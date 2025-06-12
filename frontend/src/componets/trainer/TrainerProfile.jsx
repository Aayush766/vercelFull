// src/sections/TrainerProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import Navbar from './Navbar';
import apiClient from '../../axiosConfig';
import { PulseLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const TrainerProfile = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [trainer, setTrainer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [uploadingPic, setUploadingPic] = useState(false);
    const [picUploadMessage, setPicUploadMessage] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchTrainerData = async () => {
            try {
                // apiClient automatically sends cookies. No need to get token from localStorage.
                const response = await apiClient.get('/auth/me'); // Assuming /users/me endpoint

                if (response.data.user.role !== 'trainer') {
                    setError('Access denied: Not authorized as a trainer.');
                    await apiClient.post('/auth/logout'); // Trigger backend logout
                    localStorage.removeItem('user'); // Clear any local user data
                    navigate('/trainer-login');
                    return;
                }
                setTrainer(response.data.user);
            } catch (err) {
                console.error('Error fetching trainer data:', err);
                setError(err.response?.data?.msg || 'Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);

        fetchTrainerData();
    }, [navigate]); // Add navigate to dependency array

    const handleProfilePicChange = (e) => {
        setProfilePicFile(e.target.files[0]);
        setPicUploadMessage('');
    };

    const handleProfilePicUpload = async () => {
        if (!profilePicFile) {
            setPicUploadMessage('Please select an image to upload.');
            return;
        }

        setUploadingPic(true);
        setPicUploadMessage('');
        const formData = new FormData();
        formData.append('profilePic', profilePicFile);

        try {
            // apiClient automatically sends cookies. No need for Authorization header.
            const response = await apiClient.post('/trainer/update-profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setPicUploadMessage('Profile picture updated successfully!');
            setTrainer(prevTrainer => ({
                ...prevTrainer,
                profilePicture: response.data.profilePicture
            }));
            setProfilePicFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Error uploading profile picture:', err);
            setPicUploadMessage(err.response?.data?.msg || 'Failed to upload profile picture.');
        } finally {
            setUploadingPic(false);
        }
    };

    // Dummy attendance data (replace with actual API fetch later)
    const attendanceData = {
        '2025-05-01': 'P',
        '2025-05-02': 'A',
        '2025-05-03': 'P',
        '2025-05-04': 'P',
        '2025-05-05': 'P',
        '2025-05-29': 'P', // Example for today
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = dayjs(date).format('YYYY-MM-DD');
            const status = attendanceData[dateString];
            if (status) {
                return (
                    <div className={`attendance-marker text-xs p-1 rounded-full w-6 h-6 flex items-center justify-center mx-auto mt-1
                        ${status === 'P' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {status}
                    </div>
                );
            }
        }
        return null;
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
            <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700 p-4">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
                <p>No trainer data available. Please log in.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`max-w-4xl mx-auto p-6 rounded-3xl shadow-xl
                ${darkMode
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
                    : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 border border-gray-200'
                }`}
        >
            <Navbar darkMode={darkMode} toggleDarkMode={setDarkMode} />

            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">👨‍🏫 Trainer Profile</h2>

            <div className="flex flex-col items-center mb-8">
                <img
                    src={trainer.profilePicture || 'https://via.placeholder.com/150'}
                    alt={trainer.name}
                    className="w-36 h-36 rounded-full border-4 border-blue-500 shadow-md object-cover mb-4"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="mb-3 text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0 file:text-sm file:font-semibold
                               file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleProfilePicUpload}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition-colors duration-300 flex items-center"
                    disabled={uploadingPic || !profilePicFile}
                >
                    {uploadingPic ? (
                        <>
                            <PulseLoader size={8} color={"#ffffff"} className="mr-2" /> Uploading...
                        </>
                    ) : (
                        'Update Profile Picture'
                    )}
                </button>
                {picUploadMessage && (
                    <p className={`mt-2 text-sm ${picUploadMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                        {picUploadMessage}
                    </p>
                )}
            </div>

            <div className="grid sm:grid-cols-2 gap-6 text-lg font-medium mb-6">
                <div><span className="text-gray-600 dark:text-gray-300">Name: </span>{trainer.name}</div>
                <div><span className="text-gray-600 dark:text-gray-300">Subject: </span>{trainer.subject}</div>
                <div><span className="text-gray-600 dark:text-gray-300">School: </span>{trainer.trainerSchool}</div>
                <div><span className="text-gray-600 dark:text-gray-300">Classes: </span>{trainer.classesTaught}</div>
                <div><span className="text-gray-600 dark:text-gray-300">Experience: </span>{trainer.experience} years</div>
                <div><span className="text-gray-600 dark:text-gray-300">Date of Birth: </span>{dayjs(trainer.trainerDob).format('YYYY-MM-DD')}</div>
                <div><span className="text-gray-600 dark:text-gray-300">Contact: </span>{trainer.contact}</div>
                <div><span className="text-gray-600 dark:text-gray-300">Email: </span>{trainer.email}</div>
                <div><span className="text-gray-600 dark:text-gray-300">Attendance (Today): </span>{trainer.attendanceToday || 'N/A'}</div>
                <div><span className="text-gray-600 dark:text-gray-300">Attendance (Monthly): </span>{trainer.attendanceMonth || 'N/A'}</div>
            </div>

            <h3 className="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-400">📅 Attendance Calendar</h3>
            <Calendar
                tileContent={tileContent}
                className={`attendance-calendar w-full ${darkMode ? 'dark-calendar' : ''}`}
                value={new Date()}
            />
        </motion.div>
    );
};

export default TrainerProfile;