import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 relative z-[99] shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-center px-6 md:px-8 py-4">
        <Link to="/" className="flex items-center gap-3 font-bold text-xl text-slate-900 dark:text-white transition-transform hover:scale-105">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
            <img src="/fam_tree.svg" alt="FamTree" className="w-6 h-6 object-contain" />
          </div>
          <span className="tracking-tight">FamTree</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Home</Link>
          <Link to="/about" className={`text-sm font-semibold transition-colors ${isActive('/about') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>About</Link>
          <Link to="/family-tree" className={`text-sm font-semibold transition-colors ${isActive('/family-tree') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Family Tree</Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-4 z-[99]">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 px-4 rounded-xl font-semibold mb-2 transition-colors ${isActive('/') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Home</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 px-4 rounded-xl font-semibold mb-2 transition-colors ${isActive('/about') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>About</Link>
          <Link to="/family-tree" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 px-4 rounded-xl font-semibold transition-colors ${isActive('/family-tree') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Family Tree</Link>
        </div>
      )}
    </nav>
  );
}
