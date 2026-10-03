import React, { useRef } from 'react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (type: 'kumulatif' | 'grading', file: File) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importTypeRef = useRef<'kumulatif' | 'grading'>('kumulatif');

  if (!isOpen) return null;

  const triggerUpload = (type: 'kumulatif' | 'grading') => {
    importTypeRef.current = type;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(importTypeRef.current, file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
          📥 Impor Database Excel
        </h3>
        <p className="text-xs text-slate-500">
          Silakan pilih jenis data yang ingin Anda impor dari file spreadsheet:
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => triggerUpload('kumulatif')}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-blue-50 hover:bg-blue-100 text-left cursor-pointer transition shadow-2xs"
          >
            <h4 className="font-extrabold text-sm text-blue-900 mb-0.5">
              🔵 Impor Klasemen Kumulatif
            </h4>
            <p className="text-xs text-blue-700">
              Impor riwayat kehadiran, jumlah main, menang, kalah, dan poin.
            </p>
          </button>

          <button
            onClick={() => triggerUpload('grading')}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-amber-50 hover:bg-amber-100 text-left cursor-pointer transition shadow-2xs"
          >
            <h4 className="font-extrabold text-sm text-amber-900 mb-0.5">
              ⭐ Impor Database Grading
            </h4>
            <p className="text-xs text-amber-700">
              Impor khusus untuk memperbarui Nama dan Nilai Grade pemain secara massal.
            </p>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex justify-end pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
