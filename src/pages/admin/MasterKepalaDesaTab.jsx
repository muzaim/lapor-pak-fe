import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useToast } from '../../context/ToastContext';
import { useMasterData } from '../../context/MasterDataContext';
import { 
  UserCheck, 
  Edit3, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon,
  X 
} from 'lucide-react';

export default function MasterKepalaDesaTab() {
  const { showToast } = useToast();
  const { refreshMasterData } = useMasterData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    period: '',
    description: '',
    photo_url: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const fetchVillageHead = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get('/master/village-head');
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          name: data.name || '',
          period: data.period || '',
          description: data.description || '',
          photo_url: data.photo_url || '',
        });
      }
    } catch (err) {
      console.error('Gagal memuat data Kepala Desa:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchVillageHead(true);
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const clearPhotoSelection = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const executeSave = async () => {
    setIsConfirmOpen(false);
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('period', formData.period);
      payload.append('description', formData.description);

      if (photoFile) {
        payload.append('photo', photoFile);
      }

      const res = await api.put('/master/village-head', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data?.data || res.data;
      if (updated) {
        setFormData({
          name: updated.name || formData.name,
          period: updated.period || formData.period,
          description: updated.description || formData.description,
          photo_url: updated.photo_url || formData.photo_url,
        });
      }

      setEditing(false);
      clearPhotoSelection();
      showToast('Data Kepala Desa berhasil disimpan!', 'success');
      refreshMasterData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data Kepala Desa.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const displayPhoto = photoPreview || formData.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="space-y-6 relative">
      {saving && <LoadingOverlay message="Menyimpan Master Data Kepala Desa..." backdrop="overlay" />}

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-600" />
            Master Data Kepala Desa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola identitas, foto resmi, masa jabatan, dan kutipan deskripsi Kepala Desa</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchVillageHead}
            title="Refresh Data"
            aria-label="Refresh Data"
            className="p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Kepala Desa
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Memuat data Kepala Desa...</p>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Photo Preview Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col items-center text-center">
            <h3 className="font-bold text-slate-900 text-sm w-full text-left border-b border-slate-100 pb-3">
              Foto Resmi Kepala Desa
            </h3>

            <div className="relative aspect-[4/5] w-full max-w-[240px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 group">
              <img
                src={displayPhoto}
                alt={formData.name || 'Kepala Desa'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {editing && (
                <label className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer">
                  <Upload className="w-6 h-6 mb-1" />
                  Ganti Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {editing && (
              <div className="w-full space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer w-full justify-center">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  {photoFile ? photoFile.name : 'Pilih File Foto Baru'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                {photoPreview && (
                  <button
                    type="button"
                    onClick={clearPhotoSelection}
                    className="text-xs text-rose-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" /> Batal Ganti Foto
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form / Data Details */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Informasi Kepala Desa
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Kepala Desa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Bpk. H. Ahmad Sanusi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masa Jabatan / Periode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="Contoh: 2021 – 2027"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Sambutan Profil Kepala Desa
                </label>
                <textarea
                  rows={5}
                  disabled={!editing}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan kutipan profil, sambutan, atau komitmen kepemimpinan Kepala Desa..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>
            </div>

            {editing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    clearPhotoSelection();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Konfirmasi Perubahan</h3>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin menyimpan perubahan data Kepala Desa ini?
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSave}
                className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
