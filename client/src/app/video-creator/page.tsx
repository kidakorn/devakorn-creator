/* eslint-disable @next/next/no-img-element */
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
	UploadCloud,
	X,
	Gamepad2,
	Wand2,
	Sparkles,
	Sun,
	User
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/lib/useLanguage";
import type { TranslationKey } from "@/lib/translations";

const categories = [
	'Product Showcase',
	'TikTok / Reels Ad',
	'Cinematic Promo',
	'Stop Motion',
	'3D Product Reveal',
	'B-Roll Footage'
];

// Added options for new features
const styleOptions = ['None', 'Cinematic', 'Muji Style', 'Cyberpunk', 'Anime', 'Vintage', '3D Animation', 'Realistic', 'Fantasy'];
const cameraOptions = ['None', 'Drone View', 'Close-up', 'Wide Angle', 'Macro', 'Tracking Shot', 'Pan', 'First-Person View (FPV)'];
const lightingOptions = ['None', 'Cinematic Lighting', 'Natural Light', 'Neon', 'Golden Hour', 'Studio Lighting', 'Dark & Moody'];
const presenterOptions = ['None', 'Thai Female Model', 'Korean Female Idol', 'Caucasian Male Model', 'Minimalist Hand Model', 'Lifestyle Group'];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const VCAT_KEYS: Record<string, TranslationKey> = {
	'Product Showcase': 'vcat_product', 'TikTok / Reels Ad': 'vcat_tiktok',
	'Cinematic Promo': 'vcat_cinematic', 'Stop Motion': 'vcat_stop_motion',
	'3D Product Reveal': 'vcat_3d_reveal', 'B-Roll Footage': 'vcat_broll',
};
const STYLE_KEYS: Record<string, TranslationKey> = {
	'None': 'cat_none', 'Cinematic': 'style_cinematic', 'Muji Style': 'style_muji', 'Cyberpunk': 'style_cyberpunk',
	'Anime': 'style_anime', 'Vintage': 'style_vintage', '3D Animation': 'style_3d_anim', 'Realistic': 'style_realistic', 'Fantasy': 'style_fantasy',
};
const CAM_KEYS: Record<string, TranslationKey> = {
	'None': 'cat_none', 'Drone View': 'cam_drone', 'Close-up': 'cam_closeup', 'Wide Angle': 'cam_wide',
	'Macro': 'cam_macro', 'Tracking Shot': 'cam_tracking', 'Pan': 'cam_pan', 'First-Person View (FPV)': 'cam_fpv',
};
const LIGHT_KEYS: Record<string, TranslationKey> = {
	'None': 'cat_none', 'Cinematic Lighting': 'light_cinematic', 'Natural Light': 'light_natural', 'Neon': 'light_neon',
	'Golden Hour': 'light_golden', 'Studio Lighting': 'light_studio', 'Dark & Moody': 'light_dark',
};
const PRES_KEYS: Record<string, TranslationKey> = {
	'None': 'cat_none', 'Thai Female Model': 'pres_thai_f', 'Korean Female Idol': 'pres_korean_f',
	'Caucasian Male Model': 'pres_western_m', 'Minimalist Hand Model': 'pres_hand', 'Lifestyle Group': 'pres_group',
};

