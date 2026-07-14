import { Download } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-300 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12 pb-12">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-xl ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-sm">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            About FamTree
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            FamTree is a visually stunning, frontend-only application built to help you navigate and visualize your family history. It processes standard CSV data to map out complex relationships, providing beautiful graph visualizations.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">🌳 Family Tree</h3>
            <p className="text-slate-600 dark:text-slate-400">
              The <strong>Family Tree</strong> page allows you to select <em>two</em> family members and instantly calculates the shortest relationship path between them. It highlights the exact lineage connecting them, whether it's through blood, marriage, or distant ancestors, making complex family webs easy to understand.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">🕰️ Find My Ancestors</h3>
            <p className="text-slate-600 dark:text-slate-400">
              The <strong>Find My Ancestors</strong> page is focused on historical tracing. By selecting just <em>one</em> person, the application will walk upwards through time, rendering a comprehensive top-down tree of all their known parents, grandparents, and historical ancestors.
            </p>
          </div>
        </div>

        {/* Custom Data & CSV Rules */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-xl">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Uploading Custom Family Data</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
            You can bring your own family history to life! Both the Family Tree and Ancestor pages feature a data upload button. 
            When you upload a custom CSV file, it is automatically saved to your browser's local storage and <strong>reused seamlessly across both pages</strong> until you clear it.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">CSV Formatting Rules</h4>
            <ul className="space-y-3 text-slate-700 dark:text-slate-300 list-disc list-inside">
              <li><strong>Name</strong>: The full display name of the person.</li>
              <li><strong>Email</strong>: A unique identifier for the person (does not have to be a real email, just unique).</li>
              <li><strong>Gender</strong>: Must be either <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-sm text-blue-600 dark:text-blue-400">Male</code> or <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-sm text-blue-600 dark:text-blue-400">Female</code>.</li>
              <li><strong>Parent_Email</strong>: The unique ID (Email) of <em>one</em> of their parents. The other parent is inferred via marriage! Leave as <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-sm">NULL</code> if unknown.</li>
              <li><strong>Spouse_Email</strong>: The unique ID (Email) of their current spouse. Leave as <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-sm">NULL</code> if single.</li>
              <li><strong>Phone</strong> & <strong>Image</strong>: Optional fields. (Image can be a URL).</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a 
              href="/data.csv" 
              download="famtree_template.csv"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Download size={20} />
              Download Template CSV
            </a>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This will download the default example dataset as a starting template.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
