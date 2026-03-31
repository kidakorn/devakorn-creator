/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	LayoutDashboard, Sparkles, VideoIcon, Settings as SettingsIcon,
	Wand2, ChevronLeft, ChevronRight, Image as ImageIcon, Wallet, ShieldCheck,
	User, Eye, Megaphone // 🟢 เพิ่มไอคอน Megaphone เข้ามาครับ
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
	const pathname = usePathname();
	const { data: session } = useSession();

	const navItems = [
		{ name: "Overview", href: "/", icon: LayoutDashboard },
		{ name: "Prompt Magic", href: "/prompt-enhancer", icon: Wand2 },
		{ name: "Image Studio", href: "/image-studio", icon: Sparkles },
		{ name: "Video Creator", href: "/video-creator", icon: VideoIcon },
		// 🟢 เพิ่มเมนู Campaign Builder ตรงนี้ครับ
		{ name: "Campaign Builder", href: "/campaign-builder", icon: Megaphone },
		{ name: "Gallery", href: "/gallery", icon: ImageIcon },
		{ name: "Wallet & Coins", href: "/pricing", icon: Wallet },
		{ name: "My Profile", href: "/profile", icon: User },
	];

	// เช็คสิทธิ์แอดมิน
	const isAdmin = (session?.user as any)?.role === "ADMIN";

	return (
		<aside
			className={`relative bg-gray-150 border-r border-gray-300 flex flex-col transition-all duration-300 ease-in-out z-20 shrink-0 ${isOpen ? 'w-64' : 'w-20'}`}
		>
			<button
				onClick={toggleSidebar}
				className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-primary-red hover:shadow-md transition-all z-30 hidden md:block"
			>
				{isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
			</button>

			<div className="h-16 flex items-center justify-center border-b border-gray-100 shrink-0">
				{isOpen ? (
					<div className="flex items-center gap-3">
						<img src="/favicon.ico" alt="DEVAKORN Logo" className="w-8 h-8 rounded-md" />
						<span className="text-xl font-black tracking-tight text-primary-red whitespace-nowrap">
							DEVAKORN
						</span>
					</div>
				) : (
					<img src="/favicon.ico" alt="DEVAKORN Logo" className="w-8 h-8 rounded-md" />
				)}
			</div>

			<nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
				{/* แสดงเมนูทั่วไป */}
				{navItems.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;
					return (
						<Link
							key={item.name}
							href={item.href}
							title={!isOpen ? item.name : undefined}
							className={`flex items-center rounded-lg font-medium transition-all ${isOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-3'
								} ${isActive
									? "bg-primary-red/10 text-primary-red font-bold"
									: "text-text-main/60 hover:bg-light-gray hover:text-dark-bg"
								}`}
						>
							<Icon className="w-5 h-5 shrink-0" />
							{isOpen && <span className="whitespace-nowrap">{item.name}</span>}
						</Link>
					);
				})}

				{/* แสดงเมนูพิเศษเฉพาะ Admin เท่านั้น */}
				{isAdmin && (
					<>
						<div className="h-px bg-gray-300/50 my-4 mx-2"></div>

						{/* ปุ่มไปหน้า Admin Panel */}
						<Link
							href="/admin"
							title={!isOpen ? "Admin Panel" : undefined}
							className={`flex items-center rounded-lg font-medium transition-all ${isOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-3'
								} ${pathname === "/admin"
									? "bg-primary-red/10 text-primary-red font-bold"
									: "text-text-main/60 hover:bg-light-gray hover:text-dark-bg"
								}`}
						>
							<ShieldCheck className="w-5 h-5 shrink-0" />
							{isOpen && <span className="whitespace-nowrap">Admin Panel</span>}
						</Link>

						{/* ปุ่มไปหน้า Content Moderation (ที่เพิ่มเข้ามาใหม่) */}
						<Link
							href="/admin/gallery"
							title={!isOpen ? "Moderation" : undefined}
							className={`flex items-center rounded-lg font-medium transition-all ${isOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-3'
								} ${pathname === "/admin/gallery"
									? "bg-primary-red/10 text-primary-red font-bold"
									: "text-text-main/60 hover:bg-light-gray hover:text-dark-bg"
								}`}
						>
							<Eye className="w-5 h-5 shrink-0" />
							{isOpen && <span className="whitespace-nowrap">Content Moderation</span>}
						</Link>

						{/* ปุ่มไปหน้า Settings */}
						<Link
							href="/settings"
							title={!isOpen ? "Settings" : undefined}
							className={`flex items-center rounded-lg font-medium transition-all ${isOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-3'
								} ${pathname === "/settings"
									? "bg-primary-red/10 text-primary-red font-bold"
									: "text-text-main/60 hover:bg-light-gray hover:text-dark-bg"
								}`}
						>
							<SettingsIcon className="w-5 h-5 shrink-0" />
							{isOpen && <span className="whitespace-nowrap">Settings</span>}
						</Link>
					</>
				)}
			</nav>
		</aside>
	);
}