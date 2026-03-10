/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
	const { data: session } = useSession();

	return (
		// ใช้ justify-between เพื่อดันของให้แยกซ้าย-ขวา
		<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm">

			{/* 🔴 ฝั่งซ้าย: ปุ่ม Menu (แสดงเฉพาะบนมือถือ) */}
			<div className="flex items-center">
				<button
					onClick={toggleSidebar}
					// md:hidden คือคำสั่งซ่อนปุ่มนี้เมื่อเปิดในจอคอม (เพราะจอคอมเรามีปุ่มที่ Sidebar แล้ว)
					className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
					aria-label="Toggle Menu"
				>
					<Menu className="w-6 h-6" />
				</button>
			</div>

			{/* 🟢 ฝั่งขวา: ข้อมูลโปรไฟล์ (ชิดขวาเสมอ) */}
			<div className="flex items-center gap-3 sm:gap-4">
				{session?.user ? (
					<>
						{/* ซ่อนชื่อในจอมือถือ (เพราะที่แคบ) โชว์แค่จอคอม (sm:block) */}
						<div className="text-right hidden sm:block">
							<p className="text-sm font-bold text-gray-900 leading-tight">{session.user.name}</p>
							<p className="text-xs text-gray-500 font-medium">{session.user.email}</p>
						</div>

						{/* รูปโปรไฟล์ */}
						<img
							src={session.user.image || "https://ui-avatars.com/api/?name=User"}
							alt="Profile"
							className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200"
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
					<div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse"></div>
				)}
			</div>

		</header>
	);
}