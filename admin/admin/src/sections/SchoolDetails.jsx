// src/sections/schools/SchoolDetails.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig';

function SchoolDetails({ darkMode, school, onBack, onDelete }) {
    const [currentDetailView, setCurrentDetailView] = useState('info'); // 'info', 'trainers', 'students', 'timetable'
    const [trainers, setTrainers] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]); // For student filter
    const [selectedGrade, setSelectedGrade] = useState(''); // For student filter
    const [timetable, setTimetable] = useState(null);
    const [editMode, setEditMode] = useState(false); // For editing timetable
    const [editableTimetable, setEditableTimetable] = useState([]); // For timetable form
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    useEffect(() => {
        setDetailsError(''); // Clear previous errors
        setLoadingDetails(true);
        if (currentDetailView === 'trainers') {
            fetchTrainers();
        } else if (currentDetailView === 'students') {
            fetchStudents();
            fetchGradesForSchool(); // Fetch grades when viewing students
        } else if (currentDetailView === 'timetable') {
            fetchTimetable();
        } else {
            setLoadingDetails(false); // No specific data fetching for 'info'
        }
    }, [currentDetailView, school._id, selectedGrade]); // Re-fetch if view or school changes, or grade changes for students

    // Function to fetch trainers for the school
    const fetchTrainers = async () => {
        try {
            const res = await apiClient.get(`/admin/schools/${school.schoolName}/trainers`);
            setTrainers(res.data.trainers);
        } catch (err) {
            console.error('Error fetching trainers:', err);
            setDetailsError(err.response?.data?.msg || 'Failed to fetch trainers.');
        } finally {
            setLoadingDetails(false);
        }
    };

    // Function to fetch grades specific to this school
    const fetchGradesForSchool = async () => {
        try {
            const res = await apiClient.get(`/admin/schools/${school.schoolName}/grades`);
            setGrades(res.data.grades);
        } catch (err) {
            console.error('Error fetching grades for school:', err);
            setDetailsError(err.response?.data?.msg || 'Failed to fetch grades.');
        }
    };

    // Function to fetch students for the school
    const fetchStudents = async () => {
        try {
            let url = `/admin/schools/${school.schoolName}/students`;
            if (selectedGrade) {
                url += `?grade=${selectedGrade}`;
            }
            const res = await apiClient.get(url);
            setStudents(res.data.students);
        } catch (err) {
            console.error('Error fetching students:', err);
            setDetailsError(err.response?.data?.msg || 'Failed to fetch students.');
        } finally {
            setLoadingDetails(false);
        }
    };

    // Function to fetch timetable for the school and selected grade
    const fetchTimetable = async () => {
        if (!selectedGrade) {
            setDetailsError('Please select a grade to view timetable.');
            setLoadingDetails(false);
            setTimetable(null);
            return;
        }
        try {
            const res = await apiClient.get(`/admin/schools/${school.schoolName}/grades/${selectedGrade}/timetable`);
            setTimetable(res.data.timetable);
            setEditableTimetable(res.data.timetable?.schedule || []); // Initialize for editing
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setDetailsError(err.response?.data?.msg || 'Failed to fetch timetable.');
            setTimetable(null);
            setEditableTimetable([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Timetable edit handlers
    const handleTimetableChange = (index, field, value) => {
        const updatedSchedule = [...editableTimetable];
        updatedSchedule[index][field] = value;
        setEditableTimetable(updatedSchedule);
    };

    const addTimetableEntry = () => {
        setEditableTimetable([...editableTimetable, { day: '', time: '', subject: '', trainer: '' }]);
    };

    const removeTimetableEntry = (index) => {
        setEditableTimetable(editableTimetable.filter((_, i) => i !== index));
    };

    const saveTimetable = async () => {
        setLoadingDetails(true);
        setDetailsError('');
        try {
            await apiClient.put(`/admin/schools/${school.schoolName}/grades/${selectedGrade}/timetable`, { schedule: editableTimetable });
            setTimetable({ ...timetable, schedule: editableTimetable }); // Update displayed timetable
            setEditMode(false);
            alert('Timetable updated successfully!');
        } catch (err) {
            console.error('Error saving timetable:', err);
            setDetailsError(err.response?.data?.msg || 'Failed to save timetable.');
        } finally {
            setLoadingDetails(false);
        }
    };

    return (
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                &larr; Back to Schools
            </button>
            <h3 className="text-2xl font-bold mb-4">{school.schoolName} Details</h3>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setCurrentDetailView('info')}
                    className={`px-4 py-2 rounded ${currentDetailView === 'info' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-700 hover:bg-blue-600 text-white' : 'bg-gray-300 hover:bg-blue-200 text-gray-800')}`}
                >
                    School Info
                </button>
                <button
                    onClick={() => setCurrentDetailView('trainers')}
                    className={`px-4 py-2 rounded ${currentDetailView === 'trainers' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-700 hover:bg-blue-600 text-white' : 'bg-gray-300 hover:bg-blue-200 text-gray-800')}`}
                >
                    Assigned Trainers
                </button>
                <button
                    onClick={() => setCurrentDetailView('students')}
                    className={`px-4 py-2 rounded ${currentDetailView === 'students' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-700 hover:bg-blue-600 text-white' : 'bg-gray-300 hover:bg-blue-200 text-gray-800')}`}
                >
                    Students List
                </button>
                <button
                    onClick={() => setCurrentDetailView('timetable')}
                    className={`px-4 py-2 rounded ${currentDetailView === 'timetable' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-700 hover:bg-blue-600 text-white' : 'bg-gray-300 hover:bg-blue-200 text-gray-800')}`}
                >
                    Timetable
                </button>
            </div>

            {detailsError && <p className="text-red-500 mb-3">{detailsError}</p>}
            {loadingDetails && <p>Loading details...</p>}

            {!loadingDetails && !detailsError && (
                <div className="mt-6">
                    {currentDetailView === 'info' && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <h4 className="text-xl font-bold mb-2">School Information</h4>
                            <p><strong>School Code:</strong> {school.schoolCode}</p>
                            <p><strong>Address:</strong> {school.address}</p>
                            <p><strong>City:</strong> {school.city}</p>
                            <p><strong>Coordinator Name:</strong> {school.schoolCoordinatorName}</p>
                            <p><strong>Coordinator Contact:</strong> {school.schoolCoordinatorContact}</p>
                            <p><strong>Principal Name:</strong> {school.schoolPrincipalName}</p>
                            <p><strong>Principal Contact:</strong> {school.schoolPrincipalContact}</p>
                            <button
                                onClick={() => alert('Edit School Info functionality to be implemented')} // Placeholder for edit
                                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                                Edit School Info
                            </button>
                             <button
                                onClick={() => onDelete(school._id)}
                                className="ml-2 mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete School
                            </button>
                        </div>
                    )}

                    {currentDetailView === 'trainers' && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <h4 className="text-xl font-bold mb-2">Assigned Trainers</h4>
                            {trainers.length === 0 ? (
                                <p>No trainers assigned to this school yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {trainers.map(trainer => (
                                        <li key={trainer._id} className="p-2 border rounded">
                                            <strong>{trainer.name}</strong> ({trainer.email}) - {trainer.subject}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {currentDetailView === 'students' && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <h4 className="text-xl font-bold mb-2">Students List</h4>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Filter by Grade:</label>
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className={`p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                >
                                    <option value="">All Grades</option>
                                    {grades.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            {students.length === 0 ? (
                                <p>No students found for this school and selected grade.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {students.map(student => (
                                        <li key={student._id} className="p-2 border rounded">
                                            <strong>{student.name}</strong> (Roll No: {student.rollNumber}, Grade: {student.grade}, Class: {student.class}) <br/>
                                            {student.assignedTrainer && (
                                                <small>Assigned Trainer: {student.assignedTrainer.name} ({student.assignedTrainer.email})</small>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {currentDetailView === 'timetable' && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <h4 className="text-xl font-bold mb-2">Timetable</h4>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Select Grade for Timetable:</label>
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className={`p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                >
                                    <option value="">Select a Grade</option>
                                    {grades.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedGrade && (
                                <div>
                                    {timetable ? (
                                        <>
                                            {!editMode ? (
                                                <>
                                                    <table className="min-w-full divide-y divide-gray-200 mt-4">
                                                        <thead className={darkMode ? 'bg-gray-600' : 'bg-gray-50'}>
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className={darkMode ? 'bg-gray-700 divide-gray-600' : 'bg-white divide-gray-200'}>
                                                            {timetable.schedule.length > 0 ? (
                                                                timetable.schedule.map((entry, index) => (
                                                                    <tr key={index}>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{entry.day}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{entry.time}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{entry.subject}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{entry.trainer}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr><td colSpan="4" className="px-6 py-4 text-center">No timetable entries.</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                    <button
                                                        onClick={() => setEditMode(true)}
                                                        className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                                    >
                                                        Edit Timetable
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="mt-4">
                                                    {editableTimetable.map((entry, index) => (
                                                        <div key={index} className="flex space-x-2 mb-2 items-end">
                                                            <input type="text" placeholder="Day" value={entry.day} onChange={(e) => handleTimetableChange(index, 'day', e.target.value)}
                                                                className={`p-2 border rounded w-1/4 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                                                            <input type="text" placeholder="Time" value={entry.time} onChange={(e) => handleTimetableChange(index, 'time', e.target.value)}
                                                                className={`p-2 border rounded w-1/4 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                                                            <input type="text" placeholder="Subject" value={entry.subject} onChange={(e) => handleTimetableChange(index, 'subject', e.target.value)}
                                                                className={`p-2 border rounded w-1/4 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                                                            <input type="text" placeholder="Trainer" value={entry.trainer} onChange={(e) => handleTimetableChange(index, 'trainer', e.target.value)}
                                                                className={`p-2 border rounded w-1/4 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                                                            <button onClick={() => removeTimetableEntry(index)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600">X</button>
                                                        </div>
                                                    ))}
                                                    <button onClick={addTimetableEntry} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2">Add Entry</button>
                                                    <button onClick={saveTimetable} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">Save Timetable</button>
                                                    <button onClick={() => {setEditMode(false); setEditableTimetable(timetable?.schedule || []);}} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p>No timetable available for Grade {selectedGrade}. {selectedGrade && !editMode && (
                                             <button onClick={() => setEditMode(true)} className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Create Timetable</button>
                                        )}</p>
                                    )}
                                     {selectedGrade && !timetable && !editMode && (
                                         <button onClick={() => setEditMode(true)} className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Create New Timetable</button>
                                     )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SchoolDetails;