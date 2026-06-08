'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface ScanUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export const ScanUploadModal: React.FC<ScanUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const validateAndUpload = (file: File) => {
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Please upload a valid JPEG or PNG image.');
      return;
    }
    onUpload(file);
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      id="scan-upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div>
          <h3 className="text-lg font-bold text-slate-800">Scan Fridge or Pantry</h3>
          <p className="text-xs text-slate-500">Analyze a picture of your kitchen contents to extract ingredients.</p>
        </div>

        {/* Two column content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Dropzone */}
          <div className="flex flex-col justify-center">
            <div
              id="dropzone"
              onClick={handleDropzoneClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 group min-h-[220px] shadow-sm ${
                isDragOver
                  ? 'border-teal-500 bg-teal-50/20 shadow-[inset_0_0_20px_rgba(20,184,166,0.1)]'
                  : 'border-slate-300 hover:border-teal-500 bg-[#FAF9F5]/50 hover:bg-teal-50/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.05)] transition-all">
                <svg
                  className="w-8 h-8 text-slate-400 group-hover:text-teal-650 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block group-hover:text-teal-650 transition-colors">
                  Upload Fridge Image
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Drag & drop JPEG/PNG or click to browse
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Tips & Warning */}
          <div className="flex flex-col justify-between space-y-4">
            {/* Tips Section */}
            <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
                Scanning Tips
              </h4>
              <ul className="list-disc list-inside text-[10px] text-slate-655 space-y-1 pl-0.5 leading-relaxed">
                <li>
                  <strong>Spread items out:</strong> Lay your foodstuffs out clearly or open containers if possible so
                  they don't block each other.
                </li>
                <li>
                  <strong>Good lighting:</strong> Make sure the interior of your fridge or cabinet is well-lit.
                </li>
                <li>
                  <strong>Single angle:</strong> Capture everything in a single, clear, front-facing view.
                </li>
              </ul>
              <div className="mt-2.5 pt-2.5 border-t border-amber-200/40">
                <span className="text-[9px] font-bold text-amber-800 block mb-1">Example of Good Layout:</span>
                <div className="relative w-full h-24 rounded-xl border border-amber-200/50 shadow-sm overflow-hidden">
                  <Image
                    src="/assets/k_Edit_2023-06-grocery-diary-sarah_aldi-grocery-haul-2.jpg"
                    alt="Example laid out food"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Warning Section */}
            <div className="bg-rose-50/50 border border-rose-200/50 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
                AI Notice
              </h4>
              <p className="text-[10px] text-slate-655 leading-relaxed mt-1">
                The computer vision model makes predictions based on the image contents and **may not be 100% perfect**.
                Please verify all ingredients before saving them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
