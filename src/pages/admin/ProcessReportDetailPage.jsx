import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";
import LoadingOverlay from "../../components/LoadingOverlay";
import {
	ArrowLeft,
	Edit3,
	Send,
	History,
	Image as ImageIcon,
	AlertCircle,
	CheckCircle,
	Upload,
	X,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Plus,
} from "lucide-react";

import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/dateUtils";
import { decodeId } from "../../utils/idUtils";

export default function ProcessReportDetailPage() {
	const { id } = useParams();
	const realId = decodeId(id);
	const navigate = useNavigate();
	const { showToast } = useToast();
	const adminFileInputRef = useRef(null);

	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(true);

	// Right Column Active Tab State: 'FORM' | 'HISTORY'
	const [activeRightTab, setActiveRightTab] = useState("FORM");

	const [updateStatus, setUpdateStatus] = useState("DIAJUKAN");
	const [adminComment, setAdminComment] = useState("");

	// Multiple Admin Image attachment state
	const [imageFiles, setImageFiles] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);

	// Multi-image Carousel State for Report Details & History Lightbox
	const [activeImageIdx, setActiveImageIdx] = useState(0);
	const [lightboxState, setLightboxState] = useState(null); // { images: string[], index: number } | null

	// Confirmation Modal state
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	const [updating, setUpdating] = useState(false);
	const [feedbackMsg, setFeedbackMsg] = useState("");

	const fetchReportDetail = async (isInitial = false) => {
		if (isInitial) setLoading(true);
		try {
			const decryptedId = decodeId(id);
			let res;
			try {
				// Exact Admin Swagger Endpoint: GET /api/admin/reports/:id (e.g. /api/admin/reports/20)
				res = await api.get(`/admin/reports/${decryptedId}`);
			} catch (err1) {
				// Fallback to raw param or user endpoint
				try {
					res = await api.get(`/admin/reports/${id}`);
				} catch (err2) {
					res = await api.get(`/reports/${decryptedId}`);
				}
			}

			const rawData =
				res.data?.report ||
				res.data?.data ||
				res.data?.result ||
				res.data;

			const data = Array.isArray(rawData) ? rawData[0] : rawData;

			if (data && typeof data === "object") {
				setReport(data);
				const st = (data.status || "").toUpperCase();
				const hist = data.histories || data.history || [];
				if (
					st === "DIAJUKAN" ||
					(st === "PENDING" && hist.length <= 1)
				) {
					setUpdateStatus("DIPROSES");
				} else if (st === "PENDING" || st === "MENUNGGU") {
					setUpdateStatus("DIPROSES");
				} else if (st === "IN_REVIEW" || st === "DIPROSES") {
					setUpdateStatus("SELESAI");
				} else {
					setUpdateStatus(st || "SELESAI");
				}
			}
		} catch (err) {
			console.error("GET /admin/reports/:id error", err);
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
		} else if (Array.isArray(source.photos) && source.photos.length > 0) {
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

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		const validFiles = [];
		const newPreviews = [];

		for (const file of files) {
			if (file.size > 5 * 1024 * 1024) {
				setFeedbackMsg(`File ${file.name} melebihi batas 5MB.`);
				return;
			}
			validFiles.push(file);
			newPreviews.push({
				id: Math.random().toString(36).substring(2, 9),
				file,
				url: URL.createObjectURL(file),
			});
		}

		setFeedbackMsg("");
		setImageFiles((prev) => [...prev, ...validFiles]);
		setImagePreviews((prev) => [...prev, ...newPreviews]);

		if (e.target) e.target.value = "";
	};

	const handleRemoveImage = (indexToRemove) => {
		setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
		setImagePreviews((prev) => {
			const target = prev[indexToRemove];
			if (target?.url) URL.revokeObjectURL(target.url);
			return prev.filter((_, idx) => idx !== indexToRemove);
		});
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();
		if (!report) return;

		if (!adminComment.trim()) {
			setFeedbackMsg(
				"Harap tuliskan komentar / catatan riwayat untuk perubahan status."
			);
			return;
		}

		setFeedbackMsg("");
		setIsConfirmModalOpen(true);
	};

	const executeProcessReport = async () => {
		setIsConfirmModalOpen(false);
		setUpdating(true);
		setFeedbackMsg("");

		try {
			const payloadStatus = String(updateStatus).toUpperCase();
			const formData = new FormData();
			formData.append("status", payloadStatus);
			formData.append("admin_response", adminComment);
			formData.append("comment", adminComment);

			imageFiles.forEach((file) => {
				formData.append("images", file);
			});

			await api.patch(`/admin/reports/${realId}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			const newHistoryItem = {
				id: Date.now(),
				status: payloadStatus,
				comment: adminComment,
				images: imagePreviews.map((p) => p.url),
				created_at: new Date().toISOString(),
				actor: "Admin / Petugas",
			};

			setReport((prev) => {
				const existing = Array.isArray(prev?.histories || prev?.history)
					? prev?.histories || prev?.history
					: [];
				return {
					...prev,
					status: payloadStatus,
					admin_response: adminComment,
					histories: [newHistoryItem, ...existing],
				};
			});

			// Switch to History tab after processing to view timeline
			setAdminComment("");
			setImageFiles([]);
			setImagePreviews([]);
			showToast(
				"Status & riwayat laporan berhasil diperbarui!",
				"success"
			);
			setActiveRightTab("HISTORY");
			await fetchReportDetail(false);
		} catch (err) {
			console.error("Failed to process report:", err);
			const msg =
				err.response?.data?.message ||
				"Gagal memperbarui status laporan. Silakan coba lagi.";
			setFeedbackMsg(msg);
			showToast(msg, "error");
		} finally {
			setUpdating(false);
		}
	};

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
			actor: "Pelapor (Pengguna)",
		});

		return historyList.sort(
			(a, b) => new Date(b.created_at) - new Date(a.created_at)
		);
	};

	if (loading) {
		return (
			<div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
				<div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
				<p className="text-xs text-slate-500 font-semibold">
					Memuat halaman detail & pemrosesan laporan #{id}...
				</p>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
				<AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
				<h3 className="font-bold text-slate-800 text-base">
					Laporan Tidak Ditemukan
				</h3>
				<p className="text-xs text-slate-500">
					Laporan tidak ada atau telah dihapus.
				</p>
				<Link
					to="/laporan"
					className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl"
				>
					<ArrowLeft className="w-4 h-4" /> Kembali ke Data Laporan
				</Link>
			</div>
		);
	}

	const reportImages = getReportImages(report);
	const historyItems = getHistoryItems(report);

	const currentStatusUpper = (report?.status || "").toUpperCase();
	const isDiajukan =
		currentStatusUpper === "DIAJUKAN" ||
		(currentStatusUpper === "PENDING" && historyItems.length <= 1);
	const isMenunggu =
		(currentStatusUpper === "PENDING" ||
			currentStatusUpper === "MENUNGGU") &&
		!isDiajukan;
	const isDiproses =
		currentStatusUpper === "IN_REVIEW" || currentStatusUpper === "DIPROSES";
	const isFinal =
		currentStatusUpper === "RESOLVED" ||
		currentStatusUpper === "SELESAI" ||
		currentStatusUpper === "REJECTED" ||
		currentStatusUpper === "DITOLAK";

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
		<div className="space-y-6 relative">
			{updating && (
				<LoadingOverlay
					message="Memperbarui Status Laporan, Komentar & Lampiran Foto..."
					backdrop="blank"
				/>
			)}

			{/* Top Header Bar */}
			<div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
				<Link
					to="/laporan"
					className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Kembali ke Data Laporan
				</Link>
				<h1 className="text-xl font-bold text-slate-900">
					Pemrosesan Laporan Pengaduan
				</h1>
				<p className="text-xs text-slate-500 mt-0.5">
					Tinjau detail informasi, isi form proses laporan, dan pantau
					riwayat perkembangan
				</p>
			</div>

			{/* 2-Column Main Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left Column (7 cols): Clean, Simple & Direct Detail Card */}
				<div className="lg:col-span-7 space-y-6">
					<div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-2xs">
						{/* Title & Status Header */}
						<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
							<div>
								<h2 className="text-xl font-bold text-slate-900">
									{report.title}
								</h2>
							</div>
							<div className="shrink-0">
								<StatusBadge status={report.status} />
							</div>
						</div>

						{/* Clean Key-Value Metadata Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs border-b border-slate-100 pb-5">
							<div>
								<span className="text-slate-400 font-medium block mb-0.5">
									Pelapor
								</span>
								<span className="text-slate-900 font-semibold">
									{reporterName}
								</span>
							</div>

							<div>
								<span className="text-slate-400 font-medium block mb-0.5">
									Kategori
								</span>
								<span className="text-slate-900 font-semibold">
									{report.category}
								</span>
							</div>

							<div>
								<span className="text-slate-400 font-medium block mb-0.5">
									Lokasi Kejadian
								</span>
								<span className="text-slate-900 font-semibold">
									{report.location}
								</span>
							</div>

							<div>
								<span className="text-slate-400 font-medium block mb-0.5">
									Tanggal Pengaduan
								</span>
								<span className="text-slate-900 font-semibold">
									{formatDate(report.created_at)}
								</span>
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

						{/* Lampiran Foto Bukti (Multiple Gallery & Carousel) */}
						{reportImages.length > 0 && (
							<div className="pt-3 border-t border-slate-100">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-700 block">
										Lampiran bukti ({reportImages.length})
									</span>
									{reportImages.length > 1 && (
										<span className="text-[11px] font-mono font-medium text-slate-400">
											{activeImageIdx + 1} dari{" "}
											{reportImages.length}
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
														prev === 0
															? reportImages.length -
															  1
															: prev - 1
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
														prev ===
														reportImages.length - 1
															? 0
															: prev + 1
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
												onClick={() =>
													setActiveImageIdx(i)
												}
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

				{/* Right Column (5 cols): Modern Tabbed Panel (Tab 1: Form Proses, Tab 2: History Status) */}
				<div className="lg:col-span-5 space-y-6">
					<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
						{/* Tab Header Selector */}
						<div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1">
							<button
								type="button"
								onClick={() => setActiveRightTab("FORM")}
								className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
									activeRightTab === "FORM"
										? "bg-white text-sky-700 shadow-xs border border-slate-200/80"
										: "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
								}`}
							>
								<Edit3 className="w-4 h-4 text-sky-600" />
								<span>Form Pemrosesan</span>
							</button>

							<button
								type="button"
								onClick={() => setActiveRightTab("HISTORY")}
								className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
									activeRightTab === "HISTORY"
										? "bg-white text-sky-700 shadow-xs border border-slate-200/80"
										: "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
								}`}
							>
								<History className="w-4 h-4 text-sky-600" />
								<span>Riwayat Perkembangan</span>
							</button>
						</div>

						{/* Tab 1 Content: Form Pemrosesan Status */}
						{activeRightTab === "FORM" && (
							<div className="p-6 space-y-5">
								<div className="border-b border-slate-100 pb-3">
									<h2 className="font-bold text-slate-900 text-sm">
										Form Pemrosesan Status Laporan
									</h2>
									<p className="text-[11px] text-slate-500">
										Ubah status pengaduan, komentar riwayat
										& lampiran bukti penanganan
									</p>
								</div>

								{isFinal ? (
									<div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
										<h3 className="font-bold text-slate-800 text-sm">
											Status Laporan Final
										</h3>
										<p className="text-xs text-slate-500 leading-relaxed">
											Laporan ini telah berstatus{" "}
											<StatusBadge
												status={report.status}
											/>{" "}
											dan bersifat final. Form pemrosesan
											telah ditutup & tidak dapat diubah
											lagi.
										</p>
									</div>
								) : (
									<>
										{feedbackMsg && (
											<div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
												<AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
												<span>{feedbackMsg}</span>
											</div>
										)}

										<form
											onSubmit={handleFormSubmit}
											className="space-y-4 text-xs"
										>
											<div>
												<label className="block text-xs font-semibold text-slate-700 mb-1.5">
													Status Baru Laporan{" "}
													<span className="text-rose-500">
														*
													</span>
												</label>
												<select
													value={updateStatus}
													onChange={(e) =>
														setUpdateStatus(
															e.target.value
														)
													}
													className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
												>
													{isDiajukan && (
														<>
															<option value="MENUNGGU">
																Menunggu
															</option>
															<option value="DIPROSES">
																Diproses
															</option>
															<option value="DITOLAK">
																Ditolak
															</option>
														</>
													)}
													{isMenunggu && (
														<>
															<option value="DIPROSES">
																Diproses
															</option>
														</>
													)}
													{isDiproses && (
														<>
															<option value="SELESAI">
																Selesai
															</option>
															<option value="MENUNGGU">
																Menunggu
															</option>
														</>
													)}
												</select>
											</div>

											<div>
												<label className="block text-xs font-semibold text-slate-700 mb-1.5">
													Komentar / Catatan Riwayat
													Status{" "}
													<span className="text-rose-500">
														*
													</span>
												</label>
												<textarea
													rows={4}
													required
													value={adminComment}
													onChange={(e) =>
														setAdminComment(
															e.target.value
														)
													}
													placeholder="Tuliskan komentar riwayat (contoh: 'Sedang review', 'Petugas sudah menuju lokasi survei', 'Pengerjaan selesai')..."
													className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-sky-500"
												/>
											</div>

											{/* Upload Multiple Foto Bukti Penanganan (Entire Box Clickable) */}
											<div>
												<div className="flex items-center justify-between mb-1.5">
													<label className="block text-xs font-semibold text-slate-700">
														Foto Bukti Penanganan /
														Pengerjaan{" "}
														<span className="text-slate-400 font-normal">
															(Opsional)
														</span>
													</label>
													{imagePreviews.length >
														0 && (
														<span className="text-[11px] font-medium text-slate-500">
															{
																imagePreviews.length
															}{" "}
															foto
														</span>
													)}
												</div>

												<input
													ref={adminFileInputRef}
													type="file"
													multiple
													accept="image/*"
													onChange={handleImageChange}
													className="hidden"
												/>

												<div
													onClick={() =>
														adminFileInputRef.current?.click()
													}
													className="border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/60 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center group"
												>
													<Upload className="w-5 h-5 text-sky-600 mb-1 group-hover:scale-105 transition-transform" />
													<span className="text-xs font-semibold text-slate-700">
														Unggah foto penanganan
													</span>
													<span className="text-[10px] text-slate-400 mt-0.5">
														Dapat memilih beberapa
														foto sekaligus (Max 5MB)
													</span>
												</div>

												{imagePreviews.length > 0 && (
													<div className="mt-3 grid grid-cols-3 gap-2">
														{imagePreviews.map(
															(item, idx) => (
																<div
																	key={
																		item.id ||
																		idx
																	}
																	className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-square shadow-2xs"
																>
																	<img
																		src={
																			item.url
																		}
																		alt={`Preview ${
																			idx +
																			1
																		}`}
																		className="w-full h-full object-cover"
																	/>
																	<button
																		type="button"
																		onClick={(
																			e
																		) => {
																			e.stopPropagation();
																			handleRemoveImage(
																				idx
																			);
																		}}
																		className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 cursor-pointer"
																		title="Hapus foto"
																	>
																		<X className="w-3 h-3" />
																	</button>
																</div>
															)
														)}
														<button
															type="button"
															onClick={() =>
																adminFileInputRef.current?.click()
															}
															className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-lg aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
														>
															<Plus className="w-5 h-5" />
														</button>
													</div>
												)}
											</div>

											<button
												type="submit"
												className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
											>
												<Send className="w-4 h-4" />
												<span>
													Simpan Perubahan & Perbarui
													Status
												</span>
											</button>
										</form>
									</>
								)}
							</div>
						)}

						{/* Tab 2 Content: Timeline Riwayat Perkembangan */}
						{activeRightTab === "HISTORY" && (
							<div className="p-6 space-y-4">
								<div className="border-b border-slate-100 pb-3 flex items-center justify-between">
									<h3 className="font-bold text-slate-900 text-sm">
										Riwayat Perkembangan Laporan
									</h3>
								</div>

								<div
									data-lenis-prevent
									className="max-h-[420px] overflow-y-auto pr-3 py-1 scrollbar-thin"
								>
									<div className="relative pl-7 py-2">
										{historyItems.map((item, idx, arr) => {
											const isFirst = idx === 0;
											const isLast =
												idx === arr.length - 1;
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
														!isLast
															? "pb-6"
															: "pb-1"
													}`}
												>
													{!isLast && (
														<span className="absolute -left-[19px] top-3 -bottom-5 w-0.5 bg-slate-300 z-0"></span>
													)}
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
													{item.images &&
														item.images.length >
															0 && (
															<div className="pt-1.5 space-y-1">
																<span className="text-[10px] text-slate-400 block font-medium">
																	Lampiran
																	bukti (
																	{
																		item
																			.images
																			.length
																	}
																	):
																</span>
																<div className="flex flex-wrap items-center gap-1.5">
																	{item.images.map(
																		(
																			imgUrl,
																			imgIdx
																		) => (
																			<button
																				key={
																					imgIdx
																				}
																				type="button"
																				onClick={() =>
																					setLightboxState(
																						{
																							images: item.images,
																							index: imgIdx,
																						}
																					)
																				}
																				className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 w-12 h-12 shrink-0 cursor-pointer hover:ring-2 hover:ring-sky-500 transition-all shadow-2xs"
																			>
																				<img
																					src={
																						imgUrl
																					}
																					alt={`Bukti Riwayat ${
																						imgIdx +
																						1
																					}`}
																					className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
																				/>
																			</button>
																		)
																	)}
																</div>
															</div>
														)}

													<span className="text-[10px] text-slate-400 block text-right font-medium pt-1">
														Oleh:{" "}
														<span className="font-bold text-slate-700">
															{item.actor ||
																"Sistem"}
														</span>
													</span>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						)}
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
											prev.index ===
											prev.images.length - 1
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
								alt={`Pratinjau Foto ${
									lightboxState.index + 1
								}`}
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

			{/* Admin Confirmation Modal */}
			{isConfirmModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in duration-150">
						<div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
							<CheckCircle2 className="w-6 h-6" />
						</div>

						<div>
							<h3 className="font-bold text-slate-900 text-base">
								Konfirmasi Perubahan Status
							</h3>
							<p className="text-xs text-slate-600 mt-1">
								Apakah Anda yakin ingin memperbarui status
								laporan menjadi{" "}
								<strong className="text-sky-700">
									{updateStatus}
								</strong>
								?
							</p>
						</div>

						<div className="flex justify-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setIsConfirmModalOpen(false)}
								className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={executeProcessReport}
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
