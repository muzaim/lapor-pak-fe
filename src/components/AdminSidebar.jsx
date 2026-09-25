import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMasterData } from "../context/MasterDataContext";
import {
	Shield,
	LayoutDashboard,
	FileText,
	Users,
	Building2,
	UserCheck,
	MapPin,
	Settings,
	ChevronDown,
	ChevronRight,
	X,
} from "lucide-react";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
	const navigate = useNavigate();
	const location = useLocation();
	const { appSettings } = useMasterData();

	const isDesaPath =
		location.pathname.startsWith("/master-data/desa") ||
		location.pathname === "/master-data/kepala-desa" ||
		location.pathname === "/master-data/visi-misi" ||
		location.pathname === "/master-data/geografis" ||
		location.pathname === "/master-data/office-info" ||
		location.pathname === "/master-data/app-settings";

	const [desaOpen, setDesaOpen] = useState(isDesaPath);

	useEffect(() => {
		if (isDesaPath) {
			setDesaOpen(true);
		}
	}, [location.pathname]);

	const desaSubItems = [
		{
			path: "/master-data/desa/kepala-desa",
			aliasPath: "/master-data/kepala-desa",
			label: "Kepala Desa",
			icon: UserCheck,
		},
		{
			path: "/master-data/desa/visi-misi",
			aliasPath: "/master-data/visi-misi",
			label: "Visi & Misi",
			icon: FileText,
		},
		{
			path: "/master-data/desa/geografis",
			aliasPath: "/master-data/geografis",
			label: "Letak Geografis",
			icon: MapPin,
		},
		{
			path: "/master-data/desa/office-info",
			aliasPath: "/master-data/office-info",
			label: "Informasi Kantor",
			icon: Building2,
		},
		{
			path: "/master-data/desa/app-settings",
			aliasPath: "/master-data/app-settings",
			label: "Setting Aplikasi",
			icon: Settings,
		},
	];

	return (
		<aside
			className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between min-h-screen border-r border-slate-800 shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
				sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
			}`}
		>
			<div>
				{/* Brand Header */}
				<div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg  items-center justify-center font-bold overflow-hidden shrink-0">
							{appSettings?.logo_url ? (
								<img
									src={appSettings.logo_url}
									alt={appSettings.app_name || "Logo"}
									className="w-full h-full object-contain p-0.5"
								/>
							) : (
								<Shield className="w-4 h-4" />
							)}
						</div>
						<div>
							<span className="font-bold text-white text-base tracking-tight block leading-none">
								{appSettings?.app_name || "Lapor Pak!"}
							</span>
							<span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase block mt-1">
								{appSettings?.village_name ||
									"Admin Control Panel"}
							</span>
						</div>
					</div>

					<button
						onClick={() => setSidebarOpen && setSidebarOpen(false)}
						className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
						title="Tutup Menu"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Grouped Nav List */}
				<div className="p-4 space-y-6">
					{/* DASHBOARD GROUP */}
					<div className="space-y-1">
						<p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
							DASHBOARD
						</p>
						<button
							onClick={() => {
								navigate("/dashboard");
								if (setSidebarOpen) setSidebarOpen(false);
							}}
							className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
								location.pathname === "/dashboard"
									? "bg-sky-600 text-white shadow-xs font-bold"
									: "text-slate-400 hover:text-white hover:bg-slate-800/60"
							}`}
						>
							<div className="flex items-center gap-2.5">
								<LayoutDashboard
									className={`w-4 h-4 ${
										location.pathname === "/dashboard"
											? "text-white"
											: "text-slate-400"
									}`}
								/>
								<span>Dashboard</span>
							</div>
						</button>
					</div>

					{/* MASTER DATA GROUP */}
					<div className="space-y-1">
						<p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
							MASTER DATA
						</p>

						{/* Data User */}
						<button
							onClick={() => {
								navigate("/master-data/users");
								if (setSidebarOpen) setSidebarOpen(false);
							}}
							className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
								location.pathname === "/master-data/users"
									? "bg-sky-600 text-white shadow-xs font-bold"
									: "text-slate-400 hover:text-white hover:bg-slate-800/60"
							}`}
						>
							<div className="flex items-center gap-2.5">
								<Users
									className={`w-4 h-4 ${
										location.pathname ===
										"/master-data/users"
											? "text-white"
											: "text-slate-400"
									}`}
								/>
								<span>Data User</span>
							</div>
						</button>

						{/* Data Desa (Collapsible Parent Menu) */}
						<div className="space-y-1">
							<button
								onClick={() => {
									setDesaOpen((prev) => !prev);
								}}
								className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
									isDesaPath
										? "text-sky-400 font-bold bg-slate-800/70"
										: "text-slate-400 hover:text-white hover:bg-slate-800/60"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<Building2
										className={`w-4 h-4 ${
											isDesaPath
												? "text-sky-400"
												: "text-slate-400"
										}`}
									/>
									<span>Data Desa</span>
								</div>
								{desaOpen ? (
									<ChevronDown className="w-3.5 h-3.5 text-slate-400" />
								) : (
									<ChevronRight className="w-3.5 h-3.5 text-slate-400" />
								)}
							</button>

							{/* Sub-menu Items */}
							{desaOpen && (
								<div className="pl-4 ml-3 border-l border-slate-800 space-y-1 pt-1">
									{desaSubItems.map((sub) => {
										const SubIcon = sub.icon;
										const isSubActive =
											location.pathname === sub.path ||
											location.pathname === sub.aliasPath;

										return (
											<button
												key={sub.path}
												onClick={() => {
													navigate(sub.path);
													if (setSidebarOpen)
														setSidebarOpen(false);
												}}
												className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
													isSubActive
														? "bg-sky-600 text-white font-bold shadow-xs"
														: "text-slate-400 hover:text-white hover:bg-slate-800/50"
												}`}
											>
												<SubIcon
													className={`w-3.5 h-3.5 ${
														isSubActive
															? "text-white"
															: "text-slate-400"
													}`}
												/>
												<span>{sub.label}</span>
											</button>
										);
									})}
								</div>
							)}
						</div>
					</div>

					{/* LAPORAN GROUP */}
					<div className="space-y-1">
						<p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
							LAPORAN
						</p>
						<button
							onClick={() => {
								navigate("/laporan");
								if (setSidebarOpen) setSidebarOpen(false);
							}}
							className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
								location.pathname.startsWith("/laporan")
									? "bg-sky-600 text-white shadow-xs font-bold"
									: "text-slate-400 hover:text-white hover:bg-slate-800/60"
							}`}
						>
							<div className="flex items-center gap-2.5">
								<FileText
									className={`w-4 h-4 ${
										location.pathname.startsWith("/laporan")
											? "text-white"
											: "text-slate-400"
									}`}
								/>
								<span>Data Laporan</span>
							</div>
						</button>
					</div>
				</div>
			</div>
		</aside>
	);
}
