import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMasterData } from "../context/MasterDataContext";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function CaraKerjaPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { appSettings } = useMasterData();

	const appName = appSettings?.app_name || "Lapor Pak!";
	const villageName = appSettings?.village_name || "Desa Sukamaju";

	const mainSteps = [
		{
			number: "01",
			title: "1. Bikin Laporan",
			description:
				"Ambil foto kendala di lapangan, tuliskan rincian lokasi spesifik serta penjelasan masalah, lalu kirimkan laporan secara instan melalui sistem.",
			details: [
				"Sertakan patokan lokasi yang jelas (contoh: Depan RT 02 / Pos Ronda).",
				"Unggah foto bukti kondisi riil di lapangan.",
				"Identitas pelapor terjamin kerahasiaannya oleh sistem.",
			],
		},
		{
			number: "02",
			title: "2. Admin & Petugas Urus",
			description:
				"Admin meninjau laporan, memverifikasi keabsahan data, dan langsung menugaskan tim lapangan untuk penanganan langsung di lokasi.",
			details: [
				"Verifikasi cepat maksimal dalam 1x24 jam kerja.",
				"Pemeriksaan keabsahan lokasi & foto kendala.",
				"Penugasan langsung ke tim teknis di lapangan.",
			],
		},
		{
			number: "03",
			title: "3. Masalah Ditangani & Selesai",
			description:
				"Permasalahan tuntas dikerjakan. Bukti foto perbaikan diunggah ke sistem dan Anda menerima konfirmasi penyelesaian secara transparan.",
			details: [
				"Foto kondisi hasil perbaikan diunggah terbuka.",
				"Notifikasi konfirmasi penyelesaian resmi.",
				"Arsip laporan tersimpan rapi dalam sistem digital desa.",
			],
		},
	];

	return (
		<div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
			{/* Header Banner */}
			<section className="bg-slate-900 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
				<div className="max-w-7xl mx-auto space-y-4 text-left">
					<Link
						to="/"
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
					</Link>

					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
						<div className="space-y-3">
							<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
								Cara Kerja & Alur Pengaduan
							</h1>
							<p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed">
								Pelajari bagaimana pengaduan Anda diproses secara transparan dari pengajuan awal, verifikasi admin, penanganan di lapangan, hingga laporan tuntas.
							</p>
						</div>

						<div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 text-xs space-y-1.5 min-w-[240px] text-left">
							<p className="text-slate-300 font-medium">Komitmen Pelayanan</p>
							<p className="text-xl font-extrabold text-white">Transparan & Terpantau</p>
							<p className="text-[11px] text-sky-300 leading-relaxed">
								Setiap progres perbaikan dilengkapi bukti foto nyata dari tim lapangan {villageName}.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content Area */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 space-y-16">
				{/* 3 Steps Section - Clean & Editorial Layout */}
				<section className="space-y-8">
					<div className="text-left space-y-2">
						<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
							3 Langkah Mudah Menyampaikan Laporan
						</h2>
						<p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
							Alur kerja dirancang sederhana agar setiap warga dapat melapor dengan cepat dan memantau perkembangannya secara terbuka.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
						{mainSteps.map((step) => (
							<article
								key={step.number}
								className="border-t-2 border-slate-200 pt-6 space-y-3"
							>
								<span className="text-4xl sm:text-5xl font-extrabold font-mono text-sky-600 tracking-tight block">
									{step.number}
								</span>
								<h3 className="text-xl font-bold text-slate-950">
									{step.title}
								</h3>
								<p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
									{step.description}
								</p>
								<ul className="pt-2 space-y-1.5 text-xs text-slate-500">
									{step.details.map((detail, i) => (
										<li key={i} className="flex items-start gap-2">
											<span className="text-sky-600 font-bold">•</span>
											<span>{detail}</span>
										</li>
									))}
								</ul>
							</article>
						))}
					</div>
				</section>

				{/* Guidelines & Criteria - Simple Natural Cards */}
				<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
					<div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
						<h3 className="text-lg font-bold text-emerald-700">
							Laporan Yang Diproses
						</h3>
						<ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
							<li className="flex items-start gap-2.5">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
								<span>Kerusakan fasilitas publik (jalan berlubang, jembatan rusak, penerangan jalan mati).</span>
							</li>
							<li className="flex items-start gap-2.5">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
								<span>Masalah kebersihan & lingkungan (tumpukan sampah liar, saluran drainase tersumbat).</span>
							</li>
							<li className="flex items-start gap-2.5">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
								<span>Gangguan pelayanan administrasi atau ketertiban umum di wilayah desa.</span>
							</li>
						</ul>
					</div>

					<div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
						<h3 className="text-lg font-bold text-rose-700">
							Laporan Yang Ditolak
						</h3>
						<ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
							<li className="flex items-start gap-2.5">
								<span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-2" />
								<span>Laporan fiktif, ujaran kebencian, mengandung SARA, atau tanpa foto bukti jelas.</span>
							</li>
							<li className="flex items-start gap-2.5">
								<span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-2" />
								<span>Masalah sengketa lahan atau konflik pribadi antar warga yang bukan domain publik.</span>
							</li>
							<li className="flex items-start gap-2.5">
								<span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-2" />
								<span>Lokasi kejadian di luar batas administratif wilayah {villageName}.</span>
							</li>
						</ul>
					</div>
				</section>

				{/* Call to Action Box */}
				<section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden shadow-xl border border-slate-800">
					<div className="max-w-2xl mx-auto space-y-3 relative z-10">
						<h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
							Punya Kendala Lingkungan Di Sekitar Anda?
						</h2>
						<p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
							Mari bersama menjaga kenyamanan desa dengan melaporkan setiap kendala secara cepat dan terpantau.
						</p>
						<div className="pt-4 flex flex-wrap items-center justify-center gap-4">
							<button
								onClick={() =>
									navigate(user ? "/reports/create" : "/register")
								}
								className="px-8 py-3.5 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
							>
								<span>Buat Laporan Sekarang</span>
								<ArrowRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
