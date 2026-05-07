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
	ShieldAlert,
	Camera,     
	Palette,    
	Sun,
	UploadCloud,
	X,
	Gamepad2
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

// 🟢 เพิ่มตัวเลือกสำหรับฟีเจอร์ใหม่
const styleOptions = ['None', 'Cinematic', 'Muji Style', 'Cyberpunk', 'Anime', 'Vintage', '3D Animation', 'Realistic', 'Fantasy'];
const cameraOptions = ['None', 'Drone View', 'Close-up', 'Wide Angle', 'Macro', 'Tracking Shot', 'Pan', 'First-Person View (FPV)'];
const lightingOptions = ['None', 'Cinematic Lighting', 'Natural Light', 'Neon', 'Golden Hour', 'Studio Lighting', 'Dark & Moody'];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VideoCreatorPage() {
	const { data: session } = useSession();
	const [prompt, setPrompt] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('Product Showcase');
	const [aspectRatio, setAspectRatio] = useState('16:9');
	const [duration, setDuration] = useState('10'); // 🟢 Added state for video duration

	// Advanced Settings State
	const [style, setStyle] = useState('None');
	const [cameraAngle, setCameraAngle] = useState('None');
	const [lighting, setLighting] = useState('None');

	const [isGenerating, setIsGenerating] = useState(false);
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	// 🟢 State สำหรับ Upload Image Reference
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	// 🟢 State สำหรับ Minigame ยามรอ
	const [score, setScore] = useState(0);
	const [targetPos, setTargetPos] = useState({ top: '40%', left: '40%' });

	React.useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isGenerating) {
			interval = setInterval(() => {
				setTargetPos({
					top: `${Math.random() * 80 + 10}%`,
					left: `${Math.random() * 80 + 10}%`
				});
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [isGenerating]);

	const { data: balanceData, mutate } = useSWR('/api/user/balance', fetcher, {
		refreshInterval: 10000,
		revalidateOnFocus: true
	});

	const currentCoins = balanceData?.coinBalance ?? 0;
	const isBanned = balanceData?.isBanned ?? false;

	// 🟢 ปรับลดราคาลงมาเหลือ 499 Coins ตามแผน
	const currentCost = 499;

	const isButtonDisabled = isGenerating || !prompt || currentCoins < currentCost || isBanned;

	const handleGenerate = async () => {
		if (isBanned) return alert("Your account has been suspended.");
		if (!prompt) return alert("Please describe your video scene.");

		setIsGenerating(true);
		setVideoUrl(null);

		try {
			const formData = new FormData();
			formData.append('prompt', prompt);
			formData.append('category', selectedCategory);
			formData.append('aspectRatio', aspectRatio);
			formData.append('duration', duration); // 🟢 Append duration to formData
			formData.append('style', style);
			formData.append('cameraAngle', cameraAngle);
			formData.append('lighting', lighting);
			
			if (selectedFile) {
				formData.append('image', selectedFile);
			}

			const response = await fetch('/api/generate/video', {
				method: 'POST',
				body: formData,
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
			<div className="w-full bg-[#f8f9fa] text-text-main font-sans pb-12">
				<main className="w-full">
					<div className="p-6 sm:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-500">
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

								{/* Duration & Aspect Ratio Section */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
											<Monitor className="w-4 h-4 text-red-600" /> Platform Format
										</label>
										<div className="flex gap-4">
											<button
												onClick={() => setAspectRatio('16:9')}
												className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold transition-all border ${aspectRatio === '16:9' ? 'bg-red-50 text-red-600 border-red-300 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
											>
												YouTube (16:9)
											</button>
											<button
												onClick={() => setAspectRatio('9:16')}
												className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold transition-all border ${aspectRatio === '9:16' ? 'bg-red-50 text-red-600 border-red-300 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
											>
												TikTok / IG (9:16)
											</button>
										</div>
									</div>

									<div>
										<label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
											<Clapperboard className="w-4 h-4 text-red-600" /> Video Duration
										</label>
										<div className="flex gap-3">
											{['10', '15', '30'].map((sec) => (
												<button
													key={sec}
													onClick={() => setDuration(sec)}
													className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all border ${duration === sec ? 'bg-red-50 text-red-600 border-red-300 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
												>
													{sec}s
												</button>
											))}
										</div>
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
												className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:bg-red-50'}`}
											>
												{cat}
											</button>
										))}
									</div>
								</div>

								{/* 🟢 ส่วน Advanced Settings ที่เพิ่มเข้ามา */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
									<div>
										<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
											<Palette className="w-3.5 h-3.5" /> Style
										</label>
										<select
											value={style}
											onChange={(e) => setStyle(e.target.value)}
											className="w-full border border-gray-200 bg-white rounded-lg p-2.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
										>
											{styleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
										</select>
									</div>
									<div>
										<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
											<Camera className="w-3.5 h-3.5" /> Camera Angle
										</label>
										<select
											value={cameraAngle}
											onChange={(e) => setCameraAngle(e.target.value)}
											className="w-full border border-gray-200 bg-white rounded-lg p-2.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
										>
											{cameraOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
										</select>
									</div>
									<div>
										<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
											<Sun className="w-3.5 h-3.5" /> Lighting
										</label>
										<select
											value={lighting}
											onChange={(e) => setLighting(e.target.value)}
											className="w-full border border-gray-200 bg-white rounded-lg p-2.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
										>
											{lightingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
										</select>
									</div>
								</div>

								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">Product & Scene Description</label>
									<textarea
										rows={4}
										className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all"
										placeholder="Describe your product scene... (e.g. A premium perfume bottle on a wooden table)"
										value={prompt}
										onChange={(e) => setPrompt(e.target.value)}
									/>
								</div>

								{/* 🟢 Upload Reference Image */}
								<div>
									<label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
										<UploadCloud className="w-4 h-4 text-red-600" />
										Reference Sketch / First Frame <span className="text-gray-400 font-normal">(Optional)</span>
									</label>

									{!imagePreview ? (
										<div className="flex items-center justify-center w-full">
											<label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-red-300 transition-all">
												<div className="flex flex-col items-center justify-center pt-5 pb-6">
													<UploadCloud className="w-7 h-7 mb-2 text-gray-400" />
													<p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-gray-700">Click to upload</span></p>
													<p className="text-xs text-gray-400">PNG, JPG or WEBP (Max. 5MB)</p>
												</div>
												<input
													id="dropzone-file"
													type="file"
													className="hidden"
													accept="image/jpeg, image/png, image/webp"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) {
															setSelectedFile(file);
															setImagePreview(URL.createObjectURL(file));
														}
													}}
												/>
											</label>
										</div>
									) : (
										<div className="relative inline-block border border-gray-200 rounded-lg p-2 bg-gray-50">
											<img src={imagePreview} alt="Reference Preview" className="h-28 w-auto rounded object-contain" />
											<button onClick={() => { setSelectedFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-all">
												<X className="w-3.5 h-3.5" />
											</button>
										</div>
									)}
								</div>

								<div>
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
										) : currentCoins < currentCost ? (
											`Insufficient Coins (${currentCost} Coins)`
										) : (
											<>
												<Play className="w-5 h-5 fill-current" />
												Generate Video Ad (-{currentCost} Coins)
											</>
										)}
									</button>
								</div>
							</div>

							{/* Right Panel */}
							<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-125">
								<div className="flex-1 flex items-center justify-center bg-[#f8f9fa] rounded-xl border-2 border-dashed border-gray-200 overflow-hidden relative min-h-100">
									{isGenerating ? (
										<div className="flex flex-col items-center w-full h-full justify-center absolute inset-0 bg-gray-900 text-white p-6 z-10">
											<h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Gamepad2 className="w-6 h-6 text-red-500" /> Wait & Play!</h3>
											<p className="text-sm text-gray-400 mb-6 text-center">Catch the flying sparks while Veo 3.1 renders your video...</p>
											
											{/* Mini-game container */}
											<div className="w-full max-w-sm h-48 border border-gray-700 rounded-lg relative overflow-hidden bg-gray-800 shadow-inner">
												<div 
													className="absolute w-8 h-8 bg-red-500 rounded-full cursor-pointer hover:bg-red-400 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.7)] flex items-center justify-center select-none"
													style={{ top: targetPos.top, left: targetPos.left, transition: 'top 0.4s ease-out, left 0.4s ease-out' }}
													onMouseDown={() => setScore(s => s + 1)}
												>
													<span className="text-xs">✨</span>
												</div>
											</div>
											
											<div className="mt-6 font-bold text-lg bg-gray-800 px-6 py-2 rounded-full border border-gray-700 shadow-sm">
												Score: <span className="text-red-500">{score}</span>
											</div>
											<p className="text-xs text-gray-500 mt-4 animate-pulse text-center">Usually takes 1-3 minutes. Hang tight!</p>
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
				</main>
			</div>
		</DashboardLayout>
	);
}