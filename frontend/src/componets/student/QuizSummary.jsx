import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const QuizSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions = [], answers = {} } = location.state || {};

  const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleFinish = () => {
    const resultData = {
      score: correctCount,
      total: questions.length,
      questions,
      answers,
      date: new Date().toISOString()
    };
    localStorage.setItem('session1', JSON.stringify(resultData));
    navigate('/result', { state: resultData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white text-gray-900 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-blue-200/10 to-transparent rounded-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">🧠 Quiz: Robots</h2>
          <h3 className="text-lg text-gray-500 mb-8 font-medium">Summary of Attempt</h3>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex-1 bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-200">
              <p className="text-sm text-blue-700">Questions Attempted</p>
              <h4 className="text-2xl font-bold">{answeredCount}</h4>
            </div>
            <div className="flex-1 bg-yellow-50 p-5 rounded-xl shadow-sm border border-yellow-200">
              <p className="text-sm text-yellow-700">Unanswered Questions</p>
              <h4 className="text-2xl font-bold">{unansweredCount}</h4>
            </div>
            <div className="flex-1 bg-green-50 p-5 rounded-xl shadow-sm border border-green-200">
              <p className="text-sm text-green-700">Total Questions</p>
              <h4 className="text-2xl font-bold">{questions.length}</h4>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 uppercase text-xs text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-bold">Question #</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-blue-600">Q{q.id}</td>
                    <td className="px-6 py-4">
                      {answers[q.id] ? (
                        <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                          <CheckCircle className="w-5 h-5" /> Answer saved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-red-500 font-medium">
                          <XCircle className="w-5 h-5" /> Not answered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Button */}
          <div className="mt-10 text-right">
            <button
              onClick={handleFinish}
              className="bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-800 transition-all shadow-lg"
            >
              Finish Attempt &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSummary;
