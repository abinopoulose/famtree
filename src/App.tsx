import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import FamilyTree from './pages/FamilyTree';

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
        <Navbar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
        <main className="flex-1 flex flex-col w-full relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/family-tree" element={<FamilyTree />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
