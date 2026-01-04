import React, { useState, useRef, useEffect } from 'react';
import { Tool } from '../../types.ts';

interface ImageToolsProps {
  tool: Tool;
}

const ImageTools: React.FC<ImageToolsProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('free'); // '1:1', '16:9', '4:3', 'free'
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [pickedColor, setPickedColor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset when tool changes
  useEffect(() => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
    setPickedColor(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    // Defaults
    setFormat('image/jpeg');
    setQuality(80);
    setAspectRatio('free');
  }, [tool.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setResultUrl(null);
    setPickedColor(null);
    
    // Reset dimensions on new file
    const img = new Image();
    img.src = url;
    img.onload = () => {
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
    };
  };

  const handleProcess = () => {
    if (!previewUrl || !imgRef.current) return;
    setIsLoading(true);

    // Give UI a moment to show loading state
    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = imgRef.current;

            if (!ctx || !img) {
                throw new Error("Could not initialize canvas");
            }

            // Logic per tool
            if (tool.id === 'img-conv' || tool.id === 'img-comp') {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                // Fill white background for JPEGs to avoid black transparency
                if (format === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                
                const q = tool.id === 'img-comp' ? quality / 100 : 0.92;
                const f = tool.id === 'img-conv' ? format : 'image/jpeg';
                
                setResultUrl(canvas.toDataURL(f, q));
            } 
            else if (tool.id === 'img-res') {
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                setResultUrl(canvas.toDataURL(file?.type || 'image/png'));
            }
            else if (tool.id === 'img-rot') {
                // Calculate bounding box for rotation
                const rads = rotation * Math.PI / 180;
                const c = Math.cos(rads);
                const s = Math.sin(rads);
                if (Math.abs(s) > 0.9) { // 90 or 270
                     canvas.width = img.naturalHeight;
                     canvas.height = img.naturalWidth;
                } else {
                     canvas.width = img.naturalWidth;
                     canvas.height = img.naturalHeight;
                }
                
                // Transform
                ctx.translate(canvas.width/2, canvas.height/2);
                ctx.rotate(rads);
                ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
                
                if (Math.abs(s) > 0.9) {
                     ctx.drawImage(img, -img.naturalHeight/2, -img.naturalWidth/2);
                } else {
                     ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
                }

                setResultUrl(canvas.toDataURL(file?.type || 'image/png'));
            }
            else if (tool.id === 'img-crop') {
                // Simple Center Crop based on Aspect Ratio
                const currentRatio = img.naturalWidth / img.naturalHeight;
                let targetRatio = currentRatio;
                
                if (aspectRatio === '1:1') targetRatio = 1;
                else if (aspectRatio === '16:9') targetRatio = 16/9;
                else if (aspectRatio === '4:3') targetRatio = 4/3;
                
                let cropWidth = img.naturalWidth;
                let cropHeight = img.naturalHeight;
                let cropX = 0;
                let cropY = 0;

                if (currentRatio > targetRatio) {
                    // Image is wider than target -> Crop width
                    cropWidth = img.naturalHeight * targetRatio;
                    cropX = (img.naturalWidth - cropWidth) / 2;
                } else {
                    // Image is taller than target -> Crop height
                    cropHeight = img.naturalWidth / targetRatio;
                    cropY = (img.naturalHeight - cropHeight) / 2;
                }
                
                canvas.width = cropWidth;
                canvas.height = cropHeight;
                ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                setResultUrl(canvas.toDataURL(file?.type || 'image/png'));
            }

        } catch (e) {
            console.error(e);
            setError("Failed to process image.");
        } finally {
            setIsLoading(false);
        }
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

      // Get click coordinates relative to image
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      const p = ctx.getImageData(x, y, 1, 1).data;
      const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
      setPickedColor(hex);
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  const handleDimensionChange = (key: 'width' | 'height', val: string) => {
      const v = parseInt(val) || 0;
      if (key === 'width') {
          setWidth(v);
          if (maintainAspect && imgRef.current) {
              const ratio = imgRef.current.naturalHeight / imgRef.current.naturalWidth;
              setHeight(Math.round(v * ratio));
          }
      } else {
          setHeight(v);
          if (maintainAspect && imgRef.current) {
              const ratio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
              setWidth(Math.round(v * ratio));
          }
      }
  }

  const downloadResult = () => {
      if (!resultUrl) return;
      const a = document.createElement('a');
      a.href = resultUrl;
      const ext = tool.id === 'img-conv' ? format.split('/')[1] : 'png';
      a.download = `processed-image.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const copyColor = () => {
      if(pickedColor) navigator.clipboard.writeText(pickedColor);
  }

  // Helper to determine active preview transform for rotation
  const getPreviewStyle = () => {
      if (tool.id !== 'img-rot') return {};
      return {
          transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
          transition: 'transform 0.3s ease'
      };
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-left mt-8">
      {/* Upload Area */}
      <div 
        className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 p-8 text-center transition-colors hover:bg-blue-50 hover:border-blue-300 cursor-pointer mb-8"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        {previewUrl ? (
          <div className="relative inline-block group">
             {tool.id === 'col-pick' && (
                 <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
                     Click image to pick color
                 </div>
             )}
            <img 
                ref={imgRef}
                src={previewUrl} 
                alt="Preview" 
                className={`max-h-80 rounded-lg shadow-sm mx-auto object-contain ${tool.id === 'col-pick' ? 'cursor-crosshair' : ''}`}
                style={getPreviewStyle()}
                onClick={handleColorPick}
            />
            <div className="mt-4 text-sm text-slate-500">Click to upload different image</div>
          </div>
        ) : (
          <div className="py-8">
            <i className="fas fa-cloud-upload-alt text-5xl text-blue-300 mb-4"></i>
            <p className="text-lg font-medium text-slate-700 mb-1">Click to upload or drag and drop</p>
            <p className="text-sm text-slate-400">JPG, PNG, WEBP, GIF</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {file && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Settings</h3>
            
            <div className="flex flex-wrap gap-6 items-end">
                {tool.id === 'img-conv' && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Convert to</label>
                        <select 
                            value={format} 
                            onChange={(e) => setFormat(e.target.value)}
                            className="p-2 border border-slate-300 rounded-lg min-w-[150px] outline-none focus:border-primary"
                        >
                            <option value="image/jpeg">JPG / JPEG</option>
                            <option value="image/png">PNG</option>
                            <option value="image/webp">WEBP</option>
                        </select>
                    </div>
                )}

                {tool.id === 'img-comp' && (
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Quality: {quality}%</label>
                        <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            value={quality} 
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                         <div className="flex justify-between text-xs text-slate-400 mt-1">
                             <span>Low Size</span>
                             <span>High Quality</span>
                         </div>
                    </div>
                )}

                {tool.id === 'img-res' && (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Width (px)</label>
                            <input 
                                type="number" 
                                value={width} 
                                onChange={(e) => handleDimensionChange('width', e.target.value)}
                                className="p-2 border border-slate-300 rounded-lg w-28"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Height (px)</label>
                            <input 
                                type="number" 
                                value={height} 
                                onChange={(e) => handleDimensionChange('height', e.target.value)}
                                className="p-2 border border-slate-300 rounded-lg w-28"
                            />
                        </div>
                        <div className="pb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={maintainAspect}
                                    onChange={(e) => setMaintainAspect(e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-600">Maintain Aspect Ratio</span>
                            </label>
                        </div>
                    </>
                )}

                {tool.id === 'img-rot' && (
                    <div className="flex gap-4">
                        <button onClick={() => setRotation((r) => r - 90)} className="btn-secondary p-3 bg-slate-100 rounded-lg hover:bg-slate-200" title="Rotate Left">
                            <i className="fas fa-undo"></i>
                        </button>
                        <button onClick={() => setRotation((r) => r + 90)} className="btn-secondary p-3 bg-slate-100 rounded-lg hover:bg-slate-200" title="Rotate Right">
                            <i className="fas fa-redo"></i>
                        </button>
                        <button onClick={() => setFlipH(!flipH)} className={`btn-secondary p-3 rounded-lg border ${flipH ? 'bg-blue-100 border-blue-300 text-primary' : 'bg-slate-100 border-transparent hover:bg-slate-200'}`} title="Flip Horizontal">
                            <i className="fas fa-arrows-alt-h"></i>
                        </button>
                        <button onClick={() => setFlipV(!flipV)} className={`btn-secondary p-3 rounded-lg border ${flipV ? 'bg-blue-100 border-blue-300 text-primary' : 'bg-slate-100 border-transparent hover:bg-slate-200'}`} title="Flip Vertical">
                            <i className="fas fa-arrows-alt-v"></i>
                        </button>
                    </div>
                )}

                {tool.id === 'img-crop' && (
                    <div className="flex gap-2">
                        {['1:1', '16:9', '4:3', 'free'].map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    aspectRatio === ratio 
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {ratio === 'free' ? 'Original' : ratio}
                            </button>
                        ))}
                    </div>
                )}

                {/* Process Button (Not needed for Color Picker) */}
                {tool.id !== 'col-pick' && (
                    <button
                        onClick={handleProcess}
                        disabled={isLoading}
                        className="ml-auto px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Apply & Process'}
                    </button>
                )}
            </div>

            {tool.id === 'col-pick' && pickedColor && (
                 <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full shadow-inner border border-slate-300" style={{ backgroundColor: pickedColor }}></div>
                         <div>
                             <p className="text-slate-500 text-sm font-bold">Picked Color</p>
                             <p className="text-xl font-mono text-slate-800">{pickedColor}</p>
                         </div>
                     </div>
                     <button onClick={copyColor} className="text-primary hover:text-primary-dark font-medium text-sm">
                         <i className="far fa-copy mr-1"></i> Copy HEX
                     </button>
                 </div>
            )}
        </div>
      )}

      {/* Result Area */}
      {resultUrl && tool.id !== 'col-pick' && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-8 text-center animate-fade-in">
              <h3 className="text-green-800 font-bold text-lg mb-4">Image Processed Successfully!</h3>
              <img src={resultUrl} alt="Result" className="max-h-64 mx-auto rounded shadow-sm border border-white mb-6" />
              <button 
                onClick={downloadResult}
                className="px-8 py-3 bg-green-600 text-white rounded-full font-bold shadow-lg hover:bg-green-700 hover:-translate-y-1 transition-all"
              >
                  <i className="fas fa-download mr-2"></i> Download Image
              </button>
          </div>
      )}
    </div>
  );
};

export default ImageTools;