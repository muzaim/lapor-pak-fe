import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";
import LoadingOverlay from "../../components/LoadingOverlay";
import { formatDate } from "../../utils/dateUtils";
import {
	ArrowLeft,
	MapPin,
	Calendar,
	Edit3,
	Send,
	History,
	Image as ImageIcon,
	AlertCircle,
	CheckCircle,
	FileText,
} from "lucide-react";

export default function AdminReportDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(true);
	const [updateStatus, setUpdateStatus] = useState("IN_REVIEW");
	const [adminComment, setAdminComment] = useState("");
	const [updating, setUpdating] = useState(false);
	const [feedbackMsg, setFeedbackMsg] = useState("");

	const fetchReportDetail = async () => {
		setLoading(true);
		try {
			const res = await api.get(`/admin/reports/${id}`);
			const data = res.data?.report || res.data?.data || res.data;
			if (data && typeof data === "object") {
				setReport(data);
				setUpdateStatus(data.status || "PENDING");
			}
		} catch (err) {
			console.warn("GET /admin/reports/:id fallback", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReportDetail();
	}, [id]);

	const handleProcessReport = async (e) => {
		e.preventDefault();
		if (!report) return;

		if (!adminComment.trim()) {
			setFeedbackMsg(
				"Harap tuliskan komentar / catatan riwayat perubahan status."
			);
			return;
		}

		setUpdating(true);
		setFeedbackMsg("");

		try {
			await api.patch(`/admin/reports/${id}`, {
				status: updateStatus,
				admin_response: adminComment,
			});

			const newHistoryItem = {
				id: Date.now(),
				status: updateStatus,
				comment: adminComment,
				created_at: new Date().toISOString(),
				actor: "Admin",
			};

			setReport((prev) => {
				const existing = Array.isArray(prev?.history)
					? prev.history
					: [];
				return {
					...prev,
					status: updateStatus,
					admin_response: adminComment,
					history: [newHistoryItem, ...existing],
				};
			});

			// Professional loading animation
			setTimeout(() => {
				setUpdating(false);
				setAdminComment("");
				fetchReportDetail();
			}, 1500);
		} catch (err) {
			setUpdating(false);
			const msg =
				err.response?.data?.message ||
				"Gagal memperbarui status laporan.";
			setFeedbackMsg(msg);
		}
	};

	const getHistoryItems = (detail) => {
		if (
			detail?.history &&
			Array.isArray(detail.history) &&
			detail.history.length > 0
		) {
			return detail.history;
		}

		const historyList = [];
		if (detail?.admin_response) {
			historyList.push({
				id: 2,
				status: detail.status,
				comment: detail.admin_response,
				created_at: detail.updated_at || new Date().toISOString(),
				actor: "Admin / Petugas",
			});
		}

		historyList.push({
			id: 1,
			status: "PENDING",
			comment: "Laporan baru saja dibuat oleh pelapor.",
			created_at: detail?.created_at || new Date().toISOString(),
			actor: "Pelapor (Pengguna)",
		});

		return historyList;
	};

	if (loading) {
		return (
			<div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
				<div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
				<p className="text-xs text-slate-500 font-semibold">
					Memuat rincian laporan #{id}...
				</p>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-4">
				<AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
				<h3 className="font-bold text-slate-800 text-base">
					Laporan Tidak Ditemukan
				</h3>
				<p className="text-xs text-slate-500">
					Laporan dengan ID #{id} tidak ada atau telah dihapus.
				</p>
				<Link
					to="/laporan"
					className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-lg"
				>
					<ArrowLeft className="w-4 h-4" /> Kembali ke Master Laporan
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6 relative">
			{updating && (
				<LoadingOverlay
					message="Memperbarui Status & Mencatat Riwayat Komentar..."
					backdrop="blank"
				/>
			)}

			{/* Back button & top bar */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
				<Link
					to="/laporan"
					className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
				>
					<ArrowLeft className="w-4 h-4" />
					Kembali ke Data Laporan
				</Link>

				<div className="flex items-center gap-2">
					<StatusBadge status={report.status} />
					<span className="text-xs text-slate-400 font-mono">
						ID #{report.id}
					</span>
				</div>
			</div>

			{/* 2-Column Full Page Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left Column (7 cols): Card Detail Laporan & Foto Bukti */}
				<div className="lg:col-span-7 space-y-6">
					{/* Main Detail Card */}
					<div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
						<div className="border-b border-slate-100 pb-4">
							<span className="px-2.5 py-0.5 text-[11px] font-bold text-sky-800 bg-sky-50 rounded border border-sky-100 mb-2 inline-block">
								{report.category}
							</span>
							<h1 className="text-xl font-extrabold text-slate-900 leading-snug">
								{report.title}
							</h1>

							<div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
								<span className="flex items-center gap-1.5 font-medium">
									<MapPin className="w-4 h-4 text-sky-600" />
									{report.location}
								</span>
								<span className="flex items-center gap-1.5">
									<Calendar className="w-4 h-4 text-slate-400" />
									{formatDate(report.created_at)}
								</span>
							</div>
						</div>

						<div>
							<h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
								Deskripsi Pengaduan Lengkap
							</h3>
							<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
								{report.description}
							</div>
						</div>

						{/* Lampiran Foto Bukti */}
						{(report.image_url || report.image) && (
							<div>
								<h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
									<ImageIcon className="w-4 h-4 text-sky-600" />{" "}
									Lampiran bukti
								</h3>
								<div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex justify-center">
									<img
										src={
											report.image_url ||
											(report.image?.startsWith("http")
												? report.image
												: `${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}${report.image}`)
										}
										alt="Foto Bukti"
										className="max-h-80 object-contain"
									/>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Right Column (5 cols): Form Proses Status & Timeline Riwayat */}
				<div className="lg:col-span-5 space-y-6">
					{/* Card Form Proses Laporan */}
					<div className="bg-white p-6 rounded-2xl border border-sky-200 bg-sky-50/20 space-y-4 shadow-xs">
						<div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
							<div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
								<Edit3 className="w-4.5 h-4.5" />
							</div>
							<div>
								<h3 className="font-bold text-slate-900 text-sm">
									Proses & Perbarui Status
								</h3>
								<p className="text-[11px] text-slate-500">
									Ubah status pengaduan & tuliskan komentar
								</p>
							</div>
						</div>

						{feedbackMsg && (
							<div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
								<AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
								<span>{feedbackMsg}</span>
							</div>
						)}

						<form
							onSubmit={handleProcessReport}
							className="space-y-4 text-xs"
						>
							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1.5">
									Pilih Status Baru{" "}
									<span className="text-rose-500">*</span>
								</label>
								<select
									value={updateStatus}
									onChange={(e) =>
										setUpdateStatus(e.target.value)
									}
									className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:border-sky-500"
								>
									<option value="PENDING">
										PENDING - Menunggu Peninjauan
									</option>
									<option value="IN_REVIEW">
										IN_REVIEW - Sedang Diproses (Review)
									</option>
									<option value="RESOLVED">
										RESOLVED - Sudah Diselesaikan
									</option>
									<option value="REJECTED">
										REJECTED - Ditolak / Tidak Valid
									</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1.5">
									Komentar
									<span className="text-rose-500">*</span>
								</label>
								<textarea
									rows={4}
									required
									value={adminComment}
									onChange={(e) =>
										setAdminComment(e.target.value)
									}
									placeholder="Tuliskan komentar riwayat, contoh: 'Sedang dilakukan peninjauan oleh tim lapangan', 'Sudah diselesaikan', dll..."
									className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-sky-500"
								/>
							</div>

							<button
								type="submit"
								disabled={updating}
								className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
							>
								<Send className="w-4 h-4" />
								<span>Simpan Perubahan & Komentar</span>
							</button>
						</form>
					</div>

					{/* Card Timeline Riwayat Status */}
					<div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
						<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
							<History className="w-4.5 h-4.5 text-sky-600" />
							<h3 className="font-bold text-slate-900 text-sm">
								Riwayat Perjalanan Status & Komentar
							</h3>
						</div>

						<div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
							{getHistoryItems(report).map((item, idx) => (
								<div key={idx} className="relative text-xs">
									<span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-sky-600 ring-4 ring-white"></span>

									<div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
										<div className="flex items-center justify-between gap-2">
											<StatusBadge status={item.status} />
											<span className="text-[10px] text-slate-400 font-mono">
												{formatDate(item.created_at)}
											</span>
										</div>

										<p className="text-slate-700 text-xs font-medium leading-relaxed mt-1">
											{item.comment ||
												item.message ||
												"Perubahan status dicatat."}
										</p>

										<span className="text-[10px] text-slate-400 block text-right font-semibold">
											Oleh: {item.actor || "Admin"}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
