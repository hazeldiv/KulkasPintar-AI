'use client';

import React, { useState, useEffect } from 'react';

interface DietaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRestrictions: string[];
  onSave: (restrictions: string[]) => Promise<void>;
}

export const DietaryModal: React.FC<DietaryModalProps> = ({
  isOpen,
  onClose,
  initialRestrictions,
  onSave,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(initialRestrictions);
    }
  }, [isOpen, initialRestrictions]);

  if (!isOpen) return null;

  const options = [
    { value: 'Vegetarian', label: 'Vegetarian' },
    { value: 'Vegan', label: 'Vegan' },
    { value: 'Halal', label: 'Halal' },
    { value: 'Gluten-Free', label: 'Gluten-Free' },
    { value: 'Peanut-Allergy', label: 'Peanut Allergy' },
  ];

  const handleCheckboxChange = (val: string) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(selected);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="diet-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Dietary & Health Profile</h3>
          <p className="text-xs text-slate-500">Add dietary guidelines to customize recipes.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition cursor-pointer text-xs text-slate-700"
              >
                <input
                  type="checkbox"
                  name="restrictions"
                  value={opt.value}
                  checked={selected.includes(opt.value)}
                  onChange={() => handleCheckboxChange(opt.value)}
                  className="rounded border-slate-300 text-teal-650 focus:ring-teal-500/20"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 text-xs bg-white hover:bg-slate-50 text-slate-650 font-semibold rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 text-xs bg-teal-650 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
