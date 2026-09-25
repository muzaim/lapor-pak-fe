import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useToast } from '../../context/ToastContext';
import { useMasterData } from '../../context/MasterDataContext';
import { 
  Settings, 
  Edit3, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon,
  Shield,
  X 
} from 'lucide-react';

export default function MasterAppSettingsTab() {
  const { showToast } = useToast();
  const { refreshMasterData } = useMasterData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    app_name: '',
    village_name: '',
    logo_url: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchAppSettings = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get('/master/app-settings');
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          app_name: data.app_name || '',
          village_name: data.village_name || '',
          logo_url: data.logo_url || '',
        });
      }
    } catch (err) {
      console.error('Gagal memuat Setting Aplikasi:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppSettings(true);
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
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
      payload.append('app_name', formData.app_name);
      payload.append('village_name', formData.village_name);

      if (logoFile) {
        payload.append('logo', logoFile);
      }

      const res = await api.put('/master/app-settings', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data?.data || res.data;
      if (updated) {
        setFormData({
          app_name: updated.app_name || formData.app_name,
          village_name: updated.village_name || formData.village_name,
          logo_url: updated.logo_url || formData.logo_url,
        });
      }

      setEditing(false);
      clearLogoSelection();
      showToast('Setting Aplikasi berhasil disimpan!', 'success');
      refreshMasterData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan Setting Aplikasi.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const displayLogo = logoPreview || formData.logo_url;

  return (
    <div className="space-y-6 relative">
      {saving && <LoadingOverlay message="Menyimpan Setting Aplikasi & Logo..." backdrop="overlay" />}

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-600" />
            Master Setting Aplikasi (Master App)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola identitas aplikasi, logo utama, dan nama desa terdaftar</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAppSettings}
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
              Edit Setting App
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Memuat Setting Aplikasi...</p>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Logo Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col items-center text-center">
            <h3 className="font-bold text-slate-900 text-sm w-full text-left border-b border-slate-100 pb-3">
              Logo Resmi Aplikasi
            </h3>

            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-50 flex items-center justify-center p-3 group">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={formData.app_name || 'Logo App'}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Shield className="w-12 h-12 text-sky-600" />
              )}

              {editing && (
                <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer">
                  <Upload className="w-5 h-5 mb-1" />
                  Ganti Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {editing && (
              <div className="w-full space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer w-full justify-center">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  {logoFile ? logoFile.name : 'Pilih File Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={clearLogoSelection}
                    className="text-xs text-rose-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" /> Batal Ganti Logo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form Settings Details */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Identitas Aplikasi & Desa
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Aplikasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={formData.app_name}
                  onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                  placeholder="Contoh: Lapor Pak!"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Desa / Kelurahan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={formData.village_name}
                  onChange={(e) => setFormData({ ...formData, village_name: e.target.value })}
                  placeholder="Contoh: Desa Sukamaju"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>
            </div>

            {editing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    clearLogoSelection();
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
                  Simpan Setting App
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
                Apakah Anda yakin ingin menyimpan perubahan Setting Aplikasi ini?
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
