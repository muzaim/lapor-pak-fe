import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/dateUtils";
import { decodeId } from "../utils/idUtils";
import {
	ArrowLeft,
	AlertCircle,
	Maximize2,
	X,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

export default function UserReportDetailPage() {
	const { id } = useParams();
	const realId = decodeId(id);
	const navigate = useNavigate();

	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(true);

	// Multi-image state
	const [activeImageIdx, setActiveImageIdx] = useState(0);
	const [lightboxState, setLightboxState] = useState(null); // { images: string[], index: number } | null

	const fetchReportDetail = async (isInitial = false) => {
		if (isInitial) setLoading(true);
		try {
			const decryptedId = decodeId(id);
			let res;
			try {
				// Exact Swagger Endpoint: GET /api/reports/:id (e.g. /api/reports/20)
				res = await api.get(`/reports/${decryptedId}`);
			} catch (err1) {
				// Fallback to raw param if needed
				res = await api.get(`/reports/${id}`);
			}
			const rawData =
				res.data?.report ||
				res.data?.data ||
				res.data?.result ||
				res.data;

			const targetObj = Array.isArray(rawData) ? rawData[0] : rawData;
			if (targetObj && typeof targetObj === "object") {
				setReport(targetObj);
			}
		} catch (err) {
			console.error("GET /reports/:id error", err);
		} finally {
			if (isInitial) setLoading(false);
		}
	};

	useEffect(() => {
		fetchReportDetail(true);
	}, [id]);

	const parseImages = (source) => {
		if (!source) return [];
		let rawList = [];
		if (Array.isArray(source.images) && source.images.length > 0) {
			rawList = source.images;
		} else if (
			Array.isArray(source.image_urls) &&
			source.image_urls.length > 0
		) {
			rawList = source.image_urls;
		} else if (
			Array.isArray(source.photos) &&
			source.photos.length > 0
		) {
			rawList = source.photos;
		} else {
			const single =
				source.image_url ||
				source.image ||
				source.proof_image ||
				source.response_image ||
				source.admin_image;
			if (single) rawList = [single];
		}

		return rawList
			.map((img) => {
				const raw =
					typeof img === "object"
						? img.url || img.image_url || img.path || ""
						: String(img);
				if (!raw) return null;
				const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
				return raw.startsWith("http")
					? raw
					: `${serverUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
			})
			.filter(Boolean);
	};

	const getReportImages = (detail) => parseImages(detail);

	const getHistoryItems = (detail) => {
		const rawHistories = detail?.histories || detail?.history;

		if (Array.isArray(rawHistories) && rawHistories.length > 0) {
			const items = rawHistories.map((h) => {
				const actorName =
					typeof h.actor === "object"
						? h.actor?.name
						: h.actor ||
						  (h.role === "ADMIN" ? "Admin / Petugas" : "Pelapor");
				const statusVal = h.new_status || h.status || "DIPROSES";
				const historyImages = parseImages(h);

				return {
					id: h.id || Math.random(),
					status: statusVal,
					comment:
						h.comment ||
						h.message ||
						h.admin_response ||
						"Komentar pergerakan status.",
					images: historyImages,
					created_at:
						h.created_at ||
						detail.updated_at ||
						new Date().toISOString(),
					actor: actorName,
				};
			});

			return items.sort(
				(a, b) => new Date(b.created_at) - new Date(a.created_at)
			);
		}

		const historyList = [];
		if (detail?.admin_response) {
			const adminImages = parseImages({
				image_url: detail.response_image || detail.admin_image,
				images: detail.admin_images,
			});
			historyList.push({
				id: 2,
				status: detail.status,
				comment: detail.admin_response,
				images: adminImages,
				created_at: detail.updated_at || new Date().toISOString(),
				actor: "Admin / Petugas Resmi",
			});
		}

		const initialReportImages = parseImages(detail);

		historyList.push({
			id: 1,
			status: "DIAJUKAN",
			comment: "Laporan berhasil terkirim dan tersimpan di sistem.",
			images: initialReportImages,
			created_at: detail?.created_at || new Date().toISOString(),
			actor: "Anda (Pelapor)",
		});

		return historyList.sort(
			(a, b) => new Date(b.created_at) - new Date(a.created_at)
		);
	};

	if (loading) {
		return (
			<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-2xs">
					<div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
					<p className="text-xs text-slate-500 font-semibold">
						Memuat rincian laporan pengaduan Anda...
					</p>
				</div>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-2xs">
					<AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
					<h3 className="font-bold text-slate-800 text-base">
						Laporan Tidak Ditemukan
					</h3>
					<p className="text-xs text-slate-500">
						Laporan tidak ditemukan atau telah dihapus.
					</p>
					<Link
						to="/reports"
						className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl hover:bg-sky-700 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" /> Kembali ke Laporan Saya
					</Link>
				</div>
			</div>
		);
	}

	const reportImages = getReportImages(report);

	const reporterName =
		typeof report.user === "object"
			? report.user?.name || report.user?.full_name
			: report.user ||
			  report.user_name ||
			  report.author_name ||
			  report.reporter_name ||
			  report.name ||
			  report.pelapor_name ||
			  "Pelapor Masyarakat";

	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Top navigation */}
			<div>
				<Link
					to="/reports"
					className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Kembali ke Laporan Saya
				</Link>
			</div>

			{/* Main Grid Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left Column (7 cols): Clean, Simple & Direct Detail Card */}
				<div className="lg:col-span-7 space-y-6">
					<div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-2xs">
						{/* Title & Status Header */}
						<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
							<div>
								<h1 className="text-xl font-bold text-slate-900">{report.title}</h1>
							</div>
							<div className="shrink-0">
								<StatusBadge status={report.status} />
							</div>
						</div>

						{/* Clean Key-Value Metadata Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs border-b border-slate-100 pb-5">
							<div>
								<span className="text-slate-400 font-medium block mb-0.5">Pelapor</span>
								<span className="text-slate-900 font-semibold">{reporterName}</span>
							</div>

							<div>
								<span className="text-slate-400 font-medium block mb-0.5">Kategori</span>
								<span className="text-slate-900 font-semibold">{report.category}</span>
							</div>

							<div>
								<span className="text-slate-400 font-medium block mb-0.5">Lokasi Kejadian</span>
								<span className="text-slate-900 font-semibold">{report.location}</span>
							</div>

							<div>
								<span className="text-slate-400 font-medium block mb-0.5">Tanggal Pengaduan</span>
								<span className="text-slate-900 font-semibold">{formatDate(report.created_at)}</span>
							</div>
						</div>

						{/* Deskripsi Pengaduan */}
						<div>
							<span className="text-xs font-semibold text-slate-700 block mb-2">
								Deskripsi Pengaduan
							</span>
							<p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
								{report.description}
							</p>
						</div>

						{/* Lampiran Foto Bukti (Supported Multiple Photos with Carousel Controls) */}
						{reportImages.length > 0 && (
							<div className="pt-3 border-t border-slate-100">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-700 block">
										Lampiran bukti
									</span>
									{reportImages.length > 1 && (
										<span className="text-[11px] font-mono font-medium text-slate-400">
											{activeImageIdx + 1} dari {reportImages.length}
										</span>
									)}
								</div>

								{/* Main Large Image Container */}
								<div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 w-full flex justify-center group">
									<img
										src={reportImages[activeImageIdx]}
										alt={`Foto Bukti ${activeImageIdx + 1}`}
										onClick={() =>
											setLightboxState({
												images: reportImages,
												index: activeImageIdx,
											})
										}
										className="w-full max-h-[480px] object-contain cursor-pointer group-hover:scale-[1.01] transition-transform"
									/>

									{/* Next / Prev Navigation Overlay */}
									{reportImages.length > 1 && (
										<>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setActiveImageIdx((prev) =>
														prev === 0 ? reportImages.length - 1 : prev - 1
													);
												}}
												className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/60 hover:bg-slate-950/80 text-white rounded-full transition-colors cursor-pointer"
												title="Foto Sebelumnya"
											>
												<ChevronLeft className="w-5 h-5" />
											</button>
											
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setActiveImageIdx((prev) =>
														prev === reportImages.length - 1 ? 0 : prev + 1
													);
												}}
												className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/60 hover:bg-slate-950/80 text-white rounded-full transition-colors cursor-pointer"
												title="Foto Selanjutnya"
											>
												<ChevronRight className="w-5 h-5" />
											</button>
										</>
									)}
								</div>

								{/* Thumbnail Strip */}
								{reportImages.length > 1 && (
									<div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
										{reportImages.map((imgUrl, i) => (
											<button
												key={i}
												type="button"
												onClick={() => setActiveImageIdx(i)}
												className={`relative rounded-lg overflow-hidden border-2 shrink-0 w-16 h-16 bg-slate-900 cursor-pointer transition-all ${
													activeImageIdx === i
														? "border-sky-600 ring-2 ring-sky-200"
														: "border-transparent opacity-60 hover:opacity-100"
												}`}
											>
												<img
													src={imgUrl}
													alt={`Thumbnail ${i + 1}`}
													className="w-full h-full object-cover"
												/>
											</button>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Right Column (5 cols): Timeline Riwayat Perkembangan */}
				<div className="lg:col-span-5 space-y-6">
					<div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
						<div className="border-b border-slate-100 pb-3 flex items-center justify-between">
							<h3 className="font-bold text-slate-900 text-sm">
								Riwayat Perkembangan Laporan
							</h3>
						</div>

						{/* Scrollable Fixed Height Timeline Container */}
						<div
							data-lenis-prevent
							className="max-h-[420px] overflow-y-auto pr-3 py-1 scrollbar-thin"
						>
							<div className="relative pl-7 py-2">
								{getHistoryItems(report).map(
									(item, idx, arr) => {
										const isFirst = idx === 0;
										const isLast = idx === arr.length - 1;
										const st = String(
											item.status || ""
										).toUpperCase();
										const dotBg =
											st === "DIAJUKAN"
												? "bg-indigo-600"
												: st === "MENUNGGU" ||
												  st === "PENDING"
												? "bg-amber-500"
												: st === "DIPROSES" ||
												  st === "IN_REVIEW"
												? "bg-sky-600"
												: st === "SELESAI" ||
												  st === "RESOLVED"
												? "bg-emerald-600"
												: "bg-rose-600";

										return (
											<div
												key={idx}
												className={`relative text-xs space-y-1.5 ${
													!isLast ? "pb-6" : "pb-1"
												}`}
											>
												{/* Line Down */}
												{!isLast && (
													<span className="absolute -left-[19px] top-3 -bottom-5 w-0.5 bg-slate-300 z-0"></span>
												)}

												{/* Line Up */}
												{!isFirst && (
													<span className="absolute -left-[19px] top-0 h-3 w-0.5 bg-slate-300 z-0"></span>
												)}

												<div className="flex items-center justify-between gap-2 relative">
													<span
														className={`absolute -left-[26px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${dotBg} border-2 border-none shadow-xs z-10`}
													></span>

													<StatusBadge
														status={item.status}
													/>
													<span className="text-[10px] text-slate-400 font-mono">
														{formatDate(
															item.created_at
														)}
													</span>
												</div>

												<p className="text-slate-700 text-xs font-normal leading-relaxed pt-0.5">
													{item.comment ||
														item.message ||
														"Status diperbarui."}
												</p>

												{/* History Image Mini Gallery */}
												{item.images && item.images.length > 0 && (
													<div className="pt-1.5 space-y-1">
														<span className="text-[10px] text-slate-400 block font-medium">
															Lampiran bukti ({item.images.length}):
														</span>
														<div className="flex flex-wrap items-center gap-1.5">
															{item.images.map((imgUrl, imgIdx) => (
																<button
																	key={imgIdx}
																	type="button"
																	onClick={() =>
																		setLightboxState({
																			images: item.images,
																			index: imgIdx,
																		})
																	}
																	className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 w-12 h-12 shrink-0 cursor-pointer hover:ring-2 hover:ring-sky-500 transition-all shadow-2xs"
																>
																	<img
																		src={imgUrl}
																		alt={`Bukti Riwayat ${imgIdx + 1}`}
																		className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
																	/>
																</button>
															))}
														</div>
													</div>
												)}

												<span className="text-[10px] text-slate-400 block text-right font-medium pt-1">
													Oleh:{" "}
													<span className="font-bold text-slate-700">
														{item.actor || "Sistem"}
													</span>
												</span>
											</div>
										);
									}
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Lightbox Image Preview Modal with Next/Prev Navigation */}
			{lightboxState !== null &&
				lightboxState.images &&
				lightboxState.images[lightboxState.index] && (
					<div
						onClick={() => setLightboxState(null)}
						className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
					>
						<button
							onClick={() => setLightboxState(null)}
							className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer shadow-lg z-60"
							title="Tutup Foto"
						>
							<X className="w-6 h-6" />
						</button>

						{/* Prev Lightbox Arrow */}
						{lightboxState.images.length > 1 && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setLightboxState((prev) => ({
										...prev,
										index:
											prev.index === 0
												? prev.images.length - 1
												: prev.index - 1,
									}));
								}}
								className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-60"
								title="Foto Sebelumnya"
							>
								<ChevronLeft className="w-7 h-7" />
							</button>
						)}

						{/* Next Lightbox Arrow */}
						{lightboxState.images.length > 1 && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setLightboxState((prev) => ({
										...prev,
										index:
											prev.index === prev.images.length - 1
												? 0
												: prev.index + 1,
									}));
								}}
								className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-60"
								title="Foto Selanjutnya"
							>
								<ChevronRight className="w-7 h-7" />
							</button>
						)}

						<div
							onClick={(e) => e.stopPropagation()}
							className="max-w-5xl max-h-[90vh] p-2 flex flex-col items-center justify-center relative"
						>
							<img
								src={lightboxState.images[lightboxState.index]}
								alt={`Pratinjau Foto ${lightboxState.index + 1}`}
								className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl border border-white/10"
							/>
							{lightboxState.images.length > 1 && (
								<p className="text-white/80 text-xs mt-3 font-semibold tracking-wide">
									Foto {lightboxState.index + 1} dari{" "}
									{lightboxState.images.length}
								</p>
							)}
						</div>
					</div>
				)}
		</div>
	);
}
