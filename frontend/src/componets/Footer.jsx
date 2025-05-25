import React from 'react';
import {
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaInstagram,
  FaWhatsapp,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = ({ darkMode }) => {
  return (
    <footer
      className={`mt-16 pt-12 pb-6 px-4 sm:px-12 
        ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800'}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        {/* Our Socials */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
              ${darkMode ? 'from-white to-gray-400' : 'from-gray-800 to-black'} mb-4 uppercase`}
          >
            Our Socials
          </h2>
          <div className="flex justify-center gap-6 mt-4">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF
                className={`w-8 h-8 hover:scale-110 hover:rotate-6 transition-transform duration-300 
                  ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
              />
            </a>
            <a
              href="https://www.youtube.com/@GeniusKidz-ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube
                className={`w-8 h-8 hover:scale-110 hover:rotate-6 transition-transform duration-300 
                  ${darkMode ? 'text-red-400' : 'text-red-600'}`}
              />
            </a>
            <a
              href="https://www.linkedin.com/company/genius-kidz-ai/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedinIn
                className={`w-8 h-8 hover:scale-110 hover:rotate-6 transition-transform duration-300 
                  ${darkMode ? 'text-blue-300' : 'text-blue-500'}`}
              />
            </a>
            <a
              href="https://www.instagram.com/geniuskidz.ai/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram
                className={`w-8 h-8 hover:scale-110 hover:rotate-6 transition-transform duration-300 
                  ${darkMode ? 'text-pink-400' : 'text-pink-500'}`}
              />
            </a>
            <a
              href="https://wa.me/+918081932907"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp
                className={`w-8 h-8 hover:scale-110 hover:rotate-6 transition-transform duration-300 
                  ${darkMode ? 'text-green-400' : 'text-green-500'}`}
              />
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center">
          <h3 className="text-3xl font-semibold mb-4">Contact Information</h3>
          <p className="mb-2">📍 B-30, Sector-6, Noida - 201301, UP, India</p>
          <p className="mb-2">📞 +966-563728499, +91-8860787494</p>
          <p>📧 info@geniuskidz.ai</p>
        </div>

        {/* Footer Note */}
        <div
          className={`mt-8 text-center text-sm 
            ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          &copy; {new Date().getFullYear()} Genius Kidz AI. All rights reserved.
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
