import React, { useState } from 'react';
import { X } from 'lucide-react';

const sampleVideos = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Introduction to STEM',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  },
  {
    id: '2vjPBrBU-TM',
    title: 'Benefits of Robotics in Education',
    thumbnail: 'https://img.youtube.com/vi/2vjPBrBU-TM/mqdefault.jpg',
  },
  {
    id: '3JZ_D3ELwOQ',
    title: 'The Future of Technology',
    thumbnail: 'https://img.youtube.com/vi/3JZ_D3ELwOQ/mqdefault.jpg',
  },
];

const VideoPlayer = ({ videoList = sampleVideos, onClose }) => {
  const [selectedVideo, setSelectedVideo] = useState(videoList.length > 0 ? videoList[0].id : null);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold">Video Resources</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Video Player */}
          <div className="md:w-3/4 h-[300px] md:h-auto relative">
            {selectedVideo ? (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}`}
                title="YouTube video player"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">No video selected</p>
              </div>
            )}
          </div>

          {/* Video List */}
          <div className="md:w-1/4 overflow-y-auto p-4 border-t md:border-t-0 md:border-l dark:border-gray-700">
            <h4 className="font-medium mb-3">Available Videos</h4>
            <div className="space-y-3">
              {videoList.map((video) => (
                <div
                  key={video.id}
                  className={`group cursor-pointer rounded-lg overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedVideo === video.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedVideo(video.id)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-blue-600 border-b-[8px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
