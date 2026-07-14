export default function About() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 p-8 flex items-center justify-center transition-colors duration-300">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-10 md:p-12 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-sm">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">About FamTree</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          FamTree is a visually stunning, frontend-only application built to help you navigate your family history. It processes standard CSV data to map out relationships, providing a beautiful graph visualization connecting any two family members with a sleek, modern glassmorphic interface.
        </p>
      </div>
    </div>
  );
}
