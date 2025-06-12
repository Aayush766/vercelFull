import React, { useState } from 'react';
import AddSchool from './AddSchool';
import ViewSchools from './ViewSchools';

function ManageSchools({ darkMode }) {
    const [currentSchoolView, setCurrentSchoolView] = useState('list'); // 'list' or 'add'
    const [refreshSchools, setRefreshSchools] = useState(false); // State to trigger re-fetch
    const [searchTerm, setSearchTerm] = useState(''); // New state for search term

    const triggerRefresh = () => {
        setRefreshSchools(prev => !prev);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <h2 className="text-2xl font-semibold mb-4">Manage Schools</h2>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => {
                        setCurrentSchoolView('list');
                        setSearchTerm(''); // Clear search when switching views
                    }}
                    className={`px-4 py-2 rounded ${currentSchoolView === 'list' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-700 hover:bg-blue-600 text-white' : 'bg-gray-300 hover:bg-blue-200 text-gray-800')}`}
                >
                    View All Schools
                </button>
                <button
                    onClick={() => setCurrentSchoolView('add')}
                    className={`px-4 py-2 rounded ${currentSchoolView === 'add' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-700 hover:bg-blue-600 text-white' : 'bg-gray-300 hover:bg-blue-200 text-gray-800')}`}
                >
                    Add New School
                </button>
            </div>

            {currentSchoolView === 'add' && <AddSchool darkMode={darkMode} onSchoolAdded={triggerRefresh} />}

            {currentSchoolView === 'list' && (
                <>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search schools by name or code..."
                            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    {/* Pass the searchTerm to ViewSchools */}
                    <ViewSchools darkMode={darkMode} refreshSchools={refreshSchools} searchTerm={searchTerm} />
                </>
            )}
        </div>
    );
}

export default ManageSchools;