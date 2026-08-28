import "../services/authService.js";
import "../services/submitService.js";
import "../services/examService.js";
import "../services/questionService.js";

document.addEventListener('DOMContentLoaded', async () => {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const user = await window.ExamPro.AuthService.requireAuth('student');
    if (!user) return;

    // ── Get exam ID from URL ──────────────────────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const examId    = urlParams.get('id');

    if (!examId) {
        window.location.href = 'available-exams.html';
        return;
    }

    // ── Validate exam + create attempt record ─────────────────────────────────
    const startResult = await window.ExamPro.SubmitService.validateAndStartExam(examId, user.uid);
    if (!startResult.success) {
        alert(startResult.error || 'Unable to start exam.');
        window.location.href = 'available-exams.html';
        return;
    }

    const { attemptId, exam } = startResult;
    const startedAt = new Date().toISOString();

    // ── Load questions (NO correctAnswer returned) ────────────────────────────
    const questions = await window.ExamPro.QuestionService.getQuestionsForExam(examId);

    if (!exam || questions.length === 0) {
        alert('This exam has no questions yet. Please try again later.');
        window.location.href = 'available-exams.html';
        return;
    }

    document.getElementById('examTitle').innerText = exam.title;

    // ── State ─────────────────────────────────────────────────────────────────
    let currentQuestionIndex = 0;
    const totalQuestions = questions.length;
    const answers        = {}; // { questionId: selectedOptionIndex }
    const markedForReview = new Set();

    // ── Timer ─────────────────────────────────────────────────────────────────
    let timeRemaining = exam.duration * 60; // seconds
    let timerInterval = null;

    const timerEl   = document.getElementById('examTimer');
    const timerText = timerEl.querySelector('span');

    function updateTimer() {
        const m = Math.floor(timeRemaining / 60);
        const s = timeRemaining % 60;
        timerText.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        if (timeRemaining <= 300) timerEl.classList.add('urgent'); // last 5 min
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            autoSubmit();
        }
        timeRemaining--;
    }

    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // ── DOM references ────────────────────────────────────────────────────────
    const qNumber          = document.getElementById('qNumber');
    const qMarks           = document.getElementById('qMarks');
    const qText            = document.getElementById('qText');
    const optionsContainer = document.getElementById('optionsContainer');
    const examProgress     = document.getElementById('examProgress');
    const questionPalette  = document.getElementById('questionPalette');

    // ── Question palette ──────────────────────────────────────────────────────
    function initPalette() {
        questionPalette.innerHTML = '';
        for (let i = 0; i < totalQuestions; i++) {
            const btn = document.createElement('button');
            btn.className  = 'palette-btn';
            btn.innerText  = i + 1;
            btn.onclick    = () => loadQuestion(i);
            questionPalette.appendChild(btn);
        }
    }

    function updatePalette() {
        const btns = questionPalette.children;
        for (let i = 0; i < totalQuestions; i++) {
            const q          = questions[i];
            const isAnswered = answers[q.id] !== undefined;
            const isMarked   = markedForReview.has(q.id);

            let cls = 'palette-btn';
            if (i === currentQuestionIndex) cls += ' current';
            if (isAnswered && isMarked)     cls += ' answered-marked';
            else if (isAnswered)            cls += ' answered';
            else if (isMarked)              cls += ' marked';

            btns[i].className = cls;
        }
    }

    // ── Load question ─────────────────────────────────────────────────────────
    function loadQuestion(index) {
        currentQuestionIndex = index;
        const q = questions[index];

        qNumber.innerText  = `Question ${index + 1}`;
        qMarks.innerText   = `+${q.marks} Mark${q.marks > 1 ? 's' : ''}`;
        qText.innerText    = q.text;
        examProgress.innerText = `Question ${index + 1} of ${totalQuestions}`;

        optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        q.options.forEach((optText, i) => {
            const optCard = document.createElement('div');
            optCard.className = `option-card ${answers[q.id] === i ? 'selected' : ''}`;
            optCard.innerHTML = `
                <div class="option-indicator">${letters[i]}</div>
                <div class="option-text">${optText}</div>
            `;
            optCard.onclick = () => selectOption(q.id, i);
            optionsContainer.appendChild(optCard);
        });

        updatePalette();
        updateFooterButtons();
    }

    function selectOption(qId, optIndex) {
        answers[qId] = optIndex;
        Array.from(optionsContainer.children).forEach((child, i) => {
            if (i === optIndex) child.classList.add('selected');
            else                child.classList.remove('selected');
        });
        updatePalette();
    }

    function updateFooterButtons() {
        document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
        document.getElementById('nextBtn').disabled = currentQuestionIndex === totalQuestions - 1;

        const markBtn = document.getElementById('markBtn');
        const qId     = questions[currentQuestionIndex].id;
        if (markedForReview.has(qId)) {
            markBtn.innerText              = 'Unmark';
            markBtn.style.backgroundColor  = 'transparent';
            markBtn.style.color            = 'var(--warning-color)';
        } else {
            markBtn.innerText              = 'Mark for Review';
            markBtn.style.backgroundColor  = 'var(--warning-color)';
            markBtn.style.color            = 'white';
        }
    }

    document.getElementById('prevBtn').onclick = () => {
        if (currentQuestionIndex > 0) loadQuestion(currentQuestionIndex - 1);
    };
    document.getElementById('nextBtn').onclick = () => {
        if (currentQuestionIndex < totalQuestions - 1) loadQuestion(currentQuestionIndex + 1);
    };
    document.getElementById('markBtn').onclick = () => {
        const qId = questions[currentQuestionIndex].id;
        if (markedForReview.has(qId)) markedForReview.delete(qId);
        else                          markedForReview.add(qId);
        updatePalette();
        updateFooterButtons();
    };

    initPalette();
    loadQuestion(0);

    // ── Submit modal ──────────────────────────────────────────────────────────
    const submitModal = document.getElementById('submitModal');

    document.getElementById('submitExamBtn').onclick = () => {
        const answeredCount   = Object.keys(answers).length;
        const unansweredCount = totalQuestions - answeredCount;
        const markedCount     = markedForReview.size;

        document.getElementById('modalAns').innerText    = answeredCount;
        document.getElementById('modalUnans').innerText  = unansweredCount;
        document.getElementById('modalMarked').innerText = markedCount;

        const warning = document.getElementById('modalWarning');
        if (unansweredCount > 0) {
            warning.innerHTML  = '<i class="fa-solid fa-triangle-exclamation"></i> You still have unanswered questions.';
            warning.style.color = 'var(--warning-color)';
        } else {
            warning.innerText  = 'All questions answered. Ready to submit?';
            warning.style.color = 'var(--text-secondary)';
        }
        submitModal.classList.add('active');
    };

    document.getElementById('cancelSubmitBtn').onclick = () => {
        submitModal.classList.remove('active');
    };
    document.getElementById('confirmSubmitBtn').onclick = () => {
        submitModal.classList.remove('active');
        autoSubmit();
    };

    // ── Auto-submit ───────────────────────────────────────────────────────────
    async function autoSubmit() {
        clearInterval(timerInterval);

        // Disable all submit buttons to prevent double submission
        const submitBtn  = document.getElementById('submitExamBtn');
        const confirmBtn = document.getElementById('confirmSubmitBtn');
        if (submitBtn)  submitBtn.disabled  = true;
        if (confirmBtn) confirmBtn.disabled = true;

        window.ExamPro.Utils.showToast('Submitting examination…', 'info');

        // Show loading overlay
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'submitLoadingOverlay';
        loadingDiv.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.5);z-index:9999;
            display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;color:white;font-size:1.25rem;
        `;
        loadingDiv.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin" style="font-size:3rem;"></i>
            <div>Calculating your score…</div>
            <div style="font-size:0.9rem;opacity:0.8;">Please do not close this tab.</div>
        `;
        document.body.appendChild(loadingDiv);

        try {
            // Submit to server — score is calculated by reading the /answers subcollection
            const result = await window.ExamPro.SubmitService.submitExam(
                attemptId, examId, user.uid, answers, startedAt
            );

            if (!result.success) {
                document.body.removeChild(loadingDiv);
                window.ExamPro.Utils.showToast(result.error || 'Submission failed. Please try again.', 'error');
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            // Redirect to result page
            window.location.href = `result.html?id=${result.attemptId}`;
        } catch (err) {
            console.error('Submission error:', err);
            document.body.removeChild(loadingDiv);
            window.ExamPro.Utils.showToast('Error submitting exam. Please try again.', 'error');
            if (submitBtn) submitBtn.disabled = false;
        }
    }
});
