import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/dateUtils';
import { encodeId } from '../../utils/idUtils';
import { useToast } from '../../context/ToastContext';
import { 
  RefreshCw, 
  MapPin, 
  ChevronRight, 
  FileSpreadsheet,
  FileText
} from 'lucide-react';

export default function MasterReportsTab() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchAdminReports = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (startDate) {
        params.start_date = startDate;
        params.startDate = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
        params.endDate = endDate;
      }
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/admin/reports', { params });
      const raw = res.data;

      let reportList = [];
      let total = 0;
      let pages = 1;

      if (Array.isArray(raw)) {
        reportList = raw;
        total = raw.length;
        pages = Math.ceil(total / limit) || 1;
      } else if (raw?.reports && Array.isArray(raw.reports)) {
        reportList = raw.reports;
        total = raw.totalItems || raw.total || raw.count || reportList.length;
        pages = raw.totalPages || Math.ceil(total / limit) || 1;
      } else if (raw?.data && Array.isArray(raw.data)) {
        reportList = raw.data;
        const meta = raw.pagination || raw.meta || {};
        total = meta.totalItems || meta.total || reportList.length;
        pages = meta.totalPages || Math.ceil(total / limit) || 1;
      }

      setReports(reportList);
      setTotalItems(total);
      setTotalPages(pages);
    } catch (err) {
      console.error('Failed to fetch admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminReports();
  }, [statusFilter, categoryFilter, startDate, endDate, searchQuery, page, limit]);

  const handleResetFilter = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (startDate) {
        params.start_date = startDate;
        params.startDate = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
        params.endDate = endDate;
      }
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/admin/reports/export', {
        params,
        responseType: 'blob',
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Laporan_Pengaduan_${dateStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      showToast('Berhasil mengunduh data laporan format Excel!', 'success');
    } catch (err) {
      console.error('Gagal mengeksport Excel:', err);
      showToast('Gagal mengeksport data laporan ke Excel.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const isFiltered =
    statusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    searchQuery !== '' ||
    startDate !== '' ||
    endDate !== '';

  return (
    <div className="space-y-6">
      
      {/* Top Header Card & Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-slate-800 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Data Laporan Pengaduan</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kelola seluruh daftar pengaduan masyarakat, filter data, dan ekspor laporan ke format Excel</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exporting ? 'Mengunduh...' : 'Export Excel'}</span>
          </button>

          <button
            onClick={fetchAdminReports}
            title="Refresh Data"
            aria-label="Refresh Data"
            className="p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Card - Spacious & Organized Layout */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        
        {/* Search Row */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Pencarian Laporan</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Cari berdasarkan kata kunci judul, deskripsi, pelapor, atau lokasi..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
          />
        </div>

        {/* 4-Column Grid for Selects & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Status Combobox */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Status Laporan</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors"
            >
              <option value="ALL">Semua Status</option>
              <option value="DIAJUKAN">Diajukan</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DIPROSES">Diproses</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>

          {/* Kategori Combobox */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Kategori Laporan</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Infrastruktur">Infrastruktur</option>
              <option value="Pelayanan Publik">Pelayanan Publik</option>
              <option value="Lingkungan">Lingkungan</option>
              <option value="Keamanan">Keamanan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Dari Tanggal */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors"
            />
          </div>

          {/* Sampai Tanggal */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors"
            />
          </div>

        </div>

        {/* Reset Filter Button Row */}
        {isFiltered && (
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Memuat data laporan pengaduan...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-xs font-bold text-slate-700">Tidak ada laporan ditemukan</p>
          <p className="text-[11px] text-slate-500 mt-1 mb-3">Sesuaikan kata kunci, filter status, kategori, atau rentang tanggal.</p>
          {isFiltered && (
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                  <th className="py-3.5 px-4">Judul</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Lokasi Kejadian</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report, idx) => (
                  <tr 
                    key={report.id} 
                    onClick={() => navigate(`/laporan/${encodeId(report.id)}`)}
                    className="hover:bg-sky-50/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                      {(page - 1) * limit + idx + 1}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {formatDate(report.created_at)}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-sky-600 transition-colors">
                        {report.title}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold text-sky-800 bg-sky-50 rounded border border-sky-100">
                        {report.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600 max-w-xs truncate">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate text-xs">{report.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/laporan/${encodeId(report.id)}`); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={(newPage) => setPage(newPage)}
            onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          />
        </div>
      )}

    </div>
  );
}
