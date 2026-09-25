import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import LoadingOverlay from "./LoadingOverlay";
import {
	ChevronDown,
	Key,
	LogOut,
	UserCheck,
	X,
	CheckCircle,
	AlertCircle,
	Shield,
	Menu,
} from "lucide-react";

export default function AdminHeader({ title, subtitle, onToggleSidebar }) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

	// Form Change Password State
	const [passwordData, setPasswordData] = useState({
		newPassword: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");

	const dropdownRef = useRef(null);

	// Close dropdown on click outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const handleOpenChangePassword = () => {
		setDropdownOpen(false);
		navigate("/master-data/change-password");
	};

	return (
		<header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
			{loading && (
				<LoadingOverlay
					message="Memperbarui Password Admin..."
					backdrop="blank"
				/>
			)}

			{/* Title & Subtitle + Mobile Sidebar Toggle Button */}
			<div className="flex items-center gap-3 text-left">
				<button
					onClick={onToggleSidebar}
					className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
					title="Toggle Navigation Menu"
				>
					<Menu className="w-5 h-5" />
				</button>

				{/* <div>
					<h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
						{title}
					</h1>
					{subtitle && (
						<p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
							{subtitle}
						</p>
					)}
				</div> */}
			</div>

			{/* User Account Dropdown */}
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={() => setDropdownOpen((prev) => !prev)}
					className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
				>
					<div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
						{user?.name ? user.name.charAt(0).toUpperCase() : "A"}
					</div>

					<div className="hidden sm:flex flex-col text-left">
						<span className="font-bold text-xs text-slate-800 group-hover:text-sky-700 transition-colors">
							{user?.name || "Administrator"}
						</span>
					</div>

					<ChevronDown
						className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${
							dropdownOpen ? "rotate-180" : ""
						}`}
					/>
				</button>

				{/* Dropdown Menu Window */}
				{dropdownOpen && (
					<div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
						{/* Account Details Header */}
						<div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
								{user?.name ? user.name.charAt(0).toUpperCase() : "A"}
							</div>
							<span className="font-bold text-xs text-slate-900 truncate">
								{user?.name || "Administrator"}
							</span>
						</div>

						{/* Menu Links */}
						<div className="p-1.5 space-y-1">
							<button
								onClick={handleOpenChangePassword}
								className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
							>
								<Key className="w-4 h-4 text-sky-600" />
								<span>Ubah Password</span>
							</button>

							<button
								onClick={handleLogout}
								className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
							>
								<LogOut className="w-4 h-4 text-rose-500" />
								<span>Logout</span>
							</button>
						</div>
					</div>
				)}
			</div>

		</header>
	);
}
