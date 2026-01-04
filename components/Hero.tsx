import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-blue-100 text-center py-16 px-6">
      <h1 className="text-3xl md:text-5xl font-extrabold text-secondary mb-4 leading-tight">
        Your Daily Tools, All in One Place
      </h1>
      <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
        Convert, calculate, compress, and simplify your everyday tasks — fast and free.
      </p>
      <a 
        href="#tools-container" 
        className="inline-block bg-primary hover:bg-primary-dark text-white py-3 px-8 rounded-full font-semibold transition-colors duration-300 shadow-lg shadow-blue-500/30"
      >
        Explore Tools
      </a>
      <div className="mt-10 flex justify-center gap-8 text-2xl text-primary opacity-70">
        <i className="fas fa-image"></i>
        <i className="fas fa-file-pdf"></i>
        <i className="fas fa-calculator"></i>
        <i className="fas fa-code"></i>
      </div>
    </section>
  );
};

export default Hero;