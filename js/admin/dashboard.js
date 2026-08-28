import "../services/authService.js";
import "../services/adminService.js";

document.addEventListener('DOMContentLoaded', async () => {
    // ── Auth guard (admin only) ───────────────────────────────────────────────
    const user = await window.ExamPro.AuthService.requireAuth('admin');
    if (!user) return;

    // ── Populate admin name ───────────────────────────────────────────────────
    const adminNameEl = document.getElementById('adminName');
    const adminAvatarEl = document.getElementById('adminAvatar');
    if (adminNameEl)  adminNameEl.innerText  = user.name || 'Admin';
    if (adminAvatarEl) adminAvatarEl.innerText = (user.name || 'A').charAt(0).toUpperCase();

    // ── Logout ────────────────────────────────────────────────────────────────
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.ExamPro.AuthService.logout();
        });
    }

    // ── Sidebar toggle ────────────────────────────────────────────────────────
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

    // ── Load real stats ───────────────────────────────────────────────────────
    const stats = await window.ExamPro.AdminService.getDashboardStats();

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    set('statTotalStudents', stats.totalStudents);
    set('statTotalExams',    stats.totalExams);
    set('statTotalAttempts', stats.totalAttempts);
    set('statAvgScore',      `${stats.averageScore}%`);

    // ── Charts with real data ─────────────────────────────────────────────────
    const [timeData, distData] = await Promise.all([
        window.ExamPro.AdminService.getAttemptsOverTime(),
        window.ExamPro.AdminService.getScoreDistribution()
    ]);

    const ctx1 = document.getElementById('attemptsChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: timeData.labels,
                datasets: [{
                    label: 'Attempts',
                    data:  timeData.data,
                    backgroundColor: '#4F46E5',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    const ctx2 = document.getElementById('completionChart');
    if (ctx2) {
        const passCount = stats.completedAttempts > 0 ? stats.completedAttempts : 1;
        const passRate  = Math.round(stats.averageScore);
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Pass', 'Fail'],
                datasets: [{
                    data: [passRate, 100 - passRate],
                    backgroundColor: ['#10B981', '#FEE2E2'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
                        }
                    }
                }
            }
        });
    }
});
