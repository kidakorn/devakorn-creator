"use client";

import { Search, Bell, Menu } from "lucide-react";
import Image from "next/image";

// รับ Props toggleSidebar มาจาก DashboardLayout
export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
	return (
		<header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">

			<div className="flex items-center gap-4">
				{/* ปุ่ม Hamburger Menu */}
				<button
					onClick={toggleSidebar}
					className="p-2 -ml-2 rounded-lg text-text-main/60 hover:bg-light-gray hover:text-dark-bg transition-colors"
				>
					<Menu className="w-5 h-5" />
				</button>

				{/* ช่อง Search (ปรับขนาดให้กระชับขึ้น) */}
				<div className="hidden md:flex items-center bg-light-gray/50 border border-gray-200 focus-within:border-primary-red/30 focus-within:ring-2 focus-within:ring-primary-red/10 focus-within:bg-white w-64 lg:w-80 rounded-lg px-3 py-1.5 transition-all">
					<Search className="w-4 h-4 text-text-main/40 mr-2 shrink-0" />
					<input
						type="text"
						placeholder="Search generations..."
						className="bg-transparent border-none outline-none text-sm w-full placeholder-text-main/40 text-dark-bg"
					/>
				</div>
			</div>

			<div className="flex items-center gap-4 md:gap-6">
				<button className="relative text-text-main/40 hover:text-primary-red transition-colors">
					<Bell className="w-5 h-5" />
					{/* จุดแดงแจ้งเตือน */}
					<span className="absolute top-0 right-0 w-2 h-2 bg-primary-red rounded-full border border-white"></span>
				</button>
				<div className="hidden md:block w-px h-6 bg-gray-200"></div>
				<div className="flex items-center gap-3 cursor-pointer group">
					<div className="text-right hidden sm:block">
						<p className="text-sm font-bold text-dark-bg group-hover:text-primary-red transition-colors">Kidakorn Intha</p>
						<p className="text-xs text-text-main/50">Admin</p>
					</div>
					<Image
						src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coke"
						alt="avatar"
						width={36}
						height={36}
						className="rounded-full bg-light-gray border border-gray-200 shrink-0"
						unoptimized
					/>
				</div>
			</div>
		</header>
	);
}