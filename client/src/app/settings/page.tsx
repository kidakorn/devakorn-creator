/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	User, Save, Loader2, Activity, CheckCircle2, ShieldAlert, Database, Zap,
	ImageIcon, Clapperboard, Wand2, Cpu
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Settings() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [fullName, setFullName] = useState("");
	const [businessEmail, setBusinessEmail] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [lastSynced, setLastSynced] = useState("Never");

	// Diagnostic States
	const [isTesting, setIsTesting] = useState(false);
	const [systemStatus, setSystemStatus] = useState<'idle' | 'online' | 'error'>('idle');
	const [apiModels, setApiModels] = useState<any[]>([]);
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
				setLastSynced("Just now");
			}
		} catch (error) {
			toast.error("Failed to load settings");
		} finally {
			setIsLoading(false);
		}
	};

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
				setLastSynced("Just now");
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
				setApiModels(data.models || []);
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

	// Helper function for Icons
	const getModelIcon = (type: string) => {
		switch (type) {
			case 'Image': return <ImageIcon className="w-5 h-5" />;
			case 'Video': return <Clapperboard className="w-5 h-5" />;
			case 'Prompt': return <Wand2 className="w-5 h-5" />;
			default: return <Cpu className="w-5 h-5" />;
		}
	};

	if (status === "loading" || (status === "authenticated" && isLoading && (session?.user as any)?.role === "ADMIN")) {
		return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>;
	}

	if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") return null;

	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-12">

				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
					<div>
						<h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
							<Activity className="w-8 h-8 text-red-600" /> System Diagnostics
						</h1>
						<p className="text-gray-500 text-sm mt-1">Verify Google Cloud connection and monitor API models.</p>
					</div>
					<div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-400 shadow-sm inline-block">
						Last synced: {lastSynced}
					</div>
				</div>

				{/* SYSTEM HEALTH & API MODELS */}
				<section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
					<div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg">
								<Database className="w-5 h-5" />
							</div>
							<div>
								<h2 className="text-lg font-bold text-gray-900">Vertex AI Platform</h2>
								<p className="text-xs text-gray-500 font-medium">Connection Status & Model Fleet</p>
							</div>
						</div>
						<button
							onClick={runDiagnostics}
							disabled={isTesting}
							className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md active:scale-95"
						>
							{isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white/20" />}
							Run Check
						</button>
					</div>

					<div className="p-6">
						{systemStatus === 'idle' && (
							<div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
								<p className="text-sm text-gray-400 font-bold tracking-wide">Press "Run Check" to verify connection and list APIs.</p>
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
							<div className="space-y-6 animate-in fade-in duration-500">
								{/* Connection Badge */}
								<div className="flex flex-wrap items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl gap-4">
									<div className="flex items-center gap-3">
										<CheckCircle2 className="w-6 h-6 text-emerald-600" />
										<div>
											<p className="text-sm font-black text-emerald-800">Cloud Authentication Verified</p>
											<p className="text-[11px] text-emerald-600/80 font-bold mt-0.5">Project ID: {projectId}</p>
										</div>
									</div>
									<span className="text-[10px] font-black text-emerald-700 bg-emerald-200/50 border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
										<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
									</span>
								</div>

								{/* API List Grid */}
								<div>
									<h3 className="text-sm font-black text-gray-800 mb-3 px-1 flex items-center justify-between">
										Available APIs
										<span className="text-[10px] text-gray-400 font-bold uppercase">{apiModels.length} Models Loaded</span>
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{apiModels.map((m: any) => (
											<div key={m.id} className={`p-4 border rounded-2xl flex items-center justify-between transition-all ${m.status === 'Active' ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50/50 border-gray-200 opacity-80'}`}>

												<div className="flex items-center gap-3">
													<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
														{getModelIcon(m.type)}
													</div>
													<div>
														<p className={`text-sm font-bold ${m.status === 'Active' ? 'text-gray-900' : 'text-gray-500'}`}>{m.name}</p>
														<p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-35 sm:max-w-full">{m.id}</p>
													</div>
												</div>

												<div className="flex flex-col items-end gap-1.5 shrink-0">
													{m.status === 'Active' ? (
														<>
															<span className="flex items-center gap-1.5 text-[10px] font-black text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-md">
																<CheckCircle2 className="w-3 h-3" /> ONLINE
															</span>
															<span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-blue-100">
																In Use
															</span>
														</>
													) : (
														<span className="text-[10px] font-bold text-gray-500 bg-gray-200/50 border border-gray-200 px-3 py-1.5 rounded-md">
															Standby
														</span>
													)}
												</div>

											</div>
										))}
									</div>
								</div>

							</div>
						)}
					</div>
				</section>

				{/* ADMIN ACCOUNT PROFILE */}
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
					<div className="px-8 pb-8 mb-8 flex justify-end">
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