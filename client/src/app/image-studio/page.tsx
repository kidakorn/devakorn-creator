/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
	VideoIcon,
	LayoutDashboard,
	Settings as SettingsIcon,
	Search,
	Bell,
	Sparkles,
	Download,
	Wand2,
	RefreshCw,
	ImagePlus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ImageStudio() {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsLoading] = useState(false);
	const [generatedImage, setGeneratedImage] = useState<string | null>(null);
	const [aspectRatio, setAspectRatio] = useState("1:1");

	const handleGenerate = async () => {
		if (!prompt) return alert("กรุณาพิมพ์คำอธิบายรูปภาพ");

		setIsLoading(true);
		setGeneratedImage(null);

		try {
			const response = await fetch('http://localhost:5000/api/generate/image', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt, aspectRatio }),
			});

			const data = await response.json();

			if (response.ok && data.status === 'success') {
				setGeneratedImage(`data:image/png;base64,${data.image}`);
				// 🟢 ล้าง Prompt ทันทีเมื่อเจนรูปสำเร็จ
				setPrompt("");
			} else {
				alert(data.message || "เกิดข้อผิดพลาดในการสร้างรูปภาพ");
			}
		} catch (error) {
			console.error("Fetch error:", error);
			alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = () => {
		if (!generatedImage) return;
		const link = document.createElement('a');
		link.href = generatedImage;
		link.download = `devakorn-studio-${Date.now()}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="min-h-screen bg-light-gray text-text-main flex flex-col md:flex-row font-sans">

			{/* --- Sidebar --- */}
			<aside className="w-full md:w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
				<div className="h-20 flex items-center px-8 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<span className="text-xl font-black tracking-tight text-dark-bg">
							DEVAKORN<span className="text-primary-red">.</span>
						</span>
					</div>
				</div>
				<nav className="flex-1 px-4 py-8 space-y-1">
					<Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
						<LayoutDashboard className="w-4 h-4" /> Overview
					</Link>
					<Link href="/image-studio" className="flex items-center gap-3 px-4 py-2.5 bg-primary-red/10 text-primary-red rounded-lg font-bold transition-all">
						<Sparkles className="w-4 h-4" /> Image Studio
					</Link>
					<Link href="/video-creator" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
						<VideoIcon className="w-4 h-4" /> Video Creator
					</Link>
					<Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
						<SettingsIcon className="w-4 h-4" /> Settings
					</Link>
				</nav>
			</aside>

			<main className="flex-1 flex flex-col h-screen overflow-y-auto">
				{/* Header */}
				<header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
					<div className="flex items-center bg-light-gray border border-transparent focus-within:border-primary-red/30 w-96 rounded-lg px-3 py-2 transition-all">
						<Search className="w-4 h-4 text-text-main/40 mr-2" />
						<input type="text" placeholder="Search past generations..." className="bg-transparent border-none outline-none text-sm w-full placeholder-text-main/40 text-dark-bg" />
					</div>
					<div className="flex items-center gap-6">
						<button className="relative text-text-main/40 hover:text-primary-red transition-colors">
							<Bell className="w-5 h-5" />
						</button>
						<div className="w-px h-6 bg-gray-200"></div>
						<div className="flex items-center gap-3 cursor-pointer group">
							<div className="text-right hidden sm:block">
								<p className="text-sm font-bold text-dark-bg group-hover:text-primary-red transition-colors">Kidakorn Intha</p>
								<p className="text-xs text-text-main/50">Admin</p>
							</div>
							<Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coke" alt="avatar" width={36} height={36} className="rounded-full bg-light-gray border border-gray-200" unoptimized />
						</div>
					</div>
				</header>

				<div className="p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Left Panel: Controls */}
					<div className="lg:col-span-4 space-y-6">
						<div>
							<h1 className="text-2xl font-black text-dark-bg tracking-tight mb-1">Image Studio</h1>
							<p className="text-sm font-medium text-text-main/60 flex items-center gap-1.5">
								Powered by <span className="text-primary-red font-bold">Imagen 4.0</span>
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-7">
							{/* Prompt Input */}
							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
									<Wand2 className="w-4 h-4 text-primary-red" />
									What do you want to see?
								</label>
								<textarea
									rows={5}
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder="Describe your imagination... e.g., A futuristic city at sunset, 8k resolution."
									className="w-full bg-light-gray/50 border border-gray-200 rounded-lg p-4 text-sm text-dark-bg placeholder:text-text-main/40 focus:border-primary-red/50 focus:ring-4 focus:ring-primary-red/10 outline-none transition-all resize-none"
								/>
							</div>

							{/* Aspect Ratio */}
							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg">Aspect Ratio</label>
								<div className="grid grid-cols-3 gap-3">
									{["1:1", "16:9", "9:16"].map((ratio) => (
										<button
											key={ratio}
											onClick={() => setAspectRatio(ratio)}
											className={`py-3 rounded-lg border flex flex-col items-center justify-center transition-all ${aspectRatio === ratio
												? "border-primary-red bg-primary-red/5 text-primary-red font-bold"
												: "border-gray-200 bg-white text-text-main/60 hover:border-gray-300 hover:text-dark-bg"
												}`}
										>
											<span className="text-xs tracking-wide font-semibold">{ratio}</span>
										</button>
									))}
								</div>
							</div>

							{/* Generate Button */}
							<button
								onClick={handleGenerate}
								disabled={isGenerating || !prompt}
								className="w-full bg-dark-bg hover:bg-primary-red text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-dark-bg shadow-sm"
							>
								{isGenerating ? (
									<>
										<RefreshCw className="w-4 h-4 animate-spin" />
										Generating...
									</>
								) : (
									<>
										<Sparkles className="w-4 h-4" />
										Generate Image
									</>
								)}
							</button>
						</div>
					</div>

					{/* Right Panel: Preview Area */}
					<div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden min-h-137.5 shadow-sm">

						{/* Background Decorative Pattern */}
						<div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none"></div>

						{isGenerating ? (
							<div className="flex flex-col items-center z-10 animate-in fade-in duration-300">
								<div className="w-16 h-16 bg-light-gray rounded-xl flex items-center justify-center mb-6 animate-pulse border border-gray-200">
									<Sparkles className="w-8 h-8 text-primary-red animate-bounce" />
								</div>
								<p className="font-bold text-dark-bg text-lg">Painting your imagination...</p>
								<p className="text-sm text-text-main/60 mt-2">This usually takes 15-20 seconds</p>
							</div>
						) : generatedImage ? (
							<div className="w-full h-full p-6 flex flex-col items-center justify-center group relative z-10 animate-in fade-in zoom-in-95 duration-500">
								<img
									src={generatedImage}
									alt="AI Generated Art"
									className="max-w-full max-h-[75vh] rounded-lg shadow-xl object-contain ring-1 ring-gray-200"
								/>

								{/* Floating Download Button */}
								<div className="absolute bottom-10 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
									<button
										onClick={handleDownload}
										className="bg-dark-bg/90 backdrop-blur-md text-white hover:bg-primary-red px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
									>
										<Download className="w-4 h-4" /> Download Masterpiece
									</button>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center text-text-main/40 z-10">
								<div className="w-20 h-20 bg-light-gray rounded-full flex items-center justify-center mb-5 border border-gray-200">
									<ImagePlus className="w-8 h-8 text-text-main/30" />
								</div>
								<h3 className="font-bold text-dark-bg text-lg">No Image Generated Yet</h3>
								<p className="text-sm font-medium mt-1">Enter a prompt and click generate to see the magic.</p>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}