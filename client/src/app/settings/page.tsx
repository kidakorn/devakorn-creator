"use client";

import { useState } from "react";
import {
	VideoIcon,
	LayoutDashboard,
	Settings as SettingsIcon,
	Key,
	User,
	ShieldCheck,
	Save,
	Sparkles,
	RefreshCw,
	ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Settings() {
	const [apiKey, setApiKey] = useState("AIzaSyB***************************");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = () => {
		setIsSaving(true);
		// จำลองการบันทึกข้อมูล
		setTimeout(() => setIsSaving(false), 1500);
	};

	return (
		<div className="min-h-screen bg-light-gray text-text-main flex flex-col md:flex-row font-sans">

			{/* --- Sidebar (Depth & Consistency) --- */}
			<aside className="w-full md:w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm">
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
					<Link href="/video-creator" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
						<VideoIcon className="w-4 h-4" /> Video Creator
					</Link>
					<Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 bg-primary-red/10 text-primary-red rounded-lg font-bold transition-all shadow-sm shadow-primary-red/5">
						<SettingsIcon className="w-4 h-4" /> Settings
					</Link>
				</nav>
			</aside>

			{/* --- Main Content --- */}
			<main className="flex-1 flex flex-col h-screen overflow-y-auto">

				{/* --- Depth Header (Glassmorphism + Shadow) --- */}
				{/* <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
					<div className="flex-1 max-w-md">
						<div className="group relative flex items-center">
							<Search className="absolute left-4 w-4 h-4 text-text-main/30 group-focus-within:text-primary-red transition-colors z-10" />
							<input
								type="text"
								placeholder="Search settings..."
								className="w-full bg-light-gray/50 border border-gray-200/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-dark-bg placeholder:text-text-main/30 focus:bg-white focus:border-primary-red/30 focus:ring-4 focus:ring-primary-red/5 outline-none transition-all"
							/>
						</div>
					</div>

					<div className="flex items-center gap-6">
						<button className="relative p-2 text-text-main/40 hover:text-primary-red hover:bg-primary-red/5 rounded-xl transition-all group">
							<Bell className="w-5 h-5" />
							<span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary-red rounded-full border-2 border-white"></span>
						</button>
						<div className="h-8 w-px bg-gray-200/60"></div>
						<div className="flex items-center gap-3 pl-2 group cursor-pointer">
							<div className="text-right hidden sm:block">
								<p className="text-sm font-bold text-dark-bg group-hover:text-primary-red transition-colors">Kidakorn Intha</p>
								<p className="text-[11px] text-text-main/50 font-bold uppercase tracking-wider">System Admin</p>
							</div>
							<Image
								src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coke"
								alt="profile"
								width={40}
								height={40}
								className="rounded-xl bg-light-gray border-2 border-white shadow-md group-hover:scale-105 transition-all"
								unoptimized
							/>
						</div>
					</div>
				</header> */}

				{/* --- Settings Page Content --- */}
				<div className="p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-black text-dark-bg tracking-tight">System Settings</h1>
							<p className="text-text-main/60 text-sm font-medium mt-1">Manage your API credentials and preference profile.</p>
						</div>
						<div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-text-main/40 shadow-sm">
							Last synced: Just now
						</div>
					</div>

					{/* --- API Configuration Card --- */}
					<section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
						<div className="p-6 border-b border-gray-100 bg-light-gray/20 flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 bg-dark-bg text-white rounded-xl flex items-center justify-center shadow-lg shadow-dark-bg/20">
									<Key className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-lg font-bold text-dark-bg">API Key Management</h2>
									<p className="text-xs text-text-main/50 font-medium tracking-wide">Secure your Google AI access tokens</p>
								</div>
							</div>
							<div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
								<ShieldCheck className="w-3 h-3" /> Encrypted
							</div>
						</div>

						<div className="p-8 space-y-6">
							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
									Google Cloud API Key
								</label>
								<div className="relative group">
									<input
										type="password"
										value={apiKey}
										onChange={(e) => setApiKey(e.target.value)}
										className="w-full bg-light-gray/30 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-dark-bg focus:bg-white focus:border-primary-red/40 focus:ring-4 focus:ring-primary-red/5 outline-none transition-all font-mono"
									/>
									<div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-main/20 group-hover:text-text-main/40 transition-colors">
										<Key className="w-4 h-4" />
									</div>
								</div>
								<p className="text-[11px] text-text-main/40 font-medium">
									This key provides access to <span className="text-dark-bg font-bold">Imagen 4.0</span> and <span className="text-dark-bg font-bold">Gemini 3.0</span> models.
								</p>
							</div>

							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg">Default Output Model</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<button className="flex items-center justify-between p-4 bg-white border-2 border-primary-red rounded-xl shadow-sm text-left group">
										<div className="flex items-center gap-3">
											<Sparkles className="w-5 h-5 text-primary-red" />
											<div>
												<p className="text-sm font-bold text-dark-bg">Imagen 4.0 Generate</p>
												<p className="text-[10px] text-text-main/50 font-medium">High-fidelity Masterpieces</p>
											</div>
										</div>
										<ChevronRight className="w-4 h-4 text-primary-red" />
									</button>
									<button className="flex items-center justify-between p-4 bg-light-gray/20 border border-gray-200 rounded-xl text-left hover:border-dark-bg/20 transition-all">
										<div className="flex items-center gap-3">
											<RefreshCw className="w-5 h-5 text-text-main/30" />
											<div>
												<p className="text-sm font-bold text-text-main/60">Imagen 4.0 Fast</p>
												<p className="text-[10px] text-text-main/40 font-medium">Quick 512px renders</p>
											</div>
										</div>
									</button>
								</div>
							</div>
						</div>
					</section>

					{/* --- Profile Preferences Card --- */}
					<section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
						<div className="p-6 border-b border-gray-100 bg-light-gray/20 flex items-center gap-4">
							<div className="w-10 h-10 bg-primary-red text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-red/20">
								<User className="w-5 h-5" />
							</div>
							<div>
								<h2 className="text-lg font-bold text-dark-bg">Admin Profile</h2>
								<p className="text-xs text-text-main/50 font-medium tracking-wide">Personalize your system identity</p>
							</div>
						</div>

						<div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg">Full Name</label>
								<input
									type="text"
									defaultValue="Kidakorn Intha"
									className="w-full bg-light-gray/30 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-dark-bg outline-none focus:bg-white focus:border-primary-red/40 transition-all"
								/>
							</div>
							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg">Business Email</label>
								<input
									type="email"
									defaultValue="admin@devashop.com"
									className="w-full bg-light-gray/30 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-dark-bg outline-none focus:bg-white focus:border-primary-red/40 transition-all"
								/>
							</div>
						</div>
					</section>

					{/* --- Save Button --- */}
					<div className="flex justify-end items-center gap-4 pt-4 pb-12">
						<p className="text-xs text-text-main/30 font-bold italic underline decoration-primary-red/20 underline-offset-4">Changes are applied immediately across all studio modules.</p>
						<button
							onClick={handleSave}
							disabled={isSaving}
							className="bg-dark-bg hover:bg-primary-red text-white font-black px-10 py-4 rounded-xl flex items-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-dark-bg/20 active:scale-95"
						>
							{isSaving ? (
								<>
									<RefreshCw className="w-4 h-4 animate-spin" />
									Synchronizing...
								</>
							) : (
								<>
									<Save className="w-5 h-5" />
									Save Preferences
								</>
							)}
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}