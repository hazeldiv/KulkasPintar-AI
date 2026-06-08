'use client';

import React, { useState } from 'react';

export interface Recipe {
  name: string;
  prep_time: string;
  ingredients_used: string[];
  instructions: string[];
}

interface RecipePanelProps {
  recipes: Recipe[];
  inventoryCount: number;
  onGenerateRecipesClick?: () => void;
  isGenerating?: boolean;
}

export const RecipePanel: React.FC<RecipePanelProps> = ({
  recipes,
  inventoryCount,
  onGenerateRecipesClick,
  isGenerating,
}) => {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleSteps = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className="w-full lg:w-96 bg-[#FCFBF9] p-6 lg:overflow-y-auto flex flex-col gap-6 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-2">
          <h2 className="text-lg font-bold text-slate-800">AI Chef's Corner</h2>
          <p className="text-xs text-slate-505">Delicious recipes tailored to your ingredients.</p>
        </div>
        {inventoryCount > 0 && onGenerateRecipesClick && (
          <button
            type="button"
            onClick={onGenerateRecipesClick}
            disabled={isGenerating}
            className="text-xs px-3 py-1.5 bg-teal-650 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isGenerating ? 'Thinking...' : 'Get Recipes'}
          </button>
        )}
      </div>

      <div id="recipe-list-container" className="space-y-4 flex-1 flex flex-col">
        {recipes.length === 0 ? (
          /* Recipes Empty State */
          <div
            id="recipes-empty-state"
            className="flex-1 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-550 gap-3 min-h-[250px]"
          >
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700">No Recipes Suggested</span>
            <span className="text-[10px] text-slate-500 leading-normal max-w-[200px] mb-1">
              Scan your fridge pantry or log ingredients to get instant ideas.
            </span>
            {inventoryCount > 0 && onGenerateRecipesClick && (
              <button
                type="button"
                id="btn-empty-state-get-recipes"
                onClick={onGenerateRecipesClick}
                disabled={isGenerating}
                className="mt-2 text-xs px-4 py-2 bg-teal-650 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? 'Thinking...' : 'Get Recipes'}
              </button>
            )}
          </div>
        ) : (
          <div id="recipes-container" className="space-y-4">
            {recipes.map((recipe, idx) => {
              const isExpanded = !!expandedIndices[idx];
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-teal-200/80 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{recipe.name}</h4>
                    <span className="text-[9px] px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 font-semibold rounded-full shrink-0 font-mono">
                      {recipe.prep_time}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {recipe.ingredients_used.map((ing, ingIdx) => (
                      <span
                        key={ingIdx}
                        className="px-2 py-0.5 bg-teal-50 border border-teal-200/50 text-teal-650 rounded text-[9px] font-bold"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>

                  {/* Steps trigger */}
                  <button
                    type="button"
                    onClick={() => toggleSteps(idx)}
                    className="btn-toggle-steps text-left text-[10px] font-bold text-teal-650 hover:text-teal-700 flex items-center gap-1 cursor-pointer mt-1"
                  >
                    <span>View Cooking Instructions</span>
                    <svg
                      className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  {/* Steps container */}
                  {isExpanded && (
                    <div className="steps-content mt-2 pt-2.5 border-t border-slate-200 text-[10px] text-slate-650 space-y-2 leading-relaxed">
                      <ol className="list-decimal list-inside space-y-1.5 pl-1">
                        {recipe.instructions.map((step, stepIdx) => (
                          <li key={stepIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
