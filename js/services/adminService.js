import { db } from "../firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

window.ExamPro = window.ExamPro || {};

window.ExamPro.AdminService = {

    // ── Dashboard stats ────────────────────────────────────────────────────────
    getDashboardStats: async function () {
        try {
            // Total students
            const usersSnap = await getDocs(
                query(collection(db, "users"), where("role", "==", "student"))
            );
            const totalStudents = usersSnap.size;

            // Total exams
            const examsSnap = await getDocs(collection(db, "exams"));
            const totalExams = examsSnap.size;

            // Scheduled exams (published but start time in future)
            const now = new Date();
            let scheduledExams = 0;
            examsSnap.forEach(d => {
                const data = d.data();
                if (data.published && data.scheduledStart && new Date(data.scheduledStart) > now) {
                    scheduledExams++;
                }
            });

            // Attempts stats
            const attemptsSnap = await getDocs(collection(db, "attempts"));
            let totalAttempts = 0;
            let totalPercentage = 0;
            let completedAttempts = 0;
            let totalPoints = 0;

            attemptsSnap.forEach(d => {
                const data = d.data();
                totalAttempts++;
                if (data.percentage != null) {
                    totalPercentage += data.percentage;
                    completedAttempts++;
                }
                totalPoints += data.pointsEarned || 0;
            });

            // Legacy results (backward compatibility)
            try {
                const legacySnap = await getDocs(collection(db, "results"));
                legacySnap.forEach(d => {
                    const data = d.data();
                    totalAttempts++;
                    if (data.percentage != null) {
                        totalPercentage += data.percentage;
                        completedAttempts++;
                    }
                });
            } catch (_) { /* ignore */ }

            const averageScore = completedAttempts > 0
                ? parseFloat((totalPercentage / completedAttempts).toFixed(1))
                : 0;

            return {
                totalStudents,
                totalExams,
                scheduledExams,
                totalAttempts,
                completedAttempts,
                averageScore,
                totalPoints
            };
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            return {
                totalStudents:    0,
                totalExams:       0,
                scheduledExams:   0,
                totalAttempts:    0,
                completedAttempts: 0,
                averageScore:     0,
                totalPoints:      0
            };
        }
    },

    // ── Get score distribution data for analytics chart ────────────────────────
    getScoreDistribution: async function () {
        try {
            const attemptsSnap = await getDocs(collection(db, "attempts"));
            const buckets = { "0-39": 0, "40-59": 0, "60-79": 0, "80-89": 0, "90-100": 0 };

            attemptsSnap.forEach(d => {
                const pct = d.data().percentage || 0;
                if      (pct < 40)  buckets["0-39"]++;
                else if (pct < 60)  buckets["40-59"]++;
                else if (pct < 80)  buckets["60-79"]++;
                else if (pct < 90)  buckets["80-89"]++;
                else                buckets["90-100"]++;
            });

            return {
                labels: ["<40%", "40-59%", "60-79%", "80-89%", "90-100%"],
                data:   Object.values(buckets)
            };
        } catch (error) {
            console.error("Error getting score distribution:", error);
            return { labels: [], data: [] };
        }
    },

    // ── Get attempts-per-day for the last 7 days (line chart) ─────────────────
    getAttemptsOverTime: async function () {
        try {
            const attemptsSnap = await getDocs(collection(db, "attempts"));
            const days = {};
            const now = new Date();

            // Build last 7 days labels
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const key = d.toLocaleDateString("en-US", { weekday: "short" });
                days[key] = 0;
            }

            attemptsSnap.forEach(d => {
                const data = d.data();
                const ts = data.submittedAt?.toDate?.() || new Date(data.submittedAt || 0);
                const msAgo = now - ts;
                if (msAgo < 7 * 24 * 60 * 60 * 1000) {
                    const key = ts.toLocaleDateString("en-US", { weekday: "short" });
                    if (days[key] !== undefined) days[key]++;
                }
            });

            return {
                labels: Object.keys(days),
                data:   Object.values(days)
            };
        } catch (error) {
            console.error("Error getting attempts over time:", error);
            return { labels: [], data: [] };
        }
    },

    // ── Get exam performance (avg score per exam) for radar chart ──────────────
    getExamPerformance: async function () {
        try {
            const attemptsSnap = await getDocs(collection(db, "attempts"));
            const examTotals = {};

            attemptsSnap.forEach(d => {
                const data = d.data();
                if (!data.examId || data.percentage == null) return;
                const title = data.examTitle || data.examId;
                if (!examTotals[title]) examTotals[title] = { total: 0, count: 0 };
                examTotals[title].total += data.percentage;
                examTotals[title].count++;
            });

            const labels = Object.keys(examTotals).slice(0, 6); // cap at 6 for readability
            const data   = labels.map(l =>
                parseFloat((examTotals[l].total / examTotals[l].count).toFixed(1))
            );

            return { labels, data };
        } catch (error) {
            console.error("Error getting exam performance:", error);
            return { labels: [], data: [] };
        }
    },

    // ── Get full report for a single student ──────────────────────────────────
    getStudentReport: async function (studentId) {
        try {
            const [userSnap, progressSnap, attemptsSnap] = await Promise.all([
                getDoc(doc(db, "users", studentId)),
                getDoc(doc(db, "studentProgress", studentId)),
                getDocs(query(collection(db, "attempts"), where("studentId", "==", studentId)))
            ]);

            const user     = userSnap.exists()     ? userSnap.data()     : null;
            const progress = progressSnap.exists() ? progressSnap.data() : null;
            const attempts = [];
            attemptsSnap.forEach(d => attempts.push({ id: d.id, ...d.data() }));
            attempts.sort((a, b) =>
                new Date(b.submittedAt?.toDate?.() || b.submittedAt || 0) -
                new Date(a.submittedAt?.toDate?.() || a.submittedAt || 0)
            );

            return { user, progress, attempts };
        } catch (error) {
            console.error("Error fetching student report:", error);
            return null;
        }
    }
};
