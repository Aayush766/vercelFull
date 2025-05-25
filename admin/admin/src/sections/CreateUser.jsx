// src/sections/CreateUser.jsx
import React, { useState } from 'react';
import apiClient from '../axiosConfig'; // Use apiClient

function CreateUser() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'trainer', // Default role
        grade: '',
        session: '',
        class: '',
        rollNumber: '',
        school: '',
        dob: '',
        fatherName: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.name === 'role' && e.target.value !== 'student') {
            setForm(prevForm => ({
                ...prevForm,
                grade: '',
                session: '',
                class: '',
                rollNumber: '',
                school: '',
                dob: '',
                fatherName: '',
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        const dataToSend = { ...form };
        if (dataToSend.role !== 'student') {
            delete dataToSend.grade;
            delete dataToSend.session;
            delete dataToSend.class;
            delete dataToSend.rollNumber;
            delete dataToSend.school;
            delete dataToSend.dob;
            delete dataToSend.fatherName;
        }

        try {
            await apiClient.post('/admin/create-user', dataToSend); // Use apiClient
            setMessage('User created successfully!');
            setForm({
                name: '', email: '', password: '', role: 'trainer',
                grade: '', session: '', class: '', rollNumber: '',
                school: '', dob: '', fatherName: '',
            });
        } catch (err) {
            console.error('Creation failed:', err.response ? err.response.data : err.message);
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

            <input type="text" name="name" placeholder="Name" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.password} onChange={handleChange} required />

            <select name="role" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.role} onChange={handleChange}>
                <option value="trainer">Trainer</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
            </select>

            {form.role === 'student' && (
                <>
                    <input type="number" name="grade" placeholder="Grade" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.grade} onChange={handleChange} />
                    <input type="number" name="session" placeholder="Session" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.session} onChange={handleChange} />
                    <input type="text" name="class" placeholder="Class (e.g., 10A)" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.class} onChange={handleChange} />
                    <input type="text" name="rollNumber" placeholder="Roll Number" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.rollNumber} onChange={handleChange} />
                    <input type="text" name="school" placeholder="School" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.school} onChange={handleChange} />
                    <label htmlFor="dob" className="block text-gray-700 text-sm mb-1">Date of Birth:</label>
                    <input type="date" name="dob" id="dob" placeholder="Date of Birth" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.dob} onChange={handleChange} />
                    <input type="text" name="fatherName" placeholder="Father's Name" className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.fatherName} onChange={handleChange} />
                </>
            )}

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