// Update the import to use `useNavigate` from 'react-router-dom'
import { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { getQuizDataBySessionId, saveQuizData } from '../../utils/quizData'; 
import Navbar from './Navbar';
// In the EditQuiz component, replace `useHistory` with `useNavigate`
const EditQuiz = () => {
  const { sessionId } = useParams();  // Get sessionId from the URL
  const navigate = useNavigate(); // Use navigate instead of history
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the quiz data by sessionId
  useEffect(() => {
    setLoading(true); // Start loading
    const data = getQuizDataBySessionId(sessionId);

    if (data && data.length > 0) {
      setQuizData(data);
      setLoading(false); // Stop loading
    } else {
      setError('No quiz data found for this session.');
      setLoading(false);
    }
  }, [sessionId]);

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const updatedQuiz = [...quizData];
    updatedQuiz[questionIndex].options[optionIndex] = e.target.value;
    setQuizData(updatedQuiz);
  };

  const handleAnswerChange = (e, questionIndex) => {
    const updatedQuiz = [...quizData];
    updatedQuiz[questionIndex].answer = e.target.value;
    setQuizData(updatedQuiz);
  };

  const handleQuestionChange = (e, questionIndex) => {
    const updatedQuiz = [...quizData];
    updatedQuiz[questionIndex].question = e.target.value;
    setQuizData(updatedQuiz);
  };

  const handleSave = () => {
    saveQuizData(sessionId, quizData); // Save the updated quiz data
    navigate(`/quiz-preview/${sessionId}`); // Use navigate instead of history.push
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuiz = [...quizData];
    updatedQuiz[questionIndex].options.push('');
    setQuizData(updatedQuiz);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updatedQuiz = [...quizData];
    updatedQuiz[questionIndex].options.splice(optionIndex, 1);
    setQuizData(updatedQuiz);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <>
    <Navbar/>
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-purple-700 dark:text-purple-400">Edit Quiz</h2>

      {quizData.map((q, questionIndex) => (
        <div key={q.id} className="mb-6">
          <label className="block font-semibold">Question {questionIndex + 1}</label>
          <input
            type="text"
            value={q.question}
            onChange={(e) => handleQuestionChange(e, questionIndex)}
            className="mt-2 p-2 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md"
            placeholder="Enter question"
          />

          <div className="mt-4">
            <label className="block font-semibold">Options:</label>
            {q.options.map((opt, optionIndex) => (
              <div key={optionIndex} className="flex items-center mt-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                  className="p-2 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md"
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddOption(questionIndex)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Add Option
            </button>
          </div>

          <div className="mt-4">
            <label className="block font-semibold">Correct Answer:</label>
            <select
              value={q.answer}
              onChange={(e) => handleAnswerChange(e, questionIndex)}
              className="mt-2 p-2 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md"
            >
              {q.options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Save Quiz
      </button>
    </div>
    </>
  );
};

export default EditQuiz;
