import { db } from "../firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

window.ExamPro = window.ExamPro || {};

window.ExamPro.StudentService = {

    // ── Get all students ──────────────────────────────────────────────────────
    getAllStudents: async function () {
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("role", "==", "student"));
            const snapshot = await getDocs(q);
            const students = [];
            snapshot.forEach(d => {
                students.push({ id: d.id, ...d.data() });
            });
            return students;
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    },

    // ── Get single student by UID ─────────────────────────────────────────────
    getStudentById: async function (uid) {
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching student:", error);
            return null;
        }
    },

    // ── Get student progress document ─────────────────────────────────────────
    getStudentProgress: async function (studentId) {
        try {
            const docSnap = await getDoc(doc(db, "studentProgress", studentId));
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.lastActivity?.toDate) {
                    data.lastActivity = data.lastActivity.toDate().toISOString();
                }
                return { id: docSnap.id, ...data };
            }
            // Return a zeroed-out progress object if none exists yet
            return {
                studentId,
                totalScore:      0,
                totalMarks:      0,
                totalPoints:     0,
                completedExams:  [],
                lastActivity:    null
            };
        } catch (error) {
            console.error("Error fetching student progress:", error);
            return null;
        }
    },

    // ── Admin: Reset progress (learning progress only) ────────────────────────
    resetProgress: async function (studentId) {
        try {
            const progressRef = doc(db, "studentProgress", studentId);
            await setDoc(progressRef, {
                studentId,
                totalScore:     0,
                totalMarks:     0,
                totalPoints:    0,
                completedExams: [],
                lastActivity:   null,
                updatedAt:      serverTimestamp()
            }, { merge: false }); // Full overwrite
            return true;
        } catch (error) {
            console.error("Error resetting progress:", error);
            throw error;
        }
    },

    // ── Admin: Reset quiz attempts (delete all attempt records) ──────────────
    resetAttempts: async function (studentId) {
        try {
            const attemptsRef = collection(db, "attempts");
            const q = query(attemptsRef, where("studentId", "==", studentId));
            const snapshot = await getDocs(q);

            if (snapshot.empty) return true;

            // Firestore batch allows max 500 deletes at once
            const batch = writeBatch(db);
            snapshot.forEach(d => batch.delete(d.ref));
            await batch.commit();
            return true;
        } catch (error) {
            console.error("Error resetting attempts:", error);
            throw error;
        }
    },

    // ── Admin: Reset everything (progress + attempts) ────────────────────────
    resetAll: async function (studentId) {
        try {
            await this.resetAttempts(studentId);
            await this.resetProgress(studentId);
            return true;
        } catch (error) {
            console.error("Error resetting all data:", error);
            throw error;
        }
    },

    // ── Admin: Manually adjust student points ────────────────────────────────
    adjustPoints: async function (studentId, pointsDelta) {
        try {
            const progressRef = doc(db, "studentProgress", studentId);
            const snap = await getDoc(progressRef);
            const current = snap.exists() ? (snap.data().totalPoints || 0) : 0;
            const newPoints = Math.max(0, current + parseInt(pointsDelta));
            await updateDoc(progressRef, {
                totalPoints: newPoints,
                updatedAt:   serverTimestamp()
            });
            return newPoints;
        } catch (error) {
            console.error("Error adjusting points:", error);
            throw error;
        }
    }
};