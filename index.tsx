import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Declare global libraries added via CDN
declare var PDFLib: any;
declare var download: any;

// --- TYPES ---
interface Tool {
  id: string;
  name: string;
  description: string;
  iconClass: string;
  link?: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  iconClass: string;
  tools: Tool[];
}

// --- CONSTANTS ---
const TOOLS_DATA: Category[] = [
  {
    id: 'image',
    title: 'Image Tools',
    description: 'Edit, convert, and manage your images.',
    iconClass: 'fas fa-image',
    tools: [
      { id: 'img-conv', name: 'Image Converter', description: 'Convert images between JPG, PNG, WEBP, and more.', iconClass: 'fas fa-exchange-alt' },
      { id: 'img-comp', name: 'Image Compressor', description: 'Reduce image file size without losing quality.', iconClass: 'fas fa-compress-arrows-alt' },
      { id: 'img-res', name: 'Image Resizer', description: 'Resize images to specific dimensions easily.', iconClass: 'fas fa-expand' },
      { id: 'img-crop', name: 'Image Cropper', description: 'Crop specific areas of your photos.', iconClass: 'fas fa-crop' },
      { id: 'img-ocr', name: 'Image to Text (OCR)', description: 'Extract text from images using AI.', iconClass: 'fas fa-font' },
      { id: 'img-rot', name: 'Image Rotator/Flipper', description: 'Rotate or flip images vertically and horizontally.', iconClass: 'fas fa-sync' },
    ]
  },
  {
    id: 'document',
    title: 'Document Tools',
    description: 'Manage PDFs and Documents efficiently.',
    iconClass: 'fas fa-file-pdf',
    tools: [
      { id: 'doc-p2w', name: 'PDF to Word (AI)', description: 'Extract text from PDF files using AI.', iconClass: 'fas fa-file-word' },
      { id: 'doc-w2p', name: 'Word to PDF', description: 'Convert text/content to PDF format.', iconClass: 'fas fa-file-pdf' },
      { id: 'doc-mrg', name: 'PDF Merger', description: 'Combine multiple PDF files into one.', iconClass: 'fas fa-object-group' },
      { id: 'doc-lock', name: 'PDF Lock', description: 'Add password protection to your PDF.', iconClass: 'fas fa-lock' },
      { id: 'doc-comp', name: 'PDF Compressor', description: 'Shrink PDF file sizes (Simulated).', iconClass: 'fas fa-compress' },
      { id: 'doc-sign', name: 'eSign Generator', description: 'Create digital signatures.', iconClass: 'fas fa-signature' },
    ]
  },
  {
    id: 'calculator',
    title: 'Calculator Tools',
    description: 'Quick computations for math, finance, and health.',
    iconClass: 'fas fa-calculator',
    tools: [
      { id: 'calc-sci', name: 'Scientific Calculator', description: 'Advanced math functions and operations.', iconClass: 'fas fa-flask' },
      { id: 'calc-age', name: 'Age Calculator', description: 'Calculate exact age in years, months, and days.', iconClass: 'fas fa-birthday-cake' },
      { id: 'calc-bmi', name: 'BMI Calculator', description: 'Check your Body Mass Index quickly.', iconClass: 'fas fa-weight' },
      { id: 'calc-emi', name: 'Loan EMI Calculator', description: 'Estimate monthly loan payments.', iconClass: 'fas fa-home' },
      { id: 'calc-gst', name: 'GST Calculator', description: 'Calculate Goods and Services Tax.', iconClass: 'fas fa-percent' },
      { id: 'calc-curr', name: 'Currency Converter', description: 'Live exchange rates for global currencies.', iconClass: 'fas fa-coins' },
    ]
  },
  {
    id: 'text',
    title: 'Text Tools',
    description: 'Manipulate and analyze text strings.',
    iconClass: 'fas fa-align-left',
    tools: [
      { id: 'txt-case', name: 'Text Case Converter', description: 'Upper, lower, title, and sentence case.', iconClass: 'fas fa-text-height' },
      { id: 'txt-count', name: 'Word & Char Counter', description: 'Count words, characters, and sentences.', iconClass: 'fas fa-list-ol' },
      { id: 'txt-dup', name: 'Remove Duplicate Lines', description: 'Clean up lists by removing repeats.', iconClass: 'fas fa-remove-format' },
      { id: 'txt-sort', name: 'Text Sorter', description: 'Sort text alphabetically or numerically.', iconClass: 'fas fa-sort-alpha-down' },
      { id: 'txt-enc', name: 'Text Encryptor', description: 'Encrypt and decrypt text securely.', iconClass: 'fas fa-user-secret' },
    ]
  },
  {
    id: 'web',
    title: 'Web & Dev Tools',
    description: 'Essential utilities for developers.',
    iconClass: 'fas fa-code',
    tools: [
      { id: 'web-html', name: 'Markdown/Code to HTML', description: 'Convert Markdown or Code snippets to clean HTML.', iconClass: 'fab fa-html5' },
      { id: 'web-min', name: 'HTML/CSS/JS Minifier', description: 'Minify code to improve load speeds.', iconClass: 'fas fa-file-code' },
      { id: 'web-json', name: 'JSON Formatter', description: 'Validate and prettify JSON data.', iconClass: 'fas fa-brackets-curly' },
      { id: 'web-b64', name: 'Base64 Encode/Decode', description: 'Convert data to Base64 format.', iconClass: 'fas fa-database' },
      { id: 'web-url', name: 'URL Encoder/Decoder', description: 'Encode special characters in URLs.', iconClass: 'fas fa-link' },
    ]
  },
  {
    id: 'color',
    title: 'Color Tools',
    description: 'Generators and converters for designers.',
    iconClass: 'fas fa-palette',
    tools: [
      { id: 'col-pick', name: 'Color Picker from Image', description: 'Get the HEX code from any image.', iconClass: 'fas fa-eye-dropper' },
      { id: 'col-hex', name: 'HEX to RGB Converter', description: 'Convert color formats instantly.', iconClass: 'fas fa-swatchbook' },
      { id: 'col-cont', name: 'Contrast Checker', description: 'Ensure web accessibility compliance.', iconClass: 'fas fa-adjust' },
      { id: 'col-grad', name: 'Gradient Generator', description: 'Create CSS backgrounds effortlessly.', iconClass: 'fas fa-rainbow' },
    ]
  },
  {
    id: 'seo',
    title: 'SEO & Marketing',
    description: 'Optimize content for search engines.',
    iconClass: 'fas fa-search-dollar',
    tools: [
      { id: 'seo-kw', name: 'Keyword Density', description: 'Check how often keywords appear.', iconClass: 'fas fa-key' },
      { id: 'seo-meta', name: 'Meta Tag Analyzer', description: 'Analyze page meta titles and descriptions.', iconClass: 'fas fa-tags' },
    ]
  },
  {
    id: 'utility',
    title: 'Utility Tools',
    description: 'Everyday helper tools.',
    iconClass: 'fas fa-cogs',
    tools: [
      { id: 'util-qr', name: 'QR Code Generator', description: 'Create QR codes for links and text.', iconClass: 'fas fa-qrcode' },
      { id: 'util-bar', name: 'Barcode Generator', description: 'Generate barcodes for products.', iconClass: 'fas fa-barcode' },
      { id: 'util-uuid', name: 'UUID Generator', description: 'Generate unique identifiers (v4.', iconClass: 'fas fa-fingerprint' },
      { id: 'util-unit', name: 'Unit Converter', description: 'Length, weight, temperature, and more.', iconClass: 'fas fa-balance-scale' },
      { id: 'util-rand', name: 'Random Generator', description: 'Generate random numbers or passwords.', iconClass: 'fas fa-dice' },
    ]
  },
];

