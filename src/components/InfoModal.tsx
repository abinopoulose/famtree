import { X, User } from 'lucide-react';
import { CSV_COLUMNS } from '../constants';
import { getAvatarFallback } from '../utils/graphAlgorithms';

export default function InfoModal({ modalData, setModalData, people }: any) {
  if (!modalData || !modalData.raw) return null;
  
  const p = modalData.raw;
  const parentEmail = p[CSV_COLUMNS.PARENT_EMAIL];
  const bloodParent = (parentEmail && parentEmail !== 'NULL') ? people.find((x: any) => x[CSV_COLUMNS.EMAIL] === parentEmail) : null;
  
  let father = null;
  let mother = null;

  if (bloodParent) {
    const isBloodParentMale = bloodParent[CSV_COLUMNS.GENDER]?.trim().toLowerCase() === 'male';
    if (isBloodParentMale) {
      father = bloodParent;
      const bpSpouseEmail = bloodParent[CSV_COLUMNS.SPOUSE_EMAIL];
      mother = (bpSpouseEmail && bpSpouseEmail !== 'NULL') ? people.find((x: any) => x[CSV_COLUMNS.EMAIL] === bpSpouseEmail) : null;
    } else {
      mother = bloodParent;
      const bpSpouseEmail = bloodParent[CSV_COLUMNS.SPOUSE_EMAIL];
      father = (bpSpouseEmail && bpSpouseEmail !== 'NULL') ? people.find((x: any) => x[CSV_COLUMNS.EMAIL] === bpSpouseEmail) : null;
    }
  }

  const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
  const spouse = (spouseEmail && spouseEmail !== 'NULL') ? people.find((x: any) => x[CSV_COLUMNS.EMAIL] === spouseEmail) : null;
  
  const navigateTo = (personData: any) => {
    if (!personData) return;
    const gender = personData[CSV_COLUMNS.GENDER];
    setModalData({
      name: personData[CSV_COLUMNS.NAME],
      image: personData[CSV_COLUMNS.IMAGE] ? `/${personData[CSV_COLUMNS.IMAGE].replace('public/', '')}` : getAvatarFallback(gender),
      fallbackImage: getAvatarFallback(gender),
      raw: personData
    });
  };

  const isMale = p[CSV_COLUMNS.GENDER]?.trim().toLowerCase() === 'male';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[90%] max-w-md max-h-[90vh] overflow-y-auto flex flex-col p-8 relative rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setModalData(null)}
          className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <img 
            src={modalData.image} 
            alt="avatar" 
            onError={(e) => { e.currentTarget.src = modalData.fallbackImage; }}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-md mb-4 bg-slate-50 dark:bg-slate-800"
          />
          <div className="font-bold text-2xl text-slate-900 dark:text-slate-100 text-center">{modalData.name}</div>
          <div className="text-sm font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
            {isMale ? 'Male' : 'Female'}
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mb-6 w-full">
          {father && (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 ml-1">Father</span>
              <button onClick={() => navigateTo(father)} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl transition-colors duration-200 w-full text-left cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{father[CSV_COLUMNS.NAME]}</span>
              </button>
            </div>
          )}

          {mother && (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 ml-1">Mother</span>
              <button onClick={() => navigateTo(mother)} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl transition-colors duration-200 w-full text-left cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{mother[CSV_COLUMNS.NAME]}</span>
              </button>
            </div>
          )}

          {spouse && (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 ml-1">Spouse</span>
              <button onClick={() => navigateTo(spouse)} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl transition-colors duration-200 w-full text-left cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{spouse[CSV_COLUMNS.NAME]}</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
          {Object.entries(CSV_COLUMNS).map(([key, colName]) => {
            if (key === 'PARENT_EMAIL' || key === 'SPOUSE_EMAIL') return null;
            const val = modalData.raw[colName as keyof typeof CSV_COLUMNS];
            if (!val || val === 'NULL' || key === 'IMAGE' || key === 'NAME' || key === 'GENDER') return null;
            return (
              <div key={key} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{colName}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">{val}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
