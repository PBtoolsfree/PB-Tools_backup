import React from 'react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <div 
      className="group bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 hover:border-blue-200 flex flex-col items-start h-full cursor-pointer"
      onClick={() => onClick(tool)}
    >
      <i className={`${tool.iconClass} text-3xl text-primary mb-4 transition-transform group-hover:scale-110 duration-300`}></i>
      <h3 className="text-lg font-bold text-secondary mb-2">{tool.name}</h3>
      <p className="text-sm text-slate-500 mb-6 flex-grow">{tool.description}</p>
      <div className="w-full bg-blue-50 text-primary py-2 px-4 rounded-md text-sm font-semibold text-center group-hover:bg-primary group-hover:text-white transition-colors duration-200">
        Use Tool
      </div>
    </div>
  );
};

export default ToolCard;