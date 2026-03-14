/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; // 🟢 1. ดึง session มาเช็ค role
import {
	LayoutDashboard, Sparkles, VideoIcon, Settings as SettingsIcon,
	Wand2, ChevronLeft, ChevronRight, Image as ImageIcon
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
	const pathname = usePathname();
	const { data: session } = useSession(); // 🟢 2. เรียกใช้ข้อมูล session

	// 🟢 3. รายการเมนูพื้นฐาน (สำหรับทุกคน)
	const navItems = [
		{ name: "Overview", href: "/", icon: LayoutDashboard },
		{ name: "Image Studio", href: "/image-studio", icon: Sparkles },
		{ name: "Video Creator", href: "/video-creator", icon: VideoIcon },
		{ name: "Prompt Magic", href: "/prompt-enhancer", icon: Wand2 },
		{ name: "Gallery", href: "/gallery", icon: ImageIcon }, // ✨ เพิ่ม Link Gallery
	];

	// 🟢 4. เช็คว่าเป็น Admin หรือไม่ (อ้างอิงจากฟิลด์ role ใน Database ของคุณ)
	const isAdmin = session?.user?.role === "ADMIN";

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

				{/* 🟢 5. แสดงเมนู Settings เฉพาะ Admin เท่านั้น */}
				{isAdmin && (
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
				)}
			</nav>
		</aside>
	);
}