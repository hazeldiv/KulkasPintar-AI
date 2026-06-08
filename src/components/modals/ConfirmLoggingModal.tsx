'use client';

import React, { useState, useEffect } from 'react';
import { ScanIngredient } from '@/lib/gemini-service';

interface ConfirmItem extends ScanIngredient {
  checked: boolean;
}

interface ConfirmLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedIngredients: ScanIngredient[];
  onConfirm: (
    items: {
      name: string;
      quantity: number;
      unit: string;
      category: string;
      expDays: number;
    }[]
  ) => Promise<void>;
}

export const ConfirmLoggingModal: React.FC<ConfirmLoggingModalProps> = ({
  isOpen,
  onClose,
  detectedIngredients,
  onConfirm,
}) => {
  const [items, setItems] = useState<ConfirmItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems(
        detectedIngredients.map((item) => ({
          ...item,
          checked: true,
        }))
      );
    }
  }, [isOpen, detectedIngredients]);

  if (!isOpen) return null;

  const handleCheckboxChange = (idx: number, checked: boolean) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, checked } : item))
    );
  };

  const handleFieldChange = (idx: number, field: keyof ScanIngredient, val: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleSave = async () => {
    const checkedItems = items.filter((item) => item.checked);
    if (checkedItems.length === 0) {
      alert('No ingredients checked to add.');
      onClose();
      return;
    }

    const itemsToSave = checkedItems.map((item) => ({
      name: item.name.trim(),
      quantity: parseFloat(String(item.quantity)) || 1.0,
      unit: item.unit.trim() || 'pcs',
      category: item.category || 'Others',
      expDays: parseInt(String(item.days_to_expiration)) || 7,
    }));

    setIsSubmitting(true);
    try {
      await onConfirm(itemsToSave);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="confirm-logging-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Verify Discovered Ingredients</h3>
          <p className="text-xs text-slate-500 mb-2.5">
            Edit or check the ingredients identified by the AI model before logging them manually into your stock database.
          </p>
          <div className="bg-rose-55/40 border border-rose-200/60 text-rose-800 text-[10px] p-2.5 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <span>
              <strong>AI Notice:</strong> Detections are predictions and may not be 100% accurate. Please review and
              adjust quantities, units, and shelf life before saving.
            </span>
          </div>
        </div>

        {/* Scrollable list of items */}
        <div className="flex-1 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-2">Log?</th>
                <th className="pb-2">Ingredient</th>
                <th className="pb-2 w-20">Qty</th>
                <th className="pb-2 w-24">Unit</th>
                <th className="pb-2">Category</th>
                <th className="pb-2 w-20">Exp Days</th>
              </tr>
            </thead>
            <tbody id="confirm-items-tbody" className="divide-y divide-slate-200">
              {items.map((item, index) => (
                <tr key={index} className="border-b border-slate-200 py-3 text-xs text-slate-700">
                  <td className="py-2.5">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                      className="item-confirm-cb rounded border-slate-300 text-teal-650 focus:ring-teal-500/20 cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                      className="item-confirm-name px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 w-full"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="number"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                      className="item-confirm-qty px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 w-full font-mono"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                      className="item-confirm-unit px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 w-full"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <select
                      value={item.category}
                      onChange={(e) => handleFieldChange(index, 'category', e.target.value)}
                      className="item-confirm-cat px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 w-full"
                    >
                      <option value="Dairy/Eggs">Dairy/Eggs</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Proteins">Meat/Proteins</option>
                      <option value="Pantry">Pantry</option>
                      <option value="Others">Others</option>
                    </select>
                  </td>
                  <td className="py-2.5 pr-1">
                    <input
                      type="number"
                      min="1"
                      value={item.days_to_expiration}
                      onChange={(e) => handleFieldChange(index, 'days_to_expiration', e.target.value)}
                      className="item-confirm-exp px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 w-full font-mono"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-xs bg-white hover:bg-slate-50 text-slate-655 font-semibold rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            Discard All
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-xs bg-teal-600 hover:bg-teal-550 text-white font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Add Checked to Inventory'}
          </button>
        </div>
      </div>
    </div>
  );
};
