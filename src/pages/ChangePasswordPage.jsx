import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import LoadingOverlay from "../components/LoadingOverlay";
import { Eye, EyeOff, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ChangePasswordPage() {
	const { user } = useAuth();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const [submitting, setSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	// Password validation rules
	const hasMinLength = newPassword.length >= 8;
	const hasUppercase = /[A-Z]/.test(newPassword);
	const hasLowercase = /[a-z]/.test(newPassword);
	const hasNumber = /[0-9]/.test(newPassword);
	const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
		newPassword
	);

	// Count fulfilled criteria
	const criteriaMetCount = [
		hasMinLength,
		hasUppercase,
		hasLowercase,
		hasNumber,
		hasSpecial,
	].filter(Boolean).length;

	// Calculate strength level (returns null when empty to avoid "Belum Diisi")
	const getStrengthLevel = () => {
		if (newPassword.length === 0) return null;
		if (criteriaMetCount <= 2)
			return {
				label: "Lemah",
				color: "bg-rose-100 text-rose-700 border-rose-200",
				percent: "33%",
				barColor: "bg-rose-500",
			};
		if (criteriaMetCount <= 4)
			return {
				label: "Sedang",
				color: "bg-amber-100 text-amber-700 border-amber-200",
				percent: "66%",
				barColor: "bg-amber-500",
			};
		return {
			label: "Sangat Kuat",
			color: "bg-emerald-100 text-emerald-700 border-emerald-200",
			percent: "100%",
			barColor: "bg-emerald-500",
		};
	};

	const strength = getStrengthLevel();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");

		if (!currentPassword) {
			setErrorMessage("Password saat ini / lama wajib diisi.");
			return;
		}

		if (criteriaMetCount < 5) {
			setErrorMessage(
				"Password baru belum memenuhi seluruh kriteria keamanan di petunjuk kanan."
			);
			return;
		}

		if (newPassword !== confirmPassword) {
			setErrorMessage("Konfirmasi password baru tidak cocok.");
			return;
		}

		setSubmitting(true);

		try {
			let updated = false;

			const payload = {
				oldPassword: currentPassword,
				currentPassword: currentPassword,
				newPassword: newPassword,
				password: newPassword,
			};

			try {
				await api.put("/auth/change-password", payload);
				updated = true;
			} catch (err1) {
				try {
					await api.post("/auth/change-password", payload);
					updated = true;
				} catch (err2) {
					if (user?.id) {
						await api.put(`/admin/users/${user.id}`, {
							password: newPassword,
							currentPassword: currentPassword,
							oldPassword: currentPassword,
						});
						updated = true;
					} else {
						throw err2;
					}
				}
			}

			if (updated) {
				setSuccessMessage("Password Anda berhasil diperbarui!");
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
			}
		} catch (err) {
			const msg =
				err.response?.data?.message ||
				err.message ||
				"Gagal memperbarui password. Pastikan password lama Anda benar.";
			setErrorMessage(msg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="space-y-6 text-left max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
			{submitting && (
				<LoadingOverlay
					message="Memperbarui Password Akun Anda..."
					backdrop="overlay"
				/>
			)}

			{/* Top Header Card */}
			<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
				<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
					Ubah Password Akun
				</h1>
				<p className="text-xs sm:text-sm text-slate-500 mt-1">
					Perbarui password Anda secara berkala untuk menjaga keamanan
					akun dan data pengguna.
				</p>
			</div>

			{/* Main 2-Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				{/* LEFT COLUMN: FORM UBAH PASSWORD */}
				<div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-6">
					<div className="border-b border-slate-100 pb-4">
						<h2 className="text-base font-bold text-slate-900">
							Form Perubahan Password
						</h2>
						<p className="text-xs text-slate-500 mt-1">
							Masukkan password lama Anda lalu tentukan password
							baru yang memenuhi syarat keamanan.
						</p>
					</div>

					{errorMessage && (
						<div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-3">
							<AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
							<span className="leading-relaxed">
								{errorMessage}
							</span>
						</div>
					)}

					{successMessage && (
						<div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-3">
							<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
							<span className="leading-relaxed">
								{successMessage}
							</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Password Saat Ini */}
						<div className="space-y-1.5">
							<label className="block text-xs font-bold text-slate-700">
								Password Saat Ini{" "}
								<span className="text-rose-500">*</span>
							</label>
							<div className="relative">
								<input
									type={showCurrent ? "text" : "password"}
									required
									value={currentPassword}
									onChange={(e) =>
										setCurrentPassword(e.target.value)
									}
									placeholder="Masukkan password saat ini..."
									className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowCurrent(!showCurrent)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
								>
									{showCurrent ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						{/* Password Baru */}
						<div className="space-y-1.5">
							<label className="block text-xs font-bold text-slate-700">
								Password Baru{" "}
								<span className="text-rose-500">*</span>
							</label>
							<div className="relative">
								<input
									type={showNew ? "text" : "password"}
									required
									value={newPassword}
									onChange={(e) =>
										setNewPassword(e.target.value)
									}
									placeholder="Masukkan password baru..."
									className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowNew(!showNew)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
								>
									{showNew ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						{/* Konfirmasi Password Baru */}
						<div className="space-y-1.5">
							<label className="block text-xs font-bold text-slate-700">
								Konfirmasi Password Baru{" "}
								<span className="text-rose-500">*</span>
							</label>
							<div className="relative">
								<input
									type={showConfirm ? "text" : "password"}
									required
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									placeholder="Ketik ulang password baru..."
									className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowConfirm(!showConfirm)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
								>
									{showConfirm ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
							{confirmPassword &&
								newPassword !== confirmPassword && (
									<p className="text-[11px] font-semibold text-rose-600 mt-1">
										Konfirmasi password tidak cocok dengan
										password baru.
									</p>
								)}
						</div>

						{/* Submit Button */}
						<div className="pt-2">
							<button
								type="submit"
								disabled={submitting}
								className="w-full py-3 px-5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
							>
								<Save className="w-4 h-4" />
								<span>Simpan Password Baru</span>
							</button>
						</div>
					</form>
				</div>

				{/* RIGHT COLUMN: PETUNJUK & KRITERIA KEAMANAN PASSWORD */}
				<div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-5">
					<div className="border-b border-slate-100 pb-3">
						<h3 className="text-base font-bold text-slate-900">
							Petunjuk Keamanan Password
						</h3>
						<p className="text-xs text-slate-500 mt-1">
							Password baru Anda harus memenuhi seluruh kriteria
							berikut:
						</p>
					</div>

					{/* Password Strength Meter (only shown when typing) */}
					{strength && (
						<div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
							<div className="flex items-center justify-between text-xs">
								<span className="font-semibold text-slate-600">
									Kekuatan Password:
								</span>
								<span
									className={`px-2 py-0.5 text-[10px] font-bold rounded border ${strength.color}`}
								>
									{strength.label}
								</span>
							</div>
							<div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
								<div
									className={`h-full transition-all duration-300 ${strength.barColor}`}
									style={{ width: strength.percent }}
								/>
							</div>
						</div>
					)}

					{/* Clean Minimal Checklist Guidelines */}
					<ul className="space-y-3 text-xs">
						<li className="flex items-center gap-2.5">
							<span
								className={`w-2 h-2 rounded-full shrink-0 ${
									hasMinLength
										? "bg-emerald-600"
										: "bg-slate-300"
								}`}
							/>
							<span
								className={
									hasMinLength
										? "font-semibold text-slate-900"
										: "text-slate-500"
								}
							>
								Minimal <strong>8 Karakter</strong>
							</span>
						</li>

						<li className="flex items-center gap-2.5">
							<span
								className={`w-2 h-2 rounded-full shrink-0 ${
									hasUppercase
										? "bg-emerald-600"
										: "bg-slate-300"
								}`}
							/>
							<span
								className={
									hasUppercase
										? "font-semibold text-slate-900"
										: "text-slate-500"
								}
							>
								Memiliki minimal 1{" "}
								<strong>Huruf Besar (A-Z)</strong>
							</span>
						</li>

						<li className="flex items-center gap-2.5">
							<span
								className={`w-2 h-2 rounded-full shrink-0 ${
									hasLowercase
										? "bg-emerald-600"
										: "bg-slate-300"
								}`}
							/>
							<span
								className={
									hasLowercase
										? "font-semibold text-slate-900"
										: "text-slate-500"
								}
							>
								Memiliki minimal 1{" "}
								<strong>Huruf Kecil (a-z)</strong>
							</span>
						</li>

						<li className="flex items-center gap-2.5">
							<span
								className={`w-2 h-2 rounded-full shrink-0 ${
									hasNumber
										? "bg-emerald-600"
										: "bg-slate-300"
								}`}
							/>
							<span
								className={
									hasNumber
										? "font-semibold text-slate-900"
										: "text-slate-500"
								}
							>
								Memiliki minimal 1 <strong>Angka (0-9)</strong>
							</span>
						</li>

						<li className="flex items-center gap-2.5">
							<span
								className={`w-2 h-2 rounded-full shrink-0 ${
									hasSpecial
										? "bg-emerald-600"
										: "bg-slate-300"
								}`}
							/>
							<span
								className={
									hasSpecial
										? "font-semibold text-slate-900"
										: "text-slate-500"
								}
							>
								Memiliki minimal 1{" "}
								<strong>Simbol Khusus (!@#$%^&*)</strong>
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
