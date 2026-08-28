const mockStudents = [
  {
    id: 's1',
    name: 'Sarbottam',
    studentId: 'STU2024001',
    email: 'sarbottam@example.com',
    department: 'Computer Science',
    semester: '6th Semester',
    role: 'student'
  },
  {
    id: 'a1',
    name: 'Admin User',
    email: 'admin@exampro.com',
    role: 'admin'
  }
];

window.ExamPro = window.ExamPro || {};
window.ExamPro.mockStudents = mockStudents;
