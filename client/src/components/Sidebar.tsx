/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	LayoutDashboard, Sparkles, VideoIcon, Settings as SettingsIcon,
	Wand2, ChevronLeft, ChevronRight, Image as ImageIcon, Wallet, ShieldCheck,
	User, Eye, Megaphone, X
} from "lucide-react";
import { useLanguage } from "@/lib/useLanguage";

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
	const pathname = usePathname();
	const { data: session } = useSession();
	const { t } = useLanguage();

	const navItems = [
		{ nameKey: 'nav_overview' as const, href: "/", icon: LayoutDashboard },
		{ nameKey: 'nav_prompt_magic' as const, href: "/prompt-enhancer", icon: Wand2 },
		{ nameKey: 'nav_image_studio' as const, href: "/image-studio", icon: Sparkles },
		{ nameKey: 'nav_video_creator' as const, href: "/video-creator", icon: VideoIcon },
		{ nameKey: 'nav_campaign_builder' as const, href: "/campaign-builder", icon: Megaphone },
		{ nameKey: 'nav_gallery' as const, href: "/gallery", icon: ImageIcon },
		{ nameKey: 'nav_wallet' as const, href: "/pricing", icon: Wallet },
		{ nameKey: 'nav_profile' as const, href: "/profile", icon: User },
	];

	const isAdmin = (session?.user as any)?.role === "ADMIN";

	return (
		<>
			{/* ฉากหลังสีดำจางๆ สำหรับมือถือเมื่อเปิดเมนู */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
					onClick={toggleSidebar}
				/>
			)}

			<aside
				className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-40 shrink-0
					/* ตั้งค่าสำหรับ Mobile */
					fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full w-64'}
					/* ตั้งค่าสำหรับ Desktop */
					md:relative md:translate-x-0 md:shadow-none ${isOpen ? 'md:w-64' : 'md:w-20'}
				`}
			>
				{/* ปุ่มพับเมนูสำหรับ Desktop */}
				<button
					onClick={toggleSidebar}
					className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-primary-red hover:shadow-md transition-all z-30 hidden md:block"
				>
					{isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
				</button>

				{/* ส่วนหัวของ Sidebar และโลโก้ */}
				<div className={`h-16 flex items-center border-b border-gray-100 shrink-0 ${isOpen ? 'justify-between px-4' : 'justify-center'}`}>
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

					{/* ปุ่มกากบาทสำหรับปิดเมนูบนมือถือ */}
					{isOpen && (
						<button
							onClick={toggleSidebar}
							className="md:hidden p-1 text-gray-400 hover:text-primary-red transition-colors"
						>
							<X className="w-6 h-6" />
						</button>
					)}
				</div>

				<nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;
						return (
							<Link
								key={item.nameKey}
								href={item.href}
								title={!isOpen ? t(item.nameKey) : undefined}
								onClick={() => {
									if (window.innerWidth < 768 && isOpen) toggleSidebar();
								}}
								className={`flex items-center rounded-lg font-medium transition-all ${isOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-3'
									} ${isActive
										? "bg-primary-red/10 text-primary-red font-bold"
										: "text-text-main/60 hover:bg-light-gray hover:text-dark-bg"
									}`}
							>
								<Icon className="w-5 h-5 shrink-0" />
								{isOpen && <span className="whitespace-nowrap">{t(item.nameKey)}</span>}
							</Link>
						);
					})}

					{isAdmin && (
						<>
							<div className="h-px bg-gray-300/50 my-4 mx-2"></div>

							<Link
								href="/admin"
								title={!isOpen ? "Admin Panel" : undefined}
								onClick={() => { if (window.innerWidth < 768 && isOpen) toggleSidebar(); }}
								className={`flex items-center rounded-lg font-medium transition-all ${isOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-3'
									} ${pathname === "/admin"
										? "bg-primary-red/10 text-primary-red font-bold"
										: "text-text-main/60 hover:bg-light-gray hover:text-dark-bg"
									}`}
							>
								<ShieldCheck className="w-5 h-5 shrink-0" />
								{isOpen && <span className="whitespace-nowrap">Admin Panel</span>}
							</Link>

							<Link
								href="/admin/gallery"
								title={!isOpen ? "Moderation" : undefined}
								onClick={() => { if (window.innerWidth < 768 && isOpen) toggleSidebar(); }}
								className={`flex items-center rounded-lg font-medium transition-all ${isOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-3'
									} ${pathname === "/admin/gallery"
										? "bg-primary-red/10 text-primary-red font-bold"
										: "text-text-main/60 hover:bg-light-gray hover:text-dark-bg"
									}`}
							>
								<Eye className="w-5 h-5 shrink-0" />
								{isOpen && <span className="whitespace-nowrap">Content Moderation</span>}
							</Link>

							<Link
								href="/settings"
								title={!isOpen ? "Settings" : undefined}
								onClick={() => { if (window.innerWidth < 768 && isOpen) toggleSidebar(); }}
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
		</>
	);
}