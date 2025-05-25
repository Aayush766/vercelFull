import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import ModelCanvas from "./canvas/Robo"; // Make sure path is correct

const QueryForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    reset();
    alert("Thank you for reaching out!");
  };

  return (
    <div className="bg-gradient-to-r from-gray-200 to-gray-50 py-20 px-6 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-10"
      >
        {/* Left: 3D Model */}
        <div className="w-full md:w-1/2 h-[500px] rounded-xl overflow-hidden ">
          <ModelCanvas />
        </div>

        {/* Right: Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full md:w-1/2 bg-white shadow-2xl rounded-xl px-10 py-12 space-y-6 border border-gray-200 bg-gradient-to-r from-gray-500 to-gray-200"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-black uppercase ">
            Send Us a Query
          </h2>

          <div>
            <label className="block mb-2 text-black font-bold">Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white"
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block mb-2 text-black font-bold ">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email format",
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600  bg-white"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-2 text-black font-bold">Subject</label>
            <input
              type="text"
              {...register("subject", { required: "Subject is required" })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600  bg-white"
              placeholder="Query subject"
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="block mb-2 text-black font-bold">Message</label>
            <textarea
              rows="5"
              {...register("message", { required: "Message is required" })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600  bg-white"
              placeholder="Type your message here..."
            ></textarea>
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
          </div>

          <div className="flex justify-center">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-gray-700 to-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-2xl transition duration-300"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default QueryForm;
