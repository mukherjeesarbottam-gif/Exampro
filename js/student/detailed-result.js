import "../services/authService.js";
import "../services/resultService.js";
import "../services/questionService.js";

document.addEventListener('DOMContentLoaded', async () => {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const user = await window.ExamPro.AuthService.requireAuth('student');
    if (!user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const attemptId = urlParams.get('id');

    if (!attemptId) {
        window.location.href = 'results.html';
        return;
    }

    // ── Load attempt by ID ────────────────────────────────────────────────────
    const attempt = await window.ExamPro.ResultService.getAttemptById(attemptId);

    if (!attempt) {
        alert('Result not found.');
        window.location.href = 'results.html';
        return;
    }

    // Security: ensure the student can only view their own attempt
    if (attempt.studentId !== user.uid) {
        alert('Access denied.');
        window.location.href = 'results.html';
        return;
    }

    // ── Populate summary header ───────────────────────────────────────────────
    const dateStr = attempt.submittedAt || attempt.date || '';
    document.getElementById('examTitle').innerText =
        attempt.examTitle || 'Examination';
    document.getElementById('examDate').innerText =
        dateStr ? window.ExamPro.Utils.formatDate(dateStr) : '—';
    document.getElementById('examScore').innerText =
        `${attempt.score ?? '--'} / ${attempt.totalMarks ?? '--'}`;

    const statusBadge = document.getElementById('examStatus');
    statusBadge.innerText = attempt.status || '—';
    statusBadge.className = attempt.status === 'Pass' ? 'badge badge-success' : 'badge badge-error';

    // ── Load questions + answers for breakdown ────────────────────────────────
    const container = document.getElementById('questionsContainer');

    if (!attempt.examId) {
        container.innerHTML = '<div class="text-center text-muted" style="padding:40px;">Question breakdown unavailable.</div>';
        return;
    }

    // Fetch questions (public, no correctAnswer)
    const questions = await window.ExamPro.QuestionService.getQuestionsForExam(attempt.examId);

    if (questions.length === 0) {
        container.innerHTML = '<div class="text-center text-muted" style="padding:40px;">Questions no longer available.</div>';
        return;
    }

    // Fetch correct answers — now that the exam is submitted, we reveal answers
    // This reads the /answers subcollection.
    // Note: For students, Firestore rules allow reading /answers after submission.
    // (In practice for a static site, the answers are read here for display only.)
    const correctAnswers = {};
    try {
        // Temporarily bypass: since the student has already submitted and the attempt
        // is complete, we reconstruct correct answers from the stored attempt score.
        // The proper way: the attempt document could store per-question correctness.
        // For display, we use the student's submitted answers and the total score.
        // Here we read /answers subcollection which Firestore rules allow for authenticated users.
        const { db } = await import("../firebase-config.js");
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js");
        const answersSnap = await getDocs(collection(db, "exams", attempt.examId, "answers"));
        answersSnap.forEach(d => {
            correctAnswers[d.id] = d.data().correctAnswer;
        });
    } catch (e) {
        console.warn('Could not load correct answers for display:', e.message);
    }

    // ── Render question breakdown ─────────────────────────────────────────────
    container.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    questions.forEach((q, index) => {
        const studentAnswer  = attempt.answers?.[q.id];
        const correctAnswer  = correctAnswers[q.id];
        const hasCorrectData = correctAnswer !== undefined;

        let statusText  = 'Unanswered';
        let statusClass = 'badge-warning';
        let marksScored = 0;

        if (studentAnswer !== undefined) {
            if (hasCorrectData && studentAnswer === correctAnswer) {
                statusText  = 'Correct';
                statusClass = 'badge-success';
                marksScored = q.marks || 0;
            } else if (hasCorrectData) {
                statusText  = 'Incorrect';
                statusClass = 'badge-error';
            } else {
                statusText  = 'Answered';
                statusClass = 'badge-primary';
            }
        }

        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            let optClass = 'opt';
            let iconHtml = '<i class="fa-regular fa-circle"></i>';

            if (hasCorrectData) {
                if (i === correctAnswer && i === studentAnswer) {
                    optClass += ' correct';
                    iconHtml  = '<i class="fa-solid fa-check text-success"></i>';
                } else if (i === correctAnswer) {
                    optClass += ' correct';
                    iconHtml  = '<i class="fa-solid fa-check text-success"></i>';
                } else if (i === studentAnswer) {
                    optClass += ' wrong';
                    iconHtml  = '<i class="fa-solid fa-xmark text-error"></i>';
                }
            } else {
                // Correct answers not available — just highlight selected
                if (i === studentAnswer) {
                    iconHtml = '<i class="fa-regular fa-circle-dot"></i>';
                }
            }

            optionsHtml += `
                <div class="${optClass}">
                    ${iconHtml} <strong style="width:20px;">${letters[i]}.</strong> ${opt}
                </div>
            `;
        });

        container.innerHTML += `
            <div class="q-card">
                <div class="q-header">
                    <strong class="text-primary">Question ${index + 1}</strong>
                    <div class="flex gap-md items-center">
                        <span class="badge ${statusClass}">${statusText}</span>
                        <span class="text-muted" style="font-size:0.875rem;">${marksScored} / ${q.marks || 0} Marks</span>
                    </div>
                </div>
                <div style="font-size:1.125rem;margin-bottom:1rem;font-weight:500;">
                    ${q.text}
                </div>
                <div>${optionsHtml}</div>
            </div>
        `;
    });
});