// --- SHARED COMPONENTS ---

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
        <button className="md:hidden text-secondary">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
    </header>
  );
};

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
        
        <p className="text-xs opacity-60">&copy; {new Date().getFullYear()} PB Tools. All rights reserved.</p>
      </div>
    </footer>
  );
};

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


// --- TOOL COMPONENTS ---

const ImageToText: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
       processFile(droppedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setExtractedText('');
    setError(null);
  }

  const extractText = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            },
            { text: "Extract all text present in this image. Output only the raw text found, preserving layout where possible." }
          ]
        }
      });

      const text = response.text;
      if (text) {
        setExtractedText(text);
      } else {
        setError("No text identified in the image.");
      }

    } catch (err) {
      console.error(err);
      setError("Failed to process image. Please try again. Ensure API Key is set.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const downloadHtml = () => {
    if (!extractedText) return;

    const safeText = extractedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Extracted Text</title>
</head>
<body>
    <pre>${safeText}</pre>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-left mt-8">
      <div 
        className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 p-8 text-center transition-colors hover:bg-blue-50 hover:border-blue-300 cursor-pointer mb-8"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        {previewUrl ? (
          <div className="relative inline-block">
            <img src={previewUrl} alt="Preview" className="max-h-80 rounded-lg shadow-sm mx-auto object-contain" />
            <div className="mt-4 text-sm text-slate-500">Click or drag to replace image</div>
          </div>
        ) : (
          <div className="py-8">
            <i className="fas fa-cloud-upload-alt text-5xl text-blue-300 mb-4"></i>
            <p className="text-lg font-medium text-slate-700 mb-1">Click to upload or drag and drop</p>
            <p className="text-sm text-slate-400">JPG, PNG, WEBP</p>
          </div>
        )}
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={extractText}
          disabled={!file || isLoading}
          className={`px-8 py-3 rounded-full font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${
            !file || isLoading 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-primary hover:bg-primary-dark shadow-blue-500/30'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <i className="fas fa-spinner fa-spin"></i> Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fas fa-magic"></i> Extract Text
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-center border border-red-100">
          <i className="fas fa-exclamation-circle mr-2"></i> {error}
        </div>
      )}

      {extractedText && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-slate-700">Extracted Text</h3>
            <div className="flex gap-2">
                <button 
                  onClick={downloadHtml}
                  className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-2 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <i className="fas fa-file-code"></i> Download HTML
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-2 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <i className="far fa-copy"></i> Copy
                </button>
            </div>
          </div>
          <div className="p-6">
            <textarea 
              readOnly 
              value={extractedText}
              className="w-full h-64 p-4 bg-slate-50 rounded-lg border-none resize-y focus:ring-0 focus:outline-none text-slate-700 font-mono text-sm leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};

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
        - Return ONLY the HTML code.
        - Do not include <html>, <head>, or <body> tags, just the body content.
        
        Input:
        ${inputCode}`
      });

      const text = response.text;
      if (text) {
        const cleanedText = text.replace(/^```html\s*/, '').replace(/```\s*$/, '');
        setOutputHtml(cleanedText);
      } else {
        setError("Could not generate HTML. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Check API Key.");
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
  };

  return (
    <div className="w-full max-w-5xl mx-auto text-left mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <label className="font-semibold text-slate-700 mb-2">Input (Markdown or Code)</label>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="# Hello World&#10;&#10;Type some markdown or paste code here..."
            className="w-full h-96 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none font-mono text-sm resize-none"
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
            {isLoading ? 'Converting...' : 'Convert to HTML'}
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-end mb-2">
            <label className="font-semibold text-slate-700">Output</label>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button onClick={() => setActiveTab('source')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'source' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>HTML Source</button>
              <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Preview</button>
            </div>
          </div>
          
          <div className="relative h-96 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {error ? (
              <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">{error}</div>
            ) : outputHtml ? (
              activeTab === 'source' ? (
                <textarea readOnly value={outputHtml} className="w-full h-full p-4 bg-slate-50 font-mono text-sm text-slate-700 resize-none outline-none border-none" />
              ) : (
                <div className="w-full h-full p-4 overflow-auto prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: outputHtml }} />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50/50">Converted HTML will appear here</div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
             <button onClick={downloadHtml} disabled={!outputHtml} className={`flex-1 py-2 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2 ${!outputHtml ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><i className="fas fa-download"></i> Download HTML</button>
            <button onClick={copyToClipboard} disabled={!outputHtml} className={`flex-1 py-2 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2 ${!outputHtml ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><i className="far fa-copy"></i> Copy Code</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageTools: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFile(null); setPreviewUrl(null); setResultUrl(null); setPickedColor(null); setRotation(0); setFlipH(false); setFlipV(false);
  }, [tool.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        const img = new Image();
        img.src = url;
        img.onload = () => { setWidth(img.naturalWidth); setHeight(img.naturalHeight); };
    }
  };

  const handleProcess = () => {
    if (!previewUrl || !imgRef.current) return;
    setIsLoading(true);
    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = imgRef.current;
            if (!ctx || !img) return;

            if (tool.id === 'img-rot') {
                const rads = rotation * Math.PI / 180;
                const s = Math.sin(rads);
                if (Math.abs(s) > 0.9) { canvas.width = img.naturalHeight; canvas.height = img.naturalWidth; }
                else { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; }
                ctx.translate(canvas.width/2, canvas.height/2);
                ctx.rotate(rads);
                ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
                if (Math.abs(s) > 0.9) ctx.drawImage(img, -img.naturalHeight/2, -img.naturalWidth/2);
                else ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
                setResultUrl(canvas.toDataURL(file?.type));
            } else if (tool.id === 'img-res') {
                canvas.width = width; canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                setResultUrl(canvas.toDataURL(file?.type));
            } else {
                canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
                if (format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
                ctx.drawImage(img, 0, 0);
                const q = tool.id === 'img-comp' ? quality / 100 : 0.92;
                setResultUrl(canvas.toDataURL(format, q));
            }
        } catch(e) { console.error(e); } finally { setIsLoading(false); }
    }, 100);
  };

  const handleColorPick = (e: React.MouseEvent<HTMLImageElement>) => {
      if (tool.id !== 'col-pick' || !imgRef.current) return;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = imgRef.current.naturalWidth;
      canvas.height = imgRef.current.naturalHeight;
      ctx.drawImage(imgRef.current, 0, 0);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      const p = ctx.getImageData(x, y, 1, 1).data;
      const hex = "#" + ("000000" + ((p[0] << 16) | (p[1] << 8) | p[2]).toString(16)).slice(-6);
      setPickedColor(hex);
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-left mt-8">
      <div className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 p-8 text-center cursor-pointer mb-8" onClick={() => fileInputRef.current?.click()}>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        {previewUrl ? <img ref={imgRef} src={previewUrl} className={`max-h-80 rounded-lg mx-auto ${tool.id === 'col-pick' ? 'cursor-crosshair' : ''}`} style={tool.id === 'img-rot' ? {transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`} : {}} onClick={handleColorPick} /> : <div className="py-8"><i className="fas fa-cloud-upload-alt text-5xl text-blue-300 mb-4"></i><p>Click to upload image</p></div>}
      </div>
      
      {file && tool.id !== 'col-pick' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-wrap gap-6 items-end">
            {tool.id === 'img-conv' && <select value={format} onChange={e => setFormat(e.target.value)} className="p-2 border rounded"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select>}
            {tool.id === 'img-comp' && <input type="range" min="1" max="100" value={quality} onChange={e => setQuality(parseInt(e.target.value))} className="w-48" />}
            {tool.id === 'img-res' && <div className="flex gap-2"><input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="border p-2 w-24" /><input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="border p-2 w-24" /></div>}
            {tool.id === 'img-rot' && <div className="flex gap-2"><button onClick={() => setRotation(r => r-90)} className="btn p-2 border"><i className="fas fa-undo"></i></button><button onClick={() => setRotation(r => r+90)} className="btn p-2 border"><i className="fas fa-redo"></i></button><button onClick={() => setFlipH(!flipH)} className="btn p-2 border">Flip H</button></div>}
            <button onClick={handleProcess} className="px-6 py-2 bg-primary text-white rounded shadow">{isLoading ? 'Processing...' : 'Process'}</button>
        </div>
      )}

      {tool.id === 'col-pick' && pickedColor && (
          <div className="p-4 bg-slate-50 border rounded flex gap-4 items-center"><div className="w-12 h-12 rounded-full border" style={{background:pickedColor}}></div><span className="font-mono text-xl">{pickedColor}</span></div>
      )}

      {resultUrl && (
          <div className="bg-green-50 p-8 text-center rounded-xl border border-green-200">
              <img src={resultUrl} className="max-h-64 mx-auto mb-4 border" />
              <a href={resultUrl} download="processed.png" className="px-8 py-3 bg-green-600 text-white rounded-full">Download</a>
          </div>
      )}
    </div>
  );
};

