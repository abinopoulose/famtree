import { Link, useLocation } from 'react-router-dom';
import { Network, Moon, Sun } from 'lucide-react';

export default function Navbar({ isDark, toggleTheme }: { isDark: boolean, toggleTheme: () => void }) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-8 py-4 relative z-50 shadow-sm transition-colors duration-300">
      <Link to="/" className="flex items-center gap-3 font-bold text-xl text-slate-900 dark:text-white transition-transform hover:scale-105">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
          <Network size={24} />
        </div>
        <span className="tracking-tight">FamTree</span>
      </Link>
      <div className="flex gap-8 items-center">
        <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Home</Link>
        <Link to="/about" className={`text-sm font-semibold transition-colors ${isActive('/about') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>About</Link>
        <Link to="/family-tree" className={`text-sm font-semibold transition-colors ${isActive('/family-tree') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Family Tree</Link>
        
        <button onClick={toggleTheme} className="ml-2 p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700" title="Toggle Theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}
