import React from 'react';
import { X } from 'lucide-react';

const ResourceViewer = ({ type, resource, onClose }) => {
  if (!resource) return null;

  const { url, name } = resource;

  // Office Viewer requires encoded absolute URL for PPT
  const pptEmbedUrl =
    type === 'ppt'
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + url)}`
      : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>
        <h4 className="text-2xl font-bold mb-4 text-center">{name}</h4>

        <div className="w-full h-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          {type === 'pdf' && (
            <iframe
              src={url}
              title={name}
              className="w-full h-full"
              frameBorder="0"
            />
          )}

          {type === 'ppt' && (
            <iframe
              src={pptEmbedUrl}
              title={name}
              className="w-full h-full"
              frameBorder="0"
            />
          )}

          {type === 'video' && (
            <video src={url} controls className="w-full h-full object-contain" />
          )}

          {type === 'quiz' && (
            <iframe
              src={url}
              title={name}
              className="w-full h-full"
              frameBorder="0"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceViewer;
