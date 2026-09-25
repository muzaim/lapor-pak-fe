import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMasterData } from "../context/MasterDataContext";

export default function Footer() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { appSettings } = useMasterData();

	const appName = appSettings?.app_name || "Lapor Pak!";
	const villageName = appSettings?.village_name || "Desa Sukamaju";

	const platformLinks = [
		{ label: "Tentang Kami", href: "#about" },
		{ label: "Cara Kerja", href: "/cara-kerja" },
		{ label: "Dampak & Statistik", href: "#impact" },
		{ label: "Pertanyaan Umum", href: "#faq" },
	];

	const resourceLinks = [
		{
			label: "Buat Laporan Baru",
			href: user ? "/reports/create" : "/login",
		},
		{ label: "Riwayat Laporan", href: user ? "/reports" : "/login" },
		{ label: "Panduan Cara Kerja", href: "/cara-kerja" },
		{ label: "Kontak Pengaduan", href: "mailto:kontak@desasukamaju.go.id" },
		{ label: "Panduan Layanan", href: "#" },
	];

	return (
		<footer className="bg-slate-950 text-white border-t border-slate-900">
			{/* Big tagline block — zerobin-fe style */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
				<div className="border-b border-white/10 pb-14 sm:pb-20 text-left">
					<p className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-sky-400 mb-5">
						{appName} · Pengaduan Lingkungan & Pelayanan Desa
					</p>
					<h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white max-w-4xl">
						Satu laporan dari Anda.{" "}
						<span className="text-sky-400 italic">
							Solusi cepat untuk seluruh warga.
						</span>
					</h2>
					<p className="mt-6 max-w-xl text-slate-400 leading-relaxed text-base sm:text-lg">
						{appName} hadir secara gratis dan transparan untuk
						menyampaikan pengaduan fasilitas umum dan layanan desa.
						Mari bersama wujudkan lingkungan desa yang tanggap dan
						berdaya.
					</p>
					<div className="mt-8 flex flex-wrap gap-4">
						<button
							onClick={() =>
								navigate(user ? "/reports/create" : "/register")
							}
							className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition duration-200 hover:bg-slate-100 cursor-pointer"
						>
							Buat Laporan Sekarang
							<ArrowRight className="w-4 h-4" />
						</button>
						<a
							href="#how-it-works"
							className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-medium text-slate-300 transition duration-200 hover:text-white hover:border-white/40"
						>
							Lihat Cara Kerja
						</a>
					</div>
				</div>
			</div>

			{/* Main link columns */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-left">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr]">
					{/* Brand column */}
					<div>
						<Link
							to="/"
							className="inline-flex items-center gap-2.5 group"
						>
							<div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
								{appSettings?.logo_url ? (
									<img
										src={appSettings.logo_url}
										alt={appName}
										className="w-full h-full object-contain p-0.5"
									/>
								) : (
									<Shield className="w-5 h-5" />
								)}
							</div>
							<span className="font-serif text-2xl font-bold italic tracking-tight text-white">
								{appName}
							</span>
						</Link>
						<p className="mt-5 text-xs sm:text-sm leading-relaxed text-slate-400 max-w-[250px]">
							Sistem informasi pengaduan masyarakat desa secara
							resmi, transparan, dan terintegrasi.
						</p>
						{/* <div className="mt-7 flex gap-5 text-xs font-semibold text-slate-400">
							<a
								href="#"
								className="hover:text-white transition duration-200"
							>
								Instagram
							</a>
							<a
								href="#"
								className="hover:text-white transition duration-200"
							>
								Facebook
							</a>
							<a
								href="#"
								className="hover:text-white transition duration-200"
							>
								YouTube
							</a>
						</div> */}
					</div>

					{/* Platform links */}
					<div>
						<p className="font-mono text-[11px] font-bold tracking-widest uppercase text-sky-400 mb-5">
							Platform
						</p>
						<div className="grid gap-3.5">
							{platformLinks.map((link) =>
								link.href.startsWith("/") ? (
									<Link
										key={link.label}
										to={link.href}
										className="text-xs sm:text-sm text-slate-400 hover:text-white transition duration-200"
									>
										{link.label}
									</Link>
								) : (
									<a
										key={link.label}
										href={link.href}
										className="text-xs sm:text-sm text-slate-400 hover:text-white transition duration-200"
									>
										{link.label}
									</a>
								)
							)}
						</div>
					</div>

					{/* Resource links */}
					<div>
						<p className="font-mono text-[11px] font-bold tracking-widest uppercase text-sky-400 mb-5">
							Layanan
						</p>
						<div className="grid gap-3.5">
							{resourceLinks.map((link) =>
								link.href.startsWith("/") ? (
									<Link
										key={link.label}
										to={link.href}
										className="text-xs sm:text-sm text-slate-400 hover:text-white transition duration-200"
									>
										{link.label}
									</Link>
								) : (
									<a
										key={link.label}
										href={link.href}
										className="text-xs sm:text-sm text-slate-400 hover:text-white transition duration-200"
									>
										{link.label}
									</a>
								)
							)}
						</div>
					</div>

					{/* Newsletter */}
					<div>
						<p className="font-mono text-[11px] font-bold tracking-widest uppercase text-sky-400 mb-5">
							Langganan Berita
						</p>
						<p className="text-xs sm:text-sm leading-relaxed text-slate-400 mb-5">
							Dapatkan info pembaruan laporan dan pengumuman resmi
							desa langsung ke email Anda.
						</p>
						<form
							onSubmit={(e) => e.preventDefault()}
							className="flex overflow-hidden rounded-xl border border-white/15 bg-white/5"
						>
							<input
								type="email"
								placeholder="Email Anda"
								aria-label="Email address"
								className="min-w-0 flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
							/>
							<button
								type="submit"
								aria-label="Subscribe"
								className="flex w-12 shrink-0 items-center justify-center bg-white text-slate-950 transition duration-200 cursor-pointer hover:bg-sky-400"
							>
								<ArrowRight className="w-4 h-4" />
							</button>
						</form>
						<p className="mt-3 text-[11px] text-slate-500">
							Bebas spam. Batal berlangganan kapan saja.
						</p>
					</div>
				</div>
			</div>

			{/* Bottom bar */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 py-6">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 font-medium text-left">
					<p>
						© 2026 {appName} {villageName}. Hak cipta dilindungi
						undang-undang.
					</p>
					<p className="font-mono tracking-wider text-slate-400">
						Transparansi & Pelayanan Publik
					</p>
				</div>
			</div>
		</footer>
	);
}
