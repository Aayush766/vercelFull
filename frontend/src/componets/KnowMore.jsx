import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KnowMore = () => {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      window.location.href = "https://geniuskidzai.netlify.app/";
    }, 2000); // Delay to match loader animation
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-20 bg-black text-white overflow-hidden">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-10 bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text uppercase tracking-wider">
        Know More
      </h2>

      {/* Hoverable Button */}
      <motion.button
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 shadow-xl text-white font-semibold text-xs uppercase flex items-center justify-center transition-all duration-300 ease-in-out relative"
      >
        {hovered ? (
          <motion.span
            key="hover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-2 text-center text-[12px]"
          >
            Know More About Us
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg"
          >
            Go
          </motion.span>
        )}
      </motion.button>

      {/* Redirecting Loader */}
      <AnimatePresence>
        {clicked && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-full py-6 bg-gradient-to-r from-purple-800/80 to-black flex justify-center items-center"
          >
            <div className="flex flex-col items-center">
              <div className="loader mb-2 border-4 border-white border-t-transparent rounded-full w-8 h-8 animate-spin" />
              <span className="text-white text-lg font-medium">Redirecting...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowMore;
