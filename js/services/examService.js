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
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

window.ExamPro = window.ExamPro || {};

window.ExamPro.ExamService = {

    // ── Get all exams (admin use) ─────────────────────────────────────────────
    getAllExams: async function (status = null) {
        try {
            const examsRef = collection(db, "exams");
            let q = examsRef;
            if (status) {
                q = query(examsRef, where("status", "==", status));
            }
            const snapshot = await getDocs(q);
            const exams = [];
            snapshot.forEach(d => {
                exams.push({ id: d.id, ...d.data() });
            });
            // Sort by createdAt descending (newest first)
            exams.sort((a, b) => {
                const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                return bTime - aTime;
            });
            return exams;
        } catch (error) {
            console.error("Error fetching exams:", error);
            return [];
        }
    },

    // ── Get published + currently available exams (student use) ───────────────
    // Returns exams that are published and whose schedule window is open (or no schedule).
    getAvailableExams: async function () {
        try {
            const examsRef = collection(db, "exams");
            const q = query(examsRef, where("published", "==", true));
            const snapshot = await getDocs(q);
            const now = new Date();
            const exams = [];
            snapshot.forEach(d => {
                const data = { id: d.id, ...d.data() };
                // If scheduledStart/scheduledEnd set, check the window
                const start = data.scheduledStart ? new Date(data.scheduledStart) : null;
                const end   = data.scheduledEnd   ? new Date(data.scheduledEnd)   : null;

                const notStartedYet = start && now < start;
                const alreadyEnded  = end   && now > end;

                if (!notStartedYet && !alreadyEnded) {
                    exams.push(data);
                }
            });
            exams.sort((a, b) => {
                const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                return bTime - aTime;
            });
            return exams;
        } catch (error) {
            console.error("Error fetching available exams:", error);
            return [];
        }
    },

    // ── Get upcoming/scheduled exams (for student dashboard sidebar) ──────────
    getUpcomingExams: async function () {
        try {
            const examsRef = collection(db, "exams");
            const q = query(examsRef, where("published", "==", true));
            const snapshot = await getDocs(q);
            const now = new Date();
            const exams = [];
            snapshot.forEach(d => {
                const data = { id: d.id, ...d.data() };
                const start = data.scheduledStart ? new Date(data.scheduledStart) : null;
                // Only include exams that haven't started yet
                if (start && now < start) {
                    exams.push(data);
                }
            });
            exams.sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));
            return exams;
        } catch (error) {
            console.error("Error fetching upcoming exams:", error);
            return [];
        }
    },

    // ── Get single exam by ID ─────────────────────────────────────────────────
    getExamById: async function (id) {
        try {
            const docRef = doc(db, "exams", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching exam:", error);
            return null;
        }
    },

    // ── Create exam (admin) ───────────────────────────────────────────────────
    createExam: async function (examData) {
        try {
            const newExamRef = doc(collection(db, "exams"));
            const payload = {
                title:           examData.title        || "",
                subject:         examData.subject       || "",
                description:     examData.description   || "",
                difficulty:      examData.difficulty    || "Medium",
                duration:        parseInt(examData.duration) || 30,
                totalQuestions:  parseInt(examData.totalQuestions) || 0,
                totalMarks:      parseInt(examData.totalMarks)     || 0,
                passingMarks:    parseInt(examData.passingMarks)   || 0,
                totalPoints:     parseInt(examData.totalPoints)    || 0,
                scheduledStart:  examData.scheduledStart || null,
                scheduledEnd:    examData.scheduledEnd   || null,
                status:          examData.status         || "Draft",
                published:       examData.published      || false,
                createdBy:       examData.createdBy      || null,
                createdAt:       serverTimestamp(),
                updatedAt:       serverTimestamp()
            };
            await setDoc(newExamRef, payload);
            return { id: newExamRef.id, ...payload };
        } catch (error) {
            console.error("Error creating exam:", error);
            throw error;
        }
    },

    // ── Update exam (admin) ───────────────────────────────────────────────────
    updateExam: async function (id, updateData) {
        try {
            const examRef = doc(db, "exams", id);
            await updateDoc(examRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error updating exam:", error);
            throw error;
        }
    },

    // ── Publish / unpublish exam ──────────────────────────────────────────────
    togglePublish: async function (id, published) {
        return this.updateExam(id, { published });
    },

    // ── Delete exam (admin) ───────────────────────────────────────────────────
    deleteExam: async function (id) {
        try {
            await deleteDoc(doc(db, "exams", id));
            return true;
        } catch (error) {
            console.error("Error deleting exam:", error);
            throw error;
        }
    }
};
