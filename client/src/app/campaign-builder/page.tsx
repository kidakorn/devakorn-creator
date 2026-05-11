/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from 'swr';
import {
	Megaphone, Wand2, Sparkles, Copy, CheckCircle2,
	Image as ImageIcon, LayoutGrid, History, ShieldAlert, X,
	Globe, MoreHorizontal, ThumbsUp, MessageCircle, Share,
	Heart, Bookmark, Music, Play
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/lib/useLanguage";
import type { TranslationKey } from "@/lib/translations";

const PLATFORMS = ["Facebook", "Instagram", "TikTok", "YouTube"];
const TONES = ["Engaging & Professional", "Fun & Casual", "Hard Sell (Urgent)", "Storytelling"];
const LANGUAGES = ["Thai (ภาษาไทย)", "English"];
const OBJECTIVES = ["Direct Conversion / Sales", "Engagement & Viral", "Brand Awareness", "Lead Generation"];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CAMP_TONE_KEYS: Record<string, TranslationKey> = {
	'Engaging & Professional': 'camp_tone_engaging',
	'Fun & Casual': 'camp_tone_fun',
	'Hard Sell (Urgent)': 'camp_tone_hard_sell',
	'Storytelling': 'camp_tone_story',
};
const OBJ_KEYS: Record<string, TranslationKey> = {
	'Direct Conversion / Sales': 'obj_conversion',
	'Engagement & Viral': 'obj_engagement',
	'Brand Awareness': 'obj_awareness',
	'Lead Generation': 'obj_leads',
};

export default function CampaignBuilderPage() {
	const { data: session } = useSession();
	const { t } = useLanguage();

	const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const [modalLang, setModalLang] = useState<'th' | 'en'>('th');

	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
	const [platform, setPlatform] = useState(PLATFORMS[0]);
	const [tone, setTone] = useState(TONES[0]);
	const [language, setLanguage] = useState(LANGUAGES[0]);
	const [audience, setAudience] = useState("");
	const [objective, setObjective] = useState(OBJECTIVES[0]);
	const [promotion, setPromotion] = useState("");
	const [productName, setProductName] = useState("");
	const [additionalInfo, setAdditionalInfo] = useState("");
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

	useEffect(() => {
		const savedImage = localStorage.getItem("selectedCampaignImage");
		if (savedImage) {
			setSelectedImageUrl(savedImage); // ยัดรูปเข้ากล่อง Selected Image อัตโนมัติ
			localStorage.removeItem("selectedCampaignImage"); // ลบขยะออก
		}
	}, []);

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
				body: JSON.stringify({
					imageUrl: selectedImageUrl,
					platform,
					tone,
					language: selectedLang,
					audience,
					objective,
					promotion,
					productName,
					additionalInfo
				}),
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
				{/* Title & Tabs */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
					<div>
						<h1 className="text-2xl font-black text-dark-bg tracking-tight flex items-center gap-2">
							<Megaphone className="w-6 h-6 text-primary-red" />
							{t('campaign_title')}
						</h1>

						<div className="mt-2">
							<button
								onClick={() => setShowInfo(true)}
								className="flex items-center gap-1.5 text-xs font-bold text-text-main/60 hover:text-primary-red transition-colors"
							>
								<div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-black">?</div>
								{t('show_info') || 'ดูวิธีใช้งาน'}
							</button>

							{/* Modal Overlay */}
							{showInfo && (
								<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-dark-bg/40 backdrop-blur-sm animate-in fade-in">

									{/* Modal Box */}
									<div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

										{/* Modal Header */}
										<div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-light-gray/20 shrink-0">
											<div className="flex items-center gap-4">
												<h3 className="text-xl font-black text-dark-bg flex items-center gap-2">
													<Megaphone className="w-6 h-6 text-primary-red" />
													{modalLang === 'th' ? 'คู่มือการใช้งาน Campaign Builder' : 'Campaign Builder Guide'}
												</h3>

												{/* TH/EN Toggle Button */}
												<div className="flex bg-gray-200 rounded-lg p-0.5">
													<button
														onClick={() => setModalLang('th')}
														className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${modalLang === 'th' ? 'bg-white text-primary-red shadow-sm' : 'text-gray-500 hover:text-dark-bg'}`}
													>
														TH
													</button>
													<button
														onClick={() => setModalLang('en')}
														className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${modalLang === 'en' ? 'bg-white text-primary-red shadow-sm' : 'text-gray-500 hover:text-dark-bg'}`}
													>
														EN
													</button>
												</div>
											</div>
											<button
												onClick={() => setShowInfo(false)}
												className="text-text-main/40 hover:text-primary-red transition-colors text-2xl leading-none font-bold p-1 absolute top-4 right-4 sm:static"
											>
												✕
											</button>
										</div>

										{/* Modal Body (Scrollable) */}
										<div className="p-6 overflow-y-auto space-y-6 text-sm text-text-main/80">
											<p className="font-bold text-dark-bg text-lg border-l-4 border-primary-red pl-3 bg-light-gray/20 py-3 rounded-r-lg">
												{modalLang === 'th'
													? 'ระบบนี้คือผู้ช่วยนักการตลาดส่วนตัวของคุณ เพียงนำรูปภาพโฆษณาที่คุณสร้างไว้จาก Image Studio มาจับคู่กับข้อความ (Copywriting) ที่ AI เขียนให้ คุณก็จะได้โพสต์ที่พร้อมนำไปใช้งานจริงทันที'
													: 'This tool is your personal marketing assistant. Simply take the commercial images you generated in Image Studio, pair them with AI-written copy, and you will get ready-to-publish social media posts instantly.'}
											</p>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{(modalLang === 'th' ? [
													{ title: "1. เลือกรูปจากแกลเลอรี (Select Image)", desc: "ขั้นตอนสำคัญที่สุด! คุณต้องกดเลือกรูปภาพสินค้าที่คุณเคยสร้างไว้จากโหมด Image Studio ระบบ AI จะทำการวิเคราะห์รูปภาพนี้เพื่อนำไปเขียนแคปชันให้สอดคล้องกัน" },
													{ title: "2. แพลตฟอร์ม (Platform)", desc: "เลือกช่องทางโซเชียลมีเดียที่คุณต้องการนำไปโพสต์ เช่น Facebook, TikTok หรือ Instagram ระบบจะปรับความยาวของข้อความและการจัดวาง (Layout) ให้เหมาะสมกับแอปนั้นๆ" },
													{ title: "3. ภาษา (Language)", desc: "ต้องการให้ AI เขียนแคปชันขายของเป็นภาษาอะไร? ปัจจุบันรองรับทั้งภาษาไทยเพื่อเจาะตลาดในประเทศ และภาษาอังกฤษสำหรับลูกค้าต่างชาติ" },
													{ title: "4. โทนเสียง (Tone of Voice)", desc: "กำหนดบุคลิกของแบรนด์ เช่น เลือก 'น่าสนใจ & มืออาชีพ' สำหรับสินค้าพรีเมียม หรือเลือก 'ขายตรง (เร่งด่วน)' หากต้องการกระตุ้นให้ลูกค้าตัดสินใจซื้อทันที" },
													{ title: "5. วัตถุประสงค์ (Objective)", desc: "บอก AI ว่าโพสต์นี้ทำไปเพื่ออะไร เช่น 'เพิ่มยอดขายโดยตรง' AI จะเน้นเขียนเชิญชวนให้คลิกซื้อ หรือ 'สร้าง Brand Awareness' จะเน้นการเล่าเรื่องให้คนจดจำแบรนด์" },
													{ title: "6. กลุ่มเป้าหมาย (Audience)", desc: "ระบุให้ชัดเจนว่าอยากคุยกับใคร เช่น 'พนักงานออฟฟิศอายุ 25-35 ปี' หรือ 'คุณแม่ลูกอ่อน' AI จะเลือกใช้คำศัพท์ที่ตรงใจคนกลุ่มนั้นมากขึ้น" },
													{ title: "7. โปรโมชัน (Promotion)", desc: "ใส่ข้อเสนอพิเศษเพื่อดึงดูดใจ เช่น 'ซื้อ 1 แถม 1 เฉพาะวันนี้' หรือ 'ลด 50% ส่งฟรี' ข้อมูลนี้จะถูกนำไปไฮไลต์ในแคปชันให้เด่นชัด" },
													{ title: "8. ข้อมูลเพิ่มเติม (Product Name & Info)", desc: "ระบุชื่อสินค้าของคุณและจุดเด่นหลักๆ (เช่น สบู่สมุนไพรออร์แกนิก, ลดรอยสิว) เพื่อให้แคปชันมีความเฉพาะเจาะจงและตรงกับสินค้าของคุณมากที่สุด" }
												] : [
													{ title: "1. Select Image", desc: "The most crucial step! You must select an image you previously generated in Image Studio. The AI will analyze this image to write a highly contextual and matching caption." },
													{ title: "2. Platform", desc: "Choose your target social media network (e.g., Facebook, TikTok). The AI will tailor the caption length and provide a live mockup layout for that specific app." },
													{ title: "3. Language", desc: "Select the language for your marketing copy. We currently support Thai for local markets and English for international audiences." },
													{ title: "4. Tone of Voice", desc: "Define your brand personality. Use 'Engaging & Professional' for premium products, or 'Hard Sell' to create urgency and drive immediate action." },
													{ title: "5. Objective", desc: "Tell the AI the goal of this post. 'Direct Conversion' will focus on strong Call-to-Actions, while 'Brand Awareness' will focus on storytelling." },
													{ title: "6. Target Audience", desc: "Specify who you are talking to (e.g., 'Office workers 25-35' or 'New mothers'). The AI will adjust its vocabulary to resonate with them." },
													{ title: "7. Promotion", desc: "Include your special offers here, like 'Buy 1 Get 1 Free' or '50% off today'. The AI will highlight this effectively in the generated copy." },
													{ title: "8. Product Name & Info", desc: "Input your actual product name and key selling points (e.g., Organic herbal soap, clears acne). This ensures the generated caption is accurate and specific to your brand." }
												]).map((item, idx) => (
													<div key={idx} className="bg-light-gray/30 p-4.5 rounded-xl border border-gray-100 hover:border-primary-red/30 transition-colors">
														<h4 className="font-bold text-dark-bg mb-2 text-base">{item.title}</h4>
														<p className="text-sm text-text-main/70 leading-relaxed">{item.desc}</p>
													</div>
												))}
											</div>
										</div>

										{/* Modal Footer */}
										<div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
											<button
												onClick={() => setShowInfo(false)}
												className="px-8 py-3 bg-dark-bg text-white rounded-xl text-base font-bold hover:bg-primary-red transition-all active:scale-95 shadow-sm"
											>
												{modalLang === 'th' ? 'เข้าใจแล้ว เริ่มสร้างแคมเปญ' : 'Got it, start building'}
											</button>
										</div>
									</div>

									{/* คลิกพื้นหลังเพื่อปิด */}
									<div className="absolute inset-0 -z-10" onClick={() => setShowInfo(false)}></div>
								</div>
							)}
						</div>
					</div>

					{/* 🟢 ส่วน Tabs เดิมของพี่ (Create / History) จะถูกดันลงมาอยู่ตรงนี้ ห้ามลบทิ้งนะครับ */}
					<div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 h-fit">
						<button
							onClick={() => setActiveTab('create')}
							className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-white text-dark-bg shadow-sm' : 'text-gray-500 hover:text-dark-bg'}`}
						>
							<span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> {t('campaign_create')}</span>
						</button>
						<button
							onClick={() => setActiveTab('history')}
							className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-dark-bg shadow-sm' : 'text-gray-500 hover:text-dark-bg'}`}
						>
							<span className="flex items-center gap-2"><History className="w-4 h-4" /> {t('campaign_my_campaigns')}</span>
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
								<h2 className="text-base font-bold text-dark-bg">{t('campaign_settings')}</h2>
								<p className="text-xs text-text-main/50 font-medium">{t('campaign_sub')}</p>
							</div>

							<div className="p-5 flex flex-col gap-5 flex-1">
								{/* Image Selector */}
								<div className="space-y-2">
									<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
										<ImageIcon className="w-4 h-4 text-primary-red" /> {t('campaign_select_image')}
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
												<span className="font-bold text-sm">{t('campaign_select_image')}</span>
											</button>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<label className="text-sm font-bold text-dark-bg">{t('campaign_platform')}</label>
										<select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all" value={platform} onChange={(e) => setPlatform(e.target.value)}>
											{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
										</select>
									</div>
									<div className="space-y-1.5">
										<label className="text-sm font-bold text-dark-bg">{t('campaign_language')}</label>
										<select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all" value={language} onChange={(e) => setLanguage(e.target.value)}>
											{LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
										</select>
									</div>
									<div className="space-y-1.5 lg:col-span-2">
										<label className="text-sm font-bold text-dark-bg">{t('campaign_tone')}</label>
										<select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all" value={tone} onChange={(e) => setTone(e.target.value)}>
											{TONES.map(toneVal => <option key={toneVal} value={toneVal}>{CAMP_TONE_KEYS[toneVal] ? t(CAMP_TONE_KEYS[toneVal]) : toneVal}</option>)}
										</select>
									</div>

									{/* Agency Fields */}
									<div className="space-y-1.5 lg:col-span-2">
										<label className="text-sm font-bold text-dark-bg">{t('campaign_product_name')}</label>
										<input
											type="text"
											placeholder="e.g. BAEAY Superfood"
											className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
											value={productName}
											onChange={(e) => setProductName(e.target.value)}
										/>
									</div>
									<div className="space-y-1.5 lg:col-span-2">
										<label className="text-sm font-bold text-dark-bg">{t('campaign_additional')}</label>
										<input
											type="text"
											placeholder="e.g. Helps with digestion, rich in Vitamin C"
											className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
											value={additionalInfo}
											onChange={(e) => setAdditionalInfo(e.target.value)}
										/>
									</div>
									<div className="space-y-1.5 lg:col-span-2 pt-2 border-t border-gray-100 mt-2">
										<label className="text-sm font-bold text-dark-bg">{t('campaign_objective')}</label>
										<select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all" value={objective} onChange={(e) => setObjective(e.target.value)}>
											{OBJECTIVES.map(obj => <option key={obj} value={obj}>{OBJ_KEYS[obj] ? t(OBJ_KEYS[obj]) : obj}</option>)}
										</select>
									</div>
									<div className="space-y-1.5 lg:col-span-2">
										<label className="text-sm font-bold text-dark-bg">{t('campaign_audience')}</label>
										<input
											type="text"
											placeholder="e.g. Office workers 25-35, Moms with babies"
											className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
											value={audience}
											onChange={(e) => setAudience(e.target.value)}
										/>
									</div>
									<div className="space-y-1.5 lg:col-span-2">
										<label className="text-sm font-bold text-dark-bg">{t('campaign_promotion')}</label>
										<input
											type="text"
											placeholder="e.g. Buy 1 Get 1 Free, 50% Off until midnight"
											className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
											value={promotion}
											onChange={(e) => setPromotion(e.target.value)}
										/>
									</div>
								</div>

								<div className="mt-auto pt-4">
									{isBanned && (
										<div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold flex items-center gap-2">
											<ShieldAlert className="w-4 h-4" /> {t('general_suspended')}
										</div>
									)}
									<button
										onClick={handleGenerate}
										disabled={isButtonDisabled}
										className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${isButtonDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70' : 'bg-dark-bg hover:bg-primary-red text-white'}`}
									>
										{isGenerating ? <><Sparkles className="w-4 h-4 animate-spin" /> {t('campaign_generating')}</> : <><Megaphone className="w-4 h-4" /> {t('campaign_build_btn')} (-{COST_PER_CAMPAIGN} Coins)</>}
									</button>
								</div>
							</div>
						</section>

						{/* Right Side: Output Result (50%) */}
						<section className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative min-h-125 md:h-full">
							<div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
								<div>
									<h2 className="text-base font-bold text-dark-bg">Ready to Post</h2>
									<p className="text-xs text-text-main/50 font-medium">Copy this to your social media</p>
								</div>
								{generatedCaption && (
									<button onClick={() => copyToClipboard(generatedCaption)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-600'}`}>
										{isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {isCopied ? t('general_copied') : t('general_copy')}
									</button>
								)}
							</div>

							<div className="p-5 flex-1 bg-gray-50/50 relative overflow-y-auto">
								{isGenerating ? (
									<div className="absolute inset-0 flex flex-col items-center justify-center text-primary-red animate-pulse">
										<Sparkles className="w-10 h-10 mb-2" />
										<p className="text-sm font-bold text-dark-bg">{t('campaign_generating')}</p>
									</div>
								) : generatedCaption ? (
									<div className="flex flex-col gap-6 py-4 w-full h-full max-w-125 mx-auto">

										{/* Editable Text Area for Copy */}
										<div className="flex flex-col gap-2">
											<label className="text-sm font-bold text-dark-bg">{t('campaign_editable')}</label>
											<textarea
												className="w-full min-h-55 border border-gray-200 bg-white rounded-xl p-4 text-[14px] text-gray-800 leading-relaxed focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none resize-y shadow-sm"
												value={generatedCaption}
												onChange={(e) => setGeneratedCaption(e.target.value)}
											/>
										</div>

										<div className="border-t border-gray-200 pt-6">
											<h3 className="text-sm font-bold text-dark-bg mb-4 text-center">{t('campaign_live_preview')}</h3>
											{/* Facebook Mockup */}
											{platform === 'Facebook' && (
												<div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-105 h-fit overflow-hidden flex flex-col mx-auto animate-in zoom-in-95 duration-300">
													{/* Header */}
													<div className="p-3 flex items-center justify-between">
														<div className="flex items-center gap-2.5">
															<div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
															<div className="flex flex-col">
																<span className="text-[13px] font-bold text-gray-900 leading-tight">{productName || 'Your Brand Name'}</span>
																<div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
																	<span>Sponsored</span>
																	<span>•</span>
																	<Globe className="w-3 h-3" />
																</div>
															</div>
														</div>
														<MoreHorizontal className="w-5 h-5 text-gray-400" />
													</div>
													{/* Caption Content */}
													<div className="px-3 pb-3 text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
														{generatedCaption}
													</div>
													{/* Image Preview */}
													{selectedImageUrl && (
														<div className="w-full bg-gray-100 border-y border-gray-100">
															<img src={selectedImageUrl} alt="Campaign Asset" className="w-full object-cover max-h-105" />
														</div>
													)}
													{/* Fake CTA Bar */}
													<div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
														<div className="flex flex-col overflow-hidden pr-2">
															<span className="text-[10px] text-gray-500 uppercase tracking-widest truncate">WWW.YOURSTORE.COM</span>
															<span className="text-[13px] font-bold text-gray-900 leading-tight truncate mt-0.5">Shop the latest collection now</span>
														</div>
														<div className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap">
															Learn More
														</div>
													</div>
													{/* Fake Action Buttons */}
													<div className="px-4 py-2.5 flex items-center justify-between text-gray-500">
														<button className="flex items-center justify-center gap-1.5 text-xs font-bold flex-1 py-1 hover:bg-gray-50 rounded">
															<ThumbsUp className="w-4 h-4" /> Like
														</button>
														<button className="flex items-center justify-center gap-1.5 text-xs font-bold flex-1 py-1 hover:bg-gray-50 rounded">
															<MessageCircle className="w-4 h-4" /> Comment
														</button>
														<button className="flex items-center justify-center gap-1.5 text-xs font-bold flex-1 py-1 hover:bg-gray-50 rounded">
															<Share className="w-4 h-4" /> Share
														</button>
													</div>
												</div>
											)}

											{/* Instagram Mockup */}
											{platform === 'Instagram' && (
												<div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-105 h-fit overflow-hidden flex flex-col mx-auto animate-in zoom-in-95 duration-300">
													<div className="p-3 flex items-center justify-between">
														<div className="flex items-center gap-2.5">
															<div className="w-8 h-8 bg-linear-to-tr from-yellow-400 to-fuchsia-600 rounded-full p-0.5">
																<div className="w-full h-full bg-white rounded-full border border-white" />
															</div>
															<span className="text-[13px] font-bold text-gray-900 leading-tight">{productName ? productName.toLowerCase().replace(/\s+/g, '_') : 'your_brand_name'}</span>
														</div>
														<MoreHorizontal className="w-5 h-5 text-gray-900" />
													</div>
													{selectedImageUrl && (
														<div className="w-full bg-gray-100">
															<img src={selectedImageUrl} alt="Campaign Asset" className="w-full object-cover max-h-105" />
														</div>
													)}
													<div className="px-3 py-2.5 flex items-center justify-between">
														<div className="flex items-center gap-3.5">
															<Heart className="w-6 h-6 text-gray-900" />
															<MessageCircle className="w-6 h-6 text-gray-900" />
															<Share className="w-6 h-6 text-gray-900" />
														</div>
														<Bookmark className="w-6 h-6 text-gray-900" />
													</div>
													<div className="px-3 pb-1 text-[13px] font-bold text-gray-900">1,234 likes</div>
													<div className="px-3 pb-4 text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">
														<span className="font-bold text-gray-900 mr-2">{productName ? productName.toLowerCase().replace(/\s+/g, '_') : 'your_brand_name'}</span>
														{generatedCaption}
													</div>
												</div>
											)}

											{/* TikTok Mockup */}
											{platform === 'TikTok' && (
												<div className="bg-black text-white border border-gray-800 rounded-xl shadow-sm w-full max-w-[320px] h-142 relative overflow-hidden flex flex-col mx-auto animate-in zoom-in-95 duration-300">
													{selectedImageUrl && (
														<img src={selectedImageUrl} alt="Campaign Asset" className="absolute inset-0 w-full h-full object-cover opacity-80" />
													)}
													<div className="absolute top-4 left-0 right-0 flex justify-center gap-4 text-[15px] font-bold drop-shadow-md z-10">
														<span className="text-white/70">Following</span>
														<span>For You</span>
													</div>
													<div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 drop-shadow-md z-10">
														<div className="w-12 h-12 bg-white rounded-full border-2 border-white relative mb-2">
															<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white">+</div>
														</div>
														<div className="flex flex-col items-center gap-1"><Heart className="w-8 h-8" /><span className="text-[11px] font-bold">124K</span></div>
														<div className="flex flex-col items-center gap-1"><MessageCircle className="w-8 h-8" /><span className="text-[11px] font-bold">1024</span></div>
														<div className="flex flex-col items-center gap-1"><Bookmark className="w-8 h-8" /><span className="text-[11px] font-bold">4.2K</span></div>
														<div className="flex flex-col items-center gap-1"><Share className="w-8 h-8" /><span className="text-[11px] font-bold">Share</span></div>
														<div className="w-10 h-10 bg-gray-800 rounded-full animate-spin-slow border-4 border-gray-800 flex items-center justify-center mt-2 overflow-hidden">
															<div className="w-full h-full bg-linear-to-tr from-gray-700 to-gray-500" />
														</div>
													</div>
													<div className="absolute left-3 bottom-6 right-16 flex flex-col gap-2 drop-shadow-md z-10">
														<span className="font-bold text-[15px]">@{productName ? productName.toLowerCase().replace(/\s+/g, '_') : 'your_brand_name'}</span>
														<div className="text-[13px] line-clamp-3 leading-snug">{generatedCaption}</div>
														<div className="flex items-center gap-2 text-[13px] mt-1"><Music className="w-3 h-3" /> original sound - {productName || 'Your Brand'}</div>
													</div>
													{/* Overlay Gradient for Text readability */}
													<div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
												</div>
											)}

											{/* YouTube Mockup */}
											{platform === 'YouTube' && (
												<div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-105 h-fit overflow-hidden flex flex-col mx-auto animate-in zoom-in-95 duration-300">
													{selectedImageUrl && (
														<div className="w-full relative aspect-video bg-gray-100">
															<img src={selectedImageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
															<div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">0:15</div>
														</div>
													)}
													<div className="p-3 flex items-start gap-3">
														<div className="w-9 h-9 bg-gray-200 rounded-full shrink-0 mt-0.5" />
														<div className="flex flex-col w-full">
															<span className="text-[14px] font-bold text-gray-900 leading-tight line-clamp-2 pr-6 relative">
																{generatedCaption.split('\n')[0] || "Your Video Title Here"}
																<MoreHorizontal className="w-5 h-5 text-gray-900 absolute top-0 -right-2" />
															</span>
															<div className="flex items-center gap-1 text-[12px] text-gray-500 mt-1">
																<span>{productName || 'Your Brand'} Channel</span>
																<span>•</span>
																<span>12K views</span>
																<span>•</span>
																<span>1 day ago</span>
															</div>
															<div className="mt-3 text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 p-2.5 rounded-lg border border-gray-100">
																{generatedCaption}
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								) : (
									<div className="absolute inset-0 flex flex-col items-center justify-center text-text-main/30">
										<Megaphone className="w-10 h-10 mb-3 opacity-50" />
										<p className="text-sm font-medium">{t('campaign_no_campaigns')}</p>
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
											<Copy className="w-3.5 h-3.5" /> {t('campaign_copy_caption')}
										</button>
									</div>
								</div>
							</div>
						)) : (
							<div className="col-span-full py-20 text-center text-gray-400">
								<History className="w-12 h-12 mx-auto mb-3 opacity-20" />
								<p className="font-bold">{t('campaign_no_campaigns')}</p>
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
									{t('campaign_select_image')}
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
														{t('campaign_select_image')}
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-20">
										<ImageIcon className="w-12 h-12 opacity-20" />
										<p className="font-medium text-sm">{t('campaign_no_campaigns')}</p>
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