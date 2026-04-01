/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
// 🟢 1. Import useRouter เพื่อใช้พาวาร์ปเปลี่ยนหน้า
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, Image as ImageIcon, Video, Download, Copy, CheckCircle2, RefreshCw, FileText, Megaphone } from "lucide-react";

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
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("IMAGE");

	const router = useRouter(); // 🟢 2. เรียกใช้ Router

	const fetchAssets = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/user/assets');
			const data = await response.json();
			if (data.status === "success" && data.assets) {
				setAssets(data.assets);
			}
		} catch (error) {
			console.error("Failed to load gallery:", error);
		} finally {
			setTimeout(() => setLoading(false), 500);
		}
	};

	const getAssetSrc = (asset: Asset) => {
		if (asset.outputUrl.startsWith('http')) {
			return asset.outputUrl;
		}
		const mimeType = asset.type === "IMAGE" ? "image/png" : "video/mp4";
		return `data:${mimeType};base64,${asset.outputUrl}`;
	};

	const handleDownload = async (asset: Asset) => {
		try {
			let downloadUrl = '';

			if (asset.outputUrl.startsWith('http')) {
				const response = await fetch(asset.outputUrl);
				const blob = await response.blob();
				downloadUrl = window.URL.createObjectURL(blob);
			} else {
				downloadUrl = getAssetSrc(asset);
			}

			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = `Devakorn_${asset.type}_${Date.now()}.${asset.type === "IMAGE" ? 'png' : 'mp4'}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			if (asset.outputUrl.startsWith('http')) {
				window.URL.revokeObjectURL(downloadUrl);
			}
		} catch (error) {
			console.error("Download failed, opening in new tab", error);
			window.open(getAssetSrc(asset), '_blank');
		}
	};

	const copyPrompt = (id: string, text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	// 🟢 3. ฟังก์ชัน One-Click Campaign Builder
	const handleBuildCampaign = (asset: Asset) => {
		const imageUrl = getAssetSrc(asset);
		// จำรูปที่เลือกลงในเครื่องลูกค้า (กันปัญหา URL ยาวเกินไปในกรณี Base64)
		localStorage.setItem("selectedCampaignImage", imageUrl);
		// พาวาร์ปไปหน้า Campaign Builder
		router.push("/campaign-builder");
	};

	useEffect(() => {
		fetchAssets();
	}, []);

	const filteredAssets = assets.filter(asset => asset.type === activeTab);

	return (
		<DashboardLayout>
			<div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
					<div>
						<h1 className="text-3xl font-black text-dark-bg tracking-tight">My Creations</h1>
						<p className="text-text-main/50 font-medium">Manage and reuse your commercial product assets.</p>
					</div>
					<button
						onClick={fetchAssets}
						disabled={loading}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary-red hover:border-primary-red/30 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
					>
						<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
						<span className="text-xs font-bold">{loading ? 'Updating...' : 'Refresh'}</span>
					</button>
				</div>

				<div className="flex gap-2 border-b border-gray-200 pb-px">
					<button
						onClick={() => setActiveTab("IMAGE")}
						className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "IMAGE" ? "border-primary-red text-primary-red" : "border-transparent text-gray-500 hover:text-gray-700"}`}
					>
						<ImageIcon className="w-4 h-4" /> Images
					</button>
					<button
						onClick={() => setActiveTab("VIDEO")}
						className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "VIDEO" ? "border-primary-red text-primary-red" : "border-transparent text-gray-500 hover:text-gray-700"}`}
					>
						<Video className="w-4 h-4" /> Videos
					</button>
					<button
						onClick={() => setActiveTab("PROMPT")}
						className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "PROMPT" ? "border-primary-red text-primary-red" : "border-transparent text-gray-500 hover:text-gray-700"}`}
					>
						<FileText className="w-4 h-4" /> Prompts
					</button>
				</div>

				{loading ? (
					<div className="flex flex-col items-center justify-center py-20">
						<Loader2 className="w-10 h-10 animate-spin text-primary-red mb-4" />
						<p className="text-text-main/50 font-bold">Loading your assets...</p>
					</div>
				) : filteredAssets.length > 0 ? (
					activeTab === "PROMPT" ? (
						<div className="flex flex-col gap-5">
							{filteredAssets.map((asset) => (
								<div key={asset.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6">
									<div className="flex-1">
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Original Idea</p>
										<p className="text-sm text-gray-500 italic">"{asset.prompt}"</p>
										<div className="mt-4 pt-4 border-t border-gray-100">
											<p className="text-[10px] font-black text-primary-red uppercase tracking-widest mb-2">Enhanced Output</p>
											<p className="text-sm font-medium text-gray-900 leading-relaxed">{asset.outputUrl}</p>
										</div>
									</div>
									<div className="flex flex-col justify-between items-start sm:items-end sm:w-56 shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
										<span className="text-[10px] font-bold text-primary-red uppercase tracking-wider bg-primary-red/5 px-3 py-1.5 rounded-md mb-4">
											{asset.category || "General"}
										</span>
										<button
											onClick={() => copyPrompt(asset.id, asset.outputUrl)}
											className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 text-gray-700 hover:bg-dark-bg hover:text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 font-bold text-xs"
										>
											{copiedId === asset.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
											{copiedId === asset.id ? 'Copied!' : 'Copy Prompt'}
										</button>
										<p className="text-[10px] text-gray-400 font-bold mt-4">
											ID: {asset.id.slice(-6).toUpperCase()} • {new Date(asset.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
							{filteredAssets.map((asset) => (
								<div key={asset.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
									<div className="aspect-square bg-light-gray relative overflow-hidden shrink-0">
										{asset.type === "IMAGE" ? (
											<img src={getAssetSrc(asset)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Generated asset" />
										) : (
											<video src={getAssetSrc(asset)} className="w-full h-full object-cover" muted loop onMouseOver={(e) => e.currentTarget.play()} onMouseOut={(e) => e.currentTarget.pause()} />
										)}

										{/* ปุ่มบนขวา (Download, Copy) */}
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

										{/* 🟢 4. ปุ่มล่าง (Build Campaign) เลื่อนขึ้นมาโชว์ตอน Hover เฉพาะรูปภาพ */}
										{asset.type === "IMAGE" && (
											<div className="absolute bottom-3 left-3 right-3 translate-y-16 group-hover:translate-y-0 transition-all duration-300">
												<button
													onClick={() => handleBuildCampaign(asset)}
													className="w-full py-2.5 bg-primary-red/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-primary-red transition-all font-bold text-xs flex items-center justify-center gap-2"
												>
													<Megaphone className="w-4 h-4" /> Build Campaign
												</button>
											</div>
										)}
									</div>

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
					)
				) : (
					<div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
						{activeTab === "IMAGE" && <ImageIcon className="w-16 h-16 mx-auto text-light-gray mb-4" />}
						{activeTab === "VIDEO" && <Video className="w-16 h-16 mx-auto text-light-gray mb-4" />}
						{activeTab === "PROMPT" && <FileText className="w-16 h-16 mx-auto text-light-gray mb-4" />}
						<h3 className="text-xl font-bold text-dark-bg">No {activeTab.toLowerCase()}s found</h3>
						<p className="text-text-main/40 font-medium mt-1">Go generate some amazing content!</p>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}