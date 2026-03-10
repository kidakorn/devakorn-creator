"use client";

import { useState } from "react";
import {
	Key,
	User,
	ShieldCheck,
	Save,
	Sparkles,
	RefreshCw,
	ChevronRight
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Settings() {
	const [apiKey, setApiKey] = useState("AIzaSyB***************************");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = () => {
		setIsSaving(true);
		// จำลองการบันทึกข้อมูล
		setTimeout(() => setIsSaving(false), 1500);
	};

	// 🟢 สังเกตว่าเราไม่ต้องมี <div className="min-h-screen"> หรือ <main> ครอบแล้ว 
	// เริ่มที่ container เนื้อหาได้เลย เพราะ DashboardLayout จัดการให้แล้วครับ
	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

				{/* --- Header --- */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
					<div>
						<h1 className="text-2xl font-black text-dark-bg tracking-tight">System Settings</h1>
						<p className="text-text-main/60 text-sm font-medium mt-1">Manage your API credentials and preference profile.</p>
					</div>
					<div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-text-main/40 shadow-sm inline-block">
						Last synced: Just now
					</div>
				</div>

				{/* --- API Configuration Card --- */}
				<section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
					<div className="p-5 sm:p-6 border-b border-gray-100 bg-light-gray/20 flex flex-wrap items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 bg-dark-bg text-white rounded-xl flex items-center justify-center shadow-lg shadow-dark-bg/20 shrink-0">
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

					<div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
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
								This key provides access to <span className="text-dark-bg font-bold">Imagen 3.0</span> and <span className="text-dark-bg font-bold">Gemini 3.1</span> models.
							</p>
						</div>

						<div className="space-y-3">
							<label className="text-sm font-bold text-dark-bg">Default Output Model</label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<button className="flex items-center justify-between p-4 bg-white border-2 border-primary-red rounded-xl shadow-sm text-left group transition-all">
									<div className="flex items-center gap-3">
										<Sparkles className="w-5 h-5 text-primary-red" />
										<div>
											<p className="text-sm font-bold text-dark-bg">Imagen 3.0 Generate</p>
											<p className="text-[10px] text-text-main/50 font-medium">High-fidelity Masterpieces</p>
										</div>
									</div>
									<ChevronRight className="w-4 h-4 text-primary-red" />
								</button>
								<button className="flex items-center justify-between p-4 bg-light-gray/20 border border-gray-200 rounded-xl text-left hover:border-dark-bg/20 hover:bg-white transition-all">
									<div className="flex items-center gap-3">
										<RefreshCw className="w-5 h-5 text-text-main/30" />
										<div>
											<p className="text-sm font-bold text-text-main/60">Imagen 3.0 Fast</p>
											<p className="text-[10px] text-text-main/40 font-medium">Quick 512px renders</p>
										</div>
									</div>
								</button>
							</div>
						</div>
					</div>
				</section>

				{/* --- Profile Preferences Card --- */}
				<section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
					<div className="p-5 sm:p-6 border-b border-gray-100 bg-light-gray/20 flex flex-wrap items-center gap-4">
						<div className="w-10 h-10 bg-primary-red text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-red/20 shrink-0">
							<User className="w-5 h-5" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-dark-bg">Admin Profile</h2>
							<p className="text-xs text-text-main/50 font-medium tracking-wide">Personalize your system identity</p>
						</div>
					</div>

					<div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
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
				<div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-2">
					<p className="text-xs text-text-main/40 font-medium text-center sm:text-right">
						Changes are applied immediately across all studio modules.
					</p>
					<button
						onClick={handleSave}
						disabled={isSaving}
						className="w-full sm:w-auto bg-dark-bg hover:bg-primary-red text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-md active:scale-95"
					>
						{isSaving ? (
							<>
								<RefreshCw className="w-4 h-4 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="w-4 h-4" />
								Save Settings
							</>
						)}
					</button>
				</div>
			</div>
		</DashboardLayout>
	);
}