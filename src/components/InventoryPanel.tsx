'use client';

import React from 'react';

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  addedAt: string;
  expiresAt: string | null;
}

interface InventoryPanelProps {
  items: InventoryItem[];
  onAddItemClick: () => void;
  onIncrementQty: (id: number, currentQty: number) => void;
  onDecrementQty: (id: number, currentQty: number) => void;
  onDeleteClick: (id: number) => void;
}

export const calculateExpirationStatus = (addedAtStr: string, expiresAtStr: string | null) => {
  const now = new Date();
  let expiryDate: Date;

  if (expiresAtStr) {
    expiryDate = new Date(expiresAtStr);
  } else {
    // Fallback: estimate 7 days shelf life from addition time
    const addedDate = new Date(addedAtStr);
    expiryDate = new Date(addedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { label: 'Expired', class: 'tag-expired', daysText: 'Expired' };
  } else if (diffDays <= 2) {
    return { label: 'Use Soon', class: 'tag-warning', daysText: `Expires in ${diffDays}d` };
  } else {
    return { label: 'Fresh', class: 'tag-fresh', daysText: `${diffDays} days left` };
  }
};

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onAddItemClick,
  onIncrementQty,
  onDecrementQty,
  onDeleteClick,
}) => {
  return (
    <section className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 overflow-y-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Digital Inventory</h2>
          <p className="text-xs text-slate-500">Manage ingredients in your kitchen cabinet & fridge.</p>
        </div>
        
        {/* Quick Add Button */}
        <button
          type="button"
          onClick={onAddItemClick}
          className="text-xs px-3.5 py-2 bg-teal-650 hover:bg-teal-700 active:scale-98 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Item
        </button>
      </div>

      {/* Inventory List View */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[300px] shadow-sm">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-4">Ingredient</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Qty</th>
                <th className="py-3.5 px-4">Expiration Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="inventory-list" className="divide-y divide-slate-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    Your inventory is empty. Add items manually or upload a picture.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const exp = calculateExpirationStatus(item.addedAt, item.expiresAt);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-200 hover:bg-slate-50 text-xs transition duration-200 text-slate-700"
                    >
                      <td className="py-4 px-4 font-bold text-slate-800">{item.name}</td>
                      <td className="py-4 px-4 text-slate-550">{item.category}</td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-700">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onDecrementQty(item.id, item.quantity)}
                            className="btn-dec w-6 h-6 rounded bg-slate-105 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold transition flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 inline-block text-center font-mono">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => onIncrementQty(item.id, item.quantity)}
                            className="btn-inc w-6 h-6 rounded bg-slate-105 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold transition flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${exp.class}`}>
                            {exp.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">{exp.daysText}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteClick(item.id)}
                          className="btn-delete text-rose-650 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
