/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import useSWR from 'swr';
import {
	Video,
	Download,
	Share2,
	RefreshCw,
	Play,
	Monitor,
	Clapperboard,
	ShieldAlert
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const categories = [
	'Product Showcase',
	'TikTok / Reels Ad',
	'Cinematic Promo',
	'Stop Motion',
	'3D Product Reveal',
	'B-Roll Footage'
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VideoCreatorPage() {
	const { data: session } = useSession();
	const [prompt, setPrompt] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('Product Showcase');
	const [aspectRatio, setAspectRatio] = useState('16:9');
	const [isGenerating, setIsGenerating] = useState(false);
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	const { data: balanceData, mutate } = useSWR('/api/user/balance', fetcher, {
		refreshInterval: 10000,
		revalidateOnFocus: true
	});

	const currentCoins = balanceData?.coinBalance ?? 0;
	// 🟢 ดึงสถานะการแบนมาใช้งาน
	const isBanned = balanceData?.isBanned ?? false;

	// 🟢 เปลี่ยนจาก 400 เป็น 350
	const isButtonDisabled = isGenerating || !prompt || currentCoins < 350 || isBanned;

	const handleGenerate = async () => {
		if (isBanned) return alert("Your account has been suspended.");
		if (!prompt) return alert("Please describe your video scene.");

		setIsGenerating(true);
		setVideoUrl(null);

		try {
			const response = await fetch('/api/generate/video', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt,
					category: selectedCategory,
					aspectRatio: aspectRatio
				}),
			});

			const data = await response.json();

			if (response.ok) {
				const finalUrl = data.videoUrl || (data.videoBase64 ? `data:video/mp4;base64,${data.videoBase64}` : null);

				if (finalUrl) {
					setVideoUrl(finalUrl);
					setPrompt('');

					if (data.remainingCoins !== undefined) {
						mutate({ coinBalance: data.remainingCoins, isBanned: isBanned }, false);
					} else {
						mutate();
					}
				}
			} else {
				alert(data.message || "Failed to generate video.");
			}

		} catch (err: any) {
			console.error("Frontend Error:", err);
			alert("Cannot connect to the server. Please try again later.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDownload = async () => {
		if (!videoUrl) return;
		setIsDownloading(true);

		try {
			const response = await fetch(videoUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `Devakorn_Ad_${Date.now()}.mp4`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Download error:", error);
			alert("Failed to download video.");
		} finally {
			setIsDownloading(false);
		}
	};

	const handleShare = async () => {
		if (!videoUrl) return;
		try {
			const response = await fetch(videoUrl);
			const blob = await response.blob();
			const file = new File([blob], `Devakorn_${Date.now()}.mp4`, { type: 'video/mp4' });

			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({
					title: 'สร้างสรรค์ด้วย DEVAKORN Creator AI',
					text: 'ลองดูวิดีโอโฆษณาสินค้า 30 วินาทีที่ฉันเพิ่งสร้างสิ!',
					files: [file],
				});
			} else {
				alert('เบราว์เซอร์ของคุณไม่รองรับการแชร์ไฟล์โดยตรง กรุณากดดาวน์โหลดแทนครับ');
			}
		} catch (error) {
			console.log('Error sharing:', error);
		}
	};

	return (
		<DashboardLayout>
			<div className="min-h-screen bg-[#f8f9fa] p-8">
				<div className="mb-8">
					<h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
						<Clapperboard className="w-8 h-8 text-red-600" />
						Video Ad Creator
					</h1>
					<p className="text-gray-500 mt-2 text-sm font-medium">
						Generate high-converting commercial video assets for your products.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Left Panel */}
					<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
						<div>
							<label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
								<Monitor className="w-4 h-4 text-red-600" /> Platform Format
							</label>
							<div className="flex gap-4">
								<button
									onClick={() => setAspectRatio('16:9')}
									className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold transition-all border ${aspectRatio === '16:9' ? 'bg-red-50 text-red-600 border-red-300 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
								>
									YouTube (16:9)
								</button>
								<button
									onClick={() => setAspectRatio('9:16')}
									className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold transition-all border ${aspectRatio === '9:16' ? 'bg-red-50 text-red-600 border-red-300 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
								>
									TikTok / IG (9:16)
								</button>
							</div>
						</div>

						<div>
							<label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
								<Video className="w-4 h-4 text-red-600" /> Ad Style Category
							</label>
							<div className="flex flex-wrap gap-2">
								{categories.map((cat) => (
									<button
										key={cat}
										onClick={() => setSelectedCategory(cat)}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${selectedCategory === cat ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:bg-red-50'}`}
									>
										{cat}
									</button>
								))}
							</div>
						</div>

						<div>
							<label className="block text-sm font-bold text-gray-700 mb-2">Product & Scene Description</label>
							<textarea
								rows={5}
								className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all"
								placeholder="Describe your product scene..."
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
							/>
						</div>

						<div>
							{/* 🟢 แจ้งเตือนสถานะแบน */}
							{isBanned && (
								<div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold flex items-center gap-2">
									<ShieldAlert className="w-4 h-4" /> Account Suspended
								</div>
							)}

							<button
								onClick={handleGenerate}
								disabled={isButtonDisabled}
								className={`w-full py-4 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2 ${isButtonDisabled
									? 'bg-gray-300 cursor-not-allowed opacity-60'
									: 'bg-[#1e1e2d] hover:bg-gray-800 shadow-lg active:scale-95'
									}`}
							>
								{isGenerating ? (
									<>
										<RefreshCw className="w-5 h-5 animate-spin" />
										Rendering Video...
									</>
								) : isBanned ? (
									'Suspended'
								) : currentCoins < 350 ? ( // 🟢 เปลี่ยนจาก 400 เป็น 350
									'Insufficient Coins (350 Coins)'
								) : (
									<>
										<Play className="w-5 h-5 fill-current" />
										Generate Video Ad (-350 Coins) {/* 🟢 เปลี่ยนจาก -400 เป็น -350 */}
									</>
								)}
							</button>
						</div>
					</div>

					{/* Right Panel */}
					<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
						<div className="flex-1 flex items-center justify-center bg-[#f8f9fa] rounded-xl border-2 border-dashed border-gray-200 overflow-hidden relative min-h-100">
							{isGenerating ? (
								<div className="flex flex-col items-center">
									<div className="w-14 h-14 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
									<p className="text-gray-600 font-bold">Directing your commercial...</p>
									<p className="text-xs text-gray-400 mt-2 font-medium">Veo 3.1 is processing (1-3 mins)</p>
								</div>
							) : videoUrl ? (
								<video key={videoUrl} src={videoUrl} controls autoPlay muted loop className="w-full h-full object-contain bg-black rounded-lg" />
							) : (
								<div className="text-center opacity-30">
									<Play className="w-16 h-16 mx-auto mb-4" />
									<p className="font-bold">Ready to produce your next ad.</p>
								</div>
							)}
						</div>

						{videoUrl && !isGenerating && (
							<div className="mt-6 flex gap-4">
								<button
									onClick={handleDownload}
									disabled={isDownloading}
									className="flex-1 bg-gray-50 text-gray-700 border border-gray-200 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all flex justify-center items-center gap-2"
								>
									{isDownloading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
									Download
								</button>
								<button
									onClick={handleShare}
									className="flex-1 bg-[#1877F2] text-white py-4 rounded-xl font-bold hover:bg-[#166FE5] transition-all flex justify-center items-center gap-2 shadow-sm"
								>
									<Share2 className="w-5 h-5" />
									Share
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}