const TextTools: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    
    useEffect(() => { setInput(''); setOutput(''); }, [tool.id]);

    const process = () => {
        if(tool.id === 'txt-dup') setOutput([...new Set(input.split('\n'))].join('\n'));
        if(tool.id === 'txt-sort') setOutput(input.split('\n').sort().join('\n'));
        if(tool.id === 'web-json') try { setOutput(JSON.stringify(JSON.parse(input), null, 2)); } catch { setOutput('Invalid JSON'); }
        if(tool.id === 'web-min') setOutput(input.replace(/\s+/g, ' ').trim());
    }

    return (
        <div className="w-full max-w-4xl mx-auto text-left mt-8">
            <textarea value={input} onChange={e => setInput(e.target.value)} className="w-full h-48 p-4 border rounded mb-4" placeholder="Input text..." />
            <div className="mb-6 flex gap-2">
                {tool.id === 'txt-case' && ['upper','lower','title'].map(m => <button key={m} onClick={() => setOutput(m === 'upper' ? input.toUpperCase() : m === 'lower' ? input.toLowerCase() : input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()))} className="px-4 py-2 bg-slate-200 rounded capitalize">{m}</button>)}
                {tool.id === 'web-b64' && <><button onClick={() => setOutput(btoa(input))} className="btn bg-primary text-white px-4 py-2 rounded">Encode</button><button onClick={() => setOutput(atob(input))} className="btn bg-slate-600 text-white px-4 py-2 rounded">Decode</button></>}
                {['txt-dup','txt-sort','web-json','web-min'].includes(tool.id) && <button onClick={process} className="btn bg-primary text-white px-6 py-2 rounded">Process</button>}
            </div>
            <textarea readOnly value={output} className="w-full h-48 p-4 bg-slate-50 border rounded" />
        </div>
    )
}

