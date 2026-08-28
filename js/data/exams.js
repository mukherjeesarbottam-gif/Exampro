const mockExams = [
  {
    id: 'e1',
    title: 'Java Programming Fundamentals',
    subject: 'Computer Science',
    description: 'Test your basic knowledge of Java programming including OOP concepts.',
    duration: 60,
    totalQuestions: 20,
    totalMarks: 20,
    passingMarks: 10,
    difficulty: 'Medium',
    status: 'Active',
    date: '2026-08-15',
    time: '10:00 AM'
  },
  {
    id: 'e2',
    title: 'Database Management Systems',
    subject: 'Computer Science',
    description: 'Advanced SQL queries, normalization, and transactions.',
    duration: 90,
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    difficulty: 'Hard',
    status: 'Active',
    date: '2026-08-20',
    time: '02:00 PM'
  },
  {
    id: 'e3',
    title: 'Data Structures and Algorithms',
    subject: 'Computer Science',
    description: 'Arrays, Trees, Graphs and algorithmic complexities.',
    duration: 120,
    totalQuestions: 40,
    totalMarks: 40,
    passingMarks: 20,
    difficulty: 'Hard',
    status: 'Scheduled',
    date: '2026-09-01',
    time: '09:00 AM'
  }
];

// For browser environment, we attach to window if modules aren't used
window.ExamPro = window.ExamPro || {};
window.ExamPro.mockExams = mockExams;
