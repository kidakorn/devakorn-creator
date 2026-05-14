"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, Heart, Copy, CheckCircle2, Globe, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface PublicAsset {
	id: string;
	type: string;
	prompt: string;
	outputUrl: string;
	category?: string;
	likeCount: number;
	user: {
		name: string | null;
		image: string | null;
	};
}

export default function ExplorePage() {
	const [assets, setAssets] = useState<PublicAsset[]>([]);
	const [loading, setLoading] = useState(true);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const fetchPublicAssets = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/explore');
			const data = await response.json();
			if (data.status === "success" && data.assets) {
				setAssets(data.assets);
			}
		} catch (error) {
			console.error("Failed to load explore gallery:", error);
		} finally {
			setLoading(false);
		}
	};

	const getAssetSrc = (asset: PublicAsset) => {
		if (asset.outputUrl.startsWith('http')) {
			return asset.outputUrl;
		}
		const mimeType = asset.type === "IMAGE" ? "image/png" : "video/mp4";
		return `data:${mimeType};base64,${asset.outputUrl}`;
	};

	const extractEnglishPrompt = (fullPrompt: string) => {
		const enIndex = fullPrompt.indexOf('[EN]');
		if (enIndex !== -1) {
			let text = fullPrompt.substring(enIndex + 4).trim();
			const thIndex = text.indexOf('[TH]');
			if (thIndex !== -1) {
				text = text.substring(0, thIndex).trim();
			}
			return text;
		}
		return fullPrompt;
	};

	useEffect(() => {
		fetchPublicAssets();
	}, []);

	return (
		<DashboardLayout>
			<div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div>
					<h1 className="text-3xl font-black text-dark-bg tracking-tight flex items-center gap-2">
						<Globe className="w-8 h-8 text-primary-red" />
						Community Explore
					</h1>
					<p className="text-text-main/50 font-medium mt-1">Discover amazing commercial assets created by the Devakorn community.</p>
				</div>

				{loading ? (
					<div className="flex flex-col items-center justify-center py-32">
						<Loader2 className="w-10 h-10 animate-spin text-primary-red mb-4" />
						<p className="text-text-main/50 font-bold">Loading community gallery...</p>
					</div>
				) : assets.length > 0 ? (
					<div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
						{assets.map((asset) => (
							<div key={asset.id} className="break-inside-avoid group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative">
								<div className="relative overflow-hidden bg-light-gray">
									<img src={getAssetSrc(asset)} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Generated asset" loading="lazy" />
									
									<div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
										<p className="text-white text-xs font-medium line-clamp-4 mb-1 drop-shadow-md select-text">{extractEnglishPrompt(asset.prompt)}</p>
									</div>
								</div>
								
								<div className="p-4 flex items-center justify-between z-10 bg-white">
									<div className="flex items-center gap-2">
										<div className="w-6 h-6 rounded-full bg-primary-red/10 flex items-center justify-center overflow-hidden">
											{asset.user.image ? (
												<img src={asset.user.image} alt={asset.user.name || "User"} className="w-full h-full object-cover" />
											) : (
												<span className="text-primary-red text-[10px] font-black">{asset.user.name?.charAt(0) || "U"}</span>
											)}
										</div>
										<span className="text-xs font-bold text-dark-bg truncate max-w-[100px]">{asset.user.name || "Anonymous"}</span>
									</div>
									<div className="flex items-center gap-1 text-text-main/50">
										<Heart className="w-3.5 h-3.5" />
										<span className="text-[10px] font-bold">{asset.likeCount}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
						<Globe className="w-16 h-16 mx-auto text-light-gray mb-4" />
						<h3 className="text-xl font-bold text-dark-bg">No public assets yet</h3>
						<p className="text-text-main/40 font-medium mt-1">Be the first to share your creations to the community!</p>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