const CalculatorTools: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [v1, setV1] = useState('');
    const [v2, setV2] = useState('');
    const [v3, setV3] = useState('');
    const [res, setRes] = useState<string|null>(null);

    const calc = () => {
        if (tool.id === 'calc-bmi' && v1 && v2) {
             const h = parseFloat(v1)/100; const w = parseFloat(v2);
             setRes((w/(h*h)).toFixed(2));
        }
        if (tool.id === 'calc-age' && v1) {
             const age = Math.floor((new Date().getTime() - new Date(v1).getTime()) / 31557600000);
             setRes(age + " Years");
        }
        if (tool.id === 'calc-sci') {
            try { setRes(eval(v1)); } catch { setRes('Error'); }
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto mt-8">
            <div className="grid gap-4 mb-4">
                {tool.id === 'calc-bmi' && <><input placeholder="Height (cm)" value={v1} onChange={e=>setV1(e.target.value)} className="p-3 border rounded"/><input placeholder="Weight (kg)" value={v2} onChange={e=>setV2(e.target.value)} className="p-3 border rounded"/></>}
                {tool.id === 'calc-age' && <input type="date" value={v1} onChange={e=>setV1(e.target.value)} className="p-3 border rounded"/>}
                {tool.id === 'calc-sci' && <input placeholder="Expression (e.g. 5*5)" value={v1} onChange={e=>setV1(e.target.value)} className="p-3 border rounded"/>}
            </div>
            <button onClick={calc} className="w-full py-3 bg-primary text-white rounded font-bold">Calculate</button>
            {res && <div className="mt-4 p-4 bg-green-50 border-green-200 border rounded text-2xl font-bold text-green-700">{res}</div>}
        </div>
    )
}

