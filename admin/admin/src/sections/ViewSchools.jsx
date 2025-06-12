import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig';
import SchoolDetails from './SchoolDetails'; // Import the new details component

// searchTerm is now passed as a prop
function ViewSchools({ darkMode, refreshSchools, searchTerm, setRefreshSchools }) { // Added setRefreshSchools to props
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSchool, setSelectedSchool] = useState(null); // State to hold the school clicked for details

    useEffect(() => {
        const fetchSchools = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await apiClient.get('/admin/schools');
                // *** FIX APPLIED HERE ***
                setSchools(res.data || []); // Ensure schools is always an array
            } catch (err) {
                console.error('Error fetching schools:', err);
                setError(err.response?.data?.msg || 'Failed to fetch schools.');
                setSchools([]); // Also set to empty array on error to prevent further issues
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, [refreshSchools]); // Re-fetch when refreshSchools state changes

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
            try {
                await apiClient.delete(`/admin/schools/${id}`);
                // After deletion, update the local state to remove the deleted school
                setSchools(prevSchools => prevSchools.filter(school => school._id !== id)); // Use functional update
                setSelectedSchool(null); // Clear selected school if it was the one deleted
                alert('School deleted successfully!');
            } catch (err) {
                console.error('Error deleting school:', err);
                alert(err.response?.data?.message || 'Failed to delete school.');
            }
        }
    };

    const handleBackToList = () => {
        setSelectedSchool(null);
        // Trigger a refresh of the school list when returning from details
        // This ensures the list is up-to-date if changes were made within SchoolDetails
        // Make sure setRefreshSchools is passed as a prop from parent
        if (setRefreshSchools) {
            setRefreshSchools(prev => !prev);
        }
    };

    // Filter schools based on the searchTerm
    // This line is now safe because 'schools' is guaranteed to be an array
    const filteredSchools = schools.filter(school =>
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.schoolCode && school.schoolCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (school.city && school.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return <p className="text-center">Loading schools...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    // If a school is selected, display its details
    if (selectedSchool) {
        return <SchoolDetails darkMode={darkMode} school={selectedSchool} onBack={handleBackToList} onDelete={handleDelete} />;
    }

    // Otherwise, display the list of schools
    return (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className="text-xl font-semibold mb-4">All Schools</h3>
            {filteredSchools.length === 0 ? (
                <p>No schools found matching your search criteria, or no schools added yet.</p>
            ) : (
                <ul className="space-y-3">
                    {filteredSchools.map(school => (
                        <li key={school._id} className={`p-3 border rounded-md flex justify-between items-center ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'}`}>
                            <span className="font-medium">
                                {school.schoolName} ({school.schoolCode}) - {school.city || 'N/A'}
                            </span>
                            <div>
                                <button
                                    onClick={() => setSelectedSchool(school)}
                                    className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleDelete(school._id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ViewSchools;