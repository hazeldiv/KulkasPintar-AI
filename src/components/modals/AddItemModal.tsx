'use client';

import React, { useState } from 'react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    quantity: number,
    unit: string,
    category: string,
    expDays: number
  ) => Promise<void>;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('Others');
  const [expDays, setExpDays] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;

    const parsedQty = parseFloat(quantity);
    const parsedExp = parseInt(expDays) || 7;

    if (isNaN(parsedQty) || parsedQty <= 0) return;

    setIsSubmitting(true);
    try {
      await onAdd(name.trim(), parsedQty, unit.trim(), category, parsedExp);
      // Reset form
      setName('');
      setQuantity('1');
      setUnit('pcs');
      setCategory('Others');
      setExpDays('7');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-item-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Add Ingredient</h3>
          <p className="text-xs text-slate-500">Log a new ingredient manually to your digital database.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-655 mb-1">Ingredient Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Tomatoes, Cheddar Cheese"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-505"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-655 mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-505"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-655 mb-1">Unit</label>
              <input
                type="text"
                required
                placeholder="pcs, grams, ml"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-505"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-655 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-505"
            >
              <option value="Dairy/Eggs">Dairy/Eggs</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Proteins">Meat/Proteins</option>
              <option value="Pantry">Pantry</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-655 mb-1">Expiration Days</label>
            <input
              type="number"
              min="1"
              value={expDays}
              onChange={(e) => setExpDays(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-505"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-650 font-semibold rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-550 text-white font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
