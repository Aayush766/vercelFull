// STEMQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const questions = [
  {
    id: 1,
    question: 'What does STEM stand for?',
    options: [
      'Science, Technology, Engineering, Mathematics',
      'Sports, Training, Energy, Medicine',
      'Space, Tech, Environment, Math',
      'Science, Training, Engineering, Mechanics'
    ],
    answer: 'Science, Technology, Engineering, Mathematics'
  },
  {
    id: 2,
    question: 'Which of the following is NOT a STEM field?',
    options: ['Biology', 'History', 'Engineering', 'Computer Science'],
    answer: 'History'
  },
  {
    id: 3,
    question: 'Why is STEM education important?',
    options: [
      'To develop artistic skills',
      'To promote creative storytelling',
      'To foster innovation and critical thinking',
      'To enhance language learning'
    ],
    answer: 'To foster innovation and critical thinking'
  }
];

const STEMQuiz = ({ studentName = 'John Doe' }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(1);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [startedAt] = useState(new Date());

  const handleOptionChange = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const completedAt = new Date();
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0);
    navigate('/quiz-summary', {
      state: {
        questions,
        answers,
        score,
        total: questions.length,
        startedAt,
        completedAt
      }
    });
  };

  const currentQuestion = questions.find(q => q.id === currentQ);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 text-gray-900 font-sans">
      <div className="flex items-center justify-between p-6 bg-white shadow-md border-b">
        <div className="flex items-center gap-4">
          <img src="/sample-logo.png" alt="logo" className="w-24 h-16 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {studentName}</h1>
        </div>
        <div className="text-sm text-gray-500">Course ID: {courseId}</div>
      </div>

      <div className="flex">
        <div className="w-3/4 p-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 transition-all border border-gray-200">
            <h2 className="text-xl font-semibold mb-3">Question {currentQ} of {questions.length}</h2>
            <p className="text-lg font-medium mb-6">{currentQuestion.question}</p>

            {currentQuestion.options.map((opt, idx) => (
              <label
                key={opt}
                className={`flex items-center mb-4 p-3 border rounded-lg cursor-pointer transition hover:shadow ${
                  answers[currentQ] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name={`q${currentQ}`}
                  value={opt}
                  className="mr-3"
                  checked={answers[currentQ] === opt}
                  onChange={() => handleOptionChange(currentQ, opt)}
                  disabled={submitted}
                />
                <span className="text-md"><strong>{String.fromCharCode(65 + idx)}</strong>. {opt}</span>
              </label>
            ))}

            <div className="mt-8 flex gap-4 flex-wrap">
              <button
                disabled={currentQ === 1}
                onClick={() => setCurrentQ(prev => Math.max(prev - 1, 1))}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>

              {!submitted && (
                <button
                  onClick={() => setCurrentQ(prev => Math.min(prev + 1, questions.length))}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                >
                  Save & Next
                </button>
              )}

              {!submitted && (
                <button
                  onClick={handleSubmit}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                >
                  Final Submit
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/4 p-6 bg-white border-l shadow-inner">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Time Remaining:</span>
              <span className="text-red-600 font-semibold">{formatTime(timeLeft)}</span>
            </div>
            <div><span className="font-medium">Quiz:</span> STEM Quiz</div>
            <div><span className="font-medium">Status:</span> <span className={`${submitted ? 'text-green-600' : 'text-yellow-600'} font-medium`}>{submitted ? 'Finished' : 'Not Finished'}</span></div>
          </div>

          <hr className="my-4" />

          <h3 className="text-lg font-bold mb-3">Question Map</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {questions.map(q => (
              <button
                key={q.id}
                onClick={() => setCurrentQ(q.id)}
                className={`w-10 h-10 rounded-full border font-semibold text-sm transition-all ${
                  currentQ === q.id
                    ? 'bg-blue-600 text-white'
                    : answers[q.id]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {q.id}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-600 space-y-2">
            <p><span className="inline-block w-4 h-4 mr-2 rounded bg-gray-300"></span> Not Answered</p>
            <p><span className="inline-block w-4 h-4 mr-2 rounded bg-green-500"></span> Answered</p>
            <p><span className="inline-block w-4 h-4 mr-2 rounded bg-blue-600"></span> Current</p>
          </div>

          <hr className="my-4" />
          <div className="font-medium text-sm">
            Un-Attempted Questions: <span className="float-right font-bold">{questions.length - Object.keys(answers).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default STEMQuiz;