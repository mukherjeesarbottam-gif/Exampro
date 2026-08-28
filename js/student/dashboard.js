import "../services/authService.js";
import "../services/examService.js";
import "../services/resultService.js";
import "../services/studentService.js";

document.addEventListener('DOMContentLoaded', async () => {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const user = await window.ExamPro.AuthService.requireAuth('student');
    if (!user) return;

    // ── Sidebar toggle (mobile) ───────────────────────────────────────────────
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

    // ── Logout ────────────────────────────────────────────────────────────────
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        window.ExamPro.AuthService.logout();
    });

    // ── Greeting & user info ──────────────────────────────────────────────────
    document.getElementById('topbarUserName').innerText = user.name;
    document.getElementById('userAvatar').innerText = user.name.charAt(0).toUpperCase();

    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    document.getElementById('greetingTitle').innerText =
        `${greeting}, ${user.name.split(' ')[0]} 👋`;

    // ── Fetch data in parallel ────────────────────────────────────────────────
    const [results, progress, upcomingExams, availableExams] = await Promise.all([
        window.ExamPro.ResultService.getResultsForStudent(user.uid),
        window.ExamPro.StudentService.getStudentProgress(user.uid),
        window.ExamPro.ExamService.getUpcomingExams(),
        window.ExamPro.ExamService.getAvailableExams()
    ]);

    // ── Stat cards (real data) ────────────────────────────────────────────────
    const completedCount = results.filter(r => r.status === 'Pass' || r.status === 'Fail').length;
    const availableCount = availableExams.length;
    const upcomingCount  = upcomingExams.length;

    let avgScore = 0;
    if (results.length > 0) {
        const totalPct = results.reduce((sum, r) => sum + (r.percentage || 0), 0);
        avgScore = parseFloat((totalPct / results.length).toFixed(1));
    }

    // Inject into stat cards
    const elTotalExams  = document.getElementById('statTotalExams');
    const elCompleted   = document.getElementById('statCompleted');
    const elUpcoming    = document.getElementById('statUpcoming');
    const elAvgScore    = document.getElementById('statAvgScore');

    if (elTotalExams)  elTotalExams.innerText  = completedCount + upcomingCount + availableCount;
    if (elCompleted)   elCompleted.innerText   = completedCount;
    if (elUpcoming)    elUpcoming.innerText    = upcomingCount + availableCount;
    if (elAvgScore)    elAvgScore.innerText    = `${avgScore}%`;

    // ── Recent Results table ──────────────────────────────────────────────────
    const tbody = document.querySelector('#recentResultsTable tbody');
    tbody.innerHTML = '';

    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No results yet. Take your first exam!</td></tr>';
    } else {
        results.slice(0, 5).forEach(r => {
            const dateStr  = r.submittedAt || r.date || '';
            const pct      = r.percentage  != null ? r.percentage.toFixed(1) : '--';
            const badgeClass = r.status === 'Pass' ? 'badge-success' : 'badge-error';
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${r.examTitle || '—'}</td>
                    <td>${dateStr ? window.ExamPro.Utils.formatDate(dateStr) : '—'}</td>
                    <td>${r.score ?? '--'} / ${r.totalMarks ?? '--'}</td>
                    <td><span class="badge ${badgeClass}">${pct}%</span></td>
                    <td><a href="detailed-result.html?id=${r.id}" class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;">View</a></td>
                </tr>
            `;
        });
    }

    // ── Upcoming Exams sidebar ────────────────────────────────────────────────
    const upcomingList = document.getElementById('upcomingExamsList');
    upcomingList.innerHTML = '';

    // Combine upcoming + available into one sidebar list
    const sidebarExams = [...availableExams, ...upcomingExams].slice(0, 4);

    if (sidebarExams.length === 0) {
        upcomingList.innerHTML = '<p class="text-center text-muted">No upcoming exams.</p>';
    } else {
        sidebarExams.forEach(e => {
            const diffClass = e.difficulty === 'Hard'   ? 'badge-error'
                            : e.difficulty === 'Medium' ? 'badge-warning'
                            : 'badge-success';
            const isScheduled = e.scheduledStart && new Date(e.scheduledStart) > new Date();
            const dateLabel   = isScheduled
                ? `Starts ${window.ExamPro.Utils.formatDate(e.scheduledStart)}`
                : (e.scheduledStart ? `Available since ${window.ExamPro.Utils.formatDate(e.scheduledStart)}` : 'Open now');

            upcomingList.innerHTML += `
                <div style="border:1px solid var(--border-color);border-radius:var(--radius-md);padding:var(--spacing-md);">
                    <div class="flex justify-between items-center mb-sm">
                        <h4 style="font-size:1rem;">${e.title}</h4>
                        <span class="badge ${diffClass}">${e.difficulty || ''}</span>
                    </div>
                    <div class="text-muted" style="font-size:0.875rem;display:flex;gap:var(--spacing-md);margin-bottom:var(--spacing-md);">
                        <span><i class="fa-regular fa-calendar"></i> ${dateLabel}</span>
                        <span><i class="fa-regular fa-clock"></i> ${e.duration} mins</span>
                    </div>
                    ${isScheduled
                        ? `<div class="btn btn-outline" style="width:100%;text-align:center;">Scheduled</div>`
                        : `<a href="exam-instructions.html?id=${e.id}" class="btn btn-primary" style="width:100%;display:block;text-align:center;">Start Exam</a>`
                    }
                </div>
            `;
        });
    }

    // ── Performance Chart (real data) ─────────────────────────────────────────
    const ctx = document.getElementById('performanceChart');
    if (ctx && results.length > 0) {
        // Build last 6 exam scores for the chart
        const chartData = results.slice(0, 6).reverse().map(r => ({
            label: (r.examTitle || 'Exam').substring(0, 12),
            score: r.percentage || 0
        }));

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(d => d.label),
                datasets: [{
                    label: 'Score %',
                    data:  chartData.map(d => d.score),
                    borderColor:     '#4F46E5',
                    backgroundColor: 'rgba(79,70,229,0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4F46E5'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    } else if (ctx) {
        // No attempts yet — show placeholder chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['No data yet'],
                datasets: [{
                    label: 'Score %',
                    data:  [0],
                    borderColor:     '#4F46E5',
                    backgroundColor: 'rgba(79,70,229,0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }
});
