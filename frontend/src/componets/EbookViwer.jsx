import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EbookViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { file } = location.state || {};

  useEffect(() => {
    if (!file) {
      navigate('/'); // Redirect if no file passed
    }
  }, [file, navigate]);

  const getExtension = (filename) => filename?.split('.').pop()?.toLowerCase();

  const renderContent = () => {
    const ext = getExtension(file);
    if (ext === 'ppt' || ext === 'pptx') {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            window.location.origin + file
          )}`}
          width="100%"
          height="600px"
          frameBorder="0"
          title="PPT Viewer"
          allowFullScreen
        />
      );
    } else {
      return <p className="text-center mt-10">Unsupported file format</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate(-1)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ⬅ Back
      </button>
      <h2 className="text-2xl font-bold mb-4 mt-4">Ebook Viewer</h2>
      {renderContent()}
    </div>
  );
};

export default EbookViewer;
