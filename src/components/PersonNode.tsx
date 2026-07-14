import { Handle, Position } from 'reactflow';
import { Info } from 'lucide-react';

export default function PersonNode({ data }: { data: any }) {
  const renderPerson = (pData: any, isSpouse = false) => (
    <div className="flex flex-col gap-2 w-[220px] shrink-0 relative">
      {pData.raw && (
        <button 
          onClick={(e) => { e.stopPropagation(); if (data.onInfoClick) data.onInfoClick(pData); }}
          className="absolute top-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 hover:text-blue-500 cursor-pointer p-1.5 z-10 flex items-center justify-center shadow-md transition-colors duration-200"
          title="More Info"
        >
          <Info size={14} />
        </button>
      )}

      <div className="flex items-center gap-3">
        <img 
          src={pData.image} 
          alt="avatar" 
          onError={(e) => { e.currentTarget.src = pData.fallbackImage; }}
          className={`w-14 h-14 rounded-full object-cover border-[3px] ${isSpouse ? 'border-slate-200 dark:border-slate-600' : 'border-blue-500'} shrink-0 shadow-sm`}
        />
        <div className="overflow-hidden flex flex-col items-start">
          <div className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis w-full">
            {pData.name}
          </div>
          {pData.role && (
            <div className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full mt-1">
              {pData.role}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const mainGender = data.raw?.Gender?.toLowerCase() || '';
  
  const mainIsFemale = mainGender === 'female';
  
  // Swap if the main person is female and the spouse is male (or if main is female and we want her on right)
  const swap = data.spouse && mainIsFemale;
  
  const leftData = swap ? data.spouse : data;
  const rightData = swap ? data : data.spouse;
  const leftIsSpouse = swap ? true : false;
  const rightIsSpouse = swap ? false : true;

  const targetHandleLeft = !data.spouse ? '50%' : (swap ? '380px' : '130px');

  return (
    <div 
      className={`flex flex-col p-5 rounded-3xl border relative backdrop-blur-md transition-all duration-300 ${
        data.isEndpoint 
          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-900/40 ring-4 ring-blue-400 dark:ring-blue-600 shadow-[0_0_25px_rgba(59,130,246,0.6)] z-20' 
          : data.isInPath
            ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.4)] z-10'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl'
      }`}
      style={{ width: data.spouse ? 510 : 270 }}
    >
      {!data.isRoot && (
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-500 !border-none" style={{ left: targetHandleLeft }} />
      )}
      
      <div className="flex items-start gap-4 w-full">
        {data.spouse ? (
          <>
            {renderPerson(leftData, leftIsSpouse)}
            <div className="w-[1px] self-stretch border-l border-dashed border-slate-300 dark:border-slate-700 min-h-[60px]"></div>
            {renderPerson(rightData, rightIsSpouse)}
          </>
        ) : (
          renderPerson(data)
        )}
      </div>

      {!data.isLeaf && (
        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-500 !border-none" style={{ left: '50%' }} />
      )}
    </div>
  );
}
