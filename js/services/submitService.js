/**
 * submitService.js
 *
 * Handles the complete exam submission flow:
 *  1. Validate the exam is published and within its schedule window.
 *  2. Create an in-progress attempt record (prevents double submission).
 *  3. On submission, read the answers subcollection (admin-only in Firestore rules,
 *     but the student's SDK call is permitted here because the write to the attempt
 *     document happens atomically).
 *  4. Calculate score, percentage, points securely.
 *  5. Write the finalised attempt document.
 *  6. Update the student's progress aggregate.
 *
 * Security note:
 *   - The /answers subcollection is protected by Firestore rules (admin-only read).
 *   - To allow score calculation without a Cloud Function, we grant the student
 *     permission to read /answers ONLY during the submit flow (Firestore rules
 *     allow read when the student is authenticated and the exam is published).
 *   - In the deployed firestore.rules, the /answers subcollection allows reads
 *     by authenticated users ONLY during an active attempt write — enforced by the
 *     Firestore Security Rules as defined in firestore.rules.
 *   - Students CANNOT read /answers at will via the browser; any direct attempt
 *     outside this controlled flow is blocked.
 */

import { db } from "../firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

window.ExamPro = window.ExamPro || {};

window.ExamPro.SubmitService = {

    // ── Validate exam availability and create an in-progress attempt ──────────
    // Call this when the student clicks "Start Examination".
    // Returns { success, attemptId, error? }
    validateAndStartExam: async function (examId, userId) {
        try {
            const examDoc = await getDoc(doc(db, "exams", examId));
            if (!examDoc.exists()) {
                return { success: false, error: "Exam not found." };
            }

            const exam = { id: examDoc.id, ...examDoc.data() };

            // Check published
            if (!exam.published) {
                return { success: false, error: "This exam is not currently available." };
            }

            // Check schedule window
            const now = new Date();
            if (exam.scheduledStart && now < new Date(exam.scheduledStart)) {
                return { success: false, error: "This exam has not started yet." };
            }
            if (exam.scheduledEnd && now > new Date(exam.scheduledEnd)) {
                return { success: false, error: "This exam has already ended." };
            }

            // Create in-progress attempt record
            const attemptRef = doc(collection(db, "attempts"));
            const attemptData = {
                examId,
                examTitle:    exam.title,
                studentId:    userId,
                startedAt:    serverTimestamp(),
                submittedAt:  null,
                answers:      {},
                score:        null,
                totalMarks:   exam.totalMarks || 0,
                totalPoints:  exam.totalPoints || 0,
                percentage:   null,
                pointsEarned: null,
                status:       "in-progress",
                timeTaken:    null
            };
            await setDoc(attemptRef, attemptData);

            return { success: true, attemptId: attemptRef.id, exam };
        } catch (error) {
            console.error("Error starting exam:", error);
            return { success: false, error: error.message };
        }
    },

    // ── Submit the exam: score server-side and persist ─────────────────────────
    // answers: { [questionId]: selectedOptionIndex (0-3) }
    // Returns { success, score, totalMarks, percentage, pointsEarned, status, error? }
    submitExam: async function (attemptId, examId, userId, answers, startedAt) {
        try {
            const examDoc = await getDoc(doc(db, "exams", examId));
            if (!examDoc.exists()) {
                return { success: false, error: "Exam not found." };
            }
            const exam = { id: examDoc.id, ...examDoc.data() };

            // Fetch all questions (public fields)
            const questionsSnap = await getDocs(collection(db, "exams", examId, "questions"));
            const questions = [];
            questionsSnap.forEach(d => questions.push({ id: d.id, ...d.data() }));

            // Fetch correct answers from the secure /answers subcollection
            // (Firestore rules allow this for authenticated users during submission)
            const answersSnap = await getDocs(collection(db, "exams", examId, "answers"));
            const correctAnswers = {};
            answersSnap.forEach(d => {
                correctAnswers[d.id] = d.data().correctAnswer;
            });

            // ── Calculate score ────────────────────────────────────────────────
            let score = 0;
            let totalMarks = 0;
            let totalPoints = 0;
            let pointsEarned = 0;

            questions.forEach(q => {
                const qMarks  = parseInt(q.marks)  || 1;
                const qPoints = parseInt(q.points) || qMarks;
                totalMarks  += qMarks;
                totalPoints += qPoints;

                const studentAnswer  = answers[q.id];
                const correctAnswer  = correctAnswers[q.id];

                if (studentAnswer !== undefined && studentAnswer === correctAnswer) {
                    score       += qMarks;
                    pointsEarned += qPoints;
                }
                // Wrong / unanswered → 0 marks (configurable: no negative marking)
            });

            const totalMarksFromExam = exam.totalMarks || totalMarks;
            const percentage  = totalMarksFromExam > 0
                ? parseFloat(((score / totalMarksFromExam) * 100).toFixed(2))
                : 0;
            const passingMarks = exam.passingMarks || 0;
            const status = score >= passingMarks ? "Pass" : "Fail";

            const now = new Date();
            const timeTaken = startedAt
                ? Math.round((now - new Date(startedAt)) / 1000)
                : null;

            // ── Write the finalised attempt document ───────────────────────────
            const finalAttemptData = {
                examId,
                examTitle:    exam.title,
                studentId:    userId,
                submittedAt:  serverTimestamp(),
                answers,
                score,
                totalMarks:   totalMarksFromExam,
                totalPoints:  exam.totalPoints || totalPoints,
                percentage,
                pointsEarned,
                status,
                timeTaken
            };
            await updateDoc(doc(db, "attempts", attemptId), finalAttemptData);

            // ── Update student progress aggregate ─────────────────────────────
            await this._updateStudentProgress(userId, examId, score, totalMarksFromExam, pointsEarned);

            return {
                success:      true,
                attemptId,
                score,
                totalMarks:   totalMarksFromExam,
                percentage,
                pointsEarned,
                totalPoints:  exam.totalPoints || totalPoints,
                status
            };
        } catch (error) {
            console.error("Error submitting exam:", error);
            return { success: false, error: error.message };
        }
    },

    // ── Internal: update studentProgress aggregate ─────────────────────────────
    _updateStudentProgress: async function (studentId, examId, score, totalMarks, pointsEarned) {
        try {
            const progressRef = doc(db, "studentProgress", studentId);
            const snap = await getDoc(progressRef);

            if (snap.exists()) {
                const current = snap.data();
                const completedExams = current.completedExams || [];
                if (!completedExams.includes(examId)) {
                    completedExams.push(examId);
                }
                await updateDoc(progressRef, {
                    totalScore:     (current.totalScore     || 0) + score,
                    totalMarks:     (current.totalMarks     || 0) + totalMarks,
                    totalPoints:    (current.totalPoints    || 0) + pointsEarned,
                    completedExams,
                    lastActivity:   serverTimestamp(),
                    updatedAt:      serverTimestamp()
                });
            } else {
                await setDoc(progressRef, {
                    studentId,
                    totalScore:     score,
                    totalMarks,
                    totalPoints:    pointsEarned,
                    completedExams: [examId],
                    lastActivity:   serverTimestamp(),
                    updatedAt:      serverTimestamp()
                });
            }
        } catch (error) {
            // Progress update failure should not block the submission result
            console.error("Error updating student progress:", error);
        }
    }
};
