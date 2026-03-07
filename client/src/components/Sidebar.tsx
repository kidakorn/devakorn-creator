"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, VideoIcon, Settings as SettingsIcon, Wand2 } from "lucide-react";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
	const pathname = usePathname();

	const navItems = [
		{ name: "Overview", href: "/", icon: LayoutDashboard },
		{ name: "Image Studio", href: "/image-studio", icon: Sparkles },
		{ name: "Video Creator", href: "/video-creator", icon: VideoIcon },
		{ name: "Prompt Magic", href: "/prompt-enhancer", icon: Wand2 },
		{ name: "Settings", href: "/settings", icon: SettingsIcon },
	];

	return (
		<aside
			className={`bg-gray-150 border-r border-gray-300 flex flex-col transition-all duration-300 ease-in-out z-20 shrink-0 ${isOpen ? 'w-64' : 'w-20'
				}`}
		>
			{/* โลโก้ */}
			<div className="h-16 flex items-center justify-center border-b border-gray-100 shrink-0">
				{isOpen ? (
					<span className="text-xl font-black tracking-tight text-primary-red whitespace-nowrap">
						DEVAKORN
					</span>
				) : (
					<span className="text-xl font-black tracking-tight text-primary-red">
						D
					</span>
				)}
			</div>

			{/* เมนู */}
			<nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
				{navItems.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;
					return (
						<Link
							key={item.name}
							href={item.href}
							title={!isOpen ? item.name : undefined} // เอาเมาส์ชี้ตอนหุบ จะขึ้นชื่อเมนู
							className={`flex items-center rounded-lg font-medium transition-all ${isOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-3'
								} ${isActive
									? "bg-primary-red/10 text-primary-red font-bold"
									: "text-text-main/60 hover:bg-light-gray hover:text-dark-bg"
								}`}
						>
							<Icon className="w-5 h-5 shrink-0" />
							{/* ซ่อนตัวหนังสือตอนถูกหุบ */}
							{isOpen && <span className="whitespace-nowrap">{item.name}</span>}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}