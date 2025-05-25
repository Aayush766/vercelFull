import React from "react";
import { motion } from "framer-motion";
import logo1 from "../assets/logo1.jpg";
import logos2 from "../assets/logos2.jpg";
import logos3 from "../assets/logos3.jpg";
import logo4 from "../assets/logo4.jpg";

const Partner = () => {
  const partners = [logo1, logos2, logos3,logo4];

  return (
    <div className="bg-gradient-to-r from-gray-200 to-gray-50 py-16 px-6 sm:px-16">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      {/* Heading */}
      <h2 className="text-4xl sm:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-black mb-12 uppercase">
        Strategic Partners & Alliances
      </h2>
        {/* Auto slider for images */}
        <div className="overflow-hidden w-full scrollbar-hide">
          <div className="flex items-center  w-full animate-scroll gap-0">
            {partners.map((partner, index) => (
             
                <img
                  src={partner}
                  alt={`Partner ${index + 1}`}
                  className="w-full h-auto object-contain"
                />
        
            ))}
          </div>
          </div>

      </motion.div>
    </div>
  );
};

export default Partner;
