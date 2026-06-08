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
  onDeleteAllClick?: () => void;
  onDeleteSelectedClick?: (ids: number[]) => void;
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
  onDeleteAllClick,
  onDeleteSelectedClick,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  // If page index is out of range due to deletion, adjust it
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [items.length, totalPages, currentPage]);

  // Sync selectedIds with items when items list changes
  React.useEffect(() => {
    const itemIds = new Set(items.map((item) => item.id));
    setSelectedIds((prev) => prev.filter((id) => itemIds.has(id)));
  }, [items]);

  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section className="w-full lg:flex-1 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 xl:p-6 lg:overflow-y-auto flex flex-col gap-6 flex-shrink-0 lg:flex-shrink">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Digital Inventory</h2>
          <p className="text-xs text-slate-500">Manage ingredients in your kitchen cabinet & fridge.</p>
        </div>

        {/* Actions Button Group */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && onDeleteSelectedClick ? (
            <button
              type="button"
              id="btn-delete-selected"
              onClick={() => onDeleteSelectedClick(selectedIds)}
              className="text-xs px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-200 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete Selected ({selectedIds.length})
            </button>
          ) : (
            items.length > 0 && onDeleteAllClick && (
              <button
                type="button"
                id="btn-delete-all"
                onClick={onDeleteAllClick}
                className="text-xs px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-200 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete All
              </button>
            )
          )}

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
      </div>

      {/* Inventory List View */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[300px] shadow-sm">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-2 xl:px-4 w-10 text-center">
                  {items.length > 0 && (
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer h-3.5 w-3.5"
                      checked={
                        paginatedItems.length > 0 &&
                        paginatedItems.every((item) => selectedIds.includes(item.id))
                      }
                      onChange={(e) => {
                        const pageIds = paginatedItems.map((item) => item.id);
                        if (e.target.checked) {
                          setSelectedIds((prev) => {
                            const newSelection = [...prev];
                            pageIds.forEach((id) => {
                              if (!newSelection.includes(id)) {
                                newSelection.push(id);
                              }
                            });
                            return newSelection;
                          });
                        } else {
                          setSelectedIds((prev) =>
                            prev.filter((id) => !pageIds.includes(id))
                          );
                        }
                      }}
                    />
                  )}
                </th>
                <th className="py-3.5 px-2 xl:px-4">Ingredient</th>
                <th className="py-3.5 px-2 xl:px-4">Category</th>
                <th className="py-3.5 px-2 xl:px-4 text-center">Qty</th>
                <th className="py-3.5 px-2 xl:px-4">Expiration Status</th>
                <th className="py-3.5 px-2 xl:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="inventory-list" className="divide-y divide-slate-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Your inventory is empty. Add items manually or upload a picture.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const exp = calculateExpirationStatus(item.addedAt, item.expiresAt);
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 text-xs transition duration-200 text-slate-700 ${isSelected ? 'bg-slate-50/80 font-medium' : ''
                        }`}
                    >
                      <td className="py-4 px-2 xl:px-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer h-3.5 w-3.5"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, item.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                            }
                          }}
                        />
                      </td>
                      <td className="py-4 px-2 xl:px-4 font-bold text-slate-800">{item.name}</td>
                      <td className="py-4 px-2 xl:px-4 text-slate-550">{item.category}</td>
                      <td className="py-4 px-2 xl:px-4 text-center font-semibold text-slate-700">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onDecrementQty(item.id, item.quantity)}
                            className="btn-dec w-5 h-5 rounded bg-slate-105 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold transition flex items-center justify-center cursor-pointer text-[10px]"
                          >
                            -
                          </button>
                          <span className="min-w-8 px-1 inline-block text-center font-mono text-[11px] whitespace-nowrap">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => onIncrementQty(item.id, item.quantity)}
                            className="btn-inc w-5 h-5 rounded bg-slate-105 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold transition flex items-center justify-center cursor-pointer text-[10px]"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-2 xl:px-4">
                        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-1 xl:gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${exp.class}`}>
                            {exp.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{exp.daysText}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 xl:px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteClick(item.id)}
                          className="btn-delete text-rose-650 hover:text-rose-800 font-bold cursor-pointer transition text-[11px]"
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
            <div>
              Showing <span className="font-semibold">{Math.min(items.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> to{' '}
              <span className="font-semibold">{Math.min(items.length, currentPage * ITEMS_PER_PAGE)}</span> of{' '}
              <span className="font-semibold">{items.length}</span> items
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-pagination-prev"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous
              </button>
              <span className="text-slate-500 font-medium px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                id="btn-pagination-next"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
