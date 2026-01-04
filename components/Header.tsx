import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary tracking-tight">PB Tools</div>
        <nav className="hidden md:flex gap-8">
          <a href="#" className="font-medium text-secondary hover:text-primary transition-colors">Home</a>
          <a href="#tools-container" className="font-medium text-secondary hover:text-primary transition-colors">Tools</a>
          <a href="mailto:pbtoolsfree@gmail.com" className="font-medium text-secondary hover:text-primary transition-colors">Contact</a>
        </nav>
        {/* Mobile menu button placeholder for future implementation */}
        <button className="md:hidden text-secondary">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;