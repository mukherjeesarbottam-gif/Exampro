import { db } from "../firebase-config.js";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

window.ExamPro = window.ExamPro || {};

// Helper: convert Firestore Timestamp fields to ISO strings for consistent UI handling
function normaliseAttempt(id, data) {
    const attempt = { id, ...data };
    if (attempt.submittedAt?.toDate) attempt.submittedAt = attempt.submittedAt.toDate().toISOString();
    if (attempt.startedAt?.toDate)   attempt.startedAt   = attempt.startedAt.toDate().toISOString();
    // Legacy support: old "results" collection used a "date" field
    if (!attempt.submittedAt && attempt.date) attempt.submittedAt = attempt.date;
    return attempt;
}

window.ExamPro.ResultService = {

    // ── Get all attempts for a single student ─────────────────────────────────
    getResultsForStudent: async function (studentId) {
        try {
            // Primary: new attempts collection
            const attemptsRef = collection(db, "attempts");
            const q = query(attemptsRef, where("studentId", "==", studentId));
            const snapshot = await getDocs(q);
            const attempts = [];
            snapshot.forEach(d => attempts.push(normaliseAttempt(d.id, d.data())));

            // Legacy support: also read from old "results" collection if present
            try {
                const legacyRef = collection(db, "results");
                const lq = query(legacyRef, where("studentId", "==", studentId));
                const lSnapshot = await getDocs(lq);
                lSnapshot.forEach(d => {
                    const legacy = normaliseAttempt(d.id, d.data());
                    // Avoid duplicates (if same attempt already in new collection)
                    if (!attempts.find(a => a.id === legacy.id)) {
                        attempts.push(legacy);
                    }
                });
            } catch (_) {
                // Legacy collection may not exist — ignore
            }

            // Sort by submission date descending (most recent first)
            attempts.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
            return attempts;
        } catch (error) {
            console.error("Error fetching student results:", error);
            return [];
        }
    },

    // ── Get a single attempt by ID ────────────────────────────────────────────
    getAttemptById: async function (attemptId) {
        try {
            const docSnap = await getDoc(doc(db, "attempts", attemptId));
            if (docSnap.exists()) {
                return normaliseAttempt(docSnap.id, docSnap.data());
            }
            // Fallback to legacy results collection
            const legacySnap = await getDoc(doc(db, "results", attemptId));
            if (legacySnap.exists()) {
                return normaliseAttempt(legacySnap.id, legacySnap.data());
            }
            return null;
        } catch (error) {
            console.error("Error fetching attempt:", error);
            return null;
        }
    },

    // ── Get all attempts (admin use) ──────────────────────────────────────────
    getAllResults: async function () {
        try {
            const attemptsRef = collection(db, "attempts");
            const snapshot = await getDocs(attemptsRef);
            const attempts = [];
            snapshot.forEach(d => attempts.push(normaliseAttempt(d.id, d.data())));

            // Legacy
            try {
                const legacyRef = collection(db, "results");
                const lSnapshot = await getDocs(legacyRef);
                lSnapshot.forEach(d => {
                    const legacy = normaliseAttempt(d.id, d.data());
                    if (!attempts.find(a => a.id === legacy.id)) {
                        attempts.push(legacy);
                    }
                });
            } catch (_) { /* ignore */ }

            attempts.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
            return attempts;
        } catch (error) {
            console.error("Error fetching all results:", error);
            return [];
        }
    },

    // ── Legacy: direct result submission (kept for compatibility) ─────────────
    // The new submitService.js is the authoritative submission path.
    submitExamResult: async function (resultData) {
        try {
            const newRef = doc(collection(db, "attempts"));
            const payload = {
                ...resultData,
                submittedAt: serverTimestamp()
            };
            await setDoc(newRef, payload);
            return {
                id: newRef.id,
                ...resultData,
                submittedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error("Error submitting result:", error);
            throw error;
        }
    }
};
