import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import FamilyTree from './pages/FamilyTree';
import Ancestors from './pages/Ancestors';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex flex-col w-full relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/ancestors" element={<Ancestors />} />
          </Routes>
          
          {/* Hanging CSS Bulb */}
          <div 
            id="theme-bulb"
            className="absolute top-0 right-10 md:right-16 z-[9999] flex flex-col items-center cursor-pointer group origin-top animate-[sway_3s_ease-in-out_infinite] hover:animate-none"
            onClick={() => setIsDark(!isDark)}
            title="Toggle Theme"
          >
            {/* Wire */}
            <div className={`w-[1.5px] h-6 transition-all duration-300 ease-out origin-top group-active:h-10 ${isDark ? 'bg-slate-700' : 'bg-slate-400'}`}></div>
            
            {/* Socket Base */}
            <div className={`w-3 h-3 rounded-t-sm transition-colors duration-500 z-10 flex flex-col justify-evenly relative ${isDark ? 'bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-800' : 'bg-gradient-to-b from-slate-200 to-slate-400 border border-slate-400'}`}>
               <div className={`w-[110%] -ml-[5%] h-[1px] ${isDark ? 'bg-slate-900' : 'bg-slate-500'}`}></div>
               <div className={`w-[110%] -ml-[5%] h-[1px] ${isDark ? 'bg-slate-900' : 'bg-slate-500'}`}></div>
            </div>
            
            {/* Glass Bulb */}
            <div className={`w-6 h-6 -mt-[2px] rounded-full transition-all duration-300 relative flex items-center justify-center ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]' 
                : 'bg-gradient-to-br from-yellow-50 to-yellow-300 border border-yellow-200 shadow-[0_10px_25px_rgba(250,204,21,0.7),_inset_0_-2px_6px_rgba(255,255,255,0.8)]'
            }`}>
               {/* Reflection highlight */}
               <div className="absolute top-1 left-1 w-2 h-1 bg-white/70 rounded-full rotate-[-40deg] blur-[0.5px]"></div>
               
               {/* Filament */}
               <div className={`absolute w-2 h-2 border-[1.5px] border-b-0 rounded-t-full transition-colors duration-500 mt-0.5 ${isDark ? 'border-slate-700' : 'border-orange-500 drop-shadow-[0_0_2px_rgba(249,115,22,1)]'}`}></div>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
