import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ToolCard from './components/ToolCard';
import ImageToText from './components/tools/ImageToText';
import CodeToHtml from './components/tools/CodeToHtml';
import TextTools from './components/tools/TextTools';
import CalculatorTools from './components/tools/CalculatorTools';
import GeneratorTools from './components/tools/GeneratorTools';
import ImageTools from './components/tools/ImageTools';
import { TOOLS_DATA } from './constants';
import { Tool } from './types';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  // Filter tools based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return TOOLS_DATA;
    }

    const lowerQuery = searchQuery.toLowerCase();

    // Map over categories and filter their tools
    const categoriesWithFilteredTools = TOOLS_DATA.map(category => {
      const matchingTools = category.tools.filter(tool => 
        tool.name.toLowerCase().includes(lowerQuery) || 
        tool.description.toLowerCase().includes(lowerQuery)
      );
      
      return {
        ...category,
        tools: matchingTools
      };
    });

    // Return only categories that still have tools after filtering
    return categoriesWithFilteredTools.filter(category => category.tools.length > 0);
  }, [searchQuery]);

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);
    console.log(`Tool clicked: ${tool.name}`);
  };

  const handleBackToDashboard = () => {
    setActiveTool(null);
  }

  const renderActiveTool = () => {
      if (!activeTool) return null;

      // Direct Matches
      if (activeTool.id === 'img-ocr') return <ImageToText />;
      if (activeTool.id === 'web-html') return <CodeToHtml />;

      // Image Tools Group (plus color picker)
      if (['img-conv', 'img-comp', 'img-res', 'img-crop', 'img-rot', 'col-pick'].includes(activeTool.id)) {
          return <ImageTools tool={activeTool} />;
      }

      // Text & Web Group
      if (['txt-case', 'txt-count', 'txt-dup', 'txt-sort', 'web-json', 'web-min', 'web-b64', 'web-url'].includes(activeTool.id)) {
          return <TextTools tool={activeTool} />;
      }

      // Calculator Group
      if (['calc-bmi', 'calc-age', 'calc-emi', 'calc-gst', 'calc-sci'].includes(activeTool.id)) {
          return <CalculatorTools tool={activeTool} />;
      }

      // Generator/Utility Group
      if (['util-uuid', 'util-rand', 'col-hex', 'col-grad'].includes(activeTool.id)) {
          return <GeneratorTools tool={activeTool} />;
      }

      // Fallback
      return (
        <div className="p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 inline-block max-w-lg mx-auto">
            <i className="fas fa-tools text-4xl text-slate-300 mb-4"></i>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Coming Soon</h3>
            <p className="text-slate-500">We are currently building the <strong>{activeTool.name}</strong>. Please check back later!</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Header />
      
      {activeTool ? (
         <div className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-[1200px]">
             <button 
                onClick={handleBackToDashboard}
                className="mb-8 flex items-center gap-2 text-primary font-medium hover:underline"
             >
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
                className="w-full py-4 px-6 rounded-full border-2 border-transparent shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] text-base outline-none focus:border-primary focus:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 placeholder:text-slate-400"
                />
            </div>

            <main className="flex-grow container mx-auto px-6 pb-16 max-w-[1200px]" id="tools-container">
                {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                    <section key={category.id} className="mb-12 last:mb-0">
                    <div className="mb-6 pb-2 border-b-2 border-slate-200">
                        <h2 className="text-2xl font-bold text-secondary flex items-center gap-3">
                        <i className={`${category.iconClass} text-primary`}></i>
                        {category.title}
                        </h2>
                        <p className="text-slate-500 mt-1 text-sm md:text-base">{category.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {category.tools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} onClick={handleToolClick} />
                        ))}
                    </div>
                    </section>
                ))
                ) : (
                <div className="text-center py-20">
                    <div className="text-slate-300 text-6xl mb-4">
                        <i className="fas fa-search"></i>
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-2">No tools found</h3>
                    <p className="text-slate-500">Try adjusting your search query to find what you're looking for.</p>
                </div>
                )}
            </main>
        </>
      )}

      <Footer />
    </div>
  );
};

export default App;