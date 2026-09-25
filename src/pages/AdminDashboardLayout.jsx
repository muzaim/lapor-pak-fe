import React from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminOverviewTab from "./admin/AdminOverviewTab";
import MasterReportsTab from "./admin/MasterReportsTab";
import MasterUsersTab from "./admin/MasterUsersTab";
import MasterDesaTab from "./admin/MasterDesaTab";
import ProcessReportDetailPage from "./admin/ProcessReportDetailPage";
import ChangePasswordPage from "./ChangePasswordPage";

export default function AdminDashboardLayout() {
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = React.useState(false);

	const getTabTitle = () => {
		if (location.pathname.startsWith("/laporan/")) {
			return {
				title: "Pemrosesan & Detail Pengaduan",
				subtitle:
					"Halaman khusus detail informasi pengaduan, form proses laporan, dan riwayat komentar",
			};
		}

		switch (location.pathname) {
			case "/dashboard":
				return {
					title: "Dashboard Utama",
					subtitle:
						"Ringkasan statistik & ikhtisar seluruh pengaduan masyarakat",
				};
			case "/laporan":
				return {
					title: "Data Laporan Pengaduan",
					subtitle:
						"Daftar pengaduan masuk, verifikasi status, dan tanggapan admin",
				};
			case "/master-data/users":
				return {
					title: "Data User & Pengguna",
					subtitle:
						"Manajemen pengguna terdaftar dan administrator sistem",
				};
			case "/master-data/desa":
			case "/master-data/desa/kepala-desa":
			case "/master-data/kepala-desa":
				return {
					title: "Master Data Kepala Desa",
					subtitle:
						"Kelola identitas, foto resmi, dan masa jabatan Kepala Desa",
				};
			case "/master-data/desa/visi-misi":
			case "/master-data/visi-misi":
				return {
					title: "Master Data Visi & Misi",
					subtitle: "Kelola rumusan Visi dan Misi pembangunan desa",
				};
			case "/master-data/desa/geografis":
			case "/master-data/geografis":
				return {
					title: "Master Letak Geografis & Statistik",
					subtitle:
						"Peta Google Maps, batas-batas wilayah, dan statistik administrasi",
				};
			case "/master-data/desa/office-info":
			case "/master-data/office-info":
				return {
					title: "Master Data Informasi Kantor & Kontak Desa",
					subtitle:
						"Alamat kantor desa, jam operasional layanan, nomor telepon, dan email resmi",
				};
			case "/master-data/desa/app-settings":
			case "/master-data/app-settings":
				return {
					title: "Master Setting Aplikasi (Master App)",
					subtitle:
						"Pengaturan logo resmi, nama aplikasi, dan nama desa",
				};
			case "/master-data/change-password":
			case "/change-password":
				return {
					title: "Ubah Password Akun Administrator",
					subtitle:
						"Perbarui kata sandi akun administrator Anda untuk menjaga keamanan sistem",
				};
			default:
				return {
					title: "Dashboard Admin Lapor Pak!",
					subtitle: "Panel kontrol pengaduan masyarakat",
				};
		}
	};

	const renderContent = () => {
		if (location.pathname.startsWith("/laporan/")) {
			return <ProcessReportDetailPage />;
		}

		if (
			location.pathname.startsWith("/master-data/desa") ||
			location.pathname.startsWith("/master-data/kepala-desa") ||
			location.pathname.startsWith("/master-data/visi-misi") ||
			location.pathname.startsWith("/master-data/geografis") ||
			location.pathname.startsWith("/master-data/office-info") ||
			location.pathname.startsWith("/master-data/app-settings")
		) {
			return <MasterDesaTab />;
		}

		switch (location.pathname) {
			case "/dashboard":
				return <AdminOverviewTab />;
			case "/laporan":
				return <MasterReportsTab />;
			case "/master-data/users":
				return <MasterUsersTab />;
			case "/master-data/change-password":
			case "/change-password":
				return <ChangePasswordPage />;
			default:
				return <AdminOverviewTab />;
		}
	};

	const { title, subtitle } = getTabTitle();

	return (
		<div className="flex min-h-screen bg-slate-100/70 font-sans text-slate-900 relative">
			{/* Mobile Drawer Overlay Backdrop */}
			{sidebarOpen && (
				<div
					onClick={() => setSidebarOpen(false)}
					className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
				/>
			)}

			{/* Responsive Left Sidebar */}
			<AdminSidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
			/>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-w-0">
				<AdminHeader
					title={title}
					subtitle={subtitle}
					onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
				/>

				<main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
					{renderContent()}
				</main>
			</div>
		</div>
	);
}
