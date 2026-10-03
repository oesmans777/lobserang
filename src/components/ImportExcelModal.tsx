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
    <div className="fixed inset-0 bg-[#013A40]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#F2F2F2] border-2 border-[#038C8C]/50 shape-cyber-card max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 shape-cyber-card bg-linear-to-br from-[#038C8C] to-[#013A40] text-white text-2xl flex items-center justify-center mx-auto shadow-md border border-[#B2DCE5]/40">
          <span className="drop-shadow-[0_0_8px_#F8B700]">📥</span>
        </div>
        <h3 className="text-base font-black text-[#013A40] uppercase font-tech tracking-wider flex items-center justify-center gap-2">
          <span>Impor Database Spreadsheet</span>
        </h3>
        <p className="text-xs text-[#013A40]/70 font-medium">
          Silakan pilih jenis data yang ingin Anda impor dari file spreadsheet:
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => triggerUpload('kumulatif')}
            className="w-full p-3.5 shape-cyber-card border border-[#038C8C]/40 bg-white hover:bg-[#B2DCE5]/20 text-left cursor-pointer transition shadow-2xs group"
          >
            <h4 className="font-black text-sm text-[#013A40] mb-0.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#038C8C]"></span>
              <span>Impor Klasemen Kumulatif</span>
            </h4>
            <p className="text-xs text-[#013A40]/70">
              Impor riwayat kehadiran, jumlah main, menang, kalah, dan poin.
            </p>
          </button>

          <button
            onClick={() => triggerUpload('grading')}
            className="w-full p-3.5 shape-cyber-card border border-[#038C8C]/40 bg-white hover:bg-[#B2DCE5]/20 text-left cursor-pointer transition shadow-2xs group"
          >
            <h4 className="font-black text-sm text-[#013A40] mb-0.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F8B700]"></span>
              <span>Impor Database Grading</span>
            </h4>
            <p className="text-xs text-[#013A40]/70">
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

        <div className="flex justify-end pt-3 border-t border-[#B2DCE5]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-[#013A40] shape-cyber-card font-bold text-xs cursor-pointer border border-[#B2DCE5] transition"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
