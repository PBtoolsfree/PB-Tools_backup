import React, { useState, useEffect } from 'react';
import { Tool } from '../../types';

interface GeneratorToolsProps {
  tool: Tool;
}

const GeneratorTools: React.FC<GeneratorToolsProps> = ({ tool }) => {
  const [output, setOutput] = useState('');
  
  // Random
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');

  // Colors
  const [hex, setHex] = useState('#2563EB');
  const [color1, setColor1] = useState('#2563EB');
  const [color2, setColor2] = useState('#1E293B');

  useEffect(() => {
    setOutput('');
  }, [tool.id]);

  const generate = () => {
    switch (tool.id) {
      case 'util-uuid':
        setOutput(crypto.randomUUID());
        break;
      case 'util-rand':
        const mn = parseInt(min);
        const mx = parseInt(max);
        if (!isNaN(mn) && !isNaN(mx)) {
            const rnd = Math.floor(Math.random() * (mx - mn + 1)) + mn;
            setOutput(rnd.toString());
        }
        break;
      case 'col-hex':
        // Hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        setOutput(`rgb(${r}, ${g}, ${b})`);
        break;
      case 'col-grad':
        setOutput(`background: linear-gradient(to right, ${color1}, ${color2});`);
        break;
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-8 text-left">
      <div className="grid gap-6 mb-8">
        {tool.id === 'util-rand' && (
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block font-semibold mb-1">Min</label>
                <input type="number" value={min} onChange={e => setMin(e.target.value)} className="w-full p-3 border rounded-lg" />
             </div>
             <div>
                <label className="block font-semibold mb-1">Max</label>
                <input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full p-3 border rounded-lg" />
             </div>
           </div>
        )}

        {tool.id === 'col-hex' && (
            <div>
               <label className="block font-semibold mb-1">Pick Color</label>
               <div className="flex gap-4">
                    <input type="color" value={hex} onChange={e => setHex(e.target.value)} className="h-12 w-24 cursor-pointer" />
                    <input type="text" value={hex} onChange={e => setHex(e.target.value)} className="flex-1 p-3 border rounded-lg font-mono uppercase" />
               </div>
            </div>
        )}

        {tool.id === 'col-grad' && (
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-semibold mb-1">Color 1</label>
                    <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-full h-12 cursor-pointer" />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Color 2</label>
                    <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-full h-12 cursor-pointer" />
                </div>
             </div>
        )}
      </div>

      <button
        onClick={generate}
        className="w-full py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-primary-dark mb-8"
      >
        {tool.id === 'col-hex' ? 'Convert to RGB' : tool.id === 'col-grad' ? 'Generate CSS' : 'Generate'}
      </button>

      {output && (
        <div className="relative p-6 bg-slate-50 border border-slate-200 rounded-xl text-center break-all">
          <p className="font-mono text-lg text-slate-700">{output}</p>
          
          {tool.id === 'col-grad' && (
             <div className="h-16 w-full mt-4 rounded-lg shadow-inner" style={{ background: `linear-gradient(to right, ${color1}, ${color2})` }}></div>
          )}

          <button 
             onClick={copy}
             className="mt-4 text-primary text-sm font-semibold hover:underline"
           >
             <i className="far fa-copy"></i> Copy Result
           </button>
        </div>
      )}
    </div>
  );
};

export default GeneratorTools;