import React from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ videoId }) => {
    const opts = {
        height: '480', // Adjusted height for a vertical video
        width: '270',  // Adjusted width for a vertical video
        playerVars: {
            //   autoplay: 1,
        },
    };

    return (
        <div className="w-full md:w-1/2 lg:w-1/4 xl:w-1/4 p-4 sm:flex sm:justify-center">
            <YouTube videoId={videoId} opts={opts} />
        </div>
    );
};

export default VideoPlayer;