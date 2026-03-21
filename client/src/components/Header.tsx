/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, Coins, Plus } from "lucide-react";
import Link from "next/link";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
	const { data: session } = useSession();

	const { data } = useSWR('/api/user/balance', fetcher, {
		refreshInterval: 10000,
		revalidateOnFocus: true
	});

	const imagePath = session?.user?.image;
	const hasValidImage = typeof imagePath === 'string' && imagePath.trim() !== '' && imagePath !== 'null' && imagePath !== 'undefined';

	const headerProfileImage = hasValidImage
		? imagePath
		: `https://ui-avatars.com/api/?name=${encodeURIComponent((session?.user as any)?.name || "User")}&background=FEE2E2&color=DC2626`;

	const currentCoins = data?.coinBalance ?? 0;

	return (
		<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm">
			<div className="flex items-center">
				<button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden">
					<Menu className="w-6 h-6" />
				</button>
			</div>

			<div className="flex items-center gap-3 sm:gap-4">
				{session?.user ? (
					<>
						<Link
							href="/pricing"
							className="group flex items-center gap-2 px-1.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
						>
							<div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-bold shadow-inner">
								<Coins className="w-4 h-4" />
								<span>{currentCoins.toLocaleString()}</span>
							</div>
							<div className="flex items-center gap-1 text-gray-500 group-hover:text-red-600 pr-2 transition-colors">
								<span className="text-xs font-bold hidden sm:block">Top up</span>
								<Plus className="w-4 h-4" />
							</div>
						</Link>

						<div className="text-right hidden sm:block ml-2">
							<p className="text-sm font-bold text-gray-900 leading-tight">{session.user.name}</p>
							<p className="text-xs text-gray-500 font-medium">{session.user.email}</p>
						</div>

						{/* 🟢 ทำให้รูปโปรไฟล์กดลิงก์ไปหน้า /profile ได้ */}
						<Link href="/profile" className="block hover:ring-2 hover:ring-red-500 rounded-full transition-all">
							<img
								src={headerProfileImage}
								alt="Profile"
								referrerPolicy="no-referrer" /* 🟢 ห้ามลืมบรรทัดนี้เด็ดขาด */
								className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 object-cover"
							/>
						</Link>

						<button
							onClick={() => signOut({ callbackUrl: "/login" })}
							className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
						>
							<LogOut className="w-5 h-5" />
						</button>
					</>
				) : (
					<div className="w-40 h-9 bg-gray-100 rounded-full animate-pulse"></div>
				)}
			</div>
		</header>
	);
}