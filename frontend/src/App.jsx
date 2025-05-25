import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './componets/LandingPage';
import StudentLoginForm from './componets/student/StudentLoginForm';
import StudentDashboard from './componets/student/StudentDashboard';
import MyCourse from './componets/student/MyCourse';

// Ensure Navbar, Footer, LoadingSpinner, PDFViewer, VideoPlayer, EbookViewer exist
// They are needed by MyCourse and SessionDetails, even if not directly routed here.
import Navbar from './componets/Navbar';
// import ChapterDetail from './componets/student/ChapterDetail'; // Not used in provided code snippet
import Footer from './componets/Footer';
import TrainerDashboard from './componets/trainer/TrainerDashboard';
import TrainerLoginForm from './componets/trainer/TrainerLoginForm';
import SessionDetails from './componets/student/SessionDetails';
import STEMQuiz from './componets/student/STEMQuiz';
import ResultPage from './componets/student/ResultPage';
import StudentProfile from './componets/student/StudentProfile';
// import GradeProgress from './componets/trainer/GradeProgress'; // Not used in provided code snippet
import AddClassDetails from './componets/trainer/AddClassDetails';
import LessonPlan from './componets/trainer/LessonPlan';
import Session from './componets/trainer/Session';
import TrainerSessionDetails from './componets/trainer/TrainerSessionDetails';
import QuizPreview from './componets/trainer/QuizPreview';
import UploadGallery from './componets/trainer/UploadGallery';
import DoubtAns from './componets/student/doubtAns';
import AskADoubt from './componets/student/AskADoubt';
import Notifications from './componets/student/Notifications';
import EditQuiz from './componets/trainer/EditQuizPage';
import TrainerAttendance from './componets/trainer/TrainerAttendance';
import PreviousAttendance from './componets/trainer/PreviousAttendance';
import AddStudent from './componets/trainer/AddStudent';
import TrainerActions from './componets/trainer/TrainerAction';
import TrainerProfile from './componets/trainer/TrainerProfile';
import QuizStart from './componets/student/QuizStart';
import QuizSummary from './componets/student/QuizSummary';
import EbookViewer from './componets/EbookViwer';
import TeacherDoubts from './componets/student/teacherDoubts';
import DocumentViewer from './componets/student/DocumentViewer';
import { NotificationProvider } from './componets/student/context/NotificationContext';
// import AdminPanel from './AdminPanel'; // Uncomment if you have this

function App() {
  return (
    <Router>
      <NotificationProvider>
      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/student-login" element={<StudentLoginForm />} />
        <Route path="/trainer-login" element={<TrainerLoginForm/>} />
        <Route path="/dashboard" element={<StudentDashboard/>} />
      
        <Route path="/course" element={<MyCourse />} />
        {/* <Route path="/chapter/:id" element={<ChapterDetail />} /> */} {/* Uncomment if needed */}
        <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
        {/*
          This route handles both /course/:id and /course/:id?grade=X.
          The 'grade' is accessed as a query parameter within SessionDetails.
        */}
        <Route path="/course/:id" element={<SessionDetails />} />
        <Route path="/course/:courseId/quiz/:quizId" element={<STEMQuiz />} />
        <Route path="/result" element={<ResultPage/>} />
        <Route path="/profile" element={<StudentProfile/>} />
        <Route path="/trainer/grade-details" element={<AddClassDetails/>} />
        <Route path="/trainer/lesson-plan" element={<LessonPlan/>} />
        <Route path="/lesson/:id" element={<Session />} />
        <Route path="/trainer/session/:id" element={<TrainerSessionDetails />} />
        <Route path="/quiz-preview/:sessionId" element={<QuizPreview/>} />
        <Route path="/trainer/gallery" element={<UploadGallery/>} />

        <Route path="/trainer/attendance" element={<TrainerAttendance/>} />
        <Route path="/trainer/previous-attendance" element={<PreviousAttendance/>} />

        <Route path="/notifications" element={<Notifications/>}/>
        <Route path="/student-support" element={<DoubtAns/>} />
        <Route path="/askadoubt" element={<AskADoubt/>} />
        <Route path="/edit-quiz/:sessionId" element={<EditQuiz />} />
        {/* Assuming QuizStart needs the session ID for context */}
        <Route path="/course/:id/quiz" element={<QuizStart />} />


        <Route path="/trainer/addStudent" element={<AddStudent/>} />
        <Route path ="/trainer/students" element={<TrainerActions/>}/>
        <Route path ="/trainer/profile" element={<TrainerProfile/>}/>

        {/* Assuming EbookViewer might need the session ID for context, or just a file URL */}
        <Route path="/course/:id/ebook" element={<EbookViewer />} />
        <Route path="/quiz-summary" element={<QuizSummary />} />

        <Route path="/mdoubts" element={<TeacherDoubts />} />
        {/* <Route path="/admin" element={<AdminPanel />} /> */}
      
      
      
        <Route path="/document/:documentId" element={
          <DocumentViewer /> }/>

      </Routes>


      <Footer />
      </NotificationProvider>
    </Router>
  );
}

export default App;