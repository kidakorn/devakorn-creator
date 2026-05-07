/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from 'swr';
import { Wand2, Sparkles, Copy, CheckCircle2, Tags, PackageOpen, ShieldAlert, Type, AlignLeft, Globe } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const CATEGORIES = [
	"Product Photography", "T-Shirt Design", "Sticker & Die-cut",
	"Packaging Design", "Seamless Pattern", "Logo Concept", "3D Icon", "Product Mockup"
];

// 🟢 ตัวเลือกสำหรับฟีเจอร์ Advanced Settings
const toneOptions = ['Creative & Professional', 'Direct & Minimalist', 'Dramatic & Cinematic', 'Cute & Friendly', 'Luxury & Elegant', 'Tech & Futuristic'];
const lengthOptions = ['Short (around 20-30 words)', 'Medium (around 50-80 words)', 'Long (around 100-150 words)'];
const languageOptions = ['English', 'Thai', 'Japanese', 'Chinese', 'Korean'];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PromptEnhancerPage() {
	const { data: session } = useSession();
	const [idea, setIdea] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Product Photography");
	const [enhancedPrompt, setEnhancedPrompt] = useState("");
	const [isEnhancing, setIsEnhancing] = useState(false);
	const [isCopied, setIsCopied] = useState(false);

	// 🟢 State สำหรับเก็บค่า Advanced Settings
	const [tone, setTone] = useState("Creative & Professional");
	const [length, setLength] = useState("Medium (around 50-80 words)");
	const [outputLanguage, setOutputLanguage] = useState("English");

	const { data: balanceData, mutate } = useSWR('/api/user/balance', fetcher, {
		refreshInterval: 10000,
		revalidateOnFocus: true
	});

	const currentCoins = balanceData?.coinBalance ?? 0;
	const isBanned = balanceData?.isBanned ?? false;

	const currentCost = 15;

	const handleMagic = async () => {
		if (isBanned) return alert("Your account has been suspended.");
		if (!idea) return;

		setIsEnhancing(true);
		setEnhancedPrompt("");
		setIsCopied(false);

		try {
			const response = await fetch('/api/generate/enhance-prompt', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				// 🟢 ส่งพารามิเตอร์ใหม่ไปให้ API
				body: JSON.stringify({ 
					idea, 
					category: selectedCategory,
					tone,
					length,
					outputLanguage
				}),
			});

			const data = await response.json();

			if (response.ok && data.status === 'success') {
				// 🟢 อัปเดตให้รองรับคีย์ enhancedPrompt จาก API หลังบ้านใหม่
				setEnhancedPrompt(data.enhancedPrompt || data.prompt);
				setIdea("");

				if (data.remainingCoins !== undefined) {
					mutate({ coinBalance: data.remainingCoins, isBanned: isBanned }, false);
				} else {
					mutate();
				}
			} else {
				alert("Error: " + data.message);
			}
		} catch (error) {
			console.error(error);
			alert("Cannot connect to the server.");
		} finally {
			setIsEnhancing(false);
		}
	};

	const copyToClipboard = () => {
		if (!enhancedPrompt) return;
		navigator.clipboard.writeText(enhancedPrompt);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const isButtonDisabled = isEnhancing || !idea || currentCoins < currentCost || isBanned;

	return (
		<DashboardLayout>
			<div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
				{/* Title Section */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
					<div>
						<h1 className="text-2xl font-black text-dark-bg tracking-tight flex items-center gap-2">
							<PackageOpen className="w-6 h-6 text-primary-red" />
							Product Prompt Magic
						</h1>
						<p className="text-text-main/60 text-sm mt-1 font-medium">Turn simple ideas into highly-converting commercial product designs.</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Left Side: Input Form */}
					<section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
						<div className="p-5 sm:p-6 border-b border-gray-100 bg-light-gray/20">
							<h2 className="text-lg font-bold text-dark-bg">What are you selling?</h2>
							<p className="text-xs text-text-main/50 font-medium">Define your product idea and asset type.</p>
						</div>

						<div className="p-5 sm:p-6 flex-1 flex flex-col gap-5">

							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
									<Tags className="w-4 h-4 text-primary-red" /> Product Type
								</label>
								<div className="flex flex-wrap gap-2">
									{CATEGORIES.map((cat) => (
										<button
											key={cat}
											onClick={() => setSelectedCategory(cat)}
											className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat
												? 'bg-primary-red text-white border-primary-red shadow-sm transform scale-105'
												: 'bg-light-gray/50 text-text-main/60 border-gray-200 hover:border-primary-red/50 hover:text-dark-bg'
												}`}
										>
											{cat}
										</button>
									))}
								</div>
							</div>

							{/* 🟢 ส่วน Advanced Settings สำหรับกำหนดทิศทาง Prompt */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-light-gray/30 p-3.5 rounded-xl border border-gray-100">
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Type className="w-3.5 h-3.5 text-primary-red" /> Tone
									</label>
									<select 
										value={tone} 
										onChange={(e) => setTone(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{toneOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
									</select>
								</div>
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<AlignLeft className="w-3.5 h-3.5 text-primary-red" /> Length
									</label>
									<select 
										value={length} 
										onChange={(e) => setLength(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{lengthOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
									</select>
								</div>
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Globe className="w-3.5 h-3.5 text-primary-red" /> Output Language
									</label>
									<select 
										value={outputLanguage} 
										onChange={(e) => setOutputLanguage(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{languageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
									</select>
								</div>
							</div>

							<div className="space-y-3 flex-1 flex flex-col">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">Core Idea</label>
								<textarea
									rows={4}
									value={idea}
									onChange={(e) => setIdea(e.target.value)}
									placeholder="e.g., A luxury perfume bottle with floral scent..."
									className="flex-1 w-full bg-light-gray/30 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-dark-bg focus:bg-white focus:border-primary-red/40 focus:ring-4 focus:ring-primary-red/5 outline-none transition-all resize-none"
								/>
							</div>

							<div className="mt-auto">
								{isBanned && (
									<div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold flex items-center gap-2">
										<ShieldAlert className="w-4 h-4" /> Account Suspended
									</div>
								)}

								<button
									onClick={handleMagic}
									disabled={isButtonDisabled}
									className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${isButtonDisabled
										? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
										: 'bg-dark-bg hover:bg-primary-red text-white'
										}`}
								>
									{isEnhancing ? (
										<>
											<Sparkles className="w-4 h-4 animate-spin" />
											Designing Product...
										</>
									) : isBanned ? (
										'Suspended'
									) : currentCoins < currentCost ? (
										`Insufficient Coins (${currentCost} Coins)`
									) : (
										<>
											<Wand2 className="w-4 h-4" />
											Enhance Prompt (-{currentCost} Coins)
										</>
									)}
								</button>
							</div>
						</div>
					</section>

					{/* Right Side: Result Output */}
					<section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative group">
						<div className="p-5 sm:p-6 border-b border-gray-100 bg-light-gray/20 flex justify-between items-center">
							<div>
								<h2 className="text-lg font-bold text-dark-bg">Ready to Generate</h2>
								<p className="text-xs text-text-main/50 font-medium">Copy this to Image Studio</p>
							</div>
							{enhancedPrompt && (
								<button
									onClick={copyToClipboard}
									className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-light-gray text-text-main/60 hover:text-dark-bg hover:bg-gray-200'
										}`}
								>
									{isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
									{isCopied ? 'Copied!' : 'Copy'}
								</button>
							)}
						</div>

						<div className="p-5 sm:p-6 flex-1 bg-light-gray/10 relative">
							{isEnhancing ? (
								<div className="absolute inset-0 flex flex-col items-center justify-center text-primary-red animate-pulse">
									<Sparkles className="w-10 h-10 mb-2" />
									<p className="text-sm font-bold text-dark-bg">Adding commercial details...</p>
								</div>
							) : enhancedPrompt ? (
								<div className="h-full">
									<p className="text-sm text-dark-bg font-medium leading-relaxed whitespace-pre-wrap selection:bg-primary-red/20">
										{enhancedPrompt}
									</p>
								</div>
							) : (
								<div className="absolute inset-0 flex flex-col items-center justify-center text-text-main/30">
									<PackageOpen className="w-10 h-10 mb-3 opacity-50" />
									<p className="text-sm font-medium">Your commercial prompt will appear here.</p>
								</div>
							)}
						</div>
					</section>
				</div>
			</div>
		</DashboardLayout>
	);
}