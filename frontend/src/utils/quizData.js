// src/utils/quizData.js

let quizzes = {
    1: [
      {
        id: 1,
        question: 'What does STEM stand for?',
        options: ['Science, Tech, Engineering, Math', 'Sports, Tech, Engineering, Math'],
        answer: 'Science, Tech, Engineering, Math',
      },
      {
        id: 2,
        question: 'Why is STEM important?',
        options: ['To explore arts', 'To solve real-world problems'],
        answer: 'To solve real-world problems',
      },
    ],
    // Add more quizzes per sessionId as needed
  };
  
  export const getQuizDataBySessionId = (sessionId) => {
    return quizzes[sessionId] || [];
  };
  
  // Function to save updated quiz data
  export const saveQuizData = (sessionId, updatedData) => {
    quizzes[sessionId] = updatedData;
    console.log(`Quiz for session ${sessionId} has been saved.`);
  };
  