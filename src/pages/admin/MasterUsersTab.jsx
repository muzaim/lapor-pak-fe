import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Pagination from "../../components/Pagination";
import LoadingOverlay from "../../components/LoadingOverlay";
import {
	Search,
	Filter,
	Shield,
	User,
	Users,
	RefreshCw,
	Mail,
	CheckCircle,
	Plus,
	Pencil,
	Trash2,
	X,
	AlertCircle,
	Key,
	UserCheck,
	Lock,
} from "lucide-react";

import { useToast } from "../../context/ToastContext";

export default function MasterUsersTab() {
	const { showToast } = useToast();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [loadingMsg, setLoadingMsg] = useState("");

	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("ALL");

	// Pagination State
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);

	// Modal State for Create User
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Form State
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "USER",
	});
	const [formError, setFormError] = useState("");

	// Modal State for Reset Password Confirmation
	const [isResetModalOpen, setIsResetModalOpen] = useState(false);
	const [userToReset, setUserToReset] = useState(null);

	const fetchUsers = async (isInitial = false) => {
		if (isInitial) setLoading(true);
		try {
			const res = await api.get("/admin/users", {
				params: { page, limit },
			});
			const raw = res.data;

			let userList = [];
			let total = 0;
			let pages = 1;

			if (Array.isArray(raw)) {
				userList = raw;
				total = raw.length;
				pages = Math.ceil(total / limit) || 1;
			} else if (raw?.users && Array.isArray(raw.users)) {
				userList = raw.users;
				total = raw.totalItems || raw.total || raw.count || userList.length;
				pages = raw.totalPages || raw.pages || Math.ceil(total / limit) || 1;
			} else if (raw?.data && Array.isArray(raw.data)) {
				userList = raw.data;
				const meta = raw.pagination || raw.meta || {};
				total = meta.totalItems || meta.total || userList.length;
				pages = meta.totalPages || meta.pages || Math.ceil(total / limit) || 1;
			} else if (raw?.data?.users && Array.isArray(raw.data.users)) {
				userList = raw.data.users;
				const meta = raw.data.pagination || raw.data.meta || raw.pagination || raw.meta || {};
				total = raw.data.totalItems || raw.data.total || meta.totalItems || meta.total || userList.length;
				pages = raw.data.totalPages || meta.totalPages || Math.ceil(total / limit) || 1;
			} else if (raw?.data?.data && Array.isArray(raw.data.data)) {
				userList = raw.data.data;
				const meta = raw.data.pagination || raw.data.meta || raw.pagination || raw.meta || {};
				total = meta.totalItems || meta.total || raw.data.totalItems || raw.data.total || userList.length;
				pages = meta.totalPages || Math.ceil(total / limit) || 1;
			} else if (raw?.items && Array.isArray(raw.items)) {
				userList = raw.items;
				total = raw.totalItems || raw.total || raw.count || userList.length;
				pages = raw.totalPages || Math.ceil(total / limit) || 1;
			} else if (raw?.data?.items && Array.isArray(raw.data.items)) {
				userList = raw.data.items;
				total = raw.data.totalItems || raw.data.total || userList.length;
				pages = raw.data.totalPages || Math.ceil(total / limit) || 1;
			}

			setUsers(userList);
			setTotalItems(total);
			setTotalPages(pages);
		} catch (err) {
			console.warn("GET /admin/users fallback", err);
		} finally {
			if (isInitial) setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(true);
	}, [page, limit]);

	const handleOpenCreateModal = () => {
		setFormData({
			name: "",
			email: "",
			password: "",
			role: "USER",
		});
		setFormError("");
		setIsModalOpen(true);
	};

	const handleOpenResetModal = (user) => {
		if (user?.role === "ADMIN") {
			showToast(
				"Akun Administrator bersifat sistem & tidak dapat direset!",
				"error"
			);
			return;
		}
		setUserToReset(user);
		setIsResetModalOpen(true);
	};

	const executeResetPassword = async () => {
		if (!userToReset) return;
		setIsResetModalOpen(false);
		setActionLoading(true);
		setLoadingMsg("Mereset Password User...");

		try {
			try {
				await api.post(`/admin/users/${userToReset.id}/reset-password`);
			} catch (err1) {
				try {
					await api.patch(`/admin/users/${userToReset.id}/reset-password`);
				} catch (err2) {
					await api.put(`/admin/users/${userToReset.id}`, {
						password: "123456",
					});
				}
			}

			showToast(
				`Password user ${userToReset.name} berhasil direset menjadi 123456!`,
				"success"
			);
			setUserToReset(null);
			fetchUsers(false);
		} catch (err) {
			console.error("Failed to reset password:", err);
			const msg =
				err.response?.data?.message || "Gagal mereset password user.";
			showToast(msg, "error");
		} finally {
			setActionLoading(false);
		}
	};

	const handleSaveUser = async (e) => {
		e.preventDefault();
		setFormError("");

		if (!formData.name.trim() || !formData.email.trim()) {
			setFormError("Nama dan email wajib diisi.");
			return;
		}

		if (!formData.password.trim()) {
			setFormError("Password wajib diisi untuk pengguna baru.");
			return;
		}

		setActionLoading(true);
		setLoadingMsg("Menambahkan Pengguna Baru...");

		try {
			await api.post("/admin/users", {
				name: formData.name,
				email: formData.email,
				password: formData.password,
				role: formData.role,
			});

			setActionLoading(false);
			setIsModalOpen(false);
			showToast("User baru berhasil ditambahkan!", "success");
			fetchUsers(false);
		} catch (err) {
			setActionLoading(false);
			const msg =
				err.response?.data?.message || "Gagal menyimpan data pengguna.";
			setFormError(msg);
			showToast(msg, "error");
		}
	};

	const filteredUsers = users.filter((u) => {
		const userRole = (u.role || u.peran || "").toUpperCase();
		const matchesRole = roleFilter === "ALL" || userRole === roleFilter;
		const userName = u.name || u.nama || u.fullName || u.username || "";
		const userEmail = u.email || "";
		const matchesSearch =
			userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			userEmail.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesRole && matchesSearch;
	});

	return (
		<div className="space-y-6 relative">
			{actionLoading && (
				<LoadingOverlay message={loadingMsg} backdrop="blank" />
			)}

			{/* Top Header Card */}
			<div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs">
				<div className="flex items-center gap-2.5">
					<Users className="w-5 h-5 text-slate-800 shrink-0" />
					<div>
						<h2 className="text-lg font-bold text-slate-900">
							Master Data User & Admin
						</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							Kelola pengguna terdaftar, tambah user baru, dan atur
							reset password akun
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => fetchUsers(true)}
						title="Refresh Data"
						aria-label="Refresh Data"
						className="p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
					>
						<RefreshCw
							className={`w-4 h-4 ${
								loading ? "animate-spin" : ""
							}`}
						/>
					</button>

					<button
						onClick={handleOpenCreateModal}
						className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer shadow-xs"
					>
						<Plus className="w-4 h-4" />
						Tambah User Baru
					</button>
				</div>
			</div>

			{/* Filter and Search Bar */}
			<div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
				<div className="relative w-full md:w-80">
					<Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Cari berdasarkan nama atau email..."
						className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-sky-500"
					/>
				</div>

				<div className="flex items-center gap-2 w-full md:w-auto">
					<span className="text-[11px] font-semibold text-slate-500 shrink-0">
						Peran (Role):
					</span>
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
					>
						<option value="ALL">Semua Role</option>
						<option value="USER">Masyarakat (USER)</option>
						<option value="ADMIN">Administrator (ADMIN)</option>
					</select>
				</div>
			</div>

			{/* Table */}
			{loading ? (
				<div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
					<div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
					<p className="text-xs text-slate-500">
						Memuat data pengguna...
					</p>
				</div>
			) : filteredUsers.length === 0 ? (
				<div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
					<User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
					<p className="text-xs font-bold text-slate-700">
						Tidak ada user ditemukan
					</p>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
								<tr>
									<th className="py-3 px-4 w-12 text-center">
										No
									</th>
									<th className="py-3 px-4">Nama Pengguna</th>
									<th className="py-3 px-4">Email</th>
									<th className="py-3 px-4">Peran (Role)</th>
									<th className="py-3 px-4 text-right">
										Aksi
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{filteredUsers.map((u, idx) => (
									<tr
										key={u.id}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3.5 px-4 text-center font-bold text-slate-600">
											{(page - 1) * limit + idx + 1}
										</td>

										<td className="py-3.5 px-4 font-bold text-slate-800">
											<div className="flex items-center gap-2">
												<div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
													{u.name
														? u.name
																.charAt(0)
																.toUpperCase()
														: "U"}
												</div>
												<span>{u.name}</span>
											</div>
										</td>

										<td className="py-3.5 px-4 text-slate-600">
											<div className="flex items-center gap-1.5">
												<Mail className="w-3.5 h-3.5 text-slate-400" />
												<span>{u.email}</span>
											</div>
										</td>

										<td className="py-3.5 px-4">
											{u.role === "ADMIN" ? (
												<span className="inline-block px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 rounded-lg border border-amber-200/60">
													Administrator
												</span>
											) : (
												<span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 rounded-lg">
													Masyarakat
												</span>
											)}
										</td>

										<td className="py-3.5 px-4 text-right">
											{(u.role || u.peran || "").toUpperCase() === "ADMIN" ? (
												<div className="flex items-center justify-end">
													<span
														className="p-1.5 text-slate-300 cursor-not-allowed"
														title="Akun Admin tidak dapat direset"
													>
														<Lock className="w-4 h-4 text-slate-300" />
													</span>
												</div>
											) : (
												<div className="flex items-center justify-end">
													<button
														type="button"
														onClick={() =>
															handleOpenResetModal(u)
														}
														className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
														title="Reset Password"
														aria-label="Reset Password"
													>
														<Key className="w-4 h-4" />
													</button>
												</div>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

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
			)}

			{/* Modal Form Create User Baru */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
						<div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
							<div className="flex items-center gap-2">
								<UserCheck className="w-5 h-5 text-sky-600" />
								<h3 className="font-bold text-slate-900 text-base">
									Tambah User Baru
								</h3>
							</div>
							<button
								onClick={() => setIsModalOpen(false)}
								className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<form
							onSubmit={handleSaveUser}
							className="p-6 space-y-4 text-xs"
						>
							{formError && (
								<div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
									<AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
									<span>{formError}</span>
								</div>
							)}

							<div>
								<label className="block font-semibold text-slate-700 mb-1">
									Nama Lengkap Pengguna{" "}
									<span className="text-rose-500">*</span>
								</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									placeholder="Contoh: Ahmad Prasetyo"
									className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 text-xs"
								/>
							</div>

							<div>
								<label className="block font-semibold text-slate-700 mb-1">
									Email{" "}
									<span className="text-rose-500">*</span>
								</label>
								<input
									type="email"
									required
									value={formData.email}
									onChange={(e) =>
										setFormData({
											...formData,
											email: e.target.value,
										})
									}
									placeholder="ahmad@laporpak.com"
									className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 text-xs"
								/>
							</div>

							<div>
								<label className="block font-semibold text-slate-700 mb-1">
									Password{" "}
									<span className="text-rose-500">*</span>
								</label>
								<input
									type="password"
									required
									value={formData.password}
									onChange={(e) =>
										setFormData({
											...formData,
											password: e.target.value,
										})
									}
									placeholder="••••••••"
									className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 text-xs"
								/>
							</div>

							<div>
								<label className="block font-semibold text-slate-700 mb-1">
									Peran Pengguna (Role){" "}
									<span className="text-rose-500">*</span>
								</label>
								<select
									value={formData.role}
									onChange={(e) =>
										setFormData({
											...formData,
											role: e.target.value,
										})
									}
									className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 text-xs font-bold text-slate-800"
								>
									<option value="USER">
										USER - Masyarakat Umum
									</option>
									<option value="ADMIN">
										ADMIN - Administrator Sistem
									</option>
								</select>
							</div>

							<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold cursor-pointer"
								>
									Simpan User Baru
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal Confirm Reset Password */}
			{isResetModalOpen && userToReset && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
						<div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
							<div className="flex items-center gap-2.5">
								<Key className="w-5 h-5 text-slate-700 shrink-0" />
								<h3 className="font-bold text-slate-900 text-base">
									Reset Password User
								</h3>
							</div>
							<button
								onClick={() => {
									setIsResetModalOpen(false);
									setUserToReset(null);
								}}
								className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-6 space-y-4 text-xs">
							<p className="text-slate-600 leading-relaxed">
								Apakah Anda yakin ingin mereset password untuk akun{" "}
								<strong className="text-slate-900 font-bold">{userToReset.name || userToReset.nama}</strong> ({userToReset.email})?
							</p>

							<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
								<div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
									Informasi Password Baru
								</div>
								<div className="text-xs font-medium text-slate-700">
									Password akan di-reset otomatis menjadi:{" "}
									<span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60 inline-block ml-1">
										123456
									</span>
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => {
										setIsResetModalOpen(false);
										setUserToReset(null);
									}}
									className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={executeResetPassword}
									className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
								>
									Reset Password
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
