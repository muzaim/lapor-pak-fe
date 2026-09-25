import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMasterData } from "../context/MasterDataContext";
import LoadingOverlay from "../components/LoadingOverlay";
import { Shield, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
	const { login } = useAuth();
	const { appSettings } = useMasterData();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email || !password) {
			setErrorMessage("Harap isi email dan password.");
			return;
		}

		setLoading(true);
		setErrorMessage("");

		const res = await login(email, password);

		if (res.success) {
			setLoading(false);
			if (res.user?.role === "ADMIN") {
				navigate("/dashboard");
			} else {
				navigate("/reports");
			}
		} else {
			setLoading(false);
			setErrorMessage(res.message);
		}
	};

	return (
		<div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
			{loading && (
				<LoadingOverlay
					message="Berhasil Login! Memuat Sesi Pengguna..."
					backdrop="blank"
				/>
			)}

			<div className="w-full max-w-md bg-white rounded-2xl border border-sky-100 shadow-xl shadow-sky-900/5 p-8 relative">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden shrink-0">
						{appSettings?.logo_url ? (
							<img
								src={appSettings.logo_url}
								alt={appSettings.app_name || "Logo"}
								className="w-full h-full object-contain p-1"
							/>
						) : (
							<Shield className="w-6 h-6" />
						)}
					</div>
					<h2 className="text-2xl font-bold text-slate-900">
						{appSettings?.app_name || "Lapor Pak!"}
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Masuk ke layanan pengaduan masyarakat{" "}
						{appSettings?.village_name || "Desa Sukamaju"}
					</p>
				</div>

				{errorMessage && (
					<div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
						<AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
						<span>{errorMessage}</span>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
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
								placeholder="••••••••"
								className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
					>
						<span>Masuk Sekarang</span>
						<ArrowRight className="w-4 h-4" />
					</button>
				</form>

				<div className="mt-8 pt-6 border-t border-slate-100 text-center">
					<p className="text-xs text-slate-500">
						Belum memiliki akun?{" "}
						<Link
							to="/register"
							className="text-sky-600 font-bold hover:underline cursor-pointer"
						>
							Daftar disini
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
