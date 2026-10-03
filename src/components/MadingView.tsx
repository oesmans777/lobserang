import React, { useState } from 'react';
import { MadingPost, UserRole } from '../types';

interface MadingViewProps {
  userRole: UserRole | null;
  madingList: MadingPost[];
  onSaveMading: (post: Partial<MadingPost>) => void;
  onDeleteMading: (id: string) => void;
}

export const MadingView: React.FC<MadingViewProps> = ({
  userRole,
  madingList,
  onSaveMading,
  onDeleteMading
}) => {
  const [isLocked, setIsLocked] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'post' | 'crew'>('post');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nama, setNama] = useState('');
  const [hp, setHp] = useState('');
  const [fontSize, setFontSize] = useState(13);
  const [styleClass, setStyleClass] = useState<MadingPost['style_class']>('pin-yellow');
  const [linkUrl, setLinkUrl] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  const openAddModal = (mode: 'post' | 'crew', editItem?: MadingPost) => {
    setModalMode(mode);
    if (editItem) {
      setSelectedId(editItem.mading_id);
      setTitle(editItem.title);
      setContent(editItem.content);
      setNama(editItem.nama || '');
      setHp(editItem.hp || '');
      setFontSize(editItem.font_size || 13);
      setStyleClass(editItem.style_class || (mode === 'crew' ? 'pin-crew' : 'pin-yellow'));
      setLinkUrl(editItem.link_url || '');
      setImgUrl(editItem.url_gambar || '');
    } else {
      setSelectedId(null);
      setTitle('');
      setContent('');
      setNama('');
      setHp('');
      setFontSize(mode === 'crew' ? 14 : 13);
      setStyleClass(mode === 'crew' ? 'pin-crew' : 'pin-yellow');
      setLinkUrl('');
      setImgUrl('');
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImgUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMading({
      mading_id: selectedId || undefined,
      type: modalMode,
      title: title.trim() || 'Mading',
      content: content.trim(),
      nama: modalMode === 'crew' ? nama.trim() : undefined,
      hp: modalMode === 'crew' ? hp.trim() : undefined,
      font_size: fontSize,
      style_class: styleClass,
      link_url: linkUrl.trim() || undefined,
      url_gambar: imgUrl || undefined,
      x: Math.floor(Math.random() * 50) + 20,
      y: Math.floor(Math.random() * 50) + 20,
      is_minimized: false,
    });
    setIsModalOpen(false);
  };

  const toggleMinimize = (id: string) => {
    const item = madingList.find(m => m.mading_id === id);
    if (item && item.type === 'crew') {
      onSaveMading({
        ...item,
        is_minimized: !item.is_minimized
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            📰 News & Update (Mading Pinboard)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unggah foto momen, pengumuman event, info kontak crew, sponsor, dan tautan sosial.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode View Toggle */}
          <div className="bg-slate-200 p-0.5 rounded-lg flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📱</span>
              <span>Grid Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'board'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📌</span>
              <span>Pinboard</span>
            </button>
          </div>

          {userRole === 'admin' && (
            <div className="flex gap-2 flex-wrap">
              {viewMode === 'board' && (
                <button
                  onClick={() => setIsLocked(!isLocked)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ${
                    isLocked
                      ? 'bg-white border-slate-300 text-slate-700'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  }`}
                >
                  {isLocked ? '🔒 Terkunci' : '🔓 Edit Layout'}
                </button>
              )}
              <button
                onClick={() => openAddModal('crew')}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer shadow-2xs transition"
              >
                ➕ Crew
              </button>
              <button
                onClick={() => openAddModal('post')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-2xs transition"
              >
                ➕ Tambah Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW: RESPONSIVE GRID (DEFAULT ON MOBILE & COMPACT) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {madingList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-sm bg-white rounded-xl border border-dashed border-slate-300">
              Belum ada kartu mading atau pengumuman.
            </div>
          ) : (
            madingList.map(item => {
              let themeClasses = 'bg-linear-to-br from-amber-50 to-amber-100 text-amber-950 border-amber-300';
              if (item.style_class === 'pin-blue') themeClasses = 'bg-linear-to-br from-sky-50 to-sky-100 text-sky-950 border-sky-300';
              if (item.style_class === 'pin-green') themeClasses = 'bg-linear-to-br from-emerald-50 to-emerald-100 text-emerald-950 border-emerald-300';
              if (item.style_class === 'pin-purple') themeClasses = 'bg-linear-to-br from-purple-50 to-purple-100 text-purple-950 border-purple-300';
              if (item.style_class === 'pin-crew') themeClasses = 'bg-linear-to-br from-slate-900 to-slate-800 text-white border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.2)]';
              if (item.style_class === 'pin-sponsor') themeClasses = 'bg-linear-to-br from-slate-950 to-indigo-950 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]';

              return (
                <div
                  key={item.mading_id}
                  className={`p-4 rounded-2xl border-2 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${themeClasses}`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-2.5">
                      <span className="font-extrabold text-xs flex items-center gap-1.5 truncate max-w-[85%]">
                        <span>📌</span>
                        <span className="truncate">{item.title}</span>
                      </span>
                      {userRole === 'admin' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openAddModal(item.type, item)}
                            className="cursor-pointer text-xs opacity-75 hover:opacity-100"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteMading(item.mading_id)}
                            className="cursor-pointer text-xs text-red-500 opacity-75 hover:opacity-100"
                            title="Hapus"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-xs space-y-2">
                      {item.type === 'crew' && (
                        <div className="space-y-1">
                          <div className="font-black text-sm text-cyan-300 tracking-wide">{item.nama || '-'}</div>
                          {item.content && <div className="text-xs opacity-90"><b>Jabatan / Peran:</b> {item.content}</div>}
                          {item.hp && (
                            <a
                              href={`https://wa.me/${item.hp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                            >
                              <span>💬 WhatsApp:</span>
                              <span>{item.hp}</span>
                            </a>
                          )}
                        </div>
                      )}

                      {item.type === 'post' && (
                        <div className="whitespace-pre-wrap leading-relaxed text-xs">
                          {item.content}
                        </div>
                      )}

                      {item.url_gambar && (
                        <img
                          src={item.url_gambar}
                          alt="attachment"
                          className="w-full max-h-48 object-cover rounded-xl border border-black/10 mt-2"
                        />
                      )}
                    </div>
                  </div>

                  {item.link_url && (
                    <a
                      href={item.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3.5 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white/90 hover:bg-white text-slate-900 rounded-xl font-bold text-[11px] shadow-2xs transition"
                    >
                      <span>🔗</span>
                      <span>Buka Tautan</span>
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* BOARD MADING CONTAINER (PINBOARD KANVAS) */
        <div
          className="w-full h-[620px] bg-slate-900 rounded-xl border-4 border-slate-700 relative overflow-auto p-4 shadow-2xl"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.98) 100%)',
          }}
        >
        <div className="w-[1800px] h-[1200px] relative">
          {madingList.map((item, idx) => {
            const isMin = item.type === 'crew' && item.is_minimized;
            const xPos = item.x || 20 + (idx % 4) * 280;
            const yPos = item.y || 20 + Math.floor(idx / 4) * 240;

            let themeClasses = 'bg-linear-to-br from-amber-100 to-amber-200 text-amber-900 border-amber-300';
            if (item.style_class === 'pin-blue') themeClasses = 'bg-linear-to-br from-sky-100 to-sky-200 text-sky-900 border-sky-300';
            if (item.style_class === 'pin-green') themeClasses = 'bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-900 border-emerald-300';
            if (item.style_class === 'pin-purple') themeClasses = 'bg-linear-to-br from-purple-100 to-purple-200 text-purple-900 border-purple-300';
            if (item.style_class === 'pin-crew') themeClasses = 'bg-linear-to-br from-slate-900 to-slate-800 text-white border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)]';
            if (item.style_class === 'pin-sponsor') themeClasses = 'bg-linear-to-br from-indigo-950 to-slate-950 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]';

            return (
              <div
                key={item.mading_id}
                style={{
                  position: 'absolute',
                  left: `${xPos}px`,
                  top: `${yPos}px`,
                  width: `${item.w || (item.type === 'crew' ? 230 : 260)}px`,
                  minHeight: isMin ? 'auto' : '150px',
                  zIndex: item.z_index || 10,
                }}
                className={`p-3.5 rounded-xl border-2 shadow-xl flex flex-col transition-all ${themeClasses}`}
              >
                <div className="flex items-center justify-between border-b border-black/10 pb-1.5 mb-2 select-none">
                  <span className="font-extrabold text-xs truncate max-w-[80%] flex items-center gap-1">
                    📌 {isMin && item.nama ? `${item.title} - ${item.nama}` : item.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.type === 'crew' && (
                      <button
                        onClick={() => toggleMinimize(item.mading_id)}
                        className="cursor-pointer text-xs"
                        title={isMin ? 'Perbesar' : 'Kecilkan'}
                      >
                        {isMin ? '🔽' : '🔼'}
                      </button>
                    )}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => openAddModal(item.type, item)}
                        className="cursor-pointer text-[10px] opacity-70 hover:opacity-100"
                        title="Edit Kartu"
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>

                {!isMin && (
                  <div className="flex-1 flex flex-col justify-between text-xs space-y-2">
                    {item.type === 'crew' && (
                      <div>
                        <div className="font-extrabold text-sm">{item.nama || '-'}</div>
                        {item.content && <div className="text-[11px] opacity-80 mt-0.5"><b>Info:</b> {item.content}</div>}
                        {item.hp && <div className="text-[11px] opacity-80"><b>HP:</b> {item.hp}</div>}
                      </div>
                    )}

                    {item.type === 'post' && (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </div>
                    )}

                    {item.url_gambar && (
                      <img
                        src={item.url_gambar}
                        alt="attachment"
                        className="w-full max-h-40 object-contain rounded-md border border-black/10 mt-1"
                      />
                    )}

                    {item.link_url && (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block self-start mt-2 px-3 py-1 bg-white/80 hover:bg-white text-slate-900 rounded-full font-bold text-[10px] shadow-xs"
                      >
                        🔗 Buka Tautan
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* MODAL FORM MADING */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              {selectedId ? '✏️ Edit Kartu Mading' : '➕ Tambah Kartu Mading'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">TEMA KARTU</label>
                <select
                  value={styleClass}
                  onChange={e => setStyleClass(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-md font-semibold"
                >
                  <option value="pin-yellow">📌 Catatan Kuning</option>
                  <option value="pin-blue">📌 Catatan Biru</option>
                  <option value="pin-green">📌 Catatan Hijau</option>
                  <option value="pin-purple">📌 Catatan Ungu</option>
                  <option value="pin-crew">👤 Badge Crew (Dark)</option>
                  <option value="pin-sponsor">💎 Banner Sponsor (Gold)</option>
                </select>
              </div>

              {modalMode === 'post' ? (
                <>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">JUDUL PENGUMUMAN</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Judul / Tema"
                      className="w-full p-2 border border-slate-300 rounded-md font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">PESAN / DESKRIPSI</label>
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Tuliskan isi informasi di sini..."
                      className="w-full h-24 p-2 border border-slate-300 rounded-md font-normal resize-none"
                      required
                    ></textarea>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">JABATAN (ROLE)</label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Contoh: Admin 1"
                        className="w-full p-2 border border-slate-300 rounded-md font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">NAMA LENGKAP</label>
                      <input
                        type="text"
                        value={nama}
                        onChange={e => setNama(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full p-2 border border-slate-300 rounded-md font-semibold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">INFORMASI TUGAS</label>
                    <input
                      type="text"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Contoh: Penanggung Jawab Match & Kas"
                      className="w-full p-2 border border-slate-300 rounded-md font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">HP (KONTAK WA)</label>
                    <input
                      type="text"
                      value={hp}
                      onChange={e => setHp(e.target.value)}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full p-2 border border-slate-300 rounded-md font-semibold"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-600 block mb-1">LINK TAUTAN (OPSIONAL)</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border border-slate-300 rounded-md font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">FOTO / GAMBAR (OPSIONAL)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-1 border border-slate-300 rounded-md text-xs"
                />
                {imgUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={imgUrl} alt="preview" className="h-14 rounded-md border" />
                    <button
                      type="button"
                      onClick={() => setImgUrl('')}
                      className="text-red-500 font-bold text-xs"
                    >
                      Hapus Foto
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                {selectedId ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Hapus kartu ini?')) {
                        onDeleteMading(selectedId);
                        setIsModalOpen(false);
                      }
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-md font-bold cursor-pointer"
                  >
                    Hapus
                  </button>
                ) : <div></div>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
