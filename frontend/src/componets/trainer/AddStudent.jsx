import React, { useState } from 'react';
import Navbar from './Navbar';

const AddStudent = () => {
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    rollNo: '',
    grade: '',
    section: '',
    school: '',
    dob: '',
    fatherName: '',
    class: '', // Added class
  });

  const [students, setStudents] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save student data
    setStudents((prevStudents) => [...prevStudents, studentDetails]);

    // Clear form after submission
    setStudentDetails({
      name: '',
      rollNo: '',
      grade: '',
      section: '',
      school: '',
      dob: '',
      fatherName: '',
      class: '', // Reset class field
    });

    alert('Student added successfully!');
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-yellow-400">Add New Student</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={studentDetails.name}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="rollNo" className="block text-sm font-medium">
                Roll Number
              </label>
              <input
                type="number"
                id="rollNo"
                name="rollNo"
                value={studentDetails.rollNo}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="class" className="block text-sm font-medium">
                Class
              </label>
              <input
                type="text"
                id="class"
                name="class"
                value={studentDetails.class}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium">
                Grade
              </label>
              <select
                id="grade"
                name="grade"
                value={studentDetails.grade}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-500"
              >
                <option value="">Select Grade</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="section" className="block text-sm font-medium">
                Section
              </label>
              <select
                id="section"
                name="section"
                value={studentDetails.section}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-500"
              >
                <option value="">Select Section</option>
                {['A', 'B', 'C'].map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium">
                School
              </label>
              <input
                type="text"
                id="school"
                name="school"
                value={studentDetails.school}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={studentDetails.dob}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="fatherName" className="block text-sm font-medium">
                Father's Name
              </label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={studentDetails.fatherName}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-500"
              />
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-blue-600 dark:text-yellow-400">Enrolled Students</h3>
          <table className="w-full table-auto mt-4 border dark:border-gray-600">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Roll No</th>
                <th className="border px-4 py-2">Class</th>
                <th className="border px-4 py-2">Grade</th>
                <th className="border px-4 py-2">Section</th>
                <th className="border px-4 py-2">School</th>
                <th className="border px-4 py-2">Date of Birth</th>
                <th className="border px-4 py-2">Father's Name</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{student.name}</td>
                  <td className="border px-4 py-2">{student.rollNo}</td>
                  <td className="border px-4 py-2">{student.class}</td>
                  <td className="border px-4 py-2">{student.grade}</td>
                  <td className="border px-4 py-2">{student.section}</td>
                  <td className="border px-4 py-2">{student.school}</td>
                  <td className="border px-4 py-2">{student.dob}</td>
                  <td className="border px-4 py-2">{student.fatherName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default AddStudent;
