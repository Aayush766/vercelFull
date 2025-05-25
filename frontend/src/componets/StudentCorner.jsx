import React from 'react';

const testimonials = [
  {
    name: "MRS. GEETA GANGWANI",
    title: "Principal",
    school: "Bal Bharti Public School, Rohini",
    text: "We have collaborated with GeniusKidz to provide tinkering and innovation platforms to our students. AI Program has been running successfully in the school and students have been greatly benefitted by the best in class services provided by GeniusKidz."
  },
  {
    name: "MRS. JYOTI ARORA",
    title: "Principal",
    school: "Mount Abu Public School, Delhi",
    text: "GeniusKidz team of experts have provided us with excellent technical support and their trainers assigned to our school were dedicated, energetic and committed. We would definitely recommend the team to other schools."
  },
  {
    name: "MRS. SWARNIMA LUTHRA",
    title: "Principal",
    school: "ASN Sr. Sec. School, Delhi",
    text: "GeniusKidz has an innovative, enthusiastic team that delivers what they promise by inculcating the same mindset in our students. I highly recommend them to everyone looking for STEM Education in their schools."
  }
];

const Testimonial = ({ name, title, school, text }) => (
  <div className="p-6 rounded-2xl shadow-md border border-gray-200 bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400">
    <h3 className="font-bold text-xl text-gray-800">{name}</h3>
    <h4 className="text-sm font-medium text-blue-600">{title}</h4>
    <h5 className="text-sm font-semibold text-gray-600 mb-3">{school}</h5>
    <p className="text-gray-700 leading-relaxed">{text}</p>
  </div>
);
const StudentCorner = () => {
  return (
    <section className="py-16 px-6 md:px-16 bg-gray-50">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12 uppercase">
        Testimonials
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {testimonials.map((testimonial, index) => (
          <Testimonial
            key={index}
            name={testimonial.name}
            title={testimonial.title}
            school={testimonial.school}
            text={testimonial.text}
          />
        ))}
      </div>
    </section>
  );
};

export default StudentCorner;
