import { db } from "../firebase-config.js";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

window.ExamPro = window.ExamPro || {};

window.ExamPro.QuestionService = {

    // ── Get questions for students (NO correctAnswer) ─────────────────────────
    // Reads from the /questions subcollection only — correct answers are NEVER
    // included here. The /answers subcollection is admin-only.
    getQuestionsForExam: async function (examId) {
        try {
            const questionsRef = collection(db, "exams", examId, "questions");
            const snapshot = await getDocs(questionsRef);
            const questions = [];
            snapshot.forEach(d => {
                const data = d.data();
                // Explicitly strip correctAnswer in case old data still has it
                delete data.correctAnswer;
                questions.push({ id: d.id, ...data });
            });
            // Sort by order field if present
            questions.sort((a, b) => (a.order || 0) - (b.order || 0));
            return questions;
        } catch (error) {
            console.error("Error fetching questions:", error);
            return [];
        }
    },

    // ── Get answers for a specific exam (ADMIN ONLY) ──────────────────────────
    // Reads from the /answers subcollection which is secured to admin-only.
    // Returns a map: { [questionId]: correctAnswerIndex }
    getAnswersForExam: async function (examId) {
        try {
            const answersRef = collection(db, "exams", examId, "answers");
            const snapshot = await getDocs(answersRef);
            const answersMap = {};
            snapshot.forEach(d => {
                answersMap[d.id] = d.data().correctAnswer;
            });
            return answersMap;
        } catch (error) {
            console.error("Error fetching answers:", error);
            return {};
        }
    },

    // ── Add a question (admin) ────────────────────────────────────────────────
    // Splits the question into two subcollections:
    //   1. /questions/{qId} — text, options, marks, points, order (student-readable)
    //   2. /answers/{qId}   — correctAnswer (admin-only)
    addQuestion: async function (examId, questionData) {
        try {
            // Create a new doc ref in the /questions subcollection
            const questionsRef = collection(db, "exams", examId, "questions");
            const newQRef = doc(questionsRef);
            const qId = newQRef.id;

            // Public question data (no correctAnswer)
            const publicData = {
                text:    questionData.text,
                options: questionData.options,
                marks:   parseInt(questionData.marks) || 1,
                points:  parseInt(questionData.points) || parseInt(questionData.marks) || 1,
                order:   parseInt(questionData.order) || 0,
                createdAt: serverTimestamp()
            };

            // Private answer data
            const privateData = {
                correctAnswer: parseInt(questionData.correctAnswer)
            };

            // Use a batch to write both atomically
            const batch = writeBatch(db);
            batch.set(doc(db, "exams", examId, "questions", qId), publicData);
            batch.set(doc(db, "exams", examId, "answers", qId), privateData);
            await batch.commit();

            return { id: qId, ...publicData };
        } catch (error) {
            console.error("Error adding question:", error);
            throw error;
        }
    },

    // ── Update a question (admin) ─────────────────────────────────────────────
    updateQuestion: async function (examId, qId, questionData) {
        try {
            const batch = writeBatch(db);

            const publicUpdate = {};
            if (questionData.text    !== undefined) publicUpdate.text    = questionData.text;
            if (questionData.options !== undefined) publicUpdate.options = questionData.options;
            if (questionData.marks   !== undefined) publicUpdate.marks   = parseInt(questionData.marks);
            if (questionData.points  !== undefined) publicUpdate.points  = parseInt(questionData.points);
            if (questionData.order   !== undefined) publicUpdate.order   = parseInt(questionData.order);

            if (Object.keys(publicUpdate).length > 0) {
                batch.update(doc(db, "exams", examId, "questions", qId), publicUpdate);
            }

            if (questionData.correctAnswer !== undefined) {
                batch.update(doc(db, "exams", examId, "answers", qId), {
                    correctAnswer: parseInt(questionData.correctAnswer)
                });
            }

            await batch.commit();
            return true;
        } catch (error) {
            console.error("Error updating question:", error);
            throw error;
        }
    },

    // ── Delete a question (admin) ─────────────────────────────────────────────
    deleteQuestion: async function (examId, questionId) {
        try {
            const batch = writeBatch(db);
            batch.delete(doc(db, "exams", examId, "questions", questionId));
            batch.delete(doc(db, "exams", examId, "answers", questionId));
            await batch.commit();
            return true;
        } catch (error) {
            console.error("Error deleting question:", error);
            throw error;
        }
    }
};
