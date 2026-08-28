import "../services/authService.js";
import "../services/examService.js";

document.addEventListener('DOMContentLoaded', async () => {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const user = await window.ExamPro.AuthService.requireAuth('admin');
    if (!user) return;

    // ── Logout ────────────────────────────────────────────────────────────────
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.ExamPro.AuthService.logout();
    });

    // ── Load exams ────────────────────────────────────────────────────────────
    let allExams = await window.ExamPro.ExamService.getAllExams();
    const tbody  = document.querySelector('#adminExamsTable tbody');

    function renderExams(exams) {
        tbody.innerHTML = '';
        if (exams.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:40px;">No examinations found.</td></tr>';
            return;
        }

        exams.forEach(e => {
            let badgeClass = 'badge-success';
            if (e.status === 'Draft')     badgeClass = 'badge-warning';
            if (e.status === 'Scheduled') badgeClass = 'badge-primary';
            if (e.status === 'Completed') badgeClass = 'badge-error';

            const publishedIcon = e.published
                ? '<i class="fa-solid fa-eye text-success" title="Published"></i>'
                : '<i class="fa-solid fa-eye-slash text-muted" title="Unpublished"></i>';

            const createdDate = e.createdAt?.toDate?.()
                ? window.ExamPro.Utils.formatDate(e.createdAt.toDate().toISOString())
                : (e.date ? window.ExamPro.Utils.formatDate(e.date) : '—');

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:500;">${e.title}</td>
                    <td>${e.subject || '—'}</td>
                    <td>${e.totalQuestions ?? '—'}</td>
                    <td>${e.duration ?? '—'} mins</td>
                    <td>
                        <span class="badge ${badgeClass}">${e.status}</span>
                        &nbsp;${publishedIcon}
                    </td>
                    <td>${createdDate}</td>
                    <td>
                        <div class="action-dropdown">
                            <button class="action-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                            <div class="dropdown-content">
                                <a href="questions.html?examId=${e.id}">
                                    <i class="fa-solid fa-list-check"></i> Questions
                                </a>
                                <a href="create-exam.html?edit=${e.id}">
                                    <i class="fa-regular fa-pen-to-square"></i> Edit
                                </a>
                                <a href="#" class="toggle-publish-btn"
                                   data-id="${e.id}" data-published="${e.published}">
                                    <i class="fa-solid ${e.published ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                    ${e.published ? 'Unpublish' : 'Publish'}
                                </a>
                                <a href="#" class="delete-exam-btn text-error" data-id="${e.id}" data-title="${e.title}">
                                    <i class="fa-regular fa-trash-can"></i> Delete
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });

        attachHandlers();
    }

    renderExams(allExams);

    // ── Status filter ─────────────────────────────────────────────────────────
    const statusFilter = document.getElementById('examStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            const val = statusFilter.value;
            const filtered = val ? allExams.filter(e => e.status === val) : allExams;
            renderExams(filtered);
        });
    }

    // ── Attach event handlers ─────────────────────────────────────────────────
    function attachHandlers() {

        // Publish / Unpublish
        document.querySelectorAll('.toggle-publish-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id        = btn.dataset.id;
                const published = btn.dataset.published === 'true';
                try {
                    await window.ExamPro.ExamService.togglePublish(id, !published);
                    window.ExamPro.Utils.showToast(
                        published ? 'Exam unpublished.' : 'Exam published and visible to students.',
                        'success'
                    );
                    // Refresh exam list
                    allExams = await window.ExamPro.ExamService.getAllExams();
                    renderExams(allExams);
                } catch (err) {
                    window.ExamPro.Utils.showToast('Failed to update exam.', 'error');
                }
            });
        });

        // Delete exam
        document.querySelectorAll('.delete-exam-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id    = btn.dataset.id;
                const title = btn.dataset.title;
                if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
                try {
                    await window.ExamPro.ExamService.deleteExam(id);
                    window.ExamPro.Utils.showToast('Exam deleted.', 'success');
                    allExams = allExams.filter(ex => ex.id !== id);
                    renderExams(allExams);
                } catch (err) {
                    window.ExamPro.Utils.showToast('Failed to delete exam.', 'error');
                }
            });
        });
    }
});
