/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';

const categories = [
	'Product Commercial',
	'Cinematic Trailer',
	'Animation',
	'Social Media Reel',
	'Documentary',
	'Other'
];

export default function VideoCreatorPage() {
	const [prompt, setPrompt] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('Product Commercial');
	const [aspectRatio, setAspectRatio] = useState('16:9');
	const [isGenerating, setIsGenerating] = useState(false);
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleGenerate = async () => {
		if (!prompt) {
			setError('Please describe your video scene.');
			return;
		}

		setIsGenerating(true);
		setError(null);
		setVideoUrl(null);

		try {
			const response = await fetch('http://localhost:5000/api/video/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt,
					category: selectedCategory,
					aspectRatio: aspectRatio
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to generate video.');
			}

			if (data.videoBase64) {
				// วิธีถอดรหัส Base64 เป็น Blob ที่เสถียรสำหรับเบราว์เซอร์
				const base64Link = `data:video/mp4;base64,${data.videoBase64}`;
				const fetchRes = await fetch(base64Link);
				const videoBlob = await fetchRes.blob();

				const videoObjectUrl = URL.createObjectURL(videoBlob);
				setVideoUrl(videoObjectUrl);
				console.log("✅ วิดีโอพร้อมเล่นแล้ว! ขนาดไฟล์จริง:", (videoBlob.size / 1024 / 1024).toFixed(2), "MB");
				
				setPrompt(''); 
			}

		} catch (err: any) {
			setError(err.message || 'Failed to generate video.');
			console.error("Frontend Error:", err);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#f8f9fa] p-8">
			{/* Header Section */}
			<div className="mb-8 flex justify-between items-end">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2 tracking-tight">
						Video Creator
					</h1>
					<p className="text-gray-500 mt-2 text-sm">
						Bring your ideas to life with high-fidelity AI video generation.
					</p>
				</div>
				<div className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-1.5 rounded-full border border-red-100">
					Powered by Google Veo
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* 🎛️ ฝั่งซ้าย: Input Controls */}
				<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
					<h2 className="text-lg font-bold text-gray-800 mb-6">Your Concept</h2>

					<div className="mb-8">
						<label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
							<span className="text-red-500">📐</span> Aspect Ratio
						</label>
						<div className="flex gap-4">
							<button
								onClick={() => setAspectRatio('16:9')}
								className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${aspectRatio === '16:9'
									? 'bg-red-50 text-red-600 border-red-300 shadow-sm'
									: 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
									}`}
							>
								<div className="w-6 h-3.5 border-2 border-current rounded-sm"></div>
								16:9 (Landscape)
							</button>

							<button
								onClick={() => setAspectRatio('9:16')}
								className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${aspectRatio === '9:16'
									? 'bg-red-50 text-red-600 border-red-300 shadow-sm'
									: 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
									}`}
							>
								<div className="w-3.5 h-6 border-2 border-current rounded-sm"></div>
								9:16 (Portrait)
							</button>
						</div>
					</div>

					<div className="mb-8">
						<label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
							<span className="text-red-500">🏷️</span> Video Style Category
						</label>
						<div className="flex flex-wrap gap-2">
							{categories.map((cat) => (
								<button
									key={cat}
									onClick={() => setSelectedCategory(cat)}
									className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedCategory === cat
										? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
										: 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50'
										}`}
								>
									{cat}
								</button>
							))}
						</div>
					</div>

					<div className="mb-8">
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Scene Description
						</label>
						<textarea
							rows={5}
							className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none transition-all"
							placeholder="e.g., A cinematic shot of a flying Thai Tuk-Tuk hovering above a neon-lit cyberpunk city, glowing wheels..."
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
						/>
					</div>

					{error && (
						<div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
							{error}
						</div>
					)}

					<button
						onClick={handleGenerate}
						disabled={isGenerating}
						className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 flex justify-center items-center gap-2 ${isGenerating
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-[#1e1e2d] hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
							}`}
					>
						{isGenerating ? (
							<>
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								Rendering Video...
							</>
						) : (
							'Generate Video'
						)}
					</button>
				</div>

				{/* 📺 ฝั่งขวา: Video Result */}
				<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
					<h2 className="text-lg font-bold text-gray-800 mb-6 flex justify-between items-center">
						Generated Result
					</h2>

					<div className="flex-1 flex items-center justify-center bg-[#f8f9fa] rounded-xl border-2 border-dashed border-gray-200 overflow-hidden relative min-h-75">
						{isGenerating ? (
							<div className="flex flex-col items-center animate-pulse">
								<div className="w-14 h-14 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-4 shadow-lg"></div>
								<p className="text-gray-600 font-semibold">Creating your masterpiece...</p>
								<p className="text-xs text-gray-400 mt-2">This may take a minute</p>
							</div>
						) : videoUrl ? (
							<video
								key={videoUrl}
								src={videoUrl}
								controls
								autoPlay
								muted
								loop
								playsInline
								className="w-full h-full object-contain bg-black rounded-lg shadow-sm"
							>
								Your browser does not support the video tag.
							</video>
						) : (
							<div className="text-center">
								<span className="text-4xl block mb-3 opacity-20">🎥</span>
								<p className="text-gray-400 font-medium text-sm">Ready to create your next video.</p>
							</div>
						)}
					</div>

					{videoUrl && !isGenerating && (
						<a
							href={videoUrl}
							download={`Devakorn_Video_${Date.now()}.mp4`}
							className="mt-6 w-full bg-gray-50 text-gray-700 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex justify-center items-center gap-2 cursor-pointer"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
							Download Video
						</a>
					)}
				</div>
			</div>
		</div>
	);
}