
import React from 'react';
import { EditedImage } from '../types';

interface HistoryItemProps {
  item: EditedImage;
  onClick: (item: EditedImage) => void;
  isActive: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onClick, isActive }) => {
  return (
    <button
      onClick={() => onClick(item)}
      className={`w-full p-3 flex gap-3 items-center rounded-xl transition-all text-left ${
        isActive ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-100 border-transparent'
      } border`}
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 border border-slate-100 shadow-sm">
        <img src={item.editedUrl} alt={item.prompt} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{item.prompt}</p>
        <p className="text-xs text-slate-500 mt-1">
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </button>
  );
};

export default HistoryItem;
