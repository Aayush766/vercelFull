// src/sections/schools/AddSchool.jsx
import React, { useState } from 'react';
import apiClient from '../axiosConfig';

function AddSchool({ darkMode, onSchoolAdded }) {
    const [formData, setFormData] = useState({
        schoolName: '',
        schoolCode: '',
        address: '',
        city: '',
        schoolCoordinatorName: '',
        schoolCoordinatorContact: '',
        schoolPrincipalName: '',
        schoolPrincipalContact: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await apiClient.post('/admin/schools', formData);
            setMessage(res.data.msg);
            setFormData({ // Clear form
                schoolName: '',
                schoolCode: '',
                address: '',
                city: '',
                schoolCoordinatorName: '',
                schoolCoordinatorContact: '',
                schoolPrincipalName: '',
                schoolPrincipalContact: ''
            });
            onSchoolAdded(); // Trigger refresh in parent
        } catch (err) {
            console.error('Error adding school:', err);
            setError(err.response?.data?.msg || 'Failed to add school.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className="text-xl font-semibold mb-4">Add New School</h3>
            {message && <p className="text-green-500 mb-3">{message}</p>}
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">School Name</label>
                    <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required
                        className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">School Code</label>
                    <input type="text" name="schoolCode" value={formData.schoolCode} onChange={handleChange} required
                        className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required
                        className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required
                        className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">School Coordinator Name</label>
                    <input type="text" name="schoolCoordinatorName" value={formData.schoolCoordinatorName} onChange={handleChange} required
                        className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">School Coordinator Contact</label>
                    <input type="text" name="schoolCoordinatorContact" value={formData.schoolCoordinatorContact} onChange={handleChange} required
                        className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">School Principal Name</label>
                    <input type="text" name="schoolPrincipalName" value={formData.schoolPrincipalName} onChange={handleChange} required
                        className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">School Principal Contact</label>
                    <input type="text" name="schoolPrincipalContact" value={formData.schoolPrincipalContact} onChange={handleChange} required
                        className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <button type="submit" disabled={loading}
                    className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                    {loading ? 'Adding...' : 'Add School'}
                </button>
            </form>
        </div>
    );
}

export default AddSchool;