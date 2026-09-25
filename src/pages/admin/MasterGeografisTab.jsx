import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useToast } from '../../context/ToastContext';
import { useMasterData } from '../../context/MasterDataContext';
import { 
  MapPin, 
  Edit3, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  CheckCircle2, 
  ExternalLink,
  Compass,
  BarChart3
} from 'lucide-react';

export default function MasterGeografisTab() {
  const { showToast } = useToast();
  const { refreshMasterData } = useMasterData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    google_maps_url: '',
    border_north: '',
    border_south: '',
    border_east: '',
    border_west: '',
    area_size: '',
    average_altitude: '',
    total_dusun: '',
    topography: '',
  });

  const fetchGeographics = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get('/master/geographics');
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          google_maps_url: data.google_maps_url || '',
          border_north: data.border_north || '',
          border_south: data.border_south || '',
          border_east: data.border_east || '',
          border_west: data.border_west || '',
          area_size: data.area_size || '',
          average_altitude: data.average_altitude || '',
          total_dusun: data.total_dusun || '',
          topography: data.topography || '',
        });
      }
    } catch (err) {
      console.error('Gagal memuat data Geografis:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeographics(true);
  }, []);

  const formatEmbedUrl = (url) => {
    if (!url) return 'https://maps.google.com/maps?q=Kantor+Desa+Nglaban&z=15&output=embed';
    const iframeMatch = url.match(/src=["']([^"']+)["']/);
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1];
    }
    if (url.includes('output=embed') || url.includes('/maps/embed')) {
      return url;
    }
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
      return 'https://maps.google.com/maps?q=Kantor+Desa+Nglaban&z=15&output=embed';
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const executeSave = async () => {
    setIsConfirmOpen(false);
    setSaving(true);

    try {
      const payload = {
        google_maps_url: formData.google_maps_url,
        border_north: formData.border_north,
        border_south: formData.border_south,
        border_east: formData.border_east,
        border_west: formData.border_west,
        area_size: formData.area_size,
        average_altitude: formData.average_altitude,
        total_dusun: Number(formData.total_dusun) || 0,
        topography: formData.topography,
      };

      const res = await api.put('/master/geographics', payload);
      const updated = res.data?.data || res.data;
      if (updated) {
        setFormData({
          google_maps_url: updated.google_maps_url || formData.google_maps_url,
          border_north: updated.border_north || formData.border_north,
          border_south: updated.border_south || formData.border_south,
          border_east: updated.border_east || formData.border_east,
          border_west: updated.border_west || formData.border_west,
          area_size: updated.area_size || formData.area_size,
          average_altitude: updated.average_altitude || formData.average_altitude,
          total_dusun: updated.total_dusun !== undefined ? updated.total_dusun : formData.total_dusun,
          topography: updated.topography || formData.topography,
        });
      }

      setEditing(false);
      showToast('Data Letak Geografis berhasil disimpan!', 'success');
      refreshMasterData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data Letak Geografis.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const mapEmbedSrc = formatEmbedUrl(formData.google_maps_url);

  return (
    <div className="space-y-6 relative">
      {saving && <LoadingOverlay message="Menyimpan Master Data Geografis..." backdrop="overlay" />}

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-600" />
            Master Data Letak Geografis & Statistik Wilayah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola link Google Maps, batas-batas wilayah, dan statistik administrasi desa</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGeographics}
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
              Edit Letak Geografis
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Memuat data Geografis...</p>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Live Google Maps Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  Pratinjau Google Maps
                </h3>
                <p className="text-[11px] text-slate-500">Tampilan peta interaktif desa pada halaman publik</p>
              </div>

              {formData.google_maps_url && (
                <a
                  href={formData.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 text-xs font-bold"
                >
                  <span>Buka di Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link Embed / URL Google Maps <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!editing}
                value={formData.google_maps_url}
                onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                placeholder="https://maps.google.com/maps?q=... atau tag <iframe src='...'>"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 disabled:opacity-80"
              />
            </div>

            {/* Interactive Map Iframe */}
            <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
              <iframe
                title="Peta Lokasi Desa"
                src={mapEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batas Wilayah Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600" />
                Batas-Batas Wilayah
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Utara</label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={formData.border_north}
                    onChange={(e) => setFormData({ ...formData, border_north: e.target.value })}
                    placeholder="Contoh: Desa Sukalama"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Selatan</label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={formData.border_south}
                    onChange={(e) => setFormData({ ...formData, border_south: e.target.value })}
                    placeholder="Contoh: Kecamatan Selatan"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Timur</label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={formData.border_east}
                    onChange={(e) => setFormData({ ...formData, border_east: e.target.value })}
                    placeholder="Contoh: Sungai Citarum"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Barat</label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={formData.border_west}
                    onChange={(e) => setFormData({ ...formData, border_west: e.target.value })}
                    placeholder="Contoh: Perbukitan Barat"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden disabled:opacity-80"
                  />
                </div>
              </div>
            </div>

            {/* Statistik Administrasi Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                Statistik Administrasi Desa
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Luas Wilayah Total</label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={formData.area_size}
                    onChange={(e) => setFormData({ ...formData, area_size: e.target.value })}
                    placeholder="Contoh: 14.5 km² atau 450 Ha"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ketinggian Rata-Rata</label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={formData.average_altitude}
                    onChange={(e) => setFormData({ ...formData, average_altitude: e.target.value })}
                    placeholder="Contoh: 650 mdpl"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Dusun</label>
                  <input
                    type="number"
                    disabled={!editing}
                    value={formData.total_dusun}
                    onChange={(e) => setFormData({ ...formData, total_dusun: e.target.value })}
                    placeholder="Contoh: 6"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Topografi Wilayah</label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={formData.topography}
                    onChange={(e) => setFormData({ ...formData, topography: e.target.value })}
                    placeholder="Contoh: Perbukitan & Dataran Tinggi"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden disabled:opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>

          {editing && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-end gap-2">
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
                Simpan Letak Geografis
              </button>
            </div>
          )}
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
                Apakah Anda yakin ingin menyimpan perubahan data Letak Geografis ini?
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
