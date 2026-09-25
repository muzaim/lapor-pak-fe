import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import { formatDate } from "../utils/dateUtils";
import { encodeId } from "../utils/idUtils";
import {
	FileText,
	Plus,
	Search,
	Calendar,
	MapPin,
	RefreshCw,
	MessageSquare,
	ChevronRight,
} from "lucide-react";

export default function UserDashboardPage() {
	const navigate = useNavigate();
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [categoryFilter, setCategoryFilter] = useState("ALL");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	// Pagination State
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);

	const fetchMyReports = async () => {
		setLoading(true);
		try {
			const res = await api.get("/reports", {
				params: { page, limit },
			});
			const raw = res.data;

			let reportList = [];
			let total = 0;
			let pages = 1;

			if (Array.isArray(raw)) {
				reportList = raw;
				total = raw.length;
				pages = Math.ceil(total / limit) || 1;
			} else if (raw?.reports && Array.isArray(raw.reports)) {
				reportList = raw.reports;
				total =
					raw.totalItems ||
					raw.total ||
					raw.count ||
					reportList.length;
				pages = raw.totalPages || Math.ceil(total / limit) || 1;
			} else if (raw?.data && Array.isArray(raw.data)) {
				reportList = raw.data;
				const meta = raw.pagination || raw.meta || {};
				total = meta.totalItems || meta.total || reportList.length;
				pages = meta.totalPages || Math.ceil(total / limit) || 1;
			}

			setReports(reportList);
			setTotalItems(total);
			setTotalPages(pages);
		} catch (err) {
			console.error("Failed to fetch user reports:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMyReports();
	}, [page, limit]);

	const handleResetFilter = () => {
		setStatusFilter("ALL");
		setCategoryFilter("ALL");
		setStartDate("");
		setEndDate("");
		setSearchQuery("");
	};

	const isFiltered =
		statusFilter !== "ALL" ||
		categoryFilter !== "ALL" ||
		startDate !== "" ||
		endDate !== "" ||
		searchQuery !== "";

	const filteredReports = reports.filter((item) => {
		const matchesStatus =
			statusFilter === "ALL" || item.status === statusFilter;

		const matchesCategory =
			categoryFilter === "ALL" ||
			(item.category &&
				item.category.toLowerCase() === categoryFilter.toLowerCase());

		const matchesSearch =
			!searchQuery ||
			(item.title &&
				item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
			(item.location &&
				item.location
					.toLowerCase()
					.includes(searchQuery.toLowerCase())) ||
			(item.description &&
				item.description
					.toLowerCase()
					.includes(searchQuery.toLowerCase())) ||
			(item.category &&
				item.category
					.toLowerCase()
					.includes(searchQuery.toLowerCase()));

		let matchesDate = true;
		if (startDate || endDate) {
			const itemDate = new Date(item.created_at);
			if (startDate) {
				const start = new Date(startDate);
				start.setHours(0, 0, 0, 0);
				if (itemDate < start) matchesDate = false;
			}
			if (endDate) {
				const end = new Date(endDate);
				end.setHours(23, 59, 59, 999);
				if (itemDate > end) matchesDate = false;
			}
		}

		return matchesStatus && matchesCategory && matchesSearch && matchesDate;
	});

	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
			{/* Header Banner */}
			<div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-bold text-slate-900">
						Laporan Saya
					</h1>
					<p className="text-xs text-slate-500 mt-0.5">
						Daftar riwayat dan progres pengaduan yang telah Anda
						sampaikan
					</p>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={fetchMyReports}
						className="p-2 text-slate-600 hover:text-sky-600 bg-slate-100 rounded-lg transition-colors cursor-pointer"
						title="Muat Ulang Data"
					>
						<RefreshCw
							className={`w-4 h-4 ${
								loading ? "animate-spin" : ""
							}`}
						/>
					</button>

					<Link
						to="/reports/create"
						className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
					>
						<Plus className="w-4 h-4" />
						Buat Laporan Baru
					</Link>
				</div>
			</div>

			{/* Filter Card - Full filter parameters matching Admin */}
			<div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
				{/* Search Row */}
				<div>
					<label className="block text-[11px] font-bold text-slate-600 mb-1.5">
						Pencarian Laporan
					</label>
					<div className="relative">
						<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Cari berdasarkan kata kunci judul, deskripsi, atau lokasi..."
							className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
						/>
					</div>
				</div>

				{/* 4-Column Grid for Selects & Dates */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Status Combobox */}
					<div>
						<label className="block text-[11px] font-bold text-slate-600 mb-1.5">
							Status Laporan
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors"
						>
							<option value="ALL">Semua Status</option>
							<option value="DIAJUKAN">Diajukan</option>
							<option value="MENUNGGU">Menunggu</option>
							<option value="DIPROSES">Diproses</option>
							<option value="SELESAI">Selesai</option>
							<option value="DITOLAK">Ditolak</option>
						</select>
					</div>

					{/* Kategori Combobox */}
					<div>
						<label className="block text-[11px] font-bold text-slate-600 mb-1.5">
							Kategori Laporan
						</label>
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors"
						>
							<option value="ALL">Semua Kategori</option>
							<option value="Infrastruktur">Infrastruktur</option>
							<option value="Pelayanan Publik">Pelayanan Publik</option>
							<option value="Kebersihan">Kebersihan</option>
							<option value="Keamanan & Ketertiban">Keamanan & Ketertiban</option>
							<option value="Lain-lain">Lain-lain</option>
						</select>
					</div>

					{/* Dari Tanggal */}
					<div>
						<label className="block text-[11px] font-bold text-slate-600 mb-1.5">
							Dari Tanggal
						</label>
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors"
						/>
					</div>

					{/* Sampai Tanggal */}
					<div>
						<label className="block text-[11px] font-bold text-slate-600 mb-1.5">
							Sampai Tanggal
						</label>
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors"
						/>
					</div>
				</div>

				{/* Reset Filter Button Row */}
				{isFiltered && (
					<div className="flex justify-end pt-2 border-t border-slate-100">
						<button
							type="button"
							onClick={handleResetFilter}
							className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
						>
							Reset Filter
						</button>
					</div>
				)}
			</div>

			{/* Cards list */}
			{loading ? (
				<div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
					<div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
					<p className="text-xs text-slate-500">
						Memuat laporan Anda...
					</p>
				</div>
			) : filteredReports.length === 0 ? (
				<div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md mx-auto">
					<FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
					<p className="text-xs font-bold text-slate-700">
						Belum ada laporan pengaduan
					</p>
					<p className="text-[11px] text-slate-500 mt-1 mb-4">
						{searchQuery || statusFilter !== "ALL"
							? "Tidak ditemukan laporan yang sesuai dengan kata kunci/filter."
							: "Anda belum mengirimkan laporan pengaduan."}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{/* Scrollable Fixed Height Cards Container with Lenis Prevent */}
					<div
						data-lenis-prevent
						className="max-h-[460px] sm:max-h-[520px] overflow-y-auto pr-1.5 scrollbar-thin"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredReports.map((report) => (
								<div
									key={report.id}
									onClick={() =>
										navigate(
											`/reports/${encodeId(report.id)}`
										)
									}
									className="bg-white rounded-xl border border-slate-200 hover:border-sky-400 transition-colors p-4 flex flex-col justify-between cursor-pointer space-y-3 group"
								>
									<div>
										<div className="flex items-center justify-between gap-2 mb-2">
											<span className="px-2 py-0.5 text-[10px] font-bold text-sky-800 bg-sky-50 rounded border border-sky-100">
												{report.category}
											</span>
											<StatusBadge
												status={report.status}
											/>
										</div>

										<h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-sky-600 transition-colors">
											{report.title}
										</h3>

										<p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
											{report.description}
										</p>
									</div>

									<div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
										<div className="flex items-center gap-1 truncate">
											<MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
											<span className="truncate">
												{report.location}
											</span>
										</div>

										<div className="flex items-center justify-between pt-1">
											<span className="flex items-center gap-1 text-[10px]">
												<Calendar className="w-3 h-3 text-slate-400" />
												{formatDate(report.created_at)}
											</span>

											<span className="flex items-center gap-1 text-sky-600 font-bold text-[10px]">
												Detail{" "}
												<ChevronRight className="w-3 h-3" />
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="pt-1">
						<Pagination
							currentPage={page}
							totalPages={totalPages}
							totalItems={totalItems}
							limit={limit}
							onPageChange={(newPage) => setPage(newPage)}
							onLimitChange={(newLimit) => {
								setLimit(newLimit);
								setPage(1);
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