const GeneratorTools: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [out, setOut] = useState('');
    const [c1, setC1] = useState('#000000');
    const [c2, setC2] = useState('#ffffff');

    const gen = () => {
        if(tool.id === 'util-uuid') setOut(crypto.randomUUID());
        if(tool.id === 'col-grad') setOut(`background: linear-gradient(to right, ${c1}, ${c2});`);
        if(tool.id === 'col-hex') { const r = parseInt(c1.slice(1,3),16); const g=parseInt(c1.slice(3,5),16); const b=parseInt(c1.slice(5,7),16); setOut(`rgb(${r},${g},${b})`); }
    }

    return (
        <div className="w-full max-w-lg mx-auto mt-8 text-left">
             <div className="mb-4">
                 {(tool.id === 'col-grad' || tool.id === 'col-hex') && <input type="color" value={c1} onChange={e=>setC1(e.target.value)} className="h-12 w-full mb-2"/>}
                 {tool.id === 'col-grad' && <input type="color" value={c2} onChange={e=>setC2(e.target.value)} className="h-12 w-full"/>}
             </div>
             <button onClick={gen} className="w-full py-3 bg-primary text-white rounded font-bold mb-4">Generate</button>
             {out && <div className="p-4 bg-slate-50 border rounded break-all font-mono">{out}</div>}
        </div>
    )
}

