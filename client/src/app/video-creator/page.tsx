"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	Wand2,
	Video as VideoIcon,
	Download,
	RefreshCw,
	PlayCircle,
	Volume2,
	LayoutDashboard,
	Settings as SettingsIcon,
	Search,
	Bell,
	Sparkles
} from "lucide-react";

export default function VideoCreator() {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [aspectRatio, setAspectRatio] = useState("9:16"); // Default เป็นแนวตั้งสำหรับ TikTok

	// ฟังก์ชันจำลองการโหลดวีดิโอ (จะนานกว่ารูปภาพนิดหน่อย)
	const handleGenerate = () => {
		if (!prompt) return;
		setIsGenerating(true);
		setTimeout(() => {
			setIsGenerating(false);
		}, 4500); // จำลองว่าโหลด 4.5 วินาที
	};

	return (
		<div className="min-h-screen bg-light-gray text-text-main flex flex-col md:flex-row font-sans">

			{/* --- Sidebar --- */}
			<aside className="w-full md:w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
				<div className="h-20 flex items-center px-8 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<span className="text-xl font-black tracking-tight text-dark-bg">
							DEVAKORN<span className="text-primary-red">.</span>
						</span>
					</div>
				</div>
				<nav className="flex-1 px-4 py-8 space-y-1">
					<Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
						<LayoutDashboard className="w-4 h-4" /> Overview
					</Link>
					<Link href="/image-studio" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
						<Sparkles className="w-4 h-4" /> Image Studio
					</Link>
					{/* Active State อยู่ที่ Video Creator */}
					<Link href="/video-creator" className="flex items-center gap-3 px-4 py-2.5 bg-primary-red/10 text-primary-red rounded-lg font-bold transition-all">
						<VideoIcon className="w-4 h-4" /> Video Creator
					</Link>
					<Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
						<SettingsIcon className="w-4 h-4" /> Settings
					</Link>
				</nav>
			</aside>

			<main className="flex-1 flex flex-col h-screen overflow-y-auto">
				{/* Header */}
				<header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
					<div className="flex items-center bg-light-gray border border-transparent focus-within:border-primary-red/30 w-96 rounded-lg px-3 py-2 transition-all">
						<Search className="w-4 h-4 text-text-main/40 mr-2" />
						<input type="text" placeholder="Search past video campaigns..." className="bg-transparent border-none outline-none text-sm w-full placeholder-text-main/40 text-dark-bg" />
					</div>
					<div className="flex items-center gap-6">
						<button className="relative text-text-main/40 hover:text-primary-red transition-colors">
							<Bell className="w-5 h-5" />
						</button>
						<div className="w-px h-6 bg-gray-200"></div>
						<div className="flex items-center gap-3 cursor-pointer group">
							<div className="text-right hidden sm:block">
								<p className="text-sm font-bold text-dark-bg group-hover:text-primary-red transition-colors">Kidakorn Intha</p>
								<p className="text-xs text-text-main/50">Admin</p>
							</div>
							<Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coke" alt="avatar" width={36} height={36} className="rounded-full bg-light-gray border border-gray-200" unoptimized />
						</div>
					</div>
				</header>

				{/* Main Content */}
				<div className="p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

					{/* Left Panel: Controls */}
					<div className="lg:col-span-4 space-y-6">
						<div>
							<h1 className="text-2xl font-black text-dark-bg tracking-tight mb-1">Video Creator</h1>
							<p className="text-sm font-medium text-text-main/60 flex items-center gap-1.5">
								Powered by <span className="text-primary-red font-bold">Google Veo 2.0</span>
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-7">

							{/* Prompt Input */}
							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
									<Wand2 className="w-4 h-4 text-primary-red" />
									Video Scene Description
								</label>
								<textarea
									rows={5}
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder="Describe the movement and scene... e.g. Cinematic slow-motion of a football player scoring a goal."
									className="w-full bg-light-gray/50 border border-gray-200 rounded-lg p-4 text-sm text-dark-bg placeholder:text-text-main/40 focus:border-primary-red/50 focus:ring-4 focus:ring-primary-red/10 outline-none transition-all resize-none"
								/>
							</div>

							{/* Format Selection */}
							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg">Format (Aspect Ratio)</label>
								<div className="grid grid-cols-2 gap-3">
									{/* 9:16 Button (TikTok/Reels) */}
									<button
										onClick={() => setAspectRatio("9:16")}
										className={`py-3.5 rounded-lg border text-sm flex flex-col items-center gap-2 transition-all ${aspectRatio === "9:16" ? "border-primary-red bg-primary-red/5 text-primary-red font-bold" : "border-gray-200 text-text-main/60 hover:border-gray-300 hover:text-dark-bg"}`}
									>
										<div className="w-4 h-7 border-2 border-current rounded-[3px]"></div>
										Vertical (9:16)
									</button>
									{/* 16:9 Button (YouTube) */}
									<button
										onClick={() => setAspectRatio("16:9")}
										className={`py-3.5 rounded-lg border text-sm flex flex-col items-center gap-2 transition-all ${aspectRatio === "16:9" ? "border-primary-red bg-primary-red/5 text-primary-red font-bold" : "border-gray-200 text-text-main/60 hover:border-gray-300 hover:text-dark-bg"}`}
									>
										<div className="w-7 h-4 border-2 border-current rounded-[3px]"></div>
										Landscape (16:9)
									</button>
								</div>
							</div>

							{/* Audio Toggle */}
							<div className="flex items-center justify-between p-4 bg-light-gray/50 rounded-lg border border-gray-200">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
										<Volume2 className="w-4 h-4 text-dark-bg" />
									</div>
									<div>
										<p className="text-sm font-bold text-dark-bg">Generate Audio</p>
										<p className="text-xs text-text-main/60 font-medium">Include native sound/music</p>
									</div>
								</div>
								{/* ใช้ DaisyUI Toggle แต่คุมสีด้วย primary-red */}
								<input type="checkbox" className="toggle toggle-error" defaultChecked />
							</div>

							{/* Generate Button */}
							<button
								onClick={handleGenerate}
								disabled={isGenerating || !prompt}
								className="w-full bg-dark-bg hover:bg-primary-red text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-dark-bg shadow-sm"
							>
								{isGenerating ? (
									<>
										<RefreshCw className="w-4 h-4 animate-spin" />
										Rendering Video...
									</>
								) : (
									<>
										<VideoIcon className="w-4 h-4" />
										Generate Video
									</>
								)}
							</button>
						</div>
					</div>

					{/* Right Panel: Video Preview Area */}
					<div className="lg:col-span-8">
						<div className="bg-white border border-gray-200 rounded-xl h-full min-h-137.5 flex flex-col relative overflow-hidden shadow-sm">

							{/* Toolbar Area */}
							<div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-light-gray/30">
								<span className="text-sm font-bold text-dark-bg">Video Player</span>
								<div className="flex gap-2">
									<button className="text-text-main/40 hover:text-dark-bg transition-colors" disabled={isGenerating}>
										<Download className="w-4 h-4" />
									</button>
								</div>
							</div>

							{/* Player Canvas Area */}
							<div className="flex-1 flex items-center justify-center bg-[#111111] relative p-8">
								{isGenerating ? (
									<div className="flex flex-col items-center gap-4 text-white z-10">
										<span className="loading loading-bars loading-lg text-primary-red"></span>
										<p className="text-sm font-bold text-white/80 animate-pulse tracking-wide">Rendering frames via Veo 2.0...</p>
									</div>
								) : (
									<div className="text-center text-text-main/40 flex flex-col items-center z-10">
										<div className="w-20 h-20 bg-dark-bg/50 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-700/50">
											<PlayCircle className="w-8 h-8 text-white/50" />
										</div>
										<p className="font-bold text-white/70 text-lg">No Video Rendered</p>
										<p className="text-sm text-white/40 mt-1 max-w-sm font-medium">
											Enter a prompt to generate a high-fidelity video clip. Vertical 9:16 format is recommended for Shorts & Reels.
										</p>
									</div>
								)}

								{/* Decorative Background Elements for the Player */}
								<div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-gray-700 via-[#111111] to-[#111111] pointer-events-none"></div>
							</div>

						</div>
					</div>

				</div>
			</main>
		</div>
	);
}