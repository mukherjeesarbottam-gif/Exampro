import "../services/authService.js";
import "../services/studentService.js";
import "../services/resultService.js";

document.addEventListener('DOMContentLoaded', async () => {
    // ── Auth guard (admin only) ───────────────────────────────────────────────
    const user = await window.ExamPro.AuthService.requireAuth('admin');
    if (!user) return;

    // ── Sidebar + Logout ──────────────────────────────────────────────────────
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.ExamPro.AuthService.logout();
    });

    const menuToggle    = document.getElementById('menuToggle');
    const sidebar       = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        });
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // ── Load students ─────────────────────────────────────────────────────────
    let allStudents = await window.ExamPro.StudentService.getAllStudents();
    const tbody = document.querySelector('#studentsTable tbody');

    function renderStudents(students) {
        tbody.innerHTML = '';
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:40px;">No students found.</td></tr>';
            return;
        }
        students.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="flex items-center gap-sm">
                            <div class="avatar" style="width:32px;height:32px;">${s.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <div style="font-weight:500;">${s.name}</div>
                                <div class="text-muted" style="font-size:0.75rem;">${s.email}</div>
                            </div>
                        </div>
                    </td>
                    <td>${s.studentId || '—'}</td>
                    <td>${s.department || '—'}</td>
                    <td>${s.semester || '—'}</td>
                    <td><span class="badge badge-success">Active</span></td>
                    <td>
                        <div class="action-dropdown">
                            <button class="action-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                            <div class="dropdown-content">
                                <a href="#" class="view-results-btn" data-uid="${s.uid || s.id}">
                                    <i class="fa-solid fa-award"></i> View Results
                                </a>
                                <a href="#" class="reset-progress-btn" data-uid="${s.uid || s.id}" data-name="${s.name}">
                                    <i class="fa-solid fa-rotate-left"></i> Reset Progress
                                </a>
                                <a href="#" class="reset-attempts-btn" data-uid="${s.uid || s.id}" data-name="${s.name}">
                                    <i class="fa-solid fa-trash-clock"></i> Reset Attempts
                                </a>
                                <a href="#" class="reset-all-btn text-error" data-uid="${s.uid || s.id}" data-name="${s.name}">
                                    <i class="fa-solid fa-ban"></i> Reset Everything
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });

        // ── Attach action handlers ────────────────────────────────────────────
        attachActionHandlers();
    }

    renderStudents(allStudents);

    // ── Search / filter ───────────────────────────────────────────────────────
    const searchInput = document.getElementById('studentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase();
            const filtered = allStudents.filter(s =>
                s.name.toLowerCase().includes(q) ||
                (s.email || '').toLowerCase().includes(q) ||
                (s.studentId || '').toLowerCase().includes(q)
            );
            renderStudents(filtered);
        });
    }

    // ── Student Results Modal ─────────────────────────────────────────────────
    const resultsModal = document.getElementById('studentResultsModal');
    const resultsModalTitle   = document.getElementById('resultsModalTitle');
    const resultsModalContent = document.getElementById('resultsModalContent');
    const closeResultsModal   = document.getElementById('closeResultsModal');

    if (closeResultsModal) {
        closeResultsModal.addEventListener('click', () => {
            resultsModal.classList.remove('active');
        });
    }

    // ── Reset Confirmation Modal ──────────────────────────────────────────────
    const resetModal     = document.getElementById('resetModal');
    const resetModalMsg  = document.getElementById('resetModalMsg');
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    const cancelResetBtn  = document.getElementById('cancelResetBtn');

    let pendingReset = null; // { uid, type }

    if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', () => {
            resetModal.classList.remove('active');
            pendingReset = null;
        });
    }

    if (confirmResetBtn) {
        confirmResetBtn.addEventListener('click', async () => {
            if (!pendingReset) return;
            resetModal.classList.remove('active');
            confirmResetBtn.disabled = true;

            const { uid, type } = pendingReset;
            try {
                if (type === 'progress') {
                    await window.ExamPro.StudentService.resetProgress(uid);
                    window.ExamPro.Utils.showToast('Progress reset successfully.', 'success');
                } else if (type === 'attempts') {
                    await window.ExamPro.StudentService.resetAttempts(uid);
                    window.ExamPro.Utils.showToast('Attempts reset successfully.', 'success');
                } else if (type === 'all') {
                    await window.ExamPro.StudentService.resetAll(uid);
                    window.ExamPro.Utils.showToast('All data reset successfully.', 'success');
                }
            } catch (err) {
                console.error('Reset error:', err);
                window.ExamPro.Utils.showToast('Reset failed. Please try again.', 'error');
            }
            pendingReset = null;
            confirmResetBtn.disabled = false;
        });
    }

    // ── Attach button handlers (called after each render) ─────────────────────
    function attachActionHandlers() {

        // View Results
        document.querySelectorAll('.view-results-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const uid = btn.dataset.uid;
                const student = allStudents.find(s => (s.uid || s.id) === uid);
                if (!student || !resultsModal) return;

                resultsModalTitle.innerText = `Results — ${student.name}`;
                resultsModalContent.innerHTML = '<div class="text-center"><i class="fa-solid fa-spinner fa-spin text-primary"></i></div>';
                resultsModal.classList.add('active');

                const results = await window.ExamPro.ResultService.getResultsForStudent(uid);
                if (results.length === 0) {
                    resultsModalContent.innerHTML = '<p class="text-muted text-center">No attempts yet.</p>';
                    return;
                }

                let rows = '';
                results.forEach(r => {
                    const dateStr = r.submittedAt || r.date || '';
                    const badgeCls = r.status === 'Pass' ? 'badge-success' : 'badge-error';
                    rows += `
                        <tr>
                            <td>${r.examTitle || '—'}</td>
                            <td>${dateStr ? window.ExamPro.Utils.formatDate(dateStr) : '—'}</td>
                            <td>${r.score ?? '--'} / ${r.totalMarks ?? '--'}</td>
                            <td>${r.percentage != null ? r.percentage.toFixed(1) + '%' : '—'}</td>
                            <td><span class="badge ${badgeCls}">${r.status || '—'}</span></td>
                            <td>${r.pointsEarned ?? 0}</td>
                        </tr>
                    `;
                });

                resultsModalContent.innerHTML = `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Exam</th><th>Date</th><th>Score</th>
                                    <th>%</th><th>Status</th><th>Points</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `;
            });
        });

        // Reset Progress
        document.querySelectorAll('.reset-progress-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                pendingReset = { uid: btn.dataset.uid, type: 'progress' };
                resetModalMsg.innerText =
                    `Reset learning progress for "${btn.dataset.name}"? Their account and attempt history will NOT be deleted.`;
                resetModal.classList.add('active');
            });
        });

        // Reset Attempts
        document.querySelectorAll('.reset-attempts-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                pendingReset = { uid: btn.dataset.uid, type: 'attempts' };
                resetModalMsg.innerText =
                    `Delete all exam attempts for "${btn.dataset.name}"? This cannot be undone.`;
                resetModal.classList.add('active');
            });
        });

        // Reset Everything
        document.querySelectorAll('.reset-all-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                pendingReset = { uid: btn.dataset.uid, type: 'all' };
                resetModalMsg.innerText =
                    `⚠️ Reset ALL data (progress + all attempts) for "${btn.dataset.name}"? Their account will be preserved but all learning data will be erased.`;
                resetModal.classList.add('active');
            });
        });
    }
});
