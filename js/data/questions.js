const mockQuestions = {
  'e1': [
    {
      id: 'q1',
      text: 'Which of the following is not a Java features?',
      options: ['Dynamic', 'Architecture Neutral', 'Use of pointers', 'Object-oriented'],
      correctAnswer: 2, // index 2: Use of pointers
      marks: 1
    },
    {
      id: 'q2',
      text: 'What is the return type of the hashCode() method in the Object class?',
      options: ['Object', 'int', 'long', 'void'],
      correctAnswer: 1, // index 1: int
      marks: 1
    },
    // Adding dummy questions to simulate length
    ...Array.from({length: 18}).map((_, i) => ({
      id: `q${i+3}`,
      text: `Dummy Java Question ${i+3}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Math.floor(Math.random() * 4),
      marks: 1
    }))
  ]
};

window.ExamPro = window.ExamPro || {};
window.ExamPro.mockQuestions = mockQuestions;
