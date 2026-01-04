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
      { id: 'txt-enc', name: 'Text Encryptor', description: 'Encrypt (ROT13) and decrypt text.', iconClass: 'fas fa-user-secret' },
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
      { id: 'col-cont', name: 'Contrast Checker', description: 'Check WCAG contrast ratios.', iconClass: 'fas fa-adjust' },
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
      { id: 'seo-meta', name: 'Meta Tag Analyzer', description: 'Analyze page meta titles and descriptions from HTML.', iconClass: 'fas fa-tags' },
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
      { id: 'util-unit', name: 'Unit Converter', description: 'Length and Weight conversions.', iconClass: 'fas fa-balance-scale' },
      { id: 'util-rand', name: 'Random Generator', description: 'Generate random numbers or passwords.', iconClass: 'fas fa-dice' },
    ]
  },
];

// --- HELPERS ---
const rot13 = (str: string) => str.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 90 : 122;
    const code = char.charCodeAt(0) + 13;
    return String.fromCharCode(base >= code ? code : code - 26);
});

const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const [rs, gs, bs] = [r, g, b].map(c => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastRatio = (h1: string, h2: string) => {
    const l1 = getLuminance(h1);
    const l2 = getLuminance(h2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};


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
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
          {isLoading ? 'Processing...' : 'Extract Text'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-center border border-red-100">
          <i className="fas fa-exclamation-circle mr-2"></i> {error}
        </div>
      )}

      {extractedText && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center gap-2">
            <h3 className="font-semibold text-slate-700">Extracted Text</h3>
            <div className="flex gap-2">
                <button onClick={downloadHtml} className="text-primary hover:text-primary-dark text-sm font-medium"><i className="fas fa-download"></i> Download</button>
                <button onClick={copyToClipboard} className="text-primary hover:text-primary-dark text-sm font-medium"><i className="far fa-copy"></i> Copy</button>
            </div>
          </div>
          <textarea readOnly value={extractedText} className="w-full h-64 p-6 bg-slate-50 border-none resize-y focus:outline-none text-slate-700 font-mono text-sm" />
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

  const handleConvert = async () => {
    if (!inputCode.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Convert the following text/code to clean, semantic HTML5 body content only. 
        Input: ${inputCode}`
      });
      setOutputHtml(response.text?.replace(/^```html\s*/, '').replace(/```\s*$/, '') || '');
    } catch (err) {
      console.error(err);
      setError("An error occurred. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto text-left mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label className="font-semibold text-slate-700 mb-2 block">Input</label>
          <textarea value={inputCode} onChange={(e) => setInputCode(e.target.value)} className="w-full h-96 p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-mono text-sm" placeholder="Markdown or Code..." />
          <button onClick={handleConvert} disabled={isLoading} className="mt-4 w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all">{isLoading ? 'Converting...' : 'Convert'}</button>
        </div>
        <div>
          <label className="font-semibold text-slate-700 mb-2 block">Output</label>
          <div className="relative h-96 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {error ? <div className="p-4 text-red-500">{error}</div> : <textarea readOnly value={outputHtml} className="w-full h-full p-4 bg-slate-50 font-mono text-sm text-slate-700 outline-none border-none" />}
          </div>
        </div>
    </div>
  );
};

const ImageTools: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => { setFile(null); setPreviewUrl(null); setResultUrl(null); setPickedColor(null); setRotation(0); }, [tool.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
        setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProcess = () => {
      if(!imgRef.current) return;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if(!ctx) return;
      const img = imgRef.current;
      
      if(tool.id === 'img-rot') {
           const rads = rotation * Math.PI / 180;
           canvas.width = Math.abs(Math.cos(rads)*img.naturalWidth) + Math.abs(Math.sin(rads)*img.naturalHeight);
           canvas.height = Math.abs(Math.sin(rads)*img.naturalWidth) + Math.abs(Math.cos(rads)*img.naturalHeight);
           ctx.translate(canvas.width/2, canvas.height/2);
           ctx.rotate(rads);
           ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
      } else {
           canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
           ctx.drawImage(img, 0, 0);
      }
      setResultUrl(canvas.toDataURL());
  }

  const handleColorPick = (e: React.MouseEvent<HTMLImageElement>) => {
      if (tool.id !== 'col-pick' || !imgRef.current) return;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = imgRef.current.naturalWidth; canvas.height = imgRef.current.naturalHeight;
      ctx.drawImage(imgRef.current, 0, 0);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      const p = ctx.getImageData(x, y, 1, 1).data;
      setPickedColor("#" + ("000000" + ((p[0] << 16) | (p[1] << 8) | p[2]).toString(16)).slice(-6));
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-left mt-8">
      <div className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 p-8 text-center cursor-pointer mb-8 relative">
        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
        {previewUrl ? <img ref={imgRef} src={previewUrl} className="max-h-80 mx-auto" style={{transform: `rotate(${rotation}deg)`}} onClick={handleColorPick} /> : <div className="py-8"><i className="fas fa-cloud-upload-alt text-5xl text-blue-300"></i></div>}
      </div>
      
      {file && tool.id !== 'col-pick' && (
        <div className="flex gap-4 justify-center">
            {tool.id === 'img-rot' && <button onClick={() => setRotation(r => r + 90)} className="btn bg-slate-200 px-4 py-2 rounded">Rotate 90°</button>}
            <button onClick={handleProcess} className="btn bg-primary text-white px-6 py-2 rounded">Process</button>
        </div>
      )}
      {pickedColor && <div className="text-center mt-4 text-2xl font-mono font-bold" style={{color: pickedColor}}>{pickedColor}</div>}
      {resultUrl && <div className="text-center mt-8"><img src={resultUrl} className="max-h-64 mx-auto border" /><a href={resultUrl} download="processed.png" className="btn bg-green-600 text-white px-6 py-2 rounded inline-block mt-4">Download</a></div>}
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
        if(tool.id === 'txt-enc') setOutput(rot13(input));
    }

    return (
        <div className="w-full max-w-4xl mx-auto text-left mt-8">
            <textarea value={input} onChange={e => setInput(e.target.value)} className="w-full h-48 p-4 border rounded mb-4" placeholder="Input text..." />
            <div className="mb-6 flex gap-2 flex-wrap">
                {tool.id === 'txt-case' && ['upper','lower','title'].map(m => <button key={m} onClick={() => setOutput(m === 'upper' ? input.toUpperCase() : m === 'lower' ? input.toLowerCase() : input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()))} className="px-4 py-2 bg-slate-200 rounded capitalize">{m}</button>)}
                {tool.id === 'web-b64' && <><button onClick={() => setOutput(btoa(input))} className="btn bg-primary text-white px-4 py-2 rounded">Encode</button><button onClick={() => setOutput(atob(input))} className="btn bg-slate-600 text-white px-4 py-2 rounded">Decode</button></>}
                {['txt-dup','txt-sort','web-json','web-min','txt-enc'].includes(tool.id) && <button onClick={process} className="btn bg-primary text-white px-6 py-2 rounded">Process</button>}
                {tool.id === 'web-url' && <><button onClick={() => setOutput(encodeURIComponent(input))} className="btn bg-primary text-white px-4 py-2 rounded">Encode</button><button onClick={() => setOutput(decodeURIComponent(input))} className="btn bg-slate-600 text-white px-4 py-2 rounded">Decode</button></>}
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
    const [loading, setLoading] = useState(false);
    const [currFrom, setCurrFrom] = useState('USD');
    const [currTo, setCurrTo] = useState('EUR');

    useEffect(() => { setV1(''); setV2(''); setV3(''); setRes(null); setLoading(false); }, [tool.id]);

    const calc = async () => {
        setRes(null);
        try {
            if (tool.id === 'calc-bmi') {
                 const h = parseFloat(v1)/100, w = parseFloat(v2), bmi = w/(h*h);
                 setRes(`${bmi.toFixed(2)} (${bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese'})`);
            }
            if (tool.id === 'calc-age') {
                 const b = new Date(v1), n = new Date();
                 let y = n.getFullYear() - b.getFullYear(), m = n.getMonth() - b.getMonth(), d = n.getDate() - b.getDate();
                 if(d<0) { m--; d+=new Date(n.getFullYear(),n.getMonth(),0).getDate(); }
                 if(m<0) { y--; m+=12; }
                 setRes(`${y} Years, ${m} Months, ${d} Days`);
            }
            if (tool.id === 'calc-sci') setRes(eval(v1).toString());
            if (tool.id === 'calc-emi') {
                const P = parseFloat(v1), R = parseFloat(v2)/1200, N = parseFloat(v3);
                setRes(`EMI: ${(P * R * Math.pow(1+R,N))/(Math.pow(1+R,N)-1)}.toFixed(2)`);
            }
            if (tool.id === 'calc-gst') {
                const a = parseFloat(v1), r = parseFloat(v2), gst = (a*r)/100;
                setRes(`GST: ${gst.toFixed(2)} | Total: ${(a+gst).toFixed(2)}`);
            }
            if (tool.id === 'calc-curr') {
                setLoading(true);
                const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${currFrom}`).then(r=>r.json());
                setRes(`${v1} ${currFrom} = ${(parseFloat(v1)*r.rates[currTo]).toFixed(2)} ${currTo}`);
                setLoading(false);
            }
        } catch { setRes('Error'); setLoading(false); }
    }

    return (
        <div className="w-full max-w-lg mx-auto mt-8 text-left space-y-4">
             {tool.id === 'calc-sci' ? <input className="w-full p-2 border rounded" value={v1} onChange={e=>setV1(e.target.value)} placeholder="Expression" /> : 
              tool.id === 'calc-age' ? <input type="date" className="w-full p-2 border rounded" value={v1} onChange={e=>setV1(e.target.value)} /> :
              tool.id === 'calc-curr' ? <div className="space-y-2"><input type="number" className="w-full p-2 border rounded" value={v1} onChange={e=>setV1(e.target.value)} placeholder="Amount" /><div className="flex gap-2"><select className="w-1/2 p-2 border rounded" value={currFrom} onChange={e=>setCurrFrom(e.target.value)}>{['USD','EUR','GBP','INR'].map(c=><option key={c}>{c}</option>)}</select><select className="w-1/2 p-2 border rounded" value={currTo} onChange={e=>setCurrTo(e.target.value)}>{['USD','EUR','GBP','INR'].map(c=><option key={c}>{c}</option>)}</select></div></div> :
              <><input type="number" className="w-full p-2 border rounded" value={v1} onChange={e=>setV1(e.target.value)} placeholder={tool.id==='calc-bmi'?'Height (cm)':'Amount'} />
              <input type="number" className="w-full p-2 border rounded" value={v2} onChange={e=>setV2(e.target.value)} placeholder={tool.id==='calc-bmi'?'Weight (kg)':'Rate/Interest'} />
              {tool.id==='calc-emi' && <input type="number" className="w-full p-2 border rounded" value={v3} onChange={e=>setV3(e.target.value)} placeholder="Months" />}</>
             }
             <button onClick={calc} className="w-full py-2 bg-primary text-white rounded">{loading?'...':'Calculate'}</button>
             {res && <div className="p-4 bg-green-100 rounded text-center font-bold text-green-800">{res}</div>}
        </div>
    )
}

const UtilityTools: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [out, setOut] = useState('');
    const [c1, setC1] = useState('#000000');
    const [c2, setC2] = useState('#ffffff');
    // Unit Converter State
    const [uVal, setUVal] = useState(0);
    const [uFrom, setUFrom] = useState('m');
    const [uTo, setUTo] = useState('ft');

    const gen = () => {
        if(tool.id === 'util-uuid') setOut(crypto.randomUUID());
        if(tool.id === 'col-grad') setOut(`background: linear-gradient(to right, ${c1}, ${c2});`);
        if(tool.id === 'col-hex') { const r = parseInt(c1.slice(1,3),16), g=parseInt(c1.slice(3,5),16), b=parseInt(c1.slice(5,7),16); setOut(`rgb(${r},${g},${b})`); }
        if(tool.id === 'col-cont') setOut(`Ratio: ${getContrastRatio(c1, c2).toFixed(2)}:1`);
    }

    const unitConv = () => {
        // Simple scale relative to meter or kg
        const scales: any = { m:1, km:1000, cm:0.01, ft:0.3048, in:0.0254, kg:1, g:0.001, lb:0.453592 };
        if(scales[uFrom] && scales[uTo]) setOut(`${uVal} ${uFrom} = ${(uVal * scales[uFrom] / scales[uTo]).toFixed(4)} ${uTo}`);
        else setOut("Incompatible units");
    }

    return (
        <div className="w-full max-w-lg mx-auto mt-8 text-left">
             {(tool.id.startsWith('col-')) && <div className="mb-4 flex gap-2"><input type="color" value={c1} onChange={e=>setC1(e.target.value)} className="h-10 w-full"/><input type="color" value={c2} onChange={e=>setC2(e.target.value)} className="h-10 w-full"/></div>}
             
             {tool.id === 'util-qr' && <><input className="w-full p-2 border rounded mb-2" value={out} onChange={e=>setOut(e.target.value)} placeholder="Text for QR" /><div className="text-center">{out && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(out)}`} className="mx-auto" />}</div></>}
             
             {tool.id === 'util-bar' && <><input className="w-full p-2 border rounded mb-2" value={out} onChange={e=>setOut(e.target.value)} placeholder="Text for Barcode" /><div className="text-center">{out && <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(out)}`} className="mx-auto" />}</div></>}

             {tool.id === 'util-unit' && <div className="space-y-2 mb-4">
                 <input type="number" value={uVal} onChange={e=>setUVal(parseFloat(e.target.value))} className="w-full p-2 border rounded"/>
                 <div className="flex gap-2">
                     <select value={uFrom} onChange={e=>setUFrom(e.target.value)} className="w-1/2 p-2 border rounded">{['m','km','ft','kg','lb'].map(u=><option key={u}>{u}</option>)}</select>
                     <select value={uTo} onChange={e=>setUTo(e.target.value)} className="w-1/2 p-2 border rounded">{['m','km','ft','kg','lb'].map(u=><option key={u}>{u}</option>)}</select>
                 </div>
                 <button onClick={unitConv} className="w-full py-2 bg-primary text-white rounded">Convert</button>
             </div>}

             {!['util-qr','util-bar','util-unit'].includes(tool.id) && <button onClick={gen} className="w-full py-3 bg-primary text-white rounded font-bold mb-4">Generate / Calculate</button>}
             
             {out && !['util-qr','util-bar'].includes(tool.id) && <div className="p-4 bg-slate-50 border rounded break-all font-mono text-center">{out}</div>}
        </div>
    )
}

const SeoTools: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [input, setInput] = useState('');
    const [res, setRes] = useState<any>(null);

    const analyze = () => {
        if(tool.id === 'seo-kw') {
             const w = input.toLowerCase().match(/\b\w{4,}\b/g) || [];
             const f: Record<string, number> = {}; 
             w.forEach((x: string) => f[x]=(f[x]||0)+1);
             setRes(Object.entries(f).sort((a:any,b:any)=>b[1]-a[1]).slice(0,10));
        }
        if(tool.id === 'seo-meta') {
             const d = new DOMParser().parseFromString(input, 'text/html');
             setRes({ t: d.title, d: d.querySelector('meta[name="description"]')?.getAttribute('content'), k: d.querySelector('meta[name="keywords"]')?.getAttribute('content') });
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 text-left">
            <textarea value={input} onChange={e=>setInput(e.target.value)} className="w-full h-48 p-4 border rounded mb-4" placeholder={tool.id==='seo-kw'?"Text Content":"HTML Source Code"} />
            <button onClick={analyze} className="btn bg-primary text-white px-6 py-2 rounded mb-4">Analyze</button>
            {res && <div className="bg-slate-50 p-4 border rounded">
                {tool.id === 'seo-kw' ? (res as [string, number][]).map(([k,v]) => <div key={k}>{k}: {v}</div>) : <div><div>Title: {res.t}</div><div>Desc: {res.d}</div><div>Keywords: {res.k}</div></div>}
            </div>}
        </div>
    )
}

const DocumentTools: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [file, setFile] = useState<File|null>(null);
    const [file2, setFile2] = useState<File|null>(null);
    const [textInput, setTextInput] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => { setFile(null); setFile2(null); setTextInput(''); setPassword(''); setStatus(''); }, [tool.id]);

    const handlePdfToWord = async () => {
        if(!file) return;
        setIsLoading(true); setStatus("Processing with AI...");
        try {
             const b64 = await new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve((r.result as string).split(',')[1]); r.readAsDataURL(file); });
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts: [{ inlineData: { mimeType: 'application/pdf', data: b64 } }, { text: "Extract text." }] } });
             download(res.text, "extracted.txt", "text/plain");
             setStatus("Success!");
        } catch(e) { setStatus("Error: " + (e as Error).message); }
        finally { setIsLoading(false); }
    };

    const handleWordToPdf = async () => {
        if(!textInput) return;
        setIsLoading(true);
        try {
            const doc = await PDFLib.PDFDocument.create();
            const p = doc.addPage();
            p.drawText(textInput, { x: 50, y: p.getHeight() - 50, size: 12 });
            download(await doc.save(), "doc.pdf", "application/pdf");
            setStatus("Success!");
        } catch { setStatus("Error"); }
        finally { setIsLoading(false); }
    };
    
    // Canvas Sig
    const start = (e: any) => { setIsDrawing(true); draw(e); }
    const draw = (e: any) => { if(!isDrawing||!canvasRef.current)return; const c=canvasRef.current.getContext('2d'); const r=canvasRef.current.getBoundingClientRect(); if(c){ c.lineTo((e.clientX||e.touches[0].clientX)-r.left, (e.clientY||e.touches[0].clientY)-r.top); c.stroke(); c.beginPath(); c.moveTo((e.clientX||e.touches[0].clientX)-r.left, (e.clientY||e.touches[0].clientY)-r.top); } }

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 text-center space-y-4">
            {['doc-p2w','doc-mrg','doc-lock','doc-comp'].includes(tool.id) && <input type="file" accept=".pdf" onChange={e=>setFile(e.target.files?.[0]||null)} className="block w-full border rounded p-2"/>}
            {tool.id === 'doc-mrg' && <input type="file" accept=".pdf" onChange={e=>setFile2(e.target.files?.[0]||null)} className="block w-full border rounded p-2"/>}
            {tool.id === 'doc-w2p' && <textarea className="w-full h-48 border p-4 rounded" value={textInput} onChange={e=>setTextInput(e.target.value)} placeholder="Type content..."/>}
            {tool.id === 'doc-lock' && <input className="w-full border p-2 rounded" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/>}
            {tool.id === 'doc-sign' && <><canvas ref={canvasRef} width={500} height={200} className="border bg-white mx-auto" onMouseDown={start} onMouseMove={draw} onMouseUp={()=>setIsDrawing(false)} onTouchStart={start} onTouchMove={draw} onTouchEnd={()=>setIsDrawing(false)} /><button onClick={()=>{const c=canvasRef.current?.getContext('2d'); c?.clearRect(0,0,500,200); c?.beginPath();}} className="btn bg-slate-300 px-4 py-2 rounded">Clear</button></>}
            
            <button onClick={() => { if(tool.id==='doc-p2w') handlePdfToWord(); else if(tool.id==='doc-w2p') handleWordToPdf(); else if(tool.id==='doc-sign') download(canvasRef.current?.toDataURL(), "sig.png", "image/png"); }} disabled={isLoading} className="btn bg-primary text-white px-6 py-2 rounded">{isLoading?'Working...':'Process'}</button>
            {status && <div>{status}</div>}
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
      if (['txt-case', 'txt-count', 'txt-dup', 'txt-sort', 'web-json', 'web-min', 'web-b64', 'web-url', 'txt-enc'].includes(activeTool.id)) return <TextTools tool={activeTool} />;
      if (['calc-bmi', 'calc-age', 'calc-emi', 'calc-gst', 'calc-sci', 'calc-curr'].includes(activeTool.id)) return <CalculatorTools tool={activeTool} />;
      if (['util-uuid', 'util-rand', 'col-hex', 'col-grad', 'col-cont', 'util-qr', 'util-bar', 'util-unit'].includes(activeTool.id)) return <UtilityTools tool={activeTool} />;
      if (['doc-p2w', 'doc-w2p', 'doc-mrg', 'doc-lock', 'doc-comp', 'doc-sign'].includes(activeTool.id)) return <DocumentTools tool={activeTool} />;
      if (['seo-kw', 'seo-meta'].includes(activeTool.id)) return <SeoTools tool={activeTool} />;

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