const DocumentTools: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [file, setFile] = useState<File|null>(null);
    const [file2, setFile2] = useState<File|null>(null); // For merge
    const [textInput, setTextInput] = useState(''); // For Word to PDF
    const [password, setPassword] = useState(''); // For Lock
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        setFile(null); setFile2(null); setTextInput(''); setPassword(''); setStatus('');
    }, [tool.id]);

    // -- Handlers --

    const handlePdfToWord = async () => {
        if(!file) return;
        setIsLoading(true);
        setStatus("Processing with AI... This may take a moment.");
        try {
             const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
             });

             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             // Check if model supports PDF or just text extraction
             const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                  parts: [
                    { inlineData: { mimeType: 'application/pdf', data: base64Data } },
                    { text: "Extract all text from this PDF document. Return only the raw text content." }
                  ]
                }
             });
             
             const text = response.text;
             if(text) {
                 download(text, "extracted_text.txt", "text/plain");
                 setStatus("Success! Text file downloaded.");
             } else {
                 setStatus("Failed to extract text.");
             }
        } catch(e) { console.error(e); setStatus("Error: " + (e as Error).message); }
        finally { setIsLoading(false); }
    };

    const handleWordToPdf = async () => {
        if(!textInput) return;
        setIsLoading(true);
        try {
            const pdfDoc = await PDFLib.PDFDocument.create();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const fontSize = 12;
            page.drawText(textInput, { x: 50, y: height - 4 * fontSize, size: fontSize, maxWidth: width - 100 });
            const pdfBytes = await pdfDoc.save();
            download(pdfBytes, "document.pdf", "application/pdf");
            setStatus("PDF Created successfully!");
        } catch(e) { setStatus("Error creating PDF"); }
        finally { setIsLoading(false); }
    };

    const handleMerge = async () => {
        if(!file || !file2) return;
        setIsLoading(true);
        try {
            const pdfDoc = await PDFLib.PDFDocument.create();
            const [b1, b2] = await Promise.all([file.arrayBuffer(), file2.arrayBuffer()]);
            const d1 = await PDFLib.PDFDocument.load(b1);
            const d2 = await PDFLib.PDFDocument.load(b2);
            
            const p1 = await pdfDoc.copyPages(d1, d1.getPageIndices());
            p1.forEach((p:any) => pdfDoc.addPage(p));
            const p2 = await pdfDoc.copyPages(d2, d2.getPageIndices());
            p2.forEach((p:any) => pdfDoc.addPage(p));
            
            const bytes = await pdfDoc.save();
            download(bytes, "merged.pdf", "application/pdf");
            setStatus("Merged successfully!");
        } catch(e) { setStatus("Error merging PDFs. Ensure valid PDF files."); }
        finally { setIsLoading(false); }
    }

    const handleLock = async () => {
        if(!file || !password) return;
        setIsLoading(true);
        try {
            const bytes = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(bytes);
            pdfDoc.encrypt({ userPassword: password, ownerPassword: password });
            const saved = await pdfDoc.save();
            download(saved, "protected.pdf", "application/pdf");
            setStatus("PDF Locked & Downloaded.");
        } catch(e) { setStatus("Error processing PDF."); }
        finally { setIsLoading(false); }
    }

    // Canvas Signature Logic
    const startDraw = (e: any) => {
        const ctx = canvasRef.current?.getContext('2d');
        if(!ctx) return;
        setIsDrawing(true);
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    const draw = (e: any) => {
        if(!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        if(ctx) { ctx.lineTo(x, y); ctx.stroke(); }
    }
    const endDraw = () => setIsDrawing(false);
    const clearSig = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx && canvasRef.current) ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
    }
    const saveSig = () => {
         if(canvasRef.current) {
             const url = canvasRef.current.toDataURL("image/png");
             download(url, "signature.png", "image/png");
         }
    }

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 text-center">
            {/* File Inputs */}
            {['doc-p2w', 'doc-mrg', 'doc-lock', 'doc-comp'].includes(tool.id) && (
                <div className="mb-6">
                    <label className="block mb-2 font-semibold">Upload PDF</label>
                    <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>
            )}
            
            {tool.id === 'doc-mrg' && (
                <div className="mb-6">
                    <label className="block mb-2 font-semibold">Upload Second PDF</label>
                    <input type="file" accept=".pdf" onChange={e => setFile2(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>
            )}

            {tool.id === 'doc-w2p' && (
                <textarea value={textInput} onChange={e => setTextInput(e.target.value)} className="w-full h-64 p-4 border rounded-lg mb-4" placeholder="Type your document content here..."></textarea>
            )}

            {tool.id === 'doc-lock' && (
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="p-3 border rounded w-full mb-4" placeholder="Enter Password to Lock"/>
            )}

            {tool.id === 'doc-sign' && (
                <div className="mb-4">
                    <canvas 
                        ref={canvasRef} 
                        width={500} 
                        height={200} 
                        className="border-2 border-dashed border-slate-300 rounded bg-white cursor-crosshair touch-none"
                        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                    ></canvas>
                    <div className="flex gap-4 justify-center mt-2">
                        <button onClick={clearSig} className="px-4 py-2 bg-slate-200 rounded">Clear</button>
                        <button onClick={saveSig} className="px-4 py-2 bg-primary text-white rounded">Download Signature</button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {tool.id === 'doc-p2w' && <button onClick={handlePdfToWord} disabled={isLoading || !file} className="btn-primary px-8 py-3 bg-primary text-white rounded-full">{isLoading ? 'Extracting...' : 'Extract Text from PDF'}</button>}
            {tool.id === 'doc-w2p' && <button onClick={handleWordToPdf} disabled={isLoading || !textInput} className="btn-primary px-8 py-3 bg-primary text-white rounded-full">Convert to PDF</button>}
            {tool.id === 'doc-mrg' && <button onClick={handleMerge} disabled={isLoading || !file || !file2} className="btn-primary px-8 py-3 bg-primary text-white rounded-full">Merge PDFs</button>}
            {tool.id === 'doc-lock' && <button onClick={handleLock} disabled={isLoading || !file || !password} className="btn-primary px-8 py-3 bg-primary text-white rounded-full">Lock PDF</button>}
            {tool.id === 'doc-comp' && file && <button onClick={() => { download(file, "compressed_" + file.name, "application/pdf"); setStatus("File processed (Simulated compression)"); }} className="btn-primary px-8 py-3 bg-primary text-white rounded-full">Compress PDF</button>}

            {status && <div className="mt-6 p-4 bg-slate-100 rounded text-secondary font-medium">{status}</div>}
        </div>
    )
}

// --- MAIN APP ---

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS_DATA;
    return TOOLS_DATA.map(category => ({
        ...category,
        tools: category.tools.filter(tool => 
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.tools.length > 0);
  }, [searchQuery]);

  const renderActiveTool = () => {
      if (!activeTool) return null;
      if (activeTool.id === 'img-ocr') return <ImageToText />;
      if (activeTool.id === 'web-html') return <CodeToHtml />;
      if (['img-conv', 'img-comp', 'img-res', 'img-crop', 'img-rot', 'col-pick'].includes(activeTool.id)) return <ImageTools tool={activeTool} />;
      if (['txt-case', 'txt-count', 'txt-dup', 'txt-sort', 'web-json', 'web-min', 'web-b64', 'web-url'].includes(activeTool.id)) return <TextTools tool={activeTool} />;
      if (['calc-bmi', 'calc-age', 'calc-emi', 'calc-gst', 'calc-sci'].includes(activeTool.id)) return <CalculatorTools tool={activeTool} />;
      if (['util-uuid', 'util-rand', 'col-hex', 'col-grad'].includes(activeTool.id)) return <GeneratorTools tool={activeTool} />;
      if (['doc-p2w', 'doc-w2p', 'doc-mrg', 'doc-lock', 'doc-comp', 'doc-sign'].includes(activeTool.id)) return <DocumentTools tool={activeTool} />;

      return (
        <div className="p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 inline-block max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-slate-700 mb-2">Coming Soon</h3>
            <p className="text-slate-500">We are currently building the <strong>{activeTool.name}</strong>.</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Header />
      
      {activeTool ? (
         <div className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-[1200px]">
             <button onClick={() => setActiveTool(null)} className="mb-8 flex items-center gap-2 text-primary font-medium hover:underline">
                 <i className="fas fa-arrow-left"></i> Back to Dashboard
             </button>
             <div className="bg-white rounded-xl p-6 md:p-12 shadow-md text-center border border-slate-100 min-h-[500px]">
                 <div className="mb-8 pb-8 border-b border-slate-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-primary mb-4">
                        <i className={`${activeTool.iconClass} text-4xl`}></i>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2">{activeTool.name}</h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">{activeTool.description}</p>
                 </div>
                 {renderActiveTool()}
             </div>
         </div>
      ) : (
        <>
            <Hero />
            <div className="relative max-w-[600px] mx-auto -mt-6 mb-12 px-6 z-10">
                <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a tool (e.g., PDF, BMI, Image)..."
                className="w-full py-4 px-6 rounded-full border-2 border-transparent shadow-md text-base outline-none focus:border-primary focus:shadow-lg transition-all"
                />
            </div>
            <main className="flex-grow container mx-auto px-6 pb-16 max-w-[1200px]" id="tools-container">
                {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                    <section key={category.id} className="mb-12 last:mb-0">
                    <div className="mb-6 pb-2 border-b-2 border-slate-200">
                        <h2 className="text-2xl font-bold text-secondary flex items-center gap-3"><i className={`${category.iconClass} text-primary`}></i>{category.title}</h2>
                        <p className="text-slate-500 mt-1 text-sm md:text-base">{category.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {category.tools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} onClick={setActiveTool} />
                        ))}
                    </div>
                    </section>
                ))
                ) : (
                <div className="text-center py-20"><h3 className="text-xl font-bold text-secondary mb-2">No tools found</h3></div>
                )}
            </main>
        </>
      )}
      <Footer />
    </div>
  );
};

// --- MOUNT ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
