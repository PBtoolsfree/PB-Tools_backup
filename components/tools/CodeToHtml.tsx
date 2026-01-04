import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const CodeToHtml: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const [outputHtml, setOutputHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'source' | 'preview'>('source');

  const handleConvert = async () => {
    if (!inputCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutputHtml('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Convert the following text/code to clean, semantic HTML5. 
        - If it is Markdown, convert it to valid HTML (h1, p, ul, etc.).
        - If it is a code snippet (like JS, Python, CSS), wrap it in <pre><code> tags and escape HTML entities properly.
        - Return ONLY the HTML code. Do not wrap it in markdown code blocks (no \`\`\`html).
        - Do not include <html>, <head>, or <body> tags, just the body content.
        
        Input:
        ${inputCode}`
      });

      const text = response.text;
      if (text) {
        // Clean up if the model accidentally included markdown code blocks
        const cleanedText = text.replace(/^```html\s*/, '').replace(/```\s*$/, '');
        setOutputHtml(cleanedText);
      } else {
        setError("Could not generate HTML. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during conversion.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputHtml);
  };

  const downloadHtml = () => {
    if (!outputHtml) return;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Converted HTML</title>
<style>
  body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; color: #333; }
  pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
  code { font-family: monospace; color: #d63384; }
  blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #666; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; }
</style>
</head>
<body>
${outputHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto text-left mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="flex flex-col">
          <label className="font-semibold text-slate-700 mb-2">Input (Markdown or Code)</label>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="# Hello World&#10;&#10;Type some markdown or paste code here..."
            className="w-full h-96 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm resize-none shadow-inner"
          />
          <button
            onClick={handleConvert}
            disabled={!inputCode.trim() || isLoading}
            className={`mt-4 w-full py-3 rounded-xl font-bold text-white shadow-md transition-all ${
              !inputCode.trim() || isLoading
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin"></i> Converting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-code"></i> Convert to HTML
              </span>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="flex flex-col">
          <div className="flex justify-between items-end mb-2">
            <label className="font-semibold text-slate-700">Output</label>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('source')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'source' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                HTML Source
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'preview' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
          
          <div className="relative h-96 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {error ? (
              <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">
                <div>
                    <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>{error}</p>
                </div>
              </div>
            ) : outputHtml ? (
              activeTab === 'source' ? (
                <textarea
                  readOnly
                  value={outputHtml}
                  className="w-full h-full p-4 bg-slate-50 font-mono text-sm text-slate-700 resize-none outline-none border-none"
                />
              ) : (
                <div 
                  className="w-full h-full p-4 overflow-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: outputHtml }} 
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50/50">
                <p>Converted HTML will appear here</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
             <button
              onClick={downloadHtml}
              disabled={!outputHtml}
              className={`flex-1 py-2 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2 ${
                !outputHtml 
                 ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
                 : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-blue-200'
              }`}
            >
              <i className="fas fa-download"></i> Download HTML
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!outputHtml}
              className={`flex-1 py-2 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2 ${
                !outputHtml 
                 ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
                 : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-blue-200'
              }`}
            >
              <i className="far fa-copy"></i> Copy Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeToHtml;