// src/data/initialSessions.js (New File)

export const initialSessionsData = {
    t1: [
      {
        id: 's1',
        session: 5,
        date: '2025-05-01',
        messages: [
          { from: 'student', text: 'Can you explain Newton’s 2nd law?', timestamp: '10:00 AM' },
          { from: 'teacher', text: 'Sure! It states that Force = mass × acceleration.', timestamp: '10:05 AM' },
        ],
      },
      {
        id: 's2',
        session: 12,
        date: '2025-05-10',
        messages: [
          { from: 'student', text: 'What is photosynthesis?', timestamp: '11:00 AM' },
          { from: 'teacher', text: 'It’s the process plants use to convert light into energy.', timestamp: '11:03 AM' },
        ],
      },
    ],
    t2: [
      {
        id: 's3',
        session: 3,
        date: '2025-05-05',
        messages: [
          { from: 'student', text: 'How to solve quadratic equations?', timestamp: '9:00 AM' },
          { from: 'teacher', text: 'You can use the quadratic formula.', timestamp: '9:05 AM' },
        ],
      },
    ],
    t3: [], // No sessions for t3 initially
  };
  
  export const teachersData = [
    { id: 't1', name: 'Mr. Ankit Mehra', school: 'Green Valley High School' },
    { id: 't2', name: 'Ms. Priya Nair', school: 'Sunrise International School' },
    { id: 't3', name: 'Mrs. Kavita Joshi', school: 'Green Valley High School' },
  ];
  
  export const studentData = {
      id: 'stu1',
      name: 'Riya Sharma',
      school: 'Green Valley High School',
  };