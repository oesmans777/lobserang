import React, { useState } from 'react';
import { GAS_TEMPLATES } from '../gasCodeTemplates';

interface GasExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasExportModal: React.FC<GasExportModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<keyof typeof GAS_TEMPLATES>('Code.gs');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCode = GAS_TEMPLATES[activeFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([currentCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = activeFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📁</span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                File Google Apps Script & Deployment Guide
              </h3>
              <p className="text-[11px] text-slate-500">
                Salin file-file berikut ke editor <code>script.google.com</code> Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-4 pt-3 bg-slate-100 border-b border-slate-200 overflow-x-auto">
          {Object.keys(GAS_TEMPLATES).map(fileName => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName as any)}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition border-t border-x cursor-pointer ${
                activeFile === fileName
                  ? 'bg-white text-blue-600 border-slate-200 border-b-2 border-b-white -mb-px shadow-2xs'
                  : 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 bg-slate-950 overflow-auto text-cyan-300 font-mono text-xs leading-relaxed select-text">
          <pre>{currentCode}</pre>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Path file lokal di repo: <code>/google-apps-script/{activeFile}</code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-bold cursor-pointer transition flex items-center gap-1"
            >
              ⬇️ Unduh File
            </button>
            <button
              onClick={handleCopy}
              className={`px-4 py-1.5 rounded-md font-bold text-white cursor-pointer transition flex items-center gap-1.5 ${
                copied ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? '✅ Tersalin!' : '📋 Salin Kode'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
