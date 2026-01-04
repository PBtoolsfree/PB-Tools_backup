import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-slate-300 py-12 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center">
        <div className="text-white font-bold text-xl mb-2">PB Tools</div>
        <p className="mb-6 opacity-80">Simplifying your digital life.</p>
        
        <div className="flex justify-center mb-6">
          <a href="mailto:pbtoolsfree@gmail.com" className="bg-white/10 hover:bg-white/20 transition-colors py-2 px-4 rounded flex items-center gap-2 text-sm text-white">
            <i className="far fa-envelope"></i> pbtoolsfree@gmail.com
          </a>
        </div>

        <div className="flex gap-6 text-sm mb-6">
          <a href="#" className="hover:text-white hover:underline transition-all">Privacy Policy</a>
          <span className="opacity-50">|</span>
          <a href="#" className="hover:text-white hover:underline transition-all">Terms of Use</a>
        </div>
        
        <p className="text-xs opacity-60">&copy; {new Date().getFullYear()} PB Tools. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;