/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, ShieldCheck, Image as ImageIcon, Video, FileText, Trash2, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminGallery() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("IMAGE");

	useEffect(() => {
		if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
			router.push("/");
			toast.error("Access Denied. Admins only.");
		}
	}, [status, session, router]);

	const { data, isLoading } = useSWR(
		status === "authenticated" && (session?.user as any)?.role === "ADMIN" ? '/api/admin/assets' : null,
		fetcher, { refreshInterval: 15000 }
	);

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this content? This cannot be undone.")) return;

		const toastId = toast.loading("Deleting content...");
		try {
			const res = await fetch(`/api/admin/assets?id=${id}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success("Content deleted.", { id: toastId });
				mutate('/api/admin/assets');
			} else {
				toast.error("Failed to delete", { id: toastId });
			}
		} catch (error) {
			toast.error("Network error", { id: toastId });
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
				<Loader2 className="w-10 h-10 animate-spin text-red-600" />
			</div>
		);
	}

	if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") return null;

	const assets = data?.assets || [];
	const filteredAssets = assets.filter((asset: any) => asset.type === activeTab);

	return (
		<DashboardLayout>
			<div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
					<div>
						<h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
							<ShieldCheck className="w-8 h-8 text-red-600" /> Content Moderation
						</h1>
						<p className="text-gray-500 text-sm mt-1 font-medium">Monitor and manage all generated assets across the platform.</p>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex gap-2 border-b border-gray-200 pb-px">
					<button
						onClick={() => setActiveTab("IMAGE")}
						className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "IMAGE" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
					>
						<ImageIcon className="w-4 h-4" /> Images
					</button>
					<button
						onClick={() => setActiveTab("VIDEO")}
						className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "VIDEO" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
					>
						<Video className="w-4 h-4" /> Videos
					</button>
					<button
						onClick={() => setActiveTab("PROMPT")}
						className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "PROMPT" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
					>
						<FileText className="w-4 h-4" /> Prompts
					</button>
				</div>

				{/* Gallery Area */}
				{filteredAssets.length === 0 ? (
					<div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
						<p className="text-gray-500 font-medium">No {activeTab.toLowerCase()}s generated yet.</p>
					</div>
				) : (
					/* 🟢 แยก Layout การแสดงผลตามประเภท Tab */
					activeTab === "PROMPT" ? (

						/* 👉 Layout สำหรับ Prompts (แนวนอนเรียงลงมา) */
						<div className="flex flex-col gap-4">
							{filteredAssets.map((asset: any) => (
								<div key={asset.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 relative">
									<div className="flex-1">
										<div className="flex justify-between items-start mb-3">
											<div>
												<p className="text-sm font-bold text-gray-900">{asset.user?.name || "Unknown User"}</p>
												<p className="text-xs text-gray-500">{asset.user?.email}</p>
											</div>
											<span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
												{asset.category || "None"}
											</span>
										</div>
										<div className="mt-4">
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Original Idea:</p>
											<p className="text-sm text-gray-500 italic">"{asset.prompt}"</p>
										</div>
										<div className="mt-3 pt-3 border-t border-gray-100">
											<p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Enhanced Output:</p>
											<p className="text-sm font-medium text-gray-800 leading-relaxed">{asset.outputUrl}</p>
										</div>
									</div>
									<div className="sm:w-32 shrink-0 flex flex-col justify-between items-end border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-4">
										<button
											onClick={() => handleDelete(asset.id)}
											className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
											title="Delete Prompt"
										>
											<Trash2 className="w-5 h-5" />
										</button>
										<p className="text-[10px] text-gray-400 mt-auto text-right font-medium">
											{new Date(asset.createdAt).toLocaleString()}
										</p>
									</div>
								</div>
							))}
						</div>

					) : (

						/* 👉 Layout สำหรับ Images & Videos (Grid 4 คอลัมน์แบบเดิม) */
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{filteredAssets.map((asset: any) => (
								<div key={asset.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all flex flex-col">
									{/* Asset Preview */}
									<div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center shrink-0">
										{asset.type === "IMAGE" && (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={asset.outputUrl} alt="Generated" className="w-full h-full object-cover" />
										)}
										{asset.type === "VIDEO" && (
											<video src={asset.outputUrl} controls muted className="w-full h-full object-cover bg-black" />
										)}

										<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<a href={asset.outputUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/90 text-gray-700 hover:text-blue-600 rounded-lg backdrop-blur-sm shadow-sm">
												<ExternalLink className="w-4 h-4" />
											</a>
											<button onClick={() => handleDelete(asset.id)} className="p-2 bg-white/90 text-gray-700 hover:text-red-600 rounded-lg backdrop-blur-sm shadow-sm">
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>

									{/* Asset Info */}
									<div className="p-4 flex flex-col flex-1">
										<div className="flex items-start justify-between gap-2 mb-2">
											<div className="flex-1 truncate">
												<p className="text-sm font-bold text-gray-900 truncate" title={asset.user?.email}>{asset.user?.name || "Unknown User"}</p>
												<p className="text-xs text-gray-500 truncate">{asset.user?.email}</p>
											</div>
											<span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md whitespace-nowrap">
												{asset.category || "None"}
											</span>
										</div>
										<p className="text-xs text-gray-500 line-clamp-2 mt-auto" title={asset.prompt}>
											<span className="font-semibold text-gray-700">Prompt:</span> {asset.prompt}
										</p>
										<p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100 font-medium">
											{new Date(asset.createdAt).toLocaleString()}
										</p>
									</div>
								</div>
							))}
						</div>
					)
				)}
			</div>
		</DashboardLayout>
	);
}