// StudentProfile.js
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
// import { useNavigate } // Removed `useNavigate` since we are not directly navigating anymore due to `apiClient` handling it
import { PulseLoader } from 'react-spinners';
import { FaCamera } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './StudentProfile.css';
import img from '../../assets/img.jpeg';
import Navbar from '../Navbar';
import apiClient from '../../axiosConfig'; // <-- Import apiClient here!

const StudentProfile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(img);
  const navigate = useNavigate(); // Still use navigate for explicit redirection

  const fileInputRef = useRef(null);

  // Hardcoded attendance data for now
  const hardcodedAttendanceData = {
    '2025-05-01': 'P', '2025-05-02': 'A', '2025-05-03': 'P', '2025-05-04': 'P',
    '2025-05-05': 'A', '2025-05-06': 'P', '2025-05-07': 'P', '2025-05-08': 'A',
    '2025-05-09': 'P', '2025-05-10': 'P', '2025-05-11': 'P', '2025-05-12': 'P',
    '2025-05-13': 'A', '2025-05-14': 'P', '2025-05-15': 'P', '2025-05-16': 'P',
    '2025-05-17': 'P', '2025-05-18': 'A', '2025-05-19': 'P', '2025-05-20': 'P',
    '2025-05-21': 'P',
  };

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
  };

  // Fetch student profile data using apiClient
  useEffect(() => {
    const fetchStudentProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use apiClient.get - it automatically handles cookies
        const profileResponse = await apiClient.get('/student/profile');

        setStudent(profileResponse.data.user);
        // Set profile image from fetched data if available, otherwise use default
        if (profileResponse.data.user.profilePicture) {
          setProfileImage(profileResponse.data.user.profilePicture);
        }
      } catch (err) {
        console.error('Error fetching student profile:', err.response ? err.response.data : err.message);

        // apiClient's interceptor should handle 401/403 redirection,
        // but we can still set a local error message if needed.
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          // The interceptor should already redirect, so this part is more for display
          setError(err.response?.data?.msg || 'Session expired or unauthorized. Please log in again.');
          // You might not need this navigate here if the interceptor handles it fully
          // navigate('/login');
        } else {
          setError(err.response?.data?.msg || 'Failed to load student profile. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate]); // Add navigate to dependency array

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = dayjs(date).format('YYYY-MM-DD');
      const status = hardcodedAttendanceData[dateString];
      if (status) {
        return (
          <div className={`attendance-marker ${status === 'P' ? 'present' : 'absent'}`}>
            {status}
          </div>
        );
      }
    }
    return null;
  };

  // Handle image upload using apiClient
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('profilePicture', file); // 'profilePicture' must match the backend field name

    try {
      // Use apiClient.post for multipart/form-data
      const response = await apiClient.post('/student/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Crucial for sending files
        },
      });

      setProfileImage(response.data.profilePictureUrl);
      setStudent(prevStudent => ({
        ...prevStudent,
        profilePicture: response.data.profilePictureUrl
      }));
      alert('Profile picture uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to upload profile picture.');
      alert(`Error: ${err.response?.data?.msg || 'Failed to upload profile picture.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <PulseLoader color="#4B89FF" size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center transition-all duration-500 ${darkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-100 text-red-600'} p-4 text-center`}>
        <h2 className="text-xl font-bold mb-4">Error Loading Profile</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">No student profile data available.</p>
      </div>
    );
  }

  const { name, class: studentClass, rollNumber, grade, school, dob, fatherName } = student;
  const todayDateString = dayjs().format('YYYY-MM-DD');
  const calculatedAttendanceToday = hardcodedAttendanceData[todayDateString] || 'N/A';
  const calculatedAttendanceMonth = 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`max-w-4xl mx-auto p-6 rounded-3xl shadow-xl
        ${darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 border border-gray-200'}
      `}
    >
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <h2 className="text-3xl font-bold mb-6 text-center text-purple-700 dark:text-purple-400">🎓 Student Profile</h2>

      <div className="flex justify-center mb-8 relative">
        <img
          src={profileImage}
          alt={name}
          className="w-36 h-36 rounded-full border-4 border-purple-500 shadow-md object-cover"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4
                     bg-purple-600 text-white p-3 rounded-full shadow-lg
                     hover:bg-purple-700 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                     z-10"
          aria-label="Upload profile picture"
        >
          <FaCamera size={20} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 text-lg font-medium mb-6">
        <div><span className="text-gray-600 dark:text-gray-300">Name: </span>{name}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Class: </span>{studentClass}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Roll No: </span>{rollNumber}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Grade: </span>{grade}</div>
        <div><span className="text-gray-600 dark:text-gray-300">School: </span>{school}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Date of Birth: </span>{dob ? dayjs(dob).format('YYYY-MM-DD') : 'N/A'}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Father's Name: </span>{fatherName || 'N/A'}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Attendance (Today): </span>{calculatedAttendanceToday}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Attendance (Monthly): </span>{calculatedAttendanceMonth}</div>
      </div>

      <h3 className="text-2xl font-bold mb-4 text-center text-purple-700 dark:text-purple-400">📅 Attendance Calendar</h3>
      <Calendar
        tileContent={tileContent}
        className="attendance-calendar"
      />
    </motion.div>
  );
};

export default StudentProfile;