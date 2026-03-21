/* eslint-disable @next/next/no-img-element */
"use client";

import { signIn } from "next-auth/react";
import { ChevronRight } from "lucide-react";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-[#fafafa] font-sans flex flex-col selection:bg-red-500/20">
			{/* 🟢 Minimal Navbar */}
			<nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
				<div className="flex items-center gap-3">
					{/* ใช้ favicon.ico เป็นโลโก้แบบคลีนๆ */}
					<img src="/favicon.ico" alt="Devakorn Logo" className="w-8 h-8 object-contain" />
					<span className="font-black text-xl text-gray-900 tracking-tight">DEVAKORN</span>
				</div>
				<button
					onClick={() => signIn()}
					className="px-5 py-2 text-sm font-bold text-gray-900 hover:text-red-600 transition-colors"
				>
					Sign In
				</button>
			</nav>

			{/* 🟢 Clean Hero Section */}
			<main className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-32">
				<h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">
					Create Commercial Assets in <span className="text-red-600">Seconds.</span>
				</h1>

				<p className="text-lg md:text-xl text-gray-500 font-medium mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
					Stop waiting for photoshoots. Use AI to generate highly-converting product images, 30-second video ads, and professional copy instantly.
				</p>

				<div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
					<button
						onClick={() => signIn()}
						className="px-8 py-4 bg-gray-900 hover:bg-red-600 text-white font-black rounded-full text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 active:scale-95"
					>
						Start Creating <ChevronRight className="w-5 h-5" />
					</button>
				</div>
			</main>
		</div>
	);
}