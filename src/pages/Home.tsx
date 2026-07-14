import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
        Welcome to FamTree
      </h1>
      <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl font-medium leading-relaxed">
        Discover your roots and explore your family connections with our premium, interactive network visualizer.
      </p>
      <Link 
        to="/family-tree" 
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
      >
        Explore Family Tree
      </Link>
    </div>
  );
}
