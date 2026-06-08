'use client';

import React from 'react';

interface LeftPanelProps {
  dietaryRestrictions: string[];
  onEditDietClick: () => void;
  strictMatch: boolean;
  onStrictMatchChange: (val: boolean) => void;
  saveTheFood: boolean;
  onSaveTheFoodChange: (val: boolean) => void;
  onScanClick: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  dietaryRestrictions,
  onEditDietClick,
  strictMatch,
  onStrictMatchChange,
  saveTheFood,
  onSaveTheFoodChange,
  onScanClick,
}) => {
  return (
    <section className="w-full lg:w-80 bg-[#FCFBF9] border-b lg:border-b-0 lg:border-r border-slate-200 p-5 overflow-y-auto flex flex-col gap-6 flex-shrink-0">
      
      {/* Profile & Dietary Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-500">Dietary Profile</h3>
          <button
            type="button"
            onClick={onEditDietClick}
            className="text-xs text-teal-650 hover:text-teal-700 hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>
        <div id="dietary-badges" className="flex flex-wrap gap-1.5">
          {dietaryRestrictions.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No restrictions saved.</span>
          ) : (
            dietaryRestrictions.map((diet) => (
              <span
                key={diet}
                className="px-2.5 py-1 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/50 rounded-full"
              >
                {diet}
              </span>
            ))
          )}
        </div>
      </div>

      {/* AI Controls & Options */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-500">AI Recipe Settings</h3>
        
        {/* Strict Match Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <label htmlFor="toggle-strict-match" className="text-xs font-bold text-slate-700 block">
              Strict Match
            </label>
            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
              Use only ingredients currently logged in your inventory.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer mt-1">
            <input
              type="checkbox"
              id="toggle-strict-match"
              className="sr-only peer"
              checked={strictMatch}
              onChange={(e) => onStrictMatchChange(e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:bg-[#FAF9F5] peer-checked:bg-teal-650"></div>
          </label>
        </div>

        {/* Save the Food Toggle */}
        <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="flex-1">
            <label htmlFor="toggle-save-food" className="text-xs font-bold text-slate-700 block">
              Save the Food
            </label>
            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
              Prioritize using the oldest ingredients in inventory first.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer mt-1">
            <input
              type="checkbox"
              id="toggle-save-food"
              className="sr-only peer"
              checked={saveTheFood}
              onChange={(e) => onSaveTheFoodChange(e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:bg-[#FAF9F5] peer-checked:bg-teal-650"></div>
          </label>
        </div>
      </div>

      {/* Scan Action Button */}
      <div className="mt-auto pt-4 flex-shrink-0">
        <button
          type="button"
          onClick={onScanClick}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-teal-600 hover:bg-teal-550 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 transition cursor-pointer"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>Scan Fridge / Pantry</span>
        </button>
      </div>
    </section>
  );
};
