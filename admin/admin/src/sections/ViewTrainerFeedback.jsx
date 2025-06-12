// frontend/src/sections/ViewTrainerFeedback.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

function ViewTrainerFeedback({ darkMode }) {
  const [schools, setSchools] = useState([]);
  const [selectedSchoolName, setSelectedSchoolName] = useState(''); // Use schoolName for selection
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [trainerFeedback, setTrainerFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch all schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/admin/schools'); // Endpoint to get ALL schools
        setSchools(response.data); // Assuming response.data is an array of school objects
      } catch (err) {
        console.error('Error fetching schools:', err);
        setError('Failed to load schools.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  // 2. Fetch trainers assigned to the selected school when selectedSchoolName changes
  useEffect(() => {
    const fetchTrainersBySchool = async () => {
      if (!selectedSchoolName) {
        setTrainers([]);
        setSelectedTrainerId(''); // Reset trainer selection
        setTrainerFeedback(null); // Clear feedback
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Endpoint to get trainers assigned to a specific school
        const response = await apiClient.get(`/admin/schools/${selectedSchoolName}/trainers`);
        setTrainers(response.data.trainers || []); // Assuming response.data is { trainers: [...] }
        setSelectedTrainerId(''); // Reset trainer selection
        setTrainerFeedback(null); // Clear feedback
      } catch (err) {
        console.error('Error fetching trainers for school:', err);
        setError('Failed to load trainers for the selected school.');
        setTrainers([]);
        setSelectedTrainerId('');
        setTrainerFeedback(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainersBySchool();
  }, [selectedSchoolName]);

  const handleSchoolChange = (e) => {
    setSelectedSchoolName(e.target.value);
  };

  const handleTrainerChange = (e) => {
    setSelectedTrainerId(e.target.value);
    setTrainerFeedback(null); // Clear feedback when trainer changes
  };

  // 3. Fetch student feedback for the selected trainer
  const fetchTrainerFeedback = async () => {
    if (!selectedTrainerId) {
      setError('Please select a trainer first.');
      setTrainerFeedback(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Endpoint to get student feedback for a specific trainer
      const response = await apiClient.get(`/admin/trainers/${selectedTrainerId}/student-feedback`);
      setTrainerFeedback(response.data);
    } catch (err) {
      console.error('Error fetching trainer feedback:', err);
      setError('Failed to load feedback for this trainer.');
      setTrainerFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={`p-6 rounded-3xl shadow-2xl transition-all duration-500 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-bold mb-6">View Trainer Feedback</h2>

      {/* School Selection */}
      <div className="mb-4">
        <label htmlFor="selectSchool" className="block text-lg font-semibold mb-2">
          Select School:
        </label>
        <select
          id="selectSchool"
          className={`w-full p-3 rounded-md border ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
          }`}
          value={selectedSchoolName}
          onChange={handleSchoolChange}
          disabled={loading}
        >
          <option value="">-- Select a School --</option>
          {schools.map((school) => (
            <option key={school._id} value={school.schoolName}>
              {school.schoolName} ({school.city})
            </option>
          ))}
        </select>
      </div>

      {/* Trainer Selection (dependent on school selection) */}
      <div className="mb-4">
        <label htmlFor="selectTrainer" className="block text-lg font-semibold mb-2">
          Select Trainer:
        </label>
        <select
          id="selectTrainer"
          className={`w-full p-3 rounded-md border ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
          }`}
          value={selectedTrainerId}
          onChange={handleTrainerChange}
          disabled={loading || !selectedSchoolName}
        >
          <option value="">-- Select a Trainer --</option>
          {trainers.length === 0 && selectedSchoolName && (
            <option disabled>No trainers assigned to this school.</option>
          )}
          {trainers.map((trainer) => (
            <option key={trainer._id} value={trainer._id}>
              {trainer.name} ({trainer.email})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={fetchTrainerFeedback}
        disabled={loading || !selectedTrainerId}
        className={`px-6 py-3 rounded-lg font-bold transition-colors duration-300 ${
          loading || !selectedTrainerId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Loading...' : 'View Feedback'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {trainerFeedback && (
        <div className="mt-8 border-t pt-6 border-gray-300 dark:border-gray-600">
          <h3 className="text-xl font-bold mb-4">
            Feedback for {trainerFeedback.trainerName}
          </h3>
          {trainerFeedback.feedback.length === 0 ? (
            <p>No student feedback available for this trainer yet.</p>
          ) : (
            <div className="space-y-6">
              {trainerFeedback.feedback.map((f, index) => (
                <div
                  key={index} // Using index as key is generally okay if items are not reordered/removed/added frequently
                  className={`p-4 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p className="text-lg font-semibold mb-2">
                    From: {f.submittedByName} ({f.submittedBySchool}, Grade: {f.submittedByGrade})
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Submitted: {new Date(f.submittedAt).toLocaleDateString()}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-3">
                    {Object.entries(f.ratings).map(([param, rating]) => (
                      <div key={param} className="flex items-center">
                        <span className="font-medium mr-2">{param}:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={16}
                              className={`${
                                rating >= star ? 'text-yellow-400' : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-base">
                    <span className="font-semibold">General Feedback:</span> {f.feedback || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default ViewTrainerFeedback;