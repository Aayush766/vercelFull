import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaFileAlt, FaPlayCircle, FaQuestionCircle } from 'react-icons/fa';
import Navbar from './Navbar';
import PDFViewer from '../PDFViewer';
import VideoPlayer from '../VideoPlayer';
import STEMQuiz from '../student/STEMQuiz';
import Modal from '../Modal';
import {  useNavigate } from 'react-router-dom';


const resources = [
  {
    id: 1,
    type: 'ebook',
    title: 'What is STEM? - eBook',
    icon: <FaFileAlt className="text-3xl text-blue-600" />,
    file: '/pdfs/what-is-stem.pdf',
  },
  {
    id: 2,
    type: 'video',
    title: 'What is STEM? - Video',
    icon: <FaPlayCircle className="text-3xl text-cyan-500" />,
    videoList: [
      {
        id: 'dQw4w9WgXcQ',
        title: 'STEM Introduction',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg',
      },
      {
        id: 'Dvi0OmdMJi0',
        title: 'What is STEM Education?',
        thumbnail: 'https://img.youtube.com/vi/Dvi0OmdMJi0/0.jpg',
      },
      {
        id: '5GWhwUN9iaY',
        title: 'STEM Learning: Inspiring the Next Generation',
        thumbnail: 'https://img.youtube.com/vi/5GWhwUN9iaY/0.jpg',
      },
    ],
  },
  {
    id: 3,
    type: 'quiz',
    title: 'Quiz: What is STEM?',
    icon: <FaQuestionCircle className="text-3xl text-purple-600" />,
  },
];

const TrainerSessionDetails = () => {
  const { id } = useParams();
  const [darkMode, setDarkMode] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [currentPDF, setCurrentPDF] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showEbookViewer, setShowEbookViewer] = useState(false);
  const [currentVideoList, setCurrentVideoList] = useState([]);
  const [currentEbook, setCurrentEbook] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleResourceClick = (res) => {
    if (res.type === 'ebook' && res.file) {
      setCurrentEbook(res.file);
      setShowEbookViewer(true);
      setShowQuiz(false);
      setShowVideoPlayer(false);
    }
    if (res.type === 'video' && res.videoList) {
      setCurrentVideoList(res.videoList);
      setShowVideoPlayer(true);
      setShowQuiz(false);
      setShowEbookViewer(false);
    }
    if (res.type === 'quiz') {
        navigate(`/quiz-preview/${id}`);

    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Trainer Session {id}</h2>
        <p className="text-md mb-8">
          Kit Name: <span className="font-semibold">STEM/Robotics Introduction</span><br />
          Activity Name: <span className="font-semibold">Trainer-led STEM Overview</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {resources.map((res) => (
            <div
              key={res.id}
              onClick={() => handleResourceClick(res)}
              className={`flex flex-col items-center justify-center text-center p-6 rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105
                ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
            >
              {res.icon}
              <span className="mt-4 font-medium text-lg">{res.title}</span>
            </div>
          ))}
        </div>

        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-50 text-green-700 border-green-200'}`}>
          <h3 className="text-lg font-semibold mb-2">Trainer Guidelines</h3>
          <p className="text-sm">
            As a trainer, lead the students through STEM concepts with clarity and enthusiasm. Make use of the resources provided to enhance understanding and engagement.
          </p>
        </div>

        {showQuiz && (
          <Modal isOpen={showQuiz} onClose={() => setShowQuiz(false)}>
            <STEMQuiz sessionId={id} />
          </Modal>
        )}
      </div>

      {showPDF && currentPDF && (
        <PDFViewer fileUrl={currentPDF} onClose={() => setShowPDF(false)} darkMode={darkMode} />
      )}
      {showVideoPlayer && currentVideoList && (
        <VideoPlayer videoList={currentVideoList} onClose={() => setShowVideoPlayer(false)} />
      )}
    </div>
  );
};

export default TrainerSessionDetails;
