/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	User, Save, Loader2, Activity, CheckCircle2, ShieldAlert, Cpu, Database, Zap
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Settings() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [fullName, setFullName] = useState("");
	const [businessEmail, setBusinessEmail] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	
	// 🟢 เพิ่มบรรทัดนี้ครับ (ที่ผมลืมไปในรอบก่อน)
	const [lastSynced, setLastSynced] = useState("Never");

	// Diagnostic States
	const [isTesting, setIsTesting] = useState(false);
	const [systemStatus, setSystemStatus] = useState<'idle' | 'online' | 'error'>('idle');
	const [activeModels, setActiveModels] = useState<any[]>([]);
	const [projectId, setProjectId] = useState("");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated") {
			if ((session?.user as any)?.role === "ADMIN") {
				fetchSettings();
			} else {
				router.push("/");
				toast.error("Access Denied: Admins only.");
			}
		}
	}, [status, session, router]);

	const fetchSettings = async () => {
		try {
			const res = await fetch('/api/admin/settings');
			const data = await res.json();
			if (data.status === 'success') {
				setFullName(data.user.name || "");
				setBusinessEmail(data.user.email || "");
				setLastSynced("Just now"); // 🟢 ใช้งานได้แล้ว
			}
		} catch (error) {
			toast.error("Failed to load settings");
		} finally {
			setIsLoading(false);
		}
	};

	// 🛠️ นี่คือที่มาของ handleSave ครับ เป็นฟังก์ชันภายใน Component นี้เอง
	const handleSave = async () => {
		setIsSaving(true);
		const toastId = toast.loading("Saving profile...");
		try {
			const res = await fetch('/api/admin/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: fullName, email: businessEmail })
			});
			const result = await res.json();

			if (res.ok) {
				toast.success(result.message || "Saved successfully", { id: toastId });
				setLastSynced("Just now"); // 🟢 ใช้งานได้แล้ว
			} else {
				toast.error(result.message || "Failed to save", { id: toastId });
			}
		} catch (error) {
			toast.error("Network error during save.");
		} finally {
			setIsSaving(false);
		}
	};

	const runDiagnostics = async () => {
		setIsTesting(true);
		setSystemStatus('idle');
		try {
			const res = await fetch(`/api/admin/test-api`);
			const data = await res.json();

			if (res.ok && data.status === "success") {
				setSystemStatus('online');
				setActiveModels(data.activeModels || []);
				setProjectId(data.projectId || "Unknown");
				toast.success("Vertex AI Connected!");
			} else {
				setSystemStatus('error');
				const rawMsg = data.message || "Connection Failed";
				const cleanMsg = typeof rawMsg === 'string' ? rawMsg.split('<')[0] : "Connection Failed";
				toast.error(cleanMsg);
			}
		} catch (error) {
			setSystemStatus('error');
			toast.error("Network error during diagnostics.");
		} finally {
			setIsTesting(false);
		}
	};

	if (status === "loading" || (status === "authenticated" && isLoading && (session?.user as any)?.role === "ADMIN")) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
				<Loader2 className="w-10 h-10 animate-spin text-red-600" />
			</div>
		);
	}

	if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") return null;

	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-12">

				<div className="flex justify-between items-end">
					<div>
						<h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
							<Activity className="w-8 h-8 text-red-600" /> System Diagnostics
						</h1>
						<p className="text-gray-500 text-sm mt-1">Verify Google Cloud connection and manage your admin profile.</p>
					</div>
					{/* 🟢 แสดงผลเวลาที่ซิงค์ข้อมูลล่าสุด */}
					<div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-400 shadow-sm inline-block">
						Last synced: {lastSynced}
					</div>
				</div>

				<section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
					<div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
								<Database className="w-5 h-5" />
							</div>
							<h2 className="text-lg font-bold text-gray-900">Vertex AI Status</h2>
						</div>
						<button
							onClick={runDiagnostics}
							disabled={isTesting}
							className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
						>
							{isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
							Run Check
						</button>
					</div>

					<div className="p-6">
						{systemStatus === 'idle' && (
							<div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
								<p className="text-sm text-gray-400 font-bold tracking-wide">Press "Run Check" to verify cloud connectivity.</p>
							</div>
						)}

						{systemStatus === 'error' && (
							<div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
								<ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
								<div>
									<h3 className="text-sm font-black text-red-800">Connection Failed</h3>
									<p className="text-xs text-red-600 mt-1 leading-relaxed">
										Check if <code className="bg-white px-1 rounded border border-red-200 font-mono">vertex-key.json</code> is in the root folder.
									</p>
								</div>
							</div>
						)}

						{systemStatus === 'online' && (
							<div className="space-y-6">
								<div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
									<div className="flex items-center gap-3">
										<CheckCircle2 className="w-5 h-5 text-emerald-600" />
										<p className="text-sm font-black text-emerald-800">Connected to Project: <span className="opacity-70">{projectId}</span></p>
									</div>
									<span className="text-[10px] font-black text-white bg-emerald-600 px-3 py-1 rounded-full uppercase">Online</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
									{activeModels.map((m: any) => (
										<div key={m.name} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center gap-3">
											<div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-blue-500">
												<Cpu className="w-4 h-4" />
											</div>
											<div>
												<p className="text-xs font-black text-gray-900">{m.name}</p>
												<p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">{m.status}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</section>

				<section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
					<div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
						<div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
							<User className="w-5 h-5" />
						</div>
						<h2 className="text-lg font-bold text-gray-900">Admin Account</h2>
					</div>
					<div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
						<div className="space-y-2">
							<label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
							<input 
								type="text" 
								value={fullName} 
								onChange={(e) => setFullName(e.target.value)} 
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
							/>
						</div>
						<div className="space-y-2">
							<label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
							<input 
								type="email" 
								value={businessEmail} 
								onChange={(e) => setBusinessEmail(e.target.value)} 
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
							/>
						</div>
					</div>
					<div className="px-8 pb-8 flex justify-end">
						<button 
							onClick={handleSave} 
							disabled={isSaving} 
							className="px-8 py-3 bg-gray-900 text-white font-black text-sm rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg active:scale-95"
						>
							{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
							Save Changes
						</button>
					</div>
				</section>

			</div>
		</DashboardLayout>
	);
}