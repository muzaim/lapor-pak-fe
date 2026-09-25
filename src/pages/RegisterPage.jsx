import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMasterData } from '../context/MasterDataContext';
import LoadingOverlay from '../components/LoadingOverlay';
import { Shield, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { appSettings } = useMasterData();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage('Harap isi semua kolom pendaftaran.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Registrasi akun berhasil! Silakan masuk dengan akun baru Anda.');
      setTimeout(() => {
        navigate('/login');
      }, 400);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {loading && (
        <LoadingOverlay message="Mendaftarkan Akun Baru Anda..." backdrop="blank" />
      )}

      <div className="w-full max-w-md bg-white rounded-2xl border border-sky-100 shadow-xl shadow-sky-900/5 p-8 relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 overflow-hidden shrink-0">
            {appSettings?.logo_url ? (
              <img src={appSettings.logo_url} alt={appSettings.app_name || 'Logo'} className="w-full h-full object-contain p-1" />
            ) : (
              <Shield className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Daftar Akun {appSettings?.app_name || 'Lapor Pak!'}</h2>
          <p className="text-xs text-slate-500 mt-1">Daftarkan diri Anda untuk mulai menyampaikan pengaduan di {appSettings?.village_name || 'Desa Sukamaju'}</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmad Subagyo"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Sudah mendaftar sebelumnya?{' '}
            <Link
              to="/login"
              className="text-sky-600 font-bold hover:underline cursor-pointer"
            >
              Masuk disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
