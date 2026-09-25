import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import LoadingOverlay from "../components/LoadingOverlay";
import {
	PlusCircle,
	Upload,
	MapPin,
	Tag,
	FileText,
	ArrowLeft,
	Image as ImageIcon,
	AlertCircle,
	CheckCircle2,
	X,
	Plus,
} from "lucide-react";

import { useToast } from "../context/ToastContext";

export default function CreateReportPage() {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const fileInputRef = useRef(null);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("Infrastruktur");
	const [location, setLocation] = useState("");

	// Multiple image state
	const [imageFiles, setImageFiles] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// Confirmation Modal state
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	const categories = [
		"Infrastruktur",
		"Pelayanan Publik",
		"Kebersihan",
		"Keamanan & Ketertiban",
		"Lain-lain",
	];

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		const validFiles = [];
		const newPreviews = [];

		for (const file of files) {
			if (file.size > 5 * 1024 * 1024) {
				setErrorMessage(
					`File ${file.name} melebihi batas ukuran maksimal 5MB.`
				);
				return;
			}
			validFiles.push(file);
			newPreviews.push({
				id: Math.random().toString(36).substring(2, 9),
				file,
				url: URL.createObjectURL(file),
			});
		}

		setErrorMessage("");
		setImageFiles((prev) => [...prev, ...validFiles]);
		setImagePreviews((prev) => [...prev, ...newPreviews]);

		// Reset input so re-selecting same file triggers onChange
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
		if (!title || !description || !category || !location) {
			setErrorMessage("Harap lengkapi semua bidang bertanda wajib (*).");
			return;
		}
		setErrorMessage("");
		setIsConfirmModalOpen(true);
	};

	const executeCreateReport = async () => {
		setIsConfirmModalOpen(false);
		setLoading(true);
		setErrorMessage("");

		try {
			const formData = new FormData();
			formData.append("title", title);
			formData.append("description", description);
			formData.append("category", category);
			formData.append("location", location);

			// Append multiple images for backend
			imageFiles.forEach((file) => {
				formData.append("images", file);
			});

			await api.post("/reports", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setTimeout(() => {
				setLoading(false);
				showToast("Laporan berhasil dikirimkan!", "success");
				navigate("/reports");
			}, 300);
		} catch (err) {
			setLoading(false);
			const msg =
				err.response?.data?.message ||
				"Gagal mengirim laporan. Periksa jaringan Anda.";
			setErrorMessage(msg);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative">
			{loading && (
				<LoadingOverlay
					message="Mengunggah Berkas & Mengirim Laporan..."
					backdrop="blank"
				/>
			)}

			{/* Back button */}
			<Link
				to="/reports"
				className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 cursor-pointer transition-colors"
			>
				<ArrowLeft className="w-4 h-4" />
				Kembali ke Laporan Saya
			</Link>

			<div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8">
				<div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
					<div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
						<PlusCircle className="w-6 h-6" />
					</div>
					<div>
						<h1 className="text-xl font-bold text-slate-900">
							Buat Laporan Pengaduan Baru
						</h1>
						<p className="text-xs text-slate-500">
							Sampaikan pengaduan Anda dengan detail dan akurat
						</p>
					</div>
				</div>

				{errorMessage && (
					<div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
						<AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
						<span>{errorMessage}</span>
					</div>
				)}

				<form onSubmit={handleFormSubmit} className="space-y-5">
					{/* Title */}
					<div>
						<label className="block text-xs font-semibold text-slate-700 mb-1.5">
							Judul Laporan{" "}
							<span className="text-rose-500">*</span>
						</label>
						<div className="relative">
							<FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
							<input
								type="text"
								required
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Contoh: Jalan berlubang membahayakan di Jl. Sudirman"
								className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
							/>
						</div>
					</div>

					{/* Category & Location */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-semibold text-slate-700 mb-1.5">
								Kategori Laporan{" "}
								<span className="text-rose-500">*</span>
							</label>
							<div className="relative">
								<Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
								<select
									value={category}
									onChange={(e) =>
										setCategory(e.target.value)
									}
									className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer transition-colors appearance-none"
								>
									{categories.map((cat) => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>
							</div>
						</div>

						<div>
							<label className="block text-xs font-semibold text-slate-700 mb-1.5">
								Lokasi Kejadian{" "}
								<span className="text-rose-500">*</span>
							</label>
							<div className="relative">
								<MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
								<input
									type="text"
									required
									value={location}
									onChange={(e) =>
										setLocation(e.target.value)
									}
									placeholder="Contoh: Depan Toko Bersama, RT 02/05"
									className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
								/>
							</div>
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="block text-xs font-semibold text-slate-700 mb-1.5">
							Deskripsi Laporan Lengkap{" "}
							<span className="text-rose-500">*</span>
						</label>
						<textarea
							required
							rows={5}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Jelaskan detail kejadian, kronologi, serta dampak yang ditimbulkan secara rinci..."
							className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
						/>
					</div>

					{/* Multiple Image Upload Box (Entire Box Clickable) */}
					<div>
						<div className="flex items-center justify-between mb-1.5">
							<label className="block text-xs font-semibold text-slate-700">
								Lampirkan Bukti (Opsional, Max 5MB per file)
							</label>
							{imagePreviews.length > 0 && (
								<span className="text-[11px] font-medium text-slate-500">
									{imagePreviews.length} foto terpilih
								</span>
							)}
						</div>

						{/* Hidden Input File */}
						<input
							ref={fileInputRef}
							type="file"
							multiple
							accept="image/*"
							onChange={handleImageChange}
							className="hidden"
						/>

						{/* Clickable Upload Dropzone */}
						<div
							onClick={() => fileInputRef.current?.click()}
							className="mt-1 flex flex-col justify-center items-center px-6 pt-6 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-sky-500 hover:bg-sky-50/40 transition-all bg-slate-50/50 cursor-pointer text-center group"
						>
							<ImageIcon className="h-10 w-10 text-sky-500 group-hover:scale-105 transition-transform mb-2" />
							<p className="text-xs font-bold text-slate-700">
								Unggah foto bukti
							</p>
							<p className="text-[11px] text-slate-400 mt-1">
								Bisa memilih beberapa foto sekaligus (PNG, JPG,
								JPEG, WEBP hingga 5MB)
							</p>
						</div>

						{/* Image Preview List Grid */}
						{imagePreviews.length > 0 && (
							<div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
								{imagePreviews.map((item, idx) => (
									<div
										key={item.id || idx}
										className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square shadow-2xs"
									>
										<img
											src={item.url}
											alt={`Preview ${idx + 1}`}
											className="w-full h-full object-cover"
										/>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleRemoveImage(idx);
											}}
											className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 cursor-pointer transition-colors"
											title="Hapus foto"
										>
											<X className="w-3.5 h-3.5" />
										</button>
										<span className="absolute bottom-1.5 left-1.5 bg-slate-950/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md">
											#{idx + 1}
										</span>
									</div>
								))}

								{/* Add More Photos Button */}
								<button
									type="button"
									onClick={() =>
										fileInputRef.current?.click()
									}
									className="border-2 border-dashed border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 rounded-xl aspect-square flex flex-col items-center justify-center text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
								>
									<Plus className="w-6 h-6 mb-1" />
									<span className="text-[11px] font-bold">
										Tambah Foto
									</span>
								</button>
							</div>
						)}
					</div>

					{/* Submit button */}
					<div className="pt-4 flex justify-end gap-3">
						<Link
							to="/reports"
							className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
						>
							Batal
						</Link>
						<button
							type="submit"
							disabled={loading}
							className="px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-sky-600/30 transition-all flex items-center gap-2 cursor-pointer"
						>
							<Upload className="w-4 h-4" />
							<span>Kirim Laporan</span>
						</button>
					</div>
				</form>
			</div>

			{/* Confirmation Modal */}
			{isConfirmModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in duration-150">
						<div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
							<CheckCircle2 className="w-6 h-6" />
						</div>

						<div>
							<h3 className="font-bold text-slate-900 text-base">
								Konfirmasi Data
							</h3>
							<p className="text-xs text-slate-600 mt-1">
								Apakah data yang Anda masukkan sudah benar?
							</p>
						</div>

						<div className="flex justify-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setIsConfirmModalOpen(false)}
								className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
							>
								Tidak
							</button>
							<button
								type="button"
								onClick={executeCreateReport}
								className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
							>
								Ya, Sudah Benar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
