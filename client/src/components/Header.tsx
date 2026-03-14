/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, Coins } from "lucide-react"; // 🟢 ดึงไอคอน Coins มาใช้

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
	const { data: session } = useSession();

	return (
		<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm">

			{/* ฝั่งซ้าย: ปุ่ม Menu */}
			<div className="flex items-center">
				<button
					onClick={toggleSidebar}
					className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
					aria-label="Toggle Menu"
				>
					<Menu className="w-6 h-6" />
				</button>
			</div>

			{/* ฝั่งขวา: ข้อมูลโปรไฟล์ */}
			<div className="flex items-center gap-3 sm:gap-4">
				{session?.user ? (
					<>
						{/* 🟢 กล่องแสดงเหรียญคงเหลือ */}
						<div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-bold border border-yellow-200 shadow-sm">
							<Coins className="w-4 h-4" />
							{/* ถ้ายังไม่มีข้อมูล ให้โชว์ 100 ไว้ก่อน */}
							<span>{(session.user as any).coinBalance ?? 100}</span>
						</div>

						{/* ชื่อและอีเมล */}
						<div className="text-right hidden sm:block ml-2">
							<p className="text-sm font-bold text-gray-900 leading-tight">{session.user.name}</p>
							<p className="text-xs text-gray-500 font-medium">{session.user.email}</p>
						</div>

						{/* 🟢 รูปโปรไฟล์ (แก้ปัญหารูปพังด้วย onError) */}
						<img
							src={session.user.image && session.user.image !== "null" ? session.user.image : `https://ui-avatars.com/api/?name=${encodeURIComponent((session.user as any).name || "User")}&background=FEE2E2&color=DC2626`}
							alt="Profile"
							className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 object-cover"
							onError={(e) => {
								// ถ้าโหลดรูปไม่ขึ้น ให้ใช้รูปสร้างจากชื่อแทน
								e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((session.user as any).name || "User")}&background=FEE2E2&color=DC2626`;
							}}
						/>

						{/* ปุ่ม Logout */}
						<button
							onClick={() => signOut({ callbackUrl: "/login" })}
							className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
							title="Logout"
						>
							<LogOut className="w-5 h-5 sm:w-5 sm:h-5" />
						</button>
					</>
				) : (
					<div className="w-40 h-9 bg-gray-100 rounded-full animate-pulse"></div>
				)}
			</div>
		</header>
	);
}