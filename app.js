// ============================================
//  SCHOOL MANAGEMENT SYSTEM — app.js
// ============================================

let school = {};
let currentClass = null;

// ============================================
//  DATA INITIALIZATION
// ============================================

function initializeData() {
    const saved = localStorage.getItem('schoolData');
    if (saved) {
        school = JSON.parse(saved);
    } else {
        for (let c = 1; c <= 10; c++) {
            school["Class " + c] = {
                attendanceMarked: false,
                students: []
            };
            for (let s = 1; s <= 10; s++) {
                school["Class " + c].students.push({
                    name: "Student " + s,
                    status: "Absent"
                });
            }
        }
        saveData();
    }
}

function saveData() {
    localStorage.setItem('schoolData', JSON.stringify(school));
}

// ============================================
//  CLOCK
// ============================================

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const clockTimeEl = document.getElementById('clockTime');
    const clockDateEl = document.getElementById('clockDate');
    const topbarClockEl = document.getElementById('topbarClock');

    if (clockTimeEl) clockTimeEl.textContent = timeStr;
    if (clockDateEl) clockDateEl.textContent = dateStr;
    if (topbarClockEl) topbarClockEl.textContent = timeStr;
}

setInterval(updateClock, 1000);
updateClock();

// ============================================
//  SIDEBAR TOGGLE (MOBILE)
// ============================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

// ============================================
//  PAGE NAVIGATION
// ============================================

function showPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page
    const target = document.getElementById(page);
    if (target) target.classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) btn.classList.add('active');
    });

    // Update page title in mobile topbar
    const titles = {
        home: 'Dashboard',
        attendance: 'Attendance',
        attendanceForm: 'Mark Attendance',
        maintenance: 'Maintenance',
        settings: 'Settings',
        classManage: 'Manage Class'
    };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[page] || 'School Management';

    // Close sidebar on mobile after navigation
    closeSidebar();

    // Page-specific initializations
    if (page === 'home')       updateDashboard();
    if (page === 'attendance') renderClassList();
    if (page === 'settings')   renderSettings();
}

// ============================================
//  DASHBOARD
// ============================================

function updateDashboard() {
    let totalStudents = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let markedClasses = [];

    for (const cls in school) {
        if (school[cls].attendanceMarked) markedClasses.push(cls);
        school[cls].students.forEach(s => {
            totalStudents++;
            if (s.status === "Present") totalPresent++;
            else totalAbsent++;
        });
    }

    const percent = totalStudents ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0;
    const totalClasses = Object.keys(school).length;

    const statsEl = document.getElementById('dashboardStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat-card blue">
                <div class="stat-label">Classes</div>
                <div class="stat-value">${totalClasses}</div>
            </div>
            <div class="stat-card blue">
                <div class="stat-label">Total Students</div>
                <div class="stat-value">${totalStudents}</div>
            </div>
            <div class="stat-card green">
                <div class="stat-label">Present</div>
                <div class="stat-value">${totalPresent}</div>
            </div>
            <div class="stat-card red">
                <div class="stat-label">Absent</div>
                <div class="stat-value">${totalAbsent}</div>
            </div>
            <div class="stat-card purple">
                <div class="stat-label">Attendance %</div>
                <div class="stat-value">${percent}%</div>
            </div>
        `;
    }

    const markedEl = document.getElementById('markedClasses');
    if (markedEl) {
        if (markedClasses.length === 0) {
            markedEl.innerHTML = '<li>No attendance marked yet today.</li>';
        } else {
            markedEl.innerHTML = markedClasses
                .map(c => `<li class="done">✓ ${c}</li>`)
                .join('');
        }
    }
}

// ============================================
//  ATTENDANCE
// ============================================

function renderClassList() {
    const listEl = document.getElementById('classList');
    if (!listEl) return;

    let html = '';
    for (const cls in school) {
        const isMarked = school[cls].attendanceMarked;
        html += `
            <div class="class-card">
                <div>
                    <div class="class-card-title">${cls}</div>
                    ${isMarked ? '<span class="class-badge">✓ Marked</span>' : ''}
                </div>
                <div style="font-size:12px;color:var(--text-muted);">
                    ${school[cls].students.length} students
                </div>
                <button onclick="openAttendance('${cls}')">
                    ${isMarked ? '✏️ Edit Attendance' : '📋 Mark Attendance'}
                </button>
            </div>
        `;
    }
    listEl.innerHTML = html;
}

function openAttendance(className) {
    currentClass = className;

    const titleEl = document.getElementById('formClassName');
    if (titleEl) titleEl.textContent = '📋 ' + className;

    let html = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    school[className].students.forEach((s, i) => {
        html += `
            <tr>
                <td style="color:var(--text-muted);font-family:var(--mono);font-size:13px;">${i + 1}</td>
                <td>${s.name}</td>
                <td>
                    <select id="status${i}">
                        <option value="Present" ${s.status === 'Present' ? 'selected' : ''}>✅ Present</option>
                        <option value="Absent"  ${s.status === 'Absent'  ? 'selected' : ''}>❌ Absent</option>
                    </select>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    const listEl = document.getElementById('studentsList');
    if (listEl) listEl.innerHTML = html;

    showPage('attendanceForm');
}

function saveAttendance() {
    school[currentClass].students.forEach((s, i) => {
        const sel = document.getElementById('status' + i);
        if (sel) s.status = sel.value;
    });
    school[currentClass].attendanceMarked = true;
    saveData();

    showToast('✓ Attendance saved for ' + currentClass);
    showPage('home');
}

// ============================================
//  SETTINGS
// ============================================

function renderSettings() {
    // Delete dropdown
    const deleteSelect = document.getElementById('deleteClassSelect');
    if (deleteSelect) {
        deleteSelect.innerHTML = Object.keys(school)
            .map(c => `<option value="${c}">${c}</option>`)
            .join('');
    }

    // Class list with manage button
    const manageListEl = document.getElementById('classManageList');
    if (manageListEl) {
        let html = '';
        for (const cls in school) {
            html += `
                <div class="class-row">
                    <span>${cls} <span style="color:var(--text-muted);font-size:12px;">(${school[cls].students.length} students)</span></span>
                    <button class="btn btn-purple" style="font-size:13px;padding:8px 14px;" onclick="manageClass('${cls}')">
                        Manage
                    </button>
                </div>
            `;
        }
        manageListEl.innerHTML = html;
    }
}

function addClass() {
    const input = document.getElementById('newClassName');
    const name = input ? input.value.trim() : '';
    if (!name) { showToast('⚠️ Please enter a class name', 'warn'); return; }
    if (school[name]) { showToast('⚠️ Class already exists', 'warn'); return; }

    school[name] = { attendanceMarked: false, students: [] };
    saveData();
    if (input) input.value = '';
    renderSettings();
    showToast('✓ Class "' + name + '" added!');
}

function deleteClass() {
    const sel = document.getElementById('deleteClassSelect');
    const name = sel ? sel.value : null;
    if (!name) return;

    if (confirm(`Delete "${name}" and all its students?`)) {
        delete school[name];
        saveData();
        renderSettings();
        showToast('🗑️ Class "' + name + '" deleted.');
    }
}

function manageClass(className) {
    currentClass = className;

    const titleEl = document.getElementById('manageClassName');
    if (titleEl) titleEl.textContent = '👥 ' + className;

    renderStudentsList();
    showPage('classManage');
}

function renderStudentsList() {
    const listEl = document.getElementById('studentsManageList');
    if (!listEl) return;

    let html = '';
    school[currentClass].students.forEach((s, i) => {
        html += `
            <div class="student-row">
                <span style="color:var(--text-muted);font-size:12px;font-family:var(--mono);min-width:24px;">${i + 1}</span>
                <input type="text" value="${s.name}" id="student${i}" placeholder="Student name">
                <button class="btn-icon-save" title="Save" onclick="updateStudent(${i})">💾</button>
                <button class="btn-icon-del"  title="Delete" onclick="deleteStudent(${i})">🗑️</button>
            </div>
        `;
    });

    if (html === '') {
        html = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:14px;">No students yet. Add one above.</div>';
    }

    listEl.innerHTML = html;
}

function addStudent() {
    const input = document.getElementById('newStudentName');
    const name = input ? input.value.trim() : '';
    if (!name) { showToast('⚠️ Please enter a student name', 'warn'); return; }

    school[currentClass].students.push({ name, status: 'Absent' });
    saveData();
    if (input) input.value = '';
    renderStudentsList();
    showToast('✓ Student added!');
}

function updateStudent(index) {
    const input = document.getElementById('student' + index);
    const newName = input ? input.value.trim() : '';
    if (!newName) { showToast('⚠️ Name cannot be empty', 'warn'); return; }

    school[currentClass].students[index].name = newName;
    saveData();
    showToast('✓ Student updated!');
}

function deleteStudent(index) {
    if (confirm('Delete this student?')) {
        school[currentClass].students.splice(index, 1);
        saveData();
        renderStudentsList();
        showToast('🗑️ Student deleted.');
    }
}

// ============================================
//  TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.getElementById('toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        background: type === 'warn' ? '#ff8c42' : '#00d97e',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '10px',
        fontFamily: "'Sora', sans-serif",
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        zIndex: '9999',
        transform: 'translateY(20px)',
        opacity: '0',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
//  BOOT
// ============================================

initializeData();
updateDashboard();
