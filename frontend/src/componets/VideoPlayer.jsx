// componets/VideoPlayer.jsx
import React from 'react';
import ReactPlayer from 'react-player'; // You'll need to install this: npm install react-player

const VideoPlayer = ({ videoUrl, thumbnail }) => {
    if (!videoUrl) {
        return <div className="text-center text-gray-500 py-10">No video URL provided.</div>;
    }

    return (
        <div className="video-player-wrapper relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
            <ReactPlayer
                url={videoUrl}
                controls={true}
                playing={true} // Auto-play when selected
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
                light={thumbnail || false} // Use thumbnail as a preview image if available
                config={{
                    youtube: {
                        playerVars: { showinfo: 1 } // Example: show YouTube info
                    },
                    file: {
                        attributes: {
                            controlsList: 'nodownload' // Disable download button for direct files
                        }
                    }
                }}
            />
        </div>
    );
};

export default VideoPlayer;