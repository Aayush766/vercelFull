import React from 'react';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import Logo from '../assets/Logo.png';
import stem from '../assets/stem.png';
import WaveComponent from './WaveComponent';
import AboutUs from './AboutUs';
import { useNavigate } from 'react-router-dom'; 
import StudentCorner from './StudentCorner';
import Partner from './Partner';
import KnowMore from './KnowMore';
import QueryForm from './QueryForm';
import Footer from './Footer';

const LandingPage = () => {
    const navigate = useNavigate();
    const handleStudentLoginClick = () => {
        navigate('/student-login'); 
    };

    const handleTeacherLoginClick = () => {
        navigate('/trainer-login');  // Redirect to the TrainerLoginForm component
    };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <div className="flex items-center px-8 py-4 shadow-md bg-white">
        <img src={Logo} alt="Genius Kidz Logo" className="h-16 md:h-20" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center bg-gray-50 p-8">
        {/* Left Side - Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center mb-8 md:mb-0">
          <img 
            src={stem}
            alt="Main" 
            className="w-3/4 h-auto rounded-xl shadow-lg"
          />
        </div>

        {/* Right Side - Profile Circles */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <div className="flex gap-12">
            {/* Student Login */}
            <div className="flex flex-col items-center">
              <div 
                onClick={handleStudentLoginClick} // Use the click handler
                className="w-32 h-32 border-4 border-blue-500 rounded-full flex items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform bg-white shadow-md"
              >
                <FaUserGraduate className="text-blue-500 text-5xl" />
              </div>
              <div className="mt-4 text-md md:text-lg font-semibold text-blue-600">
                Student Login
              </div>
            </div>

            {/* Teacher Login */}
            <div className="flex flex-col items-center">
              <div 
                onClick={handleTeacherLoginClick} // Redirects to TrainerLoginForm
                className="w-32 h-32 border-4 border-green-500 rounded-full flex items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform bg-white shadow-md"
              >
                <FaChalkboardTeacher className="text-green-500 text-5xl" />
              </div>
              <div className="mt-4 text-md md:text-lg font-semibold text-green-600">
                Teacher Login
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Component */}
      <WaveComponent />
      <AboutUs/>
      <StudentCorner/>
      <Partner/>
      <KnowMore/>
      <QueryForm/>
 
    </div>
  );
}

export default LandingPage;
