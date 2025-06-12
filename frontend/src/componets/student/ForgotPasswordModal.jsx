import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import apiClient from '../../axiosConfig'; // Ensure this path is correct

const ForgotPasswordModal = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [step, setStep] = useState(1); // 1: Email input, 2: DOB input, 3: Success/Error
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [userName, setUserName] = useState(''); // To store user's name

  // Watch the email field for the next step
  const email = watch('email');

  const handleEmailSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await apiClient.post('/auth/forgot-password-request', { email: data.email, role: 'student' });
      setUserName(response.data.userName); // Get user's name from response
      setStep(2); // Move to DOB verification
      setMessage(response.data.msg); // Display a temporary message if needed
    } catch (error) {
      console.error('Forgot password email request error:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.msg || 'Failed to initiate password reset. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDobSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await apiClient.post('/auth/verify-dob-and-send-link', {
        email: email, // Use the email from the first step
        dob: data.dob,
        role: 'student'
      });
      setMessage(response.data.msg || 'Password reset link sent to your email!');
      setIsError(false);
      setStep(3); // Show success message
    } catch (error) {
      console.error('DOB verification error:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.msg || 'Failed to verify DOB or send reset link.');
      setIsError(true);
      setStep(3); // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) { // Prevent closing during loading
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose} // Close when clicking outside
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-2xl font-bold"
            disabled={isLoading}
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-yellow-300 mb-6">Forgot Password</h2>

          {step === 1 && (
            <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                Enter your email address to start the password reset process.
              </p>
              <div>
                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^@]+@[^@]+\.[^@]+$/i,
                      message: "Invalid email format"
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? <PulseLoader size={8} color="#fff" /> : 'Next'}
              </button>
              {message && isError && (
                <p className="text-red-500 text-center mt-3">{message}</p>
              )}
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(handleDobSubmit)} className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                Hello, <span className="font-semibold text-blue-600 dark:text-yellow-300">{userName}</span>! To verify your identity, please enter your Date of Birth.
              </p>
              <div>
                <label htmlFor="dob" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Date of Birth</label>
                <input
                  type="date" // Use type="date" for a date picker
                  id="dob"
                  {...register("dob", {
                    required: "Date of Birth is required",
                    validate: value => {
                      const selectedDate = new Date(value);
                      const minDate = new Date('1900-01-01'); // Example minimum valid DOB
                      const maxDate = new Date(); // Cannot be in the future
                      if (selectedDate > maxDate) {
                        return "DOB cannot be in the future";
                      }
                      if (selectedDate < minDate) {
                        return "Please enter a valid DOB";
                      }
                      return true;
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? <PulseLoader size={8} color="#fff" /> : 'Send Reset Link'}
              </button>
              {message && isError && (
                <p className="text-red-500 text-center mt-3">{message}</p>
              )}
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              {isError ? (
                <p className="text-red-500 font-medium">{message}</p>
              ) : (
                <p className="text-green-600 dark:text-green-400 font-medium">{message}</p>
              )}
              <button
                onClick={handleClose}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg transition duration-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;