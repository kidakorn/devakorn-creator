/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, Image as ImageIcon, Video, Download, Copy, CheckCircle2, RefreshCw } from "lucide-react";

interface Asset {
	id: string;
	type: string;
	prompt: string;
	outputUrl: string;
	category?: string;
	createdAt: string;
}

export default function GalleryPage() {
	const [assets, setAssets] = useState<Asset[]>([]);
	const [loading, setLoading] = useState(true);
	const [copiedId, setCopiedId] = useState<string | null>(null); // สำหรับสถานะการก๊อปปี้

	const fetchAssets = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/user/assets');
			const data = await response.json();
			if (data.status === "success") {
				setAssets(data.assets);
			}
		} catch (error) {
			console.error("Failed to load gallery:", error);
		} finally {
			// หน่วงเวลา 0.5 วินาทีเพื่อให้เห็น Animation การหมุนที่สวยงาม
			setTimeout(() => setLoading(false), 500);
		}
	};

	const handleDownload = (asset: Asset) => {
		const link = document.createElement('a');
		const mimeType = asset.type === "IMAGE" ? "image/png" : "video/mp4";
		link.href = `data:${mimeType};base64,${asset.outputUrl}`;
		link.download = `Devakorn_${asset.type}_${Date.now()}.${asset.type === "IMAGE" ? 'png' : 'mp4'}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const copyPrompt = (id: string, text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	useEffect(() => {
		fetchAssets();
	}, []);

	return (
		<DashboardLayout>
			<div className="p-8 max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-black text-dark-bg tracking-tight">My Creations</h1>
						<p className="text-text-main/50 font-medium">Manage and reuse your commercial product assets.</p>
					</div>
					<button
						onClick={fetchAssets}
						disabled={loading}
						className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-primary-red hover:border-primary-red/30 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
					>
						<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
						<span className="text-xs font-bold">{loading ? 'Updating...' : 'Refresh'}</span>
					</button>
				</div>

				{loading ? (
					<div className="flex flex-col items-center justify-center py-20">
						<Loader2 className="w-10 h-10 animate-spin text-primary-red mb-4" />
						<p className="text-text-main/50 font-bold">Loading your assets...</p>
					</div>
				) : assets.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{assets.map((asset) => (
							<div key={asset.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">

								<div className="aspect-square bg-light-gray relative overflow-hidden shrink-0">
									{asset.type === "IMAGE" ? (
										<img src={`data:image/png;base64,${asset.outputUrl}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Generated asset" />
									) : (
										<video src={`data:video/mp4;base64,${asset.outputUrl}`} className="w-full h-full object-cover" muted loop onMouseOver={(e) => e.currentTarget.play()} onMouseOut={(e) => e.currentTarget.pause()} />
									)}

									{/* Floating Actions */}
									<div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-all duration-300">
										<button
											onClick={() => handleDownload(asset)}
											className="p-2.5 bg-white text-dark-bg rounded-xl shadow-lg hover:bg-primary-red hover:text-white transition-all"
											title="Download"
										>
											<Download className="w-4 h-4" />
										</button>
										<button
											onClick={() => copyPrompt(asset.id, asset.prompt)}
											className="p-2.5 bg-white text-dark-bg rounded-xl shadow-lg hover:bg-dark-bg hover:text-white transition-all"
											title="Copy Prompt"
										>
											{copiedId === asset.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
										</button>
									</div>

									<div className="absolute bottom-3 left-3">
										<span className="text-[9px] font-black px-2 py-1 rounded-md bg-black/50 text-white backdrop-blur-sm uppercase">
											{asset.type}
										</span>
									</div>
								</div>

								{/* 🟢 ส่วนแสดงรายละเอียด (Detail Section) */}
								<div className="p-5 flex flex-col flex-1">
									<div className="mb-4">
										<span className="text-[10px] font-bold text-primary-red uppercase tracking-wider bg-primary-red/5 px-2 py-1 rounded">
											{asset.category || "General"}
										</span>
									</div>
									<p className="text-xs text-dark-bg font-medium leading-relaxed line-clamp-4 flex-1">
										{asset.prompt}
									</p>
									<div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-text-main/40 font-bold">
										<span>ID: {asset.id.slice(-6).toUpperCase()}</span>
										<span>{new Date(asset.createdAt).toLocaleDateString()}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
						<ImageIcon className="w-16 h-16 mx-auto text-light-gray mb-4" />
						<h3 className="text-xl font-bold text-dark-bg">Start your production</h3>
						<p className="text-text-main/40 font-medium mt-1">Generated assets will appear here.</p>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}