/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from 'swr';
import {
	Megaphone, Wand2, Sparkles, Copy, CheckCircle2,
	Image as ImageIcon, LayoutGrid, History, ShieldAlert, X
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const PLATFORMS = ["Facebook", "Instagram", "TikTok", "YouTube"];
const TONES = ["Engaging & Professional", "Fun & Casual", "Hard Sell (Urgent)", "Storytelling"];
const LANGUAGES = ["Thai (ภาษาไทย)", "English"];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CampaignBuilderPage() {
	const { data: session } = useSession();

	const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
	const [platform, setPlatform] = useState(PLATFORMS[0]);
	const [tone, setTone] = useState(TONES[0]);
	const [language, setLanguage] = useState(LANGUAGES[0]);
	const [generatedCaption, setGeneratedCaption] = useState("");

	const [isGenerating, setIsGenerating] = useState(false);
	const [isCopied, setIsCopied] = useState(false);

	const { data: balanceData, mutate: mutateBalance } = useSWR('/api/user/balance', fetcher, {
		refreshInterval: 10000,
	});

	const { data: galleryData } = useSWR('/api/user/assets', fetcher);

	const rawAssets = Array.isArray(galleryData) ? galleryData : (galleryData?.assets || []);
	const imageAssets = rawAssets.filter((a: any) => a.type === 'IMAGE') || [];
	const campaignAssets = rawAssets.filter((a: any) => a.type === 'CAMPAIGN') || [];

	const currentCoins = balanceData?.coinBalance ?? 0;
	const isBanned = balanceData?.isBanned ?? false;
	const COST_PER_CAMPAIGN = 39;

	const handleGenerate = async () => {
		if (isBanned) return alert("Your account has been suspended.");
		if (!selectedImageUrl) return alert("Please select an image first.");

		setIsGenerating(true);
		setGeneratedCaption("");
		setIsCopied(false);

		try {
			const selectedLang = language.split(' ')[0];

			const response = await fetch('/api/generate/campaign', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ imageUrl: selectedImageUrl, platform, tone, language: selectedLang }),
			});

			const data = await response.json();

			if (response.ok && data.status === 'success') {
				setGeneratedCaption(data.caption);
				if (data.remainingCoins !== undefined) {
					mutateBalance({ coinBalance: data.remainingCoins, isBanned: isBanned }, false);
				} else {
					mutateBalance();
				}
			} else {
				alert("Error: " + data.message);
			}
		} catch (error) {
			console.error(error);
			alert("Cannot connect to the server.");
		} finally {
			setIsGenerating(false);
		}
	};

	const copyToClipboard = (text: string) => {
		if (!text) return;
		navigator.clipboard.writeText(text);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const isButtonDisabled = isGenerating || !selectedImageUrl || currentCoins < COST_PER_CAMPAIGN || isBanned;

	return (
		<DashboardLayout>
			<div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

				{/* Title & Tabs */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
					<div>
						<h1 className="text-2xl font-black text-dark-bg tracking-tight flex items-center gap-2">
							<Megaphone className="w-6 h-6 text-primary-red" />
							Campaign Builder
						</h1>
						<p className="text-text-main/60 text-sm mt-1 font-medium">Turn your images into high-converting social media posts in 1-click.</p>
					</div>
					<div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
						<button
							onClick={() => setActiveTab('create')}
							className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-white text-dark-bg shadow-sm' : 'text-gray-500 hover:text-dark-bg'}`}
						>
							<span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Create</span>
						</button>
						<button
							onClick={() => setActiveTab('history')}
							className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-dark-bg shadow-sm' : 'text-gray-500 hover:text-dark-bg'}`}
						>
							<span className="flex items-center gap-2"><History className="w-4 h-4" /> My Campaigns</span>
						</button>
					</div>
				</div>

				{/* TAB 1: CREATE */}
				{activeTab === 'create' && (
					/* 🟢 ใช้ Grid บังคับ 2 คอลัมน์ (md:grid-cols-2) เพื่อให้ชัวร์ว่ากาง 50/50 แน่นอน */
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
						
						{/* Left Side: Input Form (50%) */}
						<section className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
							<div className="p-5 border-b border-gray-100 bg-gray-50">
								<h2 className="text-base font-bold text-dark-bg">Campaign Settings</h2>
								<p className="text-xs text-text-main/50 font-medium">Select an image and configure your post.</p>
							</div>

							<div className="p-5 flex flex-col gap-5 flex-1">
								{/* Image Selector */}
								<div className="space-y-2">
									<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
										<ImageIcon className="w-4 h-4 text-primary-red" /> Selected Image
									</label>
									
									<div className="relative w-full aspect-video bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden group">
										{selectedImageUrl ? (
											<>
												<img src={selectedImageUrl} alt="Selected" className="w-full h-full object-contain p-2" />
												<div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm ">
													<button onClick={() => setIsModalOpen(true)} className="bg-white text-dark-bg px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
														<LayoutGrid className="w-4 h-4" /> Change Image
													</button>
												</div>
											</>
										) : (
											<button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center gap-2 w-full h-full text-gray-400 hover:text-primary-red hover:bg-gray-100 transition-all">
												<LayoutGrid className="w-8 h-8 opacity-50" />
												<span className="font-bold text-sm">Select Image from Gallery</span>
											</button>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<label className="text-sm font-bold text-dark-bg">Platform</label>
										<select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all" value={platform} onChange={(e) => setPlatform(e.target.value)}>
											{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
										</select>
									</div>
									<div className="space-y-1.5">
										<label className="text-sm font-bold text-dark-bg">Language</label>
										<select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all" value={language} onChange={(e) => setLanguage(e.target.value)}>
											{LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
										</select>
									</div>
									<div className="space-y-1.5 lg:col-span-2">
										<label className="text-sm font-bold text-dark-bg">Tone of Voice</label>
										<select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all" value={tone} onChange={(e) => setTone(e.target.value)}>
											{TONES.map(t => <option key={t} value={t}>{t}</option>)}
										</select>
									</div>
								</div>

								<div className="mt-auto pt-4">
									{isBanned && (
										<div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold flex items-center gap-2">
											<ShieldAlert className="w-4 h-4" /> Account Suspended
										</div>
									)}
									<button
										onClick={handleGenerate}
										disabled={isButtonDisabled}
										className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${isButtonDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70' : 'bg-dark-bg hover:bg-primary-red text-white'}`}
									>
										{isGenerating ? <><Sparkles className="w-4 h-4 animate-spin" /> Generating Agency Copy...</> : <><Megaphone className="w-4 h-4" /> Build Campaign (-{COST_PER_CAMPAIGN} Coins)</>}
									</button>
								</div>
							</div>
						</section>

						{/* Right Side: Output Result (50%) */}
						{/* 🟢 แก้ไขคลาสที่มีปัญหา min-h-125 เปลี่ยนเป็น min-h-[500px] แทน */}
						<section className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative min-h-125 md:h-full">
							<div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
								<div>
									<h2 className="text-base font-bold text-dark-bg">Ready to Post</h2>
									<p className="text-xs text-text-main/50 font-medium">Copy this to your social media</p>
								</div>
								{generatedCaption && (
									<button onClick={() => copyToClipboard(generatedCaption)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-600'}`}>
										{isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {isCopied ? 'Copied!' : 'Copy'}
									</button>
								)}
							</div>
							
							<div className="p-5 flex-1 bg-gray-50/50 relative overflow-y-auto">
								{isGenerating ? (
									<div className="absolute inset-0 flex flex-col items-center justify-center text-primary-red animate-pulse">
										<Sparkles className="w-10 h-10 mb-2" />
										<p className="text-sm font-bold text-dark-bg">Writing Agency-Level Copy...</p>
									</div>
								) : generatedCaption ? (
									<div className="text-sm text-dark-bg font-medium leading-relaxed whitespace-pre-wrap selection:bg-primary-red/20">
										{generatedCaption}
									</div>
								) : (
									<div className="absolute inset-0 flex flex-col items-center justify-center text-text-main/30">
										<Megaphone className="w-10 h-10 mb-3 opacity-50" />
										<p className="text-sm font-medium">Your highly-converting caption will appear here.</p>
									</div>
								)}
							</div>
						</section>
					</div>
				)}

				{/* TAB 2: HISTORY */}
				{activeTab === 'history' && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{campaignAssets.length > 0 ? campaignAssets.map((campaign: any) => (
							<div key={campaign.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
								<div className="aspect-square bg-gray-100 relative p-2 border-b border-gray-100">
									<img src={campaign.outputUrl} alt="Campaign Image" className="w-full h-full object-cover rounded-lg" />
									<div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-dark-bg text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
										{campaign.category}
									</div>
								</div>
								<div className="p-5 flex flex-col flex-1">
									<div className="text-sm text-gray-600 line-clamp-4 leading-relaxed mb-4 whitespace-pre-wrap">
										{campaign.prompt}
									</div>
									<div className="mt-auto pt-4 border-t border-gray-100">
										<button onClick={() => copyToClipboard(campaign.prompt)} className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-dark-bg border border-gray-200 rounded-lg text-xs font-bold flex justify-center items-center gap-2 transition-all">
											<Copy className="w-3.5 h-3.5" /> Copy Caption
										</button>
									</div>
								</div>
							</div>
						)) : (
							<div className="col-span-full py-20 text-center text-gray-400">
								<History className="w-12 h-12 mx-auto mb-3 opacity-20" />
								<p className="font-bold">No campaigns yet. Let's create one!</p>
							</div>
						)}
					</div>
				)}

				{/* MODAL: Select Image from Gallery */}
				{isModalOpen && (
					<div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
						<div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200">
							<div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
								<h3 className="font-bold text-dark-bg flex items-center gap-2">
									<ImageIcon className="w-5 h-5 text-primary-red" /> 
									Select Image
								</h3>
								<button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-all text-gray-500">
									<X className="w-5 h-5" />
								</button>
							</div>
							
							<div className="p-6 overflow-y-auto flex-1 bg-gray-50">
								{imageAssets.length > 0 ? (
									<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
										{imageAssets.map((img: any) => (
											<div
												key={img.id}
												onClick={() => { setSelectedImageUrl(img.outputUrl); setIsModalOpen(false); }}
												className="relative aspect-square w-full rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-primary-red hover:shadow-md transition-all group bg-white"
											>
												<img src={img.outputUrl} alt="Gallery item" className="absolute inset-0 w-full h-full object-cover" />
												<div className="absolute inset-0 bg-primary-red/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
													<div className="bg-white text-primary-red text-xs font-bold px-4 py-1.5 rounded-full shadow-sm transform scale-95 group-hover:scale-100 transition-all">
														Select
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-20">
										<ImageIcon className="w-12 h-12 opacity-20" />
										<p className="font-medium text-sm">No images found in your gallery.</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

			</div>
		</DashboardLayout>
	);
}