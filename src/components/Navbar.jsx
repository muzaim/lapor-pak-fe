import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMasterData } from "../context/MasterDataContext";
import { Shield, LogOut, Menu, X, ChevronDown, Key } from "lucide-react";

export default function Navbar() {
	const { user, logout, isAdmin } = useAuth();
	const { appSettings } = useMasterData();
	const navigate = useNavigate();
	const location = useLocation();

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [profilDropdownOpen, setProfilDropdownOpen] = useState(false);
	const [userDropdownOpen, setUserDropdownOpen] = useState(false);
	const [hoveredMenu, setHoveredMenu] = useState(null);
	const [scrolled, setScrolled] = useState(false);

	const userDropdownRef = useRef(null);

	// Close user account dropdown on click outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				userDropdownRef.current &&
				!userDropdownRef.current.contains(event.target)
			) {
				setUserDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Handle scroll effect for transparent navbar at hero top
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 20) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const isHomePage = location.pathname === "/";
	const isTransparentNav = isHomePage && !scrolled;

	const isActivePath = (path) => {
		if (path === "/") return location.pathname === "/" && !location.hash;
		return location.pathname.startsWith(path);
	};

	const isProfilDesaActive =
		location.pathname.startsWith("/profil-desa") ||
		location.hash.includes("desa");

	// Compute CSS class without layout width/height shift
	const getNavClass = (menuName, isActualActive) => {
		const isHighlighted = hoveredMenu
			? hoveredMenu === menuName
			: isActualActive;

		if (isTransparentNav) {
			if (isHighlighted) {
				return "font-semibold text-white border-b-2 border-white pb-1 text-xs transition-all duration-200 cursor-pointer";
			}
			return "font-semibold text-white/80 hover:text-white border-b-2 border-transparent pb-1 text-xs transition-all duration-200 cursor-pointer";
		}

		if (isHighlighted) {
			return "font-semibold text-slate-900 border-b-2 border-slate-900 pb-1 text-xs transition-all duration-200 cursor-pointer";
		}
		return "font-semibold text-slate-600 hover:text-slate-900 border-b-2 border-transparent pb-1 text-xs transition-all duration-200 cursor-pointer";
	};

	const handleNav = (path, hash = "") => {
		setMobileMenuOpen(false);
		setProfilDropdownOpen(false);

		if (location.pathname !== path) {
			navigate(path + hash);
		} else if (hash) {
			const element = document.querySelector(hash);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			}
		} else {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-700 ease-in-out ${
				isTransparentNav
					? "bg-transparent text-white border-b border-white/10"
					: "bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 shadow-xs"
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				{/* Brand Logo & Title */}
				<Link
					to={isAdmin ? "/dashboard" : "/"}
					className="flex items-center gap-2.5 text-left focus:outline-hidden group"
				>
					<div className="w-9 h-9 rounded-xl  items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform overflow-hidden shrink-0">
						{appSettings?.logo_url ? (
							<img
								src={appSettings.logo_url}
								alt={appSettings.app_name || "Logo"}
								className="w-full h-full object-contain p-1"
							/>
						) : (
							<Shield className="w-5 h-5" />
						)}
					</div>
					<div className="flex items-center gap-2">
						<span
							className={`text-lg font-bold leading-none tracking-tight transition-colors duration-200 ${
								isTransparentNav
									? "text-white"
									: "text-slate-900"
							}`}
						>
							{appSettings?.app_name || "Lapor Pak!"}
						</span>
					</div>
				</Link>

				{/* Desktop Navigation Links */}
				<nav className="hidden md:flex items-center gap-7">
					{!isAdmin && (
						<>
							{/* Beranda */}
							<button
								onClick={() => handleNav("/", "")}
								onMouseEnter={() => setHoveredMenu("beranda")}
								onMouseLeave={() => setHoveredMenu(null)}
								className={getNavClass(
									"beranda",
									isActivePath("/")
								)}
							>
								Beranda
							</button>

							{/* Profil Desa with Animated Dropdown */}
							<div
								className="relative py-4"
								onMouseEnter={() => {
									setHoveredMenu("profil-desa");
									setProfilDropdownOpen(true);
								}}
								onMouseLeave={() => {
									setHoveredMenu(null);
									setProfilDropdownOpen(false);
								}}
							>
								<button
									onClick={() =>
										navigate("/profil-desa/kepala-desa")
									}
									className={`flex items-center gap-1.5 ${getNavClass(
										"profil-desa",
										isProfilDesaActive
									)}`}
								>
									<span>Profil Desa</span>
									<ChevronDown
										className={`w-3.5 h-3.5 transition-transform duration-200 ${
											profilDropdownOpen
												? "rotate-180"
												: ""
										} ${
											isTransparentNav
												? "text-white/80"
												: "text-slate-400"
										}`}
									/>
								</button>

								{/* Sub-Menu Dropdown - Smooth Animated Transition, No Icons */}
								<div
									className={`absolute left-0 top-full pt-1 w-52 z-50 transition-all duration-200 ease-out origin-top-left ${
										profilDropdownOpen
											? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
											: "opacity-0 scale-95 -translate-y-1 pointer-events-none"
									}`}
								>
									<div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 text-slate-900">
										<Link
											to="/profil-desa/kepala-desa"
											onClick={() =>
												setProfilDropdownOpen(false)
											}
											className="block w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
										>
											Kepala Desa
										</Link>

										<Link
											to="/profil-desa/visi-misi"
											onClick={() =>
												setProfilDropdownOpen(false)
											}
											className="block w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
										>
											Visi & Misi
										</Link>

										<Link
											to="/profil-desa/wilayah-desa"
											onClick={() =>
												setProfilDropdownOpen(false)
											}
											className="block w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
										>
											Letak Geografis
										</Link>

										<Link
											to="/profil-desa/lokasi-kontak"
											onClick={() =>
												setProfilDropdownOpen(false)
											}
											className="block w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
										>
											Lokasi & Kontak
										</Link>
									</div>
								</div>
							</div>

							{/* Cara Kerja */}
							<button
								onClick={() => handleNav("/cara-kerja")}
								onMouseEnter={() =>
									setHoveredMenu("cara-kerja")
								}
								onMouseLeave={() => setHoveredMenu(null)}
								className={getNavClass(
									"cara-kerja",
									isActivePath("/cara-kerja")
								)}
							>
								Cara Kerja
							</button>
						</>
					)}

					{user && !isAdmin && (
						<>
							<div
								className={`h-4 w-px transition-colors ${
									isTransparentNav
										? "bg-white/20"
										: "bg-slate-200"
								}`}
							></div>
							<Link
								to="/reports"
								onMouseEnter={() =>
									setHoveredMenu("laporan-saya")
								}
								onMouseLeave={() => setHoveredMenu(null)}
								className={`text-xs transition-all duration-200 ${
									hoveredMenu === "laporan-saya" ||
									location.pathname === "/reports"
										? isTransparentNav
											? "font-semibold text-sky-300 border-b-2 border-sky-300 pb-1"
											: "font-semibold text-sky-600 border-b-2 border-sky-600 pb-1"
										: isTransparentNav
										? "font-semibold text-white/80 hover:text-white border-b-2 border-transparent pb-1"
										: "font-semibold text-slate-600 hover:text-slate-900 border-b-2 border-transparent pb-1"
								}`}
							>
								Laporan Saya
							</Link>
						</>
					)}

					{user && isAdmin && (
						<Link
							to="/dashboard"
							className="text-xs font-bold text-slate-900 hover:text-sky-600 transition-colors"
						>
							Dashboard Admin
						</Link>
					)}
				</nav>

				{/* User Account Info / Actions */}
				<div className="hidden md:flex items-center gap-3">
					{user ? (
						<div className="relative" ref={userDropdownRef}>
							<button
								onClick={() => setUserDropdownOpen((prev) => !prev)}
								className={`flex items-center gap-2.5 p-1.5 px-2 rounded-xl transition-all cursor-pointer border border-transparent ${
									isTransparentNav
										? "text-white hover:bg-white/10 hover:border-white/20"
										: "text-slate-900 hover:bg-slate-100/80 hover:border-slate-200"
								}`}
							>
								<div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
									{user.name
										? user.name.charAt(0).toUpperCase()
										: "U"}
								</div>
								<span className="font-bold text-xs truncate max-w-[150px]">
									{user.name}
								</span>
								<ChevronDown
									className={`w-4 h-4 transition-transform duration-200 ${
										userDropdownOpen ? "rotate-180" : ""
									} ${
										isTransparentNav
											? "text-white/80"
											: "text-slate-400"
									}`}
								/>
							</button>

							{/* Dropdown Menu Window */}
							{userDropdownOpen && (
								<div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
									{/* Account Details Header */}
									<div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
											{user.name
												? user.name.charAt(0).toUpperCase()
												: "U"}
										</div>
										<span className="font-bold text-xs text-slate-900 truncate">
											{user.name}
										</span>
									</div>

									{/* Menu Links */}
									<div className="p-1.5 space-y-1">
										<Link
											to="/change-password"
											onClick={() => setUserDropdownOpen(false)}
											className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer text-left"
										>
											<Key className="w-4 h-4 text-sky-600" />
											<span>Ubah Password</span>
										</Link>

										<button
											onClick={() => {
												setUserDropdownOpen(false);
												logout();
												navigate("/login");
											}}
											className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
										>
											<LogOut className="w-4 h-4 text-rose-500" />
											<span>Logout</span>
										</button>
									</div>
								</div>
							)}
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Link
								to="/login"
								className={`px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
									isTransparentNav
										? "text-white/90 hover:text-white"
										: "text-slate-700 hover:text-slate-900"
								}`}
							>
								Masuk
							</Link>
							<Link
								to="/register"
								className="px-3.5 py-2 text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 rounded-xl transition-all cursor-pointer shadow-xs"
							>
								Daftar Akun
							</Link>
						</div>
					)}
				</div>

				{/* Mobile menu toggle */}
				<button
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className={`md:hidden p-2 rounded-xl transition-colors ${
						isTransparentNav
							? "text-white hover:bg-white/10"
							: "text-slate-600 hover:bg-slate-100"
					}`}
				>
					{mobileMenuOpen ? (
						<X className="w-5 h-5" />
					) : (
						<Menu className="w-5 h-5" />
					)}
				</button>
			</div>

			{/* Mobile Dropdown */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t border-slate-200 bg-white text-slate-900 px-4 py-3 space-y-3 shadow-lg">
					{!isAdmin && (
						<>
							<button
								onClick={() => handleNav("/", "")}
								className={`w-full text-left py-1.5 text-xs ${
									isActivePath("/")
										? "font-bold text-slate-900"
										: "font-semibold text-slate-600"
								}`}
							>
								Beranda
							</button>

							<div className="space-y-1.5 pl-2 border-l-2 border-slate-100">
								<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
									Profil Desa
								</p>
								<Link
									to="/profil-desa/kepala-desa"
									onClick={() => setMobileMenuOpen(false)}
									className="block w-full text-left py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
								>
									Kepala Desa
								</Link>
								<Link
									to="/profil-desa/visi-misi"
									onClick={() => setMobileMenuOpen(false)}
									className="block w-full text-left py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
								>
									Visi & Misi
								</Link>
								<Link
									to="/profil-desa/wilayah-desa"
									onClick={() => setMobileMenuOpen(false)}
									className="block w-full text-left py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
								>
									Letak Geografis
								</Link>
								<Link
									to="/profil-desa/lokasi-kontak"
									onClick={() => setMobileMenuOpen(false)}
									className="block w-full text-left py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
								>
									Lokasi & Kontak
								</Link>
							</div>

							<button
								onClick={() => handleNav("/cara-kerja")}
								className={`w-full text-left py-1.5 text-xs ${
									isActivePath("/cara-kerja")
										? "font-bold text-slate-900"
										: "font-semibold text-slate-600 hover:text-slate-900"
								}`}
							>
								Cara Kerja
							</button>
						</>
					)}

					{user && !isAdmin && (
						<button
							onClick={() => handleNav("/reports")}
							className="w-full text-left py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
						>
							Laporan Saya
						</button>
					)}

					{user ? (
						<div className="pt-3 border-t border-slate-100 space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
										{user.name
											? user.name.charAt(0).toUpperCase()
											: "U"}
									</div>
									<p className="text-xs font-bold text-slate-900">
										{user.name}
									</p>
								</div>
								<button
									onClick={() => {
										logout();
										navigate("/login");
										setMobileMenuOpen(false);
									}}
									className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl cursor-pointer"
								>
									Logout
								</button>
							</div>

							<button
								onClick={() => handleNav("/change-password")}
								className="w-full text-left py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
							>
								<Key className="w-3.5 h-3.5 text-slate-400" />
								<span>Ubah Password Akun</span>
							</button>
						</div>
					) : (
						<div className="pt-2 border-t border-slate-100 flex gap-2">
							<button
								onClick={() => handleNav("/login")}
								className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
							>
								Masuk
							</button>
							<button
								onClick={() => handleNav("/register")}
								className="flex-1 py-2 text-center text-xs font-bold text-white bg-sky-600 rounded-xl"
							>
								Daftar
							</button>
						</div>
					)}
				</div>
			)}
		</header>
	);
}
