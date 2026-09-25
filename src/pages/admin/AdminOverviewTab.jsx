import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { 
  FileText, 
  Users, 
  Clock, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function AdminOverviewTab() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/reports');
        const data = res.data?.reports || res.data?.data || res.data || [];
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch admin overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const totalCount = reports.length;
  const pendingCount = reports.filter(r => {
    const st = String(r.status || '').toUpperCase();
    return st === 'MENUNGGU' || st === 'PENDING' || st === 'DIAJUKAN';
  }).length;

  const inReviewCount = reports.filter(r => {
    const st = String(r.status || '').toUpperCase();
    return st === 'DIPROSES' || st === 'IN_REVIEW';
  }).length;

  const resolvedCount = reports.filter(r => {
    const st = String(r.status || '').toUpperCase();
    return st === 'SELESAI' || st === 'RESOLVED';
  }).length;

  const rejectedCount = reports.filter(r => {
    const st = String(r.status || '').toUpperCase();
    return st === 'DITOLAK' || st === 'REJECTED';
  }).length;

  const recentReports = reports.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">Total Pengajuan</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <span className="text-[10px] text-sky-600 font-semibold mt-2 inline-block">Akumulasi Seluruh Laporan</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-amber-700">Menunggu</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-amber-600 font-semibold mt-2 inline-block">Perlu Peninjauan</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-sky-700">Sedang Diproses</p>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-sky-900 mt-1">{inReviewCount}</p>
          <span className="text-[10px] text-sky-600 font-semibold mt-2 inline-block">Tindak Lanjut Lapangan</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-emerald-700">Selesai</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-2 inline-block">Telah Ditindaklanjuti</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-rose-700">Ditolak</p>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-900 mt-1">{rejectedCount}</p>
          <span className="text-[10px] text-rose-600 font-semibold mt-2 inline-block">Tidak Valid / Ditolak</span>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => navigate('/laporan')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-sky-400 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Data Laporan</h3>
          <p className="text-xs text-slate-500 mt-1">Kelola status dan berikan respon resmi untuk setiap pengaduan</p>
        </div>

        <div 
          onClick={() => navigate('/master-data/users')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-sky-400 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Master Data User</h3>
          <p className="text-xs text-slate-500 mt-1">Daftar pengguna terdaftar dan manajemen hak akses</p>
        </div>

        <div 
          onClick={() => navigate('/master-data/desa')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-sky-400 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Master Data Desa</h3>
          <p className="text-xs text-slate-500 mt-1">Struktur wilayah administratif dan profil desa</p>
        </div>
      </div>

    </div>
  );
}
