import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMasterData } from "../context/MasterDataContext";
import api from "../api/axios";
import {
	Play,
	ArrowDown,
	CheckCircle2,
	Plus,
	ChevronDown,
	ShieldCheck,
	MapPin,
	MessageSquare,
	Clock,
	Smartphone,
	FileText,
	HelpCircle,
} from "lucide-react";

const HERO_IMAGES = [
	"https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&q=80&w=1920",
	"https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920",
	"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1920",
	"https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&q=80&w=1920",
	"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1920",
];

export default function LandingPage() {
	const { user } = useAuth();
	const { appSettings } = useMasterData();
	const navigate = useNavigate();
	const location = useLocation();

	const appName = appSettings?.app_name || "Lapor Pak!";
	const villageName = appSettings?.village_name || "Desa Sukamaju";

	const [villageInfo, setVillageInfo] = useState(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [openFaqIndex, setOpenFaqIndex] = useState(0);

	// 3-second image rotation timer
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
		}, 3000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const fetchVillage = async () => {
			try {
				const res = await api.get("/village");
				const data = res.data?.data || res.data;
				if (data && typeof data === "object") {
					setVillageInfo(data);
				}
			} catch (err) {
				console.warn("GET /village error fallback", err);
			}
		};

		fetchVillage();
	}, []);

	// Handle Hash Scroll on Mount/Hash Change
	useEffect(() => {
		if (location.hash) {
			const element = document.querySelector(location.hash);
			if (element) {
				setTimeout(() => {
					element.scrollIntoView({ behavior: "smooth" });
				}, 100);
			}
		}
	}, [location.hash]);

	const faqItems = [
		{
			q: "Bagaimana cara membuat laporan pengaduan baru?",
			a: `Anda cukup mendaftar atau masuk ke akun ${appName}, klik tombol 'Buat Laporan', kemudian isi judul pengaduan, rincian lokasi, serta unggah bukti foto kendala di lapangan.`,
		},
		{
			q: "Apakah identitas pelapor terjamin kerahasiaannya?",
			a: `Ya, sistem ${appName} menjaga data pribadi pelapor. Informasi pribadi Anda hanya dapat diakses oleh admin resmi untuk kepentingan verifikasi dan tidak akan dipublikasikan ke umum.`,
		},
		{
			q: "Berapa lama laporan saya akan ditindaklanjuti?",
			a: "Laporan yang masuk akan ditinjau oleh admin dalam waktu maksimal 24 jam. Setelah diverifikasi, laporan diteruskan ke tim lapangan dan status pengerjaan dapat Anda pantau secara real-time.",
		},
		{
			q: "Apakah saya bisa melihat bukti foto setelah perbaikan selesai?",
			a: "Tentu saja. Setelah petugas menyelesaikan perbaikan di lapangan, bukti foto hasil penanganan akan diunggah langsung ke riwayat laporan Anda dan terbuka secara transparan.",
		},
	];

	return (
		<div className="space-y-20 pb-20 bg-slate-50 font-sans text-slate-900">
			{/* 1. HERO SECTION */}
			<section className="relative w-full bg-slate-900 text-white min-h-screen flex flex-col justify-between overflow-hidden border-b border-slate-800 pt-16">
				{/* 5 Background Images Slider with Soft Cross-fade & Ken Burns Zoom */}
				{HERO_IMAGES.map((imgUrl, index) => {
					const isActive = index === currentImageIndex;
					return (
						<div
							key={imgUrl}
							className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out transform ${
								isActive
									? "opacity-100 scale-110"
									: "opacity-0 scale-100"
							}`}
							style={{ backgroundImage: `url("${imgUrl}")` }}
						/>
					);
				})}

				{/* High contrast dark overlay gradient */}
				<div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/40 z-1" />

				{/* Hero Content Container - Aligned Left matching Navbar */}
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-16 sm:py-24 text-left space-y-6">
					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
						Sampaikan Pengaduan & Aspirasi Lingkungan Anda Secara
						Transparan
					</h1>

					<p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-normal">
						Sistem pengaduan terpadu untuk melaporkan kendala
						fasilitas umum, jalan rusak, kebersihan, serta masalah
						pelayanan di wilayah Anda secara cepat dan terpantau.
					</p>

					<div className="pt-3 flex flex-wrap gap-4 items-center justify-start">
						<button
							onClick={() =>
								navigate(user ? "/reports/create" : "/register")
							}
							className="px-8 py-3.5 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg transition-all cursor-pointer"
						>
							{user
								? "Buat Laporan Baru"
								: "Laporkan Masalah Sekarang"}
						</button>

						<a
							href="#about-lapor-pak"
							className="px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all cursor-pointer flex items-center gap-2 backdrop-blur-xs"
						>
							<span>Pelajari Lebih Lanjut</span>
							<ArrowDown className="w-4 h-4" />
						</a>
					</div>
				</div>
			</section>

			{/* Main Content Sections Container */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-36 sm:space-y-48">
				{/* 2. ABOUT LAPOR PAK! (Cellar-Six Style 3-Image Grid Left) */}
				<section id="about-lapor-pak" className="scroll-mt-24">
					<div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
						{/* Left Column: 3-Image Grid (1 Top Main spanning 2 cols, 2 Bottom Grid 1.2fr / 0.8fr) */}
						<div className="lg:col-span-6 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
							<img
								src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200"
								alt="Warga Melapor via Smartphone"
								className="h-[300px] md:h-[370px] w-full rounded-2xl border border-slate-200 object-cover sm:col-span-2 shadow-xs hover:shadow-md transition-shadow bg-slate-100"
							/>

							<img
								src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800"
								alt="Penanganan Lapangan Petugas"
								className="h-[200px] w-full rounded-2xl border border-slate-200 object-cover shadow-xs hover:shadow-md transition-shadow bg-slate-100"
							/>

							<img
								src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600"
								alt="Dashboard Pemantauan Digital"
								className="h-[200px] w-full rounded-2xl border border-slate-200 object-cover shadow-xs hover:shadow-md transition-shadow bg-slate-100"
							/>
						</div>

						{/* Right Column: Eyebrow, Quote Title, Paragraphs & Action Buttons */}
						<div className="lg:col-span-6 text-left">
							<div className="flex items-center gap-3">
								<span className="font-serif italic text-base sm:text-lg text-sky-700 font-medium tracking-wide">
									About {appName}
								</span>
								<span className="w-12 sm:w-16 h-[2px] bg-sky-600 rounded-full"></span>
							</div>

							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15] mt-4">
								“Suarakan Kendala, Wujudkan Perubahan.”
							</h2>

							<p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mt-6">
								{appName} didesain untuk momen-momen sederhana
								di mana kendala fasilitas umum membutuhkan
								respon cepat: jalan berlubang di gang desa,
								penerangan jalan umum yang mati, hingga saluran
								air tersumbat setelah hujan deras.
							</p>

							<p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mt-4">
								Tujuannya bukan sekadar membuat laporan online,
								melainkan menciptakan sistem pelaporan yang
								transparan, mudah diakses, serta responsif demi
								kenyamanan seluruh warga desa.
							</p>

							<div className="mt-8 flex flex-col sm:flex-row gap-4">
								<button
									onClick={() =>
										navigate(
											user
												? "/reports/create"
												: "/register"
										)
									}
									className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
								>
									Buat Laporan Sekarang
								</button>

								<button
									onClick={() => navigate("/cara-kerja")}
									className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
								>
									Lihat Cara Kerja
								</button>
							</div>
						</div>
					</div>
				</section>

				{/* 3. HOW IT WORKS (3 Langkah Mudah Untuk Lapor - Exact zerobin-fe Style) */}
				<section id="how-it-works" className="scroll-mt-24">
					<div className="mx-auto max-w-3xl text-center space-y-3">
						<div className="flex items-center justify-center gap-3">
							<span className="w-10 h-[2px] bg-sky-600 rounded-full"></span>
							<span className="font-serif italic text-base sm:text-lg text-sky-700 font-medium tracking-wide">
								How It Works
							</span>
							<span className="w-10 h-[2px] bg-sky-600 rounded-full"></span>
						</div>

						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mt-5">
							3 Langkah Mudah Untuk Lapor
						</h2>

						<p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mt-6 max-w-2xl mx-auto">
							Pelaporan masyarakat hanya berfungsi maksimal ketika
							setiap alurnya jelas, transparan, dan dapat diakses
							dengan mudah oleh siapapun.
						</p>
					</div>

					<div className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-16 text-left">
						{/* Step 01 */}
						<article className="border-t-2 border-slate-200 bg-slate-50/60 p-6 sm:p-7 rounded-b-2xl">
							<div className="flex items-start justify-between gap-4">
								<span className="text-5xl font-bold font-mono text-sky-600 tracking-tight">
									01
								</span>
								<img
									src="/assets/illustrations/step1-lapor.svg"
									alt="Lapor Kendala"
									className="h-28 w-32 object-contain"
								/>
							</div>
							<h3 className="mt-7 text-2xl font-bold text-slate-950">
								1. Lapor Kendala
							</h3>
							<p className="mt-4 leading-7 text-slate-600 text-sm sm:text-base">
								Ambil foto masalah di lapangan, tuliskan lokasi
								spesifik serta rincian kendala, lalu kirimkan
								laporan secara instan dari perangkat Anda.
							</p>
						</article>

						{/* Step 02 */}
						<article className="border-t-2 border-slate-200 bg-slate-50/60 p-6 sm:p-7 rounded-b-2xl">
							<div className="flex items-start justify-between gap-4">
								<span className="text-5xl font-bold font-mono text-sky-600 tracking-tight">
									02
								</span>
								<img
									src="/assets/illustrations/step2-admin.svg"
									alt="Admin Urus & Tindak Lanjut"
									className="h-28 w-32 object-contain"
								/>
							</div>
							<h3 className="mt-7 text-2xl font-bold text-slate-950">
								2. Admin & Petugas Urus
							</h3>
							<p className="mt-4 leading-7 text-slate-600 text-sm sm:text-base">
								Admin meninjau laporan, memverifikasi keabsahan
								data, dan langsung menugaskan tim lapangan untuk
								penanganan langsung di lokasi.
							</p>
						</article>

						{/* Step 03 */}
						<article className="border-t-2 border-slate-200 bg-slate-50/60 p-6 sm:p-7 rounded-b-2xl">
							<div className="flex items-start justify-between gap-4">
								<span className="text-5xl font-bold font-mono text-sky-600 tracking-tight">
									03
								</span>
								<img
									src="/assets/illustrations/step3-selesai.svg"
									alt="Laporan Selesai"
									className="h-28 w-32 object-contain"
								/>
							</div>
							<h3 className="mt-7 text-2xl font-bold text-slate-950">
								3. Selesai & Transparan
							</h3>
							<p className="mt-4 leading-7 text-slate-600 text-sm sm:text-base">
								Permasalahan tuntas dikerjakan. Bukti foto
								perbaikan diunggah ke sistem dan Anda menerima
								konfirmasi status penyelesaian resmi.
							</p>
						</article>
					</div>
				</section>
			</div>

			{/* 4. STORY SECTION (Dark Banner) */}
			<section className="relative isolate overflow-hidden bg-slate-900 py-24 sm:py-36 text-white border-y border-slate-800 my-24 sm:my-36">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
						<div className="max-w-3xl text-left">
							<p className="font-serif italic text-lg text-sky-400 font-medium">
								Setiap Suara Berharga
							</p>
							<h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mt-4 tracking-tight leading-tight">
								Pelaporan Cepat, Lingkungan Desa Lebih Tertata.
							</h2>
						</div>
						<div className="max-w-sm md:text-right space-y-4">
							<p className="leading-relaxed text-slate-300 text-xs sm:text-sm">
								Melaporkan kendala fasilitas umum adalah cara
								terbaik menjaga kenyamanan bersama di desa kita.
							</p>
							<button
								onClick={() =>
									navigate(
										user ? "/reports/create" : "/register"
									)
								}
								className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
							>
								Mulai Melapor Sekarang
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* 5. IMPACT SECTION & ASYMMETRICAL COLLAGE */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-36 sm:space-y-48">
				<section id="impact" className="scroll-mt-24">
					<div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
						{/* Left Content */}
						<div className="space-y-8 text-left">
							<div>
								<span className="font-serif italic text-base sm:text-lg text-sky-700 font-medium">
									Dampak & Capaian Desa
								</span>
								<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mt-3 leading-tight">
									Transparansi Nyata Menghasilkan Kepercayaan
									Warga.
								</h2>
								<p className="text-slate-600 leading-relaxed text-sm sm:text-base mt-6 max-w-2xl">
									Lapor Pak! hadir untuk memastikan setiap
									masalah fasilitas publik ditangani secara
									bertanggung jawab. Dari perbaikan jalan
									hingga kebersihan lingkungan, semua
									pencapaian tercatat demi mewujudkan desa
									yang berdaya saing.
								</p>
							</div>

							{/* Stats Grid */}
							<div className="grid gap-8 sm:grid-cols-2 pt-6 border-t border-slate-200">
								<div className="space-y-1">
									<p className="text-4xl sm:text-5xl font-extrabold text-sky-600 tracking-tight">
										10.500+
									</p>
									<p className="text-xs uppercase tracking-widest font-mono font-bold text-slate-400 mt-1">
										Laporan Tuntas
									</p>
									<p className="text-xs text-slate-600 mt-2 leading-relaxed">
										Pengaduan jalan rusak, drainase, dan
										kebersihan yang telah berhasil ditangani
										oleh tim lapangan.
									</p>
								</div>

								<div className="space-y-1">
									<p className="text-4xl sm:text-5xl font-extrabold text-emerald-600 tracking-tight">
										4.9 / 5
									</p>
									<p className="text-xs uppercase tracking-widest font-mono font-bold text-slate-400 mt-1">
										Kepuasan Warga
									</p>
									<p className="text-xs text-slate-600 mt-2 leading-relaxed">
										Indeks kepuasan atas kecepatan respon
										dan kejelasan bukti foto penanganan
										masalah.
									</p>
								</div>
							</div>
						</div>

						{/* Right Asymmetrical Overlapping Image Collage */}
						<div className="relative pt-8 sm:pt-12 lg:pt-0">
							{/* Main Image */}
							<div className="relative aspect-[4/5] w-[85%] ml-auto overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-md">
								<img
									src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&h=1000&q=80"
									alt="Petugas Lapangan Menangani Perbaikan"
									className="w-full h-full object-cover"
								/>
							</div>

							{/* Overlapping Secondary Image */}
							<div className="absolute bottom-[-20px] left-0 w-[45%] aspect-square overflow-hidden rounded-2xl border-4 border-slate-50 bg-slate-100 shadow-xl hidden sm:block">
								<img
									src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=80"
									alt="Monitoring Laporan Digital"
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* 6. FAQ ACCORDION SECTION */}
				<section
					id="faq"
					className="scroll-mt-24 py-8 sm:py-16 border-t border-slate-200/80 pt-16 sm:pt-24"
				>
					<div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 items-start">
						{/* Left Header */}
						<div className="lg:sticky lg:top-28 lg:h-fit text-left">
							<p className="font-serif italic text-base sm:text-lg text-sky-700 font-medium tracking-wide flex items-center gap-3 after:content-[''] after:w-14 after:h-[1px] after:bg-sky-700/50">
								Questions before sharing
							</p>
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.05] mt-5 font-serif">
								Hal mendasar harus jelas.
							</h2>
							<p className="mt-6 max-w-md text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
								Pelaporan lingkungan berfungsi maksimal ketika
								warga memahami aturan dan ekspektasi penanganan
								sejak awal.
							</p>
						</div>

						{/* Right Accordion List */}
						<div className="divide-y divide-slate-200 border-y border-slate-200 text-left">
							{faqItems.map((faq, index) => {
								const isOpen = openFaqIndex === index;
								return (
									<div key={faq.q} className="group">
										<button
											onClick={() =>
												setOpenFaqIndex(
													isOpen ? -1 : index
												)
											}
											aria-expanded={isOpen}
											className="w-full text-left flex cursor-pointer items-center justify-between gap-6 py-6 outline-none focus:text-sky-700 transition duration-200"
										>
											<h3 className="text-xl font-bold leading-snug text-slate-950 sm:text-2xl tracking-tight font-serif">
												{faq.q}
											</h3>
											<span
												className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-xl font-mono text-sky-700 transition-transform duration-300 ${
													isOpen
														? "rotate-45 bg-sky-50 border-sky-300 text-sky-800"
														: ""
												}`}
											>
												+
											</span>
										</button>

										<div
											className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
												isOpen
													? "grid-rows-[1fr] opacity-100"
													: "grid-rows-[0fr] opacity-0"
											}`}
										>
											<div className="overflow-hidden">
												<p className="max-w-2xl pb-7 text-base leading-8 text-slate-600 sm:text-lg font-normal">
													{faq.a}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
