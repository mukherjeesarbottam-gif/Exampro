const mockResults = [
  {
    id: 'r1',
    studentId: 's1',
    examId: 'e2', // Dummy: DBMS
    examTitle: 'Database Management Systems',
    date: '2026-08-01',
    score: 25,
    totalMarks: 30,
    percentage: 83.33,
    status: 'Pass',
    answers: {
      'q1': 0, 'q2': 1 // Just dummy mappings
    }
  }
];

window.ExamPro = window.ExamPro || {};
window.ExamPro.mockResults = mockResults;
