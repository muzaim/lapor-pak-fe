import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useToast } from '../../context/ToastContext';
import { useMasterData } from '../../context/MasterDataContext';
import { 
  Building2, 
  Edit3, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';

export default function MasterOfficeInfoTab() {
  const { showToast } = useToast();
  const { refreshMasterData } = useMasterData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    office_address: '',
    operational_hours: '',
    operational_description: '',
    phone: '',
    email: '',
  });

  const fetchOfficeInfo = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get('/master/office-info');
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          office_address: data.office_address || '',
          operational_hours: data.operational_hours || '',
          operational_description: data.operational_description || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      }
    } catch (err) {
      console.error('Gagal memuat data Informasi Kantor:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeInfo(true);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const executeSave = async () => {
    setIsConfirmOpen(false);
    setSaving(true);

    try {
      const res = await api.put('/master/office-info', formData);
      const updated = res.data?.data || res.data;
      if (updated) {
        setFormData({
          office_address: updated.office_address || formData.office_address,
          operational_hours: updated.operational_hours || formData.operational_hours,
          operational_description: updated.operational_description || formData.operational_description,
          phone: updated.phone || formData.phone,
          email: updated.email || formData.email,
        });
      }

      setEditing(false);
      showToast('Data Informasi Kantor berhasil disimpan!', 'success');
      refreshMasterData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data Informasi Kantor.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {saving && <LoadingOverlay message="Menyimpan Master Informasi Kantor Desa..." backdrop="overlay" />}

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            Master Data Informasi Kantor & Kontak Desa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola alamat resmi kantor desa, jam operasional layanan, serta kontak telepon dan email</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOfficeInfo}
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
              Edit Informasi Kantor
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Memuat Informasi Kantor Desa...</p>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              Alamat Resmi & Kontak Kantor Desa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Office Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Kantor Desa <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  disabled={!editing}
                  value={formData.office_address}
                  onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                  placeholder="Contoh: Jl. Raya Desa Sukamaju No. 01, Kec. Sukamaju, Kab. Bogor 16910"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  Alamat Email Resmi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={!editing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Contoh: kontak@desasukamaju.go.id"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              Jam Operasional Layanan Publik
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Operational Hours */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jam Operasional <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={formData.operational_hours}
                  onChange={(e) => setFormData({ ...formData, operational_hours: e.target.value })}
                  placeholder="Contoh: Senin - Jumat: 08.00 - 15.00 WIB"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>

              {/* Operational Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Operasional
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.operational_description}
                  onChange={(e) => setFormData({ ...formData, operational_description: e.target.value })}
                  placeholder="Contoh: Sabtu, Minggu dan Hari Libur Nasional Tutup."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
                />
              </div>
            </div>

            {editing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
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
                  Simpan Informasi Kantor
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
                Apakah Anda yakin ingin menyimpan perubahan Informasi Kantor & Kontak Desa ini?
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
