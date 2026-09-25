import React, { useState, useEffect } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/dateUtils";
import {
	Search,
	Filter,
	RefreshCw,
	CheckCircle2,
	Clock,
	Eye,
	XCircle,
	MapPin,
	Edit3,
	X,
	AlertCircle,
	FileText,
	User,
} from "lucide-react";

export default function AdminDashboardPage() {
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [searchQuery, setSearchQuery] = useState("");

	// Update modal state
	const [selectedReport, setSelectedReport] = useState(null);
	const [updateStatus, setUpdateStatus] = useState("IN_REVIEW");
	const [adminResponseText, setAdminResponseText] = useState("");
	const [updating, setUpdating] = useState(false);
	const [feedbackMsg, setFeedbackMsg] = useState("");

	const fetchAdminReports = async () => {
		setLoading(true);
		try {
			const res = await api.get("/admin/reports");
			const data = res.data?.reports || res.data?.data || res.data || [];
			setReports(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Failed to fetch admin reports:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAdminReports();
	}, []);

	const openProcessModal = (report) => {
		setSelectedReport(report);
		setUpdateStatus(report.status || "DIPROSES");
		setAdminResponseText(report.admin_response || "");
		setFeedbackMsg("");
	};

	const handleUpdateReport = async (e) => {
		e.preventDefault();
		if (!selectedReport) return;

		setUpdating(true);
		setFeedbackMsg("");

		try {
			await api.patch(`/admin/reports/${selectedReport.id}`, {
				status: updateStatus,
				admin_response: adminResponseText,
			});

			setUpdating(false);
			setSelectedReport(null);
			fetchAdminReports();
		} catch (err) {
			setUpdating(false);
			const msg =
				err.response?.data?.message ||
				"Gagal memperbarui status laporan.";
			setFeedbackMsg(msg);
		}
	};

	// Stats computation (Akumulasi Total & Filter Status Indonesia)
	const totalCount = reports.length;
	const pendingCount = reports.filter((r) => {
		const st = String(r.status || "").toUpperCase();
		return st === "MENUNGGU" || st === "PENDING" || st === "DIAJUKAN";
	}).length;

	const inReviewCount = reports.filter((r) => {
		const st = String(r.status || "").toUpperCase();
		return st === "DIPROSES" || st === "IN_REVIEW";
	}).length;

	const resolvedCount = reports.filter((r) => {
		const st = String(r.status || "").toUpperCase();
		return st === "SELESAI" || st === "RESOLVED";
	}).length;

	const rejectedCount = reports.filter((r) => {
		const st = String(r.status || "").toUpperCase();
		return st === "DITOLAK" || st === "REJECTED";
	}).length;

	const filteredReports = reports.filter((item) => {
		const st = String(item.status || "").toUpperCase();
		let matchesStatus = true;
		if (statusFilter === "MENUNGGU") {
			matchesStatus = st === "MENUNGGU" || st === "PENDING" || st === "DIAJUKAN";
		} else if (statusFilter === "DIPROSES") {
			matchesStatus = st === "DIPROSES" || st === "IN_REVIEW";
		} else if (statusFilter === "SELESAI") {
			matchesStatus = st === "SELESAI" || st === "RESOLVED";
		} else if (statusFilter === "DITOLAK") {
			matchesStatus = st === "DITOLAK" || st === "REJECTED";
		}

		const matchesSearch =
			!searchQuery ||
			(item.title &&
				item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
			(item.location &&
				item.location
					.toLowerCase()
					.includes(searchQuery.toLowerCase())) ||
			(item.category &&
				item.category
					.toLowerCase()
					.includes(searchQuery.toLowerCase()));
		return matchesStatus && matchesSearch;
	});

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Top Header Card */}
			<div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[11px] font-bold uppercase tracking-wider mb-1">
						Panel Administrator
					</div>
					<h1 className="text-xl font-bold text-slate-900">
						Dashboard Pengelolaan Laporan Pengaduan
					</h1>
					<p className="text-xs text-slate-500 mt-0.5">
						Kelola seluruh pengaduan masyarakat, perbarui status,
						dan berikan respon resmi
					</p>
				</div>

				<button
					onClick={fetchAdminReports}
					title="Refresh Data"
					aria-label="Refresh Data"
					className="p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto flex items-center justify-center shrink-0"
				>
					<RefreshCw
						className={`w-4 h-4 ${
							loading ? "animate-spin" : ""
						}`}
					/>
				</button>
			</div>

			{/* Metrics Bar */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
				<button
					onClick={() => setStatusFilter("ALL")}
					className={`bg-white p-4 rounded-xl border text-left cursor-pointer transition-all ${
						statusFilter === "ALL"
							? "border-sky-600 bg-sky-50/50 font-bold"
							: "border-slate-200 hover:border-slate-300"
					}`}
				>
					<p className="text-[11px] text-slate-500 font-medium">
						Total Pengajuan
					</p>
					<p className="text-xl font-bold text-slate-900 mt-0.5">
						{totalCount}
					</p>
				</button>

				<button
					onClick={() => setStatusFilter("MENUNGGU")}
					className={`bg-white p-4 rounded-xl border text-left cursor-pointer transition-all ${
						statusFilter === "MENUNGGU" || statusFilter === "PENDING"
							? "border-amber-500 bg-amber-50/50 font-bold"
							: "border-slate-200 hover:border-slate-300"
					}`}
				>
					<div className="flex items-center justify-between">
						<p className="text-[11px] text-amber-700 font-semibold">
							Menunggu
						</p>
						<Clock className="w-3.5 h-3.5 text-amber-500" />
					</div>
					<p className="text-xl font-bold text-slate-900 mt-0.5">
						{pendingCount}
					</p>
				</button>

				<button
					onClick={() => setStatusFilter("DIPROSES")}
					className={`bg-white p-4 rounded-xl border text-left cursor-pointer transition-all ${
						statusFilter === "DIPROSES" || statusFilter === "IN_REVIEW"
							? "border-sky-500 bg-sky-50/50 font-bold"
							: "border-slate-200 hover:border-slate-300"
					}`}
				>
					<div className="flex items-center justify-between">
						<p className="text-[11px] text-sky-700 font-semibold">
							Sedang Diproses
						</p>
						<Eye className="w-3.5 h-3.5 text-sky-500" />
					</div>
					<p className="text-xl font-bold text-slate-900 mt-0.5">
						{inReviewCount}
					</p>
				</button>

				<button
					onClick={() => setStatusFilter("SELESAI")}
					className={`bg-white p-4 rounded-xl border text-left cursor-pointer transition-all ${
						statusFilter === "SELESAI" || statusFilter === "RESOLVED"
							? "border-emerald-500 bg-emerald-50/50 font-bold"
							: "border-slate-200 hover:border-slate-300"
					}`}
				>
					<div className="flex items-center justify-between">
						<p className="text-[11px] text-emerald-700 font-semibold">
							Selesai
						</p>
						<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
					</div>
					<p className="text-xl font-bold text-slate-900 mt-0.5">
						{resolvedCount}
					</p>
				</button>

				<button
					onClick={() => setStatusFilter("DITOLAK")}
					className={`bg-white p-4 rounded-xl border text-left cursor-pointer transition-all ${
						statusFilter === "DITOLAK" || statusFilter === "REJECTED"
							? "border-rose-500 bg-rose-50/50 font-bold"
							: "border-slate-200 hover:border-slate-300"
					}`}
				>
					<div className="flex items-center justify-between">
						<p className="text-[11px] text-rose-700 font-semibold">
							Ditolak
						</p>
						<XCircle className="w-3.5 h-3.5 text-rose-500" />
					</div>
					<p className="text-xl font-bold text-slate-900 mt-0.5">
						{rejectedCount}
					</p>
				</button>
			</div>

			{/* Filter and Search */}
			<div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200">
				<div className="relative w-full md:w-80">
					<Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Cari berdasarkan judul atau lokasi..."
						className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-sky-500"
					/>
				</div>

				<div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
					<span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
						<Filter className="w-3 h-3" /> Status:
					</span>
					{[
						{ id: "ALL", label: "Semua" },
						{ id: "DIAJUKAN", label: "Diajukan" },
						{ id: "MENUNGGU", label: "Menunggu" },
						{ id: "DIPROSES", label: "Diproses" },
						{ id: "SELESAI", label: "Selesai" },
						{ id: "DITOLAK", label: "Ditolak" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setStatusFilter(tab.id)}
							className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 cursor-pointer ${
								statusFilter === tab.id
									? "bg-sky-600 text-white"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Data Table */}
			{loading ? (
				<div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
					<div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
					<p className="text-xs text-slate-500">
						Memuat daftar laporan pengaduan...
					</p>
				</div>
			) : filteredReports.length === 0 ? (
				<div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
					<p className="text-xs font-bold text-slate-700">
						Tidak ada data laporan pengaduan
					</p>
					<p className="text-[11px] text-slate-500 mt-0.5">
						Sesuaikan pencarian atau filter status untuk melihat
						data lain.
					</p>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
								<tr>
									<th className="py-3 px-4">ID / Tanggal</th>
									<th className="py-3 px-4">
										Judul & Kategori
									</th>
									<th className="py-3 px-4">
										Lokasi Kejadian
									</th>
									<th className="py-3 px-4">
										Status Saat Ini
									</th>
									<th className="py-3 px-4 text-right">
										Tindakan Admin
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{filteredReports.map((report) => (
									<tr
										key={report.id}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3.5 px-4 whitespace-nowrap">
											<span className="font-bold text-slate-900 block">
												#{report.id}
											</span>
											<span className="text-[10px] text-slate-400">
												{formatDate(report.created_at)}
											</span>
										</td>

										<td className="py-3.5 px-4">
											<div className="max-w-md">
												<span className="inline-block px-2 py-0.5 text-[10px] font-bold text-sky-800 bg-sky-50 rounded border border-sky-100 mb-1">
													{report.category}
												</span>
												<p className="font-bold text-slate-900 text-xs line-clamp-1">
													{report.title}
												</p>
												<p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
													{report.description}
												</p>
											</div>
										</td>

										<td className="py-3.5 px-4">
											<div className="flex items-center gap-1 text-slate-600 max-w-xs truncate">
												<MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
												<span className="truncate text-xs">
													{report.location}
												</span>
											</div>
										</td>

										<td className="py-3.5 px-4 whitespace-nowrap">
											<StatusBadge
												status={report.status}
											/>
										</td>

										<td className="py-3.5 px-4 text-right whitespace-nowrap">
											<button
												onClick={() =>
													openProcessModal(report)
												}
												className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
											>
												<Edit3 className="w-3 h-3" />
												Proses Laporan
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Admin Status Processing Modal */}
			{selectedReport && (
				<div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
						<button
							onClick={() => setSelectedReport(null)}
							className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full cursor-pointer"
						>
							<X className="w-4 h-4" />
						</button>

						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
								<Edit3 className="w-4 h-4" />
							</div>
							<div>
								<h2 className="text-base font-bold text-slate-900">
									Proses Laporan #{selectedReport.id}
								</h2>
								<p className="text-xs text-slate-500">
									Ubah status & masukan respon resmi petugas
								</p>
							</div>
						</div>

						{/* Report Brief info */}
						<div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
							<div className="flex justify-between items-center">
								<h3 className="font-bold text-slate-900">
									{selectedReport.title}
								</h3>
								<StatusBadge status={selectedReport.status} />
							</div>
							<p className="text-slate-600 leading-relaxed">
								{selectedReport.description}
							</p>
							<p className="text-[11px] text-slate-500">
								📍 Lokasi: {selectedReport.location}
							</p>
						</div>

						{selectedReport.status === "RESOLVED" ||
						selectedReport.status === "REJECTED" ? (
							<div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
								<p className="text-xs text-slate-600 font-semibold">
									Status Laporan Final (
									<StatusBadge
										status={selectedReport.status}
									/>
									). Form pemrosesan telah ditutup.
								</p>
								<button
									type="button"
									onClick={() => setSelectedReport(null)}
									className="mt-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg cursor-pointer"
								>
									Tutup
								</button>
							</div>
						) : (
							<>
								{feedbackMsg && (
									<div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
										<AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
										<span>{feedbackMsg}</span>
									</div>
								)}

								<form
									onSubmit={handleUpdateReport}
									className="space-y-3 pt-1"
								>
									<div>
										<label className="block text-xs font-semibold text-slate-700 mb-1">
											Status Baru
										</label>
										<select
											value={updateStatus}
											onChange={(e) =>
												setUpdateStatus(e.target.value)
											}
											className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
										>
											{selectedReport.status === "DIAJUKAN" && (
												<>
													<option value="MENUNGGU">Menunggu</option>
													<option value="DIPROSES">Diproses</option>
													<option value="DITOLAK">Ditolak</option>
												</>
											)}
											{(selectedReport.status === "PENDING" || selectedReport.status === "MENUNGGU") && (
												<>
													<option value="DIPROSES">Diproses</option>
												</>
											)}
											{(selectedReport.status === "IN_REVIEW" || selectedReport.status === "DIPROSES") && (
												<>
													<option value="MENUNGGU">Menunggu</option>
													<option value="SELESAI">Selesai</option>
												</>
											)}
										</select>
									</div>

									<div>
										<label className="block text-xs font-semibold text-slate-700 mb-1">
											Tanggapan Resmi Admin / Petugas
										</label>
										<textarea
											rows={3}
											value={adminResponseText}
											onChange={(e) =>
												setAdminResponseText(
													e.target.value
												)
											}
											placeholder="Contoh: Laporan diterima dan sudah ditindaklanjuti oleh dinas terkait pada lokasi..."
											className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-sky-500"
										/>
									</div>

									<div className="flex justify-end gap-2 pt-2">
										<button
											type="button"
											onClick={() =>
												setSelectedReport(null)
											}
											className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
										>
											Batal
										</button>
										<button
											type="submit"
											disabled={updating}
											className="px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
										>
											{updating
												? "Menyimpan..."
												: "Simpan Status & Respon"}
										</button>
									</div>
								</form>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
