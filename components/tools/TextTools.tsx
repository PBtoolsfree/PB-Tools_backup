import React, { useState, useEffect } from 'react';
import { Tool } from '../../types.ts';

interface TextToolsProps {
  tool: Tool;
}

const TextTools: React.FC<TextToolsProps> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<{ words: number; chars: number; lines: number } | null>(null);

  useEffect(() => {
    // Reset state when tool changes
    setInput('');
    setOutput('');
    setStats(null);
  }, [tool.id]);

  const processText = () => {
    let result = '';
    switch (tool.id) {
      case 'txt-case':
        // Handled by specific buttons in render
        break;
      case 'txt-dup':
        const lines = input.split('\n');
        const uniqueLines = [...new Set(lines)];
        result = uniqueLines.join('\n');
        break;
      case 'txt-sort':
        result = input.split('\n').sort().join('\n');
        break;
      case 'web-json':
        try {
          const obj = JSON.parse(input);
          result = JSON.stringify(obj, null, 2);
        } catch (e) {
          result = "Invalid JSON";
        }
        break;
      case 'web-b64':
        // Handled by specific buttons
        break;
      case 'web-url':
        // Handled by specific buttons
        break;
        case 'web-min':
            result = input.replace(/\s+/g, ' ').trim();
            break;
      default:
        break;
    }
    if (result) setOutput(result);
  };

  // Specific handlers
  const handleCase = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    switch (type) {
      case 'upper': setOutput(input.toUpperCase()); break;
      case 'lower': setOutput(input.toLowerCase()); break;
      case 'title': setOutput(input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())); break;
      case 'sentence': setOutput(input.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase())); break;
    }
  };

  const handleBase64 = (action: 'encode' | 'decode') => {
    try {
      setOutput(action === 'encode' ? btoa(input) : atob(input));
    } catch (e) {
      setOutput("Invalid input for Base64 operation");
    }
  };

  const handleUrl = (action: 'encode' | 'decode') => {
    try {
      setOutput(action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
    } catch (e) {
      setOutput("Invalid URL component");
    }
  };

  const handleCount = () => {
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const chars = input.length;
    const lines = input.split(/\r\n|\r|\n/).length;
    setStats({ words, chars, lines });
  };

  useEffect(() => {
    if (tool.id === 'txt-count') {
      handleCount();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, tool.id]);


  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-left mt-8">
      <div className="mb-4">
        <label className="block font-semibold text-slate-700 mb-2">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-48 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm shadow-inner"
          placeholder="Enter your text here..."
        />
      </div>

      {/* Controls based on Tool ID */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        {tool.id === 'txt-case' && (
          <>
            <button onClick={() => handleCase('upper')} className="btn-secondary px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 font-medium">UPPERCASE</button>
            <button onClick={() => handleCase('lower')} className="btn-secondary px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 font-medium">lowercase</button>
            <button onClick={() => handleCase('title')} className="btn-secondary px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 font-medium">Title Case</button>
            <button onClick={() => handleCase('sentence')} className="btn-secondary px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 font-medium">Sentence case</button>
          </>
        )}

        {tool.id === 'txt-dup' && (
           <button onClick={processText} className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark">Remove Duplicates</button>
        )}
        
        {tool.id === 'txt-sort' && (
           <button onClick={processText} className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark">Sort Alphabetically</button>
        )}

        {tool.id === 'web-json' && (
           <button onClick={processText} className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark">Format JSON</button>
        )}
         {tool.id === 'web-min' && (
           <button onClick={processText} className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark">Minify</button>
        )}

        {tool.id === 'web-b64' && (
          <>
            <button onClick={() => handleBase64('encode')} className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark">Encode</button>
            <button onClick={() => handleBase64('decode')} className="bg-slate-600 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-700">Decode</button>
          </>
        )}

        {tool.id === 'web-url' && (
          <>
            <button onClick={() => handleUrl('encode')} className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark">Encode</button>
            <button onClick={() => handleUrl('decode')} className="bg-slate-600 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-700">Decode</button>
          </>
        )}
      </div>

      {/* Output Area (or Stats) */}
      {tool.id === 'txt-count' ? (
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-100">
                <div className="text-3xl font-bold text-primary">{stats?.words || 0}</div>
                <div className="text-slate-500 text-sm uppercase tracking-wide font-semibold">Words</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-100">
                <div className="text-3xl font-bold text-primary">{stats?.chars || 0}</div>
                <div className="text-slate-500 text-sm uppercase tracking-wide font-semibold">Characters</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-100">
                <div className="text-3xl font-bold text-primary">{stats?.lines || 0}</div>
                <div className="text-slate-500 text-sm uppercase tracking-wide font-semibold">Lines</div>
            </div>
        </div>
      ) : (
        <div className="relative">
          <label className="block font-semibold text-slate-700 mb-2">Output</label>
          <textarea
            readOnly
            value={output}
            className="w-full h-48 p-4 bg-white rounded-xl border border-slate-200 outline-none font-mono text-sm"
          />
          {output && (
             <button 
             onClick={copyToClipboard}
             className="absolute top-10 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded text-xs font-medium transition-colors"
           >
             Copy
           </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TextTools;