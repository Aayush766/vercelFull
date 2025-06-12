// src/sections/CreateUser.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig'; // Use apiClient

function CreateUser() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'trainer', // Default role for convenience
        // Student specific fields
        grade: '',
        session: '',
        class: '',
        rollNumber: '',
        school: '', // Student's school - will be selected from dropdown
        dob: '', // Student's DOB
        fatherName: '',
        // Trainer specific fields
        subject: '',
        trainerSchool: '', // Trainer's school - will be selected from dropdown
        classesTaught: '', // Assuming comma-separated string, convert to array on backend if needed
        experience: '',
        contact: '',
        trainerDob: '', // Trainer's DOB
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [schools, setSchools] = useState([]); // State to hold available schools

    // Fetch schools on component mount
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await apiClient.get('/admin/schools');
                // Defensive check: Ensure response.data is an array.
                // Your backend's getAllSchools sends the array directly.
                if (Array.isArray(response.data)) {
                    setSchools(response.data); // Set schools directly from response.data
                } else {
                    // Log a warning if the response format is unexpected
                    console.warn('API response for schools was not an array:', response.data);
                    setSchools([]); // Fallback to an empty array to prevent errors
                }
            } catch (err) {
                console.error('Error fetching schools:', err);
                // Provide a user-friendly error message
                setError('Failed to load schools for selection. Please try again later.');
                setSchools([]); // Ensure schools is an array even on error
            }
        };
        fetchSchools();
    }, []); // Empty dependency array ensures this runs once on mount

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => {
            const newForm = { ...prevForm, [name]: value };

            // Clear student-specific fields if role changes from student
            if (name === 'role' && value !== 'student') {
                newForm.grade = '';
                newForm.session = '';
                newForm.class = '';
                newForm.rollNumber = '';
                newForm.school = '';
                newForm.dob = '';
                newForm.fatherName = '';
            }
            // Clear trainer-specific fields if role changes from trainer
            if (name === 'role' && value !== 'trainer') {
                newForm.subject = '';
                newForm.trainerSchool = '';
                newForm.classesTaught = '';
                newForm.experience = '';
                newForm.contact = '';
                newForm.trainerDob = '';
            }

            return newForm;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        const dataToSend = { ...form };

        // Ensure numeric fields are numbers, or undefined if empty for optional fields
        dataToSend.grade = dataToSend.grade ? Number(dataToSend.grade) : undefined;
        dataToSend.session = dataToSend.session ? Number(dataToSend.session) : undefined;
        dataToSend.experience = dataToSend.experience ? Number(dataToSend.experience) : undefined;

        // Conditionally remove fields not relevant to the selected role
        // This cleans up the payload sent to the backend
        if (dataToSend.role !== 'student') {
            delete dataToSend.grade;
            delete dataToSend.session;
            delete dataToSend.class;
            delete dataToSend.rollNumber;
            delete dataToSend.school;
            delete dataToSend.dob;
            delete dataToSend.fatherName;
        }

        if (dataToSend.role !== 'trainer') {
            delete dataToSend.subject;
            delete dataToSend.trainerSchool;
            delete dataToSend.classesTaught;
            delete dataToSend.experience;
            delete dataToSend.contact;
            delete dataToSend.trainerDob;
        }

        try {
            await apiClient.post('/admin/create-user', dataToSend);
            setMessage('User created successfully!');
            // Reset form to initial state after successful creation
            setForm({
                name: '', email: '', password: '', role: 'trainer',
                grade: '', session: '', class: '', rollNumber: '', school: '', dob: '', fatherName: '',
                subject: '', trainerSchool: '', classesTaught: '', experience: '', contact: '', trainerDob: '',
            });
        } catch (err) {
            console.error('User creation failed:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'User creation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="bg-white p-6 rounded shadow-md max-w-md mx-auto" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4 text-center">Create User</h2>
            {message && <p className="text-green-500 text-center mb-3">{message}</p>}
            {error && <p className="text-red-500 text-center mb-3">{error}</p>}

            {/* General User Fields */}
            <input type="text" name="name" placeholder="Name" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.password} onChange={handleChange} required />

            <select name="role" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.role} onChange={handleChange}>
                <option value="trainer">Trainer</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
            </select>

            {/* Student Specific Fields (Conditional Rendering) */}
            {form.role === 'student' && (
                <>
                    <input type="number" name="grade" placeholder="Grade" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.grade} onChange={handleChange} required={form.role === 'student'} />
                    <input type="number" name="session" placeholder="Session" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.session} onChange={handleChange} />
                    <input type="text" name="class" placeholder="Class (e.g., 10A)" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.class} onChange={handleChange} required={form.role === 'student'} />
                    <input type="text" name="rollNumber" placeholder="Roll Number" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.rollNumber} onChange={handleChange} required={form.role === 'student'} />
                    
                    {/* School Dropdown for Student */}
                    <select
                        name="school"
                        className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.school}
                        onChange={handleChange}
                        required={form.role === 'student'}
                    >
                        <option value="">Select Student's School</option>
                        {/* Defensive rendering: ensure schools is an array before mapping */}
                        {Array.isArray(schools) && schools.length > 0 ? (
                            schools.map((school) => (
                                <option key={school._id} value={school.schoolName}>
                                    {school.schoolName}
                                </option>
                            ))
                        ) : (
                            <option disabled>No schools available</option>
                        )}
                    </select>

                    <label htmlFor="dob" className="block text-gray-700 text-sm mb-1">Date of Birth:</label>
                    <input type="date" name="dob" id="dob" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.dob} onChange={handleChange} required={form.role === 'student'} />
                    <input type="text" name="fatherName" placeholder="Father's Name" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.fatherName} onChange={handleChange} required={form.role === 'student'} />
                </>
            )}

            {/* Trainer Specific Fields (Conditional Rendering) */}
            {form.role === 'trainer' && (
                <>
                    <input type="text" name="subject" placeholder="Subject (e.g., Mathematics)" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.subject} onChange={handleChange} required={form.role === 'trainer'} />
                    
                    {/* School Dropdown for Trainer */}
                    <select
                        name="trainerSchool"
                        className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.trainerSchool}
                        onChange={handleChange}
                        required={form.role === 'trainer'}
                    >
                        <option value="">Select Trainer's School</option>
                        {/* Defensive rendering: ensure schools is an array before mapping */}
                        {Array.isArray(schools) && schools.length > 0 ? (
                            schools.map((school) => (
                                <option key={school._id} value={school.schoolName}>
                                    {school.schoolName}
                                </option>
                            ))
                        ) : (
                            <option disabled>No schools available</option>
                        )}
                    </select>

                    <input type="text" name="classesTaught" placeholder="Classes Taught (e.g., Grade 1 to 10 or Algebra, Geometry)" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.classesTaught} onChange={handleChange} required={form.role === 'trainer'} />
                    <input type="number" name="experience" placeholder="Experience (in years)" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.experience} onChange={handleChange} required={form.role === 'trainer'} />
                    <input type="text" name="contact" placeholder="Contact Number" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.contact} onChange={handleChange} required={form.role === 'trainer'} />
                    <label htmlFor="trainerDob" className="block text-gray-700 text-sm mb-1">Trainer's Date of Birth:</label>
                    <input type="date" name="trainerDob" id="trainerDob" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.trainerDob} onChange={handleChange} required={form.role === 'trainer'} />
                </>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-300"
                disabled={loading}
            >
                {loading ? 'Creating...' : 'Create User'}
            </button>
        </form>
    );
}

export default CreateUser;