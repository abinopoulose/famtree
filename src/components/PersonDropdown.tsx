import { useState, useRef, useEffect } from 'react';
import { CSV_COLUMNS } from '../constants';
import { Search, ChevronDown } from 'lucide-react';
import { getAvatarFallback } from '../utils/graphAlgorithms';

export default function PersonDropdown({ label, people, selectedPerson, onSelect }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as globalThis.Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredPeople = people.filter((p: any) => {
    const name = (p[CSV_COLUMNS.NAME] || '').toLowerCase();
    const searchTerms = search.toLowerCase().trim().split(/\s+/);
    
    if (searchTerms.length === 1 && searchTerms[0] === '') return true;
    
    return searchTerms.every(term => name.includes(term));
  });

  return (
    <div ref={dropdownRef} className={`flex flex-col gap-2 relative w-64 ${isOpen ? 'z-[100]' : 'z-[70]'}`}>
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer group"
      >
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
          {selectedPerson ? selectedPerson[CSV_COLUMNS.NAME] : 'Select person...'}
        </span>
        <ChevronDown size={16} className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 relative">
            <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto py-2">
            {filteredPeople.map((p: any) => (
              <div 
                key={p[CSV_COLUMNS.EMAIL]} 
                onClick={() => {
                  onSelect(p);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <img 
                  src={p[CSV_COLUMNS.IMAGE] ? `/${p[CSV_COLUMNS.IMAGE].replace('public/', '')}` : getAvatarFallback(p[CSV_COLUMNS.GENDER])}
                  onError={(e) => { e.currentTarget.src = getAvatarFallback(p[CSV_COLUMNS.GENDER]); }}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{p[CSV_COLUMNS.NAME]}</span>
              </div>
            ))}
            {filteredPeople.length === 0 && (
              <div className="px-4 py-6 text-center text-sm font-medium text-slate-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
