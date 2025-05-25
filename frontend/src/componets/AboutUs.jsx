import React from 'react';
import stemImage from '../assets/stem.png'; // Use any image you want
import { motion } from 'framer-motion';
const AboutUs = () => {
  return (
    <div className="py-16 px-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
        Learn STEM the Smart Way
      </h2>
      <h2 className="text-3xl md:text-4xl font-bold text-left text-gray-800 ">
        About Us
      </h2>
      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 ">
        {/* Left - Description */}
       
        <div className="w-full md:w-1/2 text-gray-600 text-lg leading-relaxed">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Fusce quis nulla id orci tincidunt malesuada. 
            Sed vitae convallis orci, eu tincidunt nulla. 
            Morbi et sagittis orci. 
            Suspendisse potenti. 
            Integer porta, eros non euismod gravida, 
            libero urna malesuada ligula, 
            vel suscipit velit nunc non velit. 
            Cras nec libero felis. 
            Aenean sodales, nibh vitae placerat feugiat, justo lacus pharetra lacus, 
            non lobortis risus nisi a sapien.
          </p>
        </div>

        {/* Right - Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <img 
            src={stemImage} 
            alt="About STEM" 
            className="rounded-lg shadow-lg w-3/4 md:w-full"
          />
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
