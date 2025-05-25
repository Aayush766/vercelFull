import React, { useState } from 'react';

const UploadGallery = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file || !title || !remarks) {
      alert('Please fill in all fields and choose a file.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      alert('File uploaded successfully!');
      setIsUploading(false);
      setFile(null);
      setTitle('');
      setRemarks('');
      onClose(); // close modal on successful upload
    }, 2000);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Upload Media to Gallery</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Choose File</label>
        <input
          type="file"
          accept="image/*, video/*"
          onChange={handleFileChange}
          className="mt-2 p-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Remarks</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleUpload}
          className={`px-4 py-2 rounded-md text-white ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default UploadGallery;