export default function VideoCreatorPage() {
	const { data: session } = useSession();
	const { t } = useLanguage();
	const [prompt, setPrompt] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('Product Showcase');
	const [aspectRatio, setAspectRatio] = useState('16:9');
	const [showInfo, setShowInfo] = useState(false);
	const [modalLang, setModalLang] = useState<'th' | 'en'>('th');

	// Advanced Settings State
	const [style, setStyle] = useState('None');
	const [cameraAngle, setCameraAngle] = useState('None');
	const [lighting, setLighting] = useState('None');
	const [presenter, setPresenter] = useState('None');

	const [isGenerating, setIsGenerating] = useState(false);
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	// State for Upload Image Reference
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	// State for Minigame
	const [score, setScore] = useState(0);
	const [targetPos, setTargetPos] = useState({ top: '40%', left: '40%' });

	// State for Auto Prompt
	const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

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

	const handleAutoPrompt = async () => {
		if (!prompt) return alert("Please type a short idea first.");
		setIsEnhancingPrompt(true);
		try {
			const response = await fetch('/api/generate/enhance-prompt', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					idea: prompt,
					category: selectedCategory,
					tone: 'Dramatic & Cinematic',
					length: 'Medium (around 50-80 words)',
					outputLanguage: 'English'
				}),
			});
			const data = await response.json();
			if (response.ok && data.status === 'success') {
				setPrompt(data.enhancedPrompt || data.prompt);
			} else {
				alert("Error: " + data.message);
			}
		} catch (error) {
			console.error(error);
			alert("Cannot connect to AI.");
		} finally {
			setIsEnhancingPrompt(false);
		}
	};

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
			formData.append('style', style);
			formData.append('cameraAngle', cameraAngle);
			formData.append('lighting', lighting);
			formData.append('presenter', presenter);

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
						{/* <div className="mb-8">
							<h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
								<Clapperboard className="w-8 h-8 text-red-600" />
								{t('video_title')}
							</h1>
							<p className="text-gray-500 mt-2 text-sm font-medium">
								{t('video_sub')}
							</p>
						</div> */}
						{/* 1. ส่วนหัวข้อและปุ่มเปิด Modal */}
						<div className="mb-6">
							<h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
								<Clapperboard className="w-8 h-8 text-red-600" />
								{t('video_title')}
							</h1>

							<div className="mt-2">
								<button
									onClick={() => setShowInfo(true)}
									className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
								>
									<div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-black">?</div>
									{t('show_info') || 'ดูวิธีใช้งาน'}
								</button>

								{/* Modal Overlay */}
								{showInfo && (
									<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">

										{/* Modal Box */}
										<div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

											{/* Modal Header */}
											<div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 shrink-0">
												<div className="flex items-center gap-4">
													<h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
														<Clapperboard className="w-6 h-6 text-red-600" />
														{modalLang === 'th' ? 'คู่มือการใช้งาน Video Creator' : 'Video Creator Guide'}
													</h3>

													{/* TH/EN Toggle Button */}
													<div className="flex bg-gray-200 rounded-lg p-0.5">
														<button
															onClick={() => setModalLang('th')}
															className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${modalLang === 'th' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
														>
															TH
														</button>
														<button
															onClick={() => setModalLang('en')}
															className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${modalLang === 'en' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
														>
															EN
														</button>
													</div>
												</div>
												<button
													onClick={() => setShowInfo(false)}
													className="text-gray-400 hover:text-red-600 transition-colors text-2xl leading-none font-bold p-1 absolute top-4 right-4 sm:static"
												>
													✕
												</button>
											</div>

											{/* Modal Body (Scrollable) */}
											<div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-800">
												<p className="font-bold text-gray-900 text-lg border-l-4 border-red-600 pl-3 bg-gray-50 py-3 rounded-r-lg">
													{modalLang === 'th'
														? 'ระบบนี้ช่วยเปลี่ยนภาพนิ่งและไอเดียของคุณให้เป็นวิดีโอโฆษณาที่เคลื่อนไหวได้สมจริง ดึงดูดความสนใจและเพิ่มยอดขายได้อย่างมีประสิทธิภาพ'
														: 'This tool transforms your static images and ideas into realistic, engaging video ads that capture attention and drive sales effectively.'}
												</p>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{(modalLang === 'th' ? [
														{ title: "1. หมวดหมู่ (Category)", desc: "เลือกรูปแบบวิดีโอ เช่น 'Product Showcase' สำหรับโชว์สินค้า หรือ 'TikTok / Reels Ad' สำหรับวิดีโอแนวตั้งที่ต้องการดึงดูดสายตาอย่างรวดเร็ว" },
														{ title: "2. ผู้นำเสนอ (Presenter)", desc: "ต้องการให้มีคนนำเสนอในวิดีโอหรือไม่? เลือกเพื่อเพิ่มความมีชีวิตชีวาและความน่าเชื่อถือให้กับสินค้า" },
														{ title: "3. สไตล์ (Style)", desc: "กำหนดทิศทางศิลปะ เช่น 'Cinematic' เพื่อภาพลักษณ์ที่ดูหรูหราอลังการ หรือ '3D Animation' สำหรับสินค้าที่ต้องการความล้ำสมัย" },
														{ title: "4. มุมกล้องและแสง (Camera & Light)", desc: "กำหนดมุมมองและการจัดแสง เช่น 'Drone View' สำหรับภาพมุมกว้าง หรือ 'Studio Lighting' เพื่อความคมชัดระดับมืออาชีพ" },
														{ title: "5. อธิบายฉาก (Video Prompt)", desc: "พิมพ์อธิบายฉากวิดีโอที่ต้องการ หรือกดปุ่ม 'ให้ AI คิดให้' เพื่อให้ระบบช่วยเขียนสคริปต์และคำสั่งที่สมบูรณ์แบบ" },
														{ title: "6. รูปอ้างอิง (Upload Reference)", desc: "อัปโหลดรูปภาพสินค้าหรือภาพร่างเพื่อใช้เป็นเฟรมแรกของวิดีโอ (แนะนำให้ใส่เพื่อความแม่นยำของผลลัพธ์)" },
														{ title: "7. สัดส่วนวิดีโอ (Platform Format)", desc: "เลือกขนาดให้เหมาะกับแพลตฟอร์มของคุณ: 16:9 สำหรับ YouTube หรือหน้าเว็บไซต์ และ 9:16 สำหรับ TikTok หรือ Instagram Reels" },
														{ title: "8. เกมระหว่างรอ (Wait & Play)", desc: "ระหว่างรอ AI ประมวลผลวิดีโอ (ประมาณ 1-3 นาที) คุณสามารถเล่นมินิเกมคลิกเก็บคะแนนเพื่อฆ่าเวลาได้" }
													] : [
														{ title: "1. Category", desc: "Choose the video format, such as 'Product Showcase' to highlight items, or 'TikTok / Reels Ad' for engaging vertical videos." },
														{ title: "2. Presenter", desc: "Decide if you want a human presenter in the video to add liveliness and credibility to your product." },
														{ title: "3. Style", desc: "Define the art direction, like 'Cinematic' for a luxurious feel or '3D Animation' for a modern, high-tech look." },
														{ title: "4. Camera & Light", desc: "Set the perspective and illumination, such as 'Drone View' for aerial shots or 'Studio Lighting' for professional clarity." },
														{ title: "5. Video Prompt", desc: "Describe the desired video scene, or click 'Let AI Think' to have the system write a perfect, detailed prompt for you." },
														{ title: "6. Upload Reference", desc: "Upload a product photo or sketch to use as the first frame of the video (highly recommended for accuracy)." },
														{ title: "7. Platform Format", desc: "Choose the aspect ratio tailored to your platform (16:9 for YouTube/Websites or 9:16 for TikTok/Reels)." },
														{ title: "8. Wait & Play", desc: "While waiting for the AI to render your video (approx. 1-3 minutes), you can play a quick point-and-click mini-game." }
													]).map((item, idx) => (
														<div key={idx} className="bg-gray-50 p-4.5 rounded-xl border border-gray-100 hover:border-red-200 transition-colors">
															<h4 className="font-bold text-gray-900 mb-2 text-base">{item.title}</h4>
															<p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
														</div>
													))}
												</div>
											</div>

											{/* Modal Footer */}
											<div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
												<button
													onClick={() => setShowInfo(false)}
													className="px-8 py-3 bg-gray-900 text-white rounded-xl text-base font-bold hover:bg-red-600 transition-all active:scale-95 shadow-sm"
												>
													{modalLang === 'th' ? 'เข้าใจแล้ว ปิดหน้าต่าง' : 'Got it, close window'}
												</button>
											</div>
										</div>

										{/* คลิกพื้นหลังเพื่อปิด */}
										<div className="absolute inset-0 -z-10" onClick={() => setShowInfo(false)}></div>
									</div>
								)}
							</div>
						</div>

						{/* 2. ปรับ Grid ให้เริ่มชิดบนเสมอ */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"></div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* Left Panel */}
							<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">

								<div>
									<label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
										<Video className="w-4 h-4 text-red-600" /> {t('image_category')}
									</label>
									<div className="flex flex-wrap gap-2">
										{categories.map((cat) => (
											<button
												key={cat}
												onClick={() => setSelectedCategory(cat)}
												className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:bg-red-50'}`}
											>
												{VCAT_KEYS[cat] ? t(VCAT_KEYS[cat]) : cat}
											</button>
										))}
									</div>
								</div>

								{/* Advanced Settings */}
								<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
									<div>
										<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
											<User className="w-3.5 h-3.5 text-red-600" /> {t('image_presenter')}
										</label>
										<select
											value={presenter}
											onChange={(e) => setPresenter(e.target.value)}
											className="w-full border border-gray-200 bg-white rounded-lg p-2.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
										>
											{presenterOptions.map(opt => <option key={opt} value={opt}>{PRES_KEYS[opt] ? t(PRES_KEYS[opt]) : opt}</option>)}
										</select>
									</div>
									<div>
										<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
											<Palette className="w-3.5 h-3.5" /> {t('image_style')}
										</label>
										<select
											value={style}
											onChange={(e) => setStyle(e.target.value)}
											className="w-full border border-gray-200 bg-white rounded-lg p-2.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
										>
											{styleOptions.map(opt => <option key={opt} value={opt}>{STYLE_KEYS[opt] ? t(STYLE_KEYS[opt]) : opt}</option>)}
										</select>
									</div>
									<div>
										<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
											<Camera className="w-3.5 h-3.5" /> {t('image_camera')}
										</label>
										<select
											value={cameraAngle}
											onChange={(e) => setCameraAngle(e.target.value)}
											className="w-full border border-gray-200 bg-white rounded-lg p-2.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
										>
											{cameraOptions.map(opt => <option key={opt} value={opt}>{CAM_KEYS[opt] ? t(CAM_KEYS[opt]) : opt}</option>)}
										</select>
									</div>
									<div>
										<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
											<Sun className="w-3.5 h-3.5" /> {t('image_lighting')}
										</label>
										<select
											value={lighting}
											onChange={(e) => setLighting(e.target.value)}
											className="w-full border border-gray-200 bg-white rounded-lg p-2.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
										>
											{lightingOptions.map(opt => <option key={opt} value={opt}>{LIGHT_KEYS[opt] ? t(LIGHT_KEYS[opt]) : opt}</option>)}
										</select>
									</div>
								</div>

								<div>
									<div className="flex items-center justify-between mb-2">
										<label className="text-sm font-bold text-gray-700 flex items-center gap-2">
											<Clapperboard className="w-4 h-4 text-red-600" />
											{t('video_prompt_label')}
										</label>
										<button
											onClick={handleAutoPrompt}
											disabled={isEnhancingPrompt || currentCoins < 15}
											className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isEnhancingPrompt || currentCoins < 15
													? 'bg-gray-100 text-gray-400 cursor-not-allowed'
													: 'bg-primary-red/10 text-primary-red hover:bg-primary-red hover:text-white'
												}`}
										>
											{isEnhancingPrompt ? (
												<RefreshCw className="w-3.5 h-3.5 animate-spin" />
											) : (
												<Sparkles className="w-3.5 h-3.5" />
											)}
											{isEnhancingPrompt ? 'กำลังคิด...' : `${t('image_let_ai_think')} (-15 Coins)`}
										</button>
									</div>
									<textarea
										rows={4}
										className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all"
										placeholder="Describe your product scene... (Or paste a Shopee/Lazada URL and click 'Let AI Think')"
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

								{/* 🟢 เติม Platform Format (Aspect Ratio) กลับเข้ามาตรงนี้ครับ */}
								<div className="md:col-span-2">
									<label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
										<Monitor className="w-4 h-4 text-red-600" /> Platform Format
										<span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-2">Standard Duration (5s)</span>
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
									{isBanned && (
										<div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold flex items-center gap-2">
											<ShieldAlert className="w-4 h-4" /> {t('general_suspended')}
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
											<><RefreshCw className="w-5 h-5 animate-spin" />{t('image_generating')}</>
										) : isBanned ? (
											t('general_suspended')
										) : currentCoins < currentCost ? (
											t('general_not_enough_coins')
										) : (
											<><Play className="w-5 h-5 fill-current" />{t('video_generate_btn')} (-{currentCost} Coins)</>
										)}
									</button>
								</div>
							</div>

							{/* Right Panel */}
							<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-150 lg:sticky lg:top-6">
								<div className="flex-1 flex items-center justify-center bg-[#f8f9fa] rounded-xl border-2 border-dashed border-gray-200 overflow-hidden relative min-h-125">
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
													<span className="text-xs">X</span>
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
											{t('video_download')}
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