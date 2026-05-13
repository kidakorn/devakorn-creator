/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from 'swr';
import { Wand2, Sparkles, Copy, CheckCircle2, Tags, PackageOpen, ShieldAlert, Type, AlignLeft, Globe } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/lib/useLanguage";
import type { TranslationKey } from "@/lib/translations";

const CATEGORIES = [
	"Product Photography", "T-Shirt Design", "Sticker & Die-cut",
	"Packaging Design", "Seamless Pattern", "Logo Concept", "3D Icon", "Product Mockup"
];

// Advanced Settings Options
const toneOptions = ['Creative & Professional', 'Direct & Minimalist', 'Dramatic & Cinematic', 'Cute & Friendly', 'Luxury & Elegant', 'Tech & Futuristic'];
const lengthOptions = ['Short (around 20-30 words)', 'Medium (around 50-80 words)', 'Long (around 100-150 words)'];
const languageOptions = ['English', 'Thai', 'Japanese', 'Chinese', 'Korean'];
const lightingOptions = ['Studio Light', 'Natural Light', 'Golden Hour', 'Dark & Moody', 'Neon'];
const cameraOptions = ['Close-up', 'Wide Angle', 'Top-down', 'Eye-level'];

// Lookup maps: English value → translation key
const CAT_KEYS: Record<string, TranslationKey> = {
	'Product Photography': 'cat_product_photo',
	'T-Shirt Design': 'cat_tshirt',
	'Sticker & Die-cut': 'cat_sticker',
	'Packaging Design': 'cat_packaging',
	'Seamless Pattern': 'cat_pattern',
	'Logo Concept': 'cat_logo',
	'3D Icon': 'cat_3d',
	'Product Mockup': 'cat_mockup',
};
const TONE_KEYS: Record<string, TranslationKey> = {
	'Creative & Professional': 'tone_creative',
	'Direct & Minimalist': 'tone_direct',
	'Dramatic & Cinematic': 'tone_dramatic',
	'Cute & Friendly': 'tone_cute',
	'Luxury & Elegant': 'tone_luxury',
	'Tech & Futuristic': 'tone_tech',
};
const LEN_KEYS: Record<string, TranslationKey> = {
	'Short (around 20-30 words)': 'len_short',
	'Medium (around 50-80 words)': 'len_medium',
	'Long (around 100-150 words)': 'len_long',
};
const LIGHT_KEYS: Record<string, TranslationKey> = {
	'Studio Light': 'light_studio',
	'Natural Light': 'light_natural',
	'Golden Hour': 'light_golden',
	'Dark & Moody': 'light_dark',
	'Neon': 'light_neon',
};
const CAM_KEYS: Record<string, TranslationKey> = {
	'Close-up': 'cam_closeup',
	'Wide Angle': 'cam_wide',
	'Top-down': 'cam_drone', // ใช้ cam_drone แทนชั่วคราวได้ครับ
	'Eye-level': 'cam_tracking', // ใช้ cam_tracking หรือเพิ่ม key ใหม่ใน translations.ts ก็ได้ครับ
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PromptEnhancerPage() {
	const { data: session } = useSession();
	const { t } = useLanguage();
	const [idea, setIdea] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Product Photography");
	const [enhancedPrompt, setEnhancedPrompt] = useState("");
	const [isEnhancing, setIsEnhancing] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const [modalLang, setModalLang] = useState<'th' | 'en'>('th');
	const [placeholderText, setPlaceholderText] = useState("พิมพ์ไอเดียของคุณ เช่น สบู่สมุนไพร หรือ เสื้อยืดสีขาว...");

	// State for Advanced Settings
	const [tone, setTone] = useState("Creative & Professional");
	const [length, setLength] = useState("Medium (around 50-80 words)");
	const [outputLanguage, setOutputLanguage] = useState("Thai");
	const [lighting, setLighting] = useState("Studio Light");
	const [cameraAngle, setCameraAngle] = useState("Close-up");

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
				// Send new parameters to API
				body: JSON.stringify({
					idea,
					category: selectedCategory,
					tone,
					length,
					outputLanguage,
					lighting,
					cameraAngle
				}),
			});

			const data = await response.json();

			if (response.ok && data.status === 'success') {
				// Update to support new API response key
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

	useEffect(() => {
		const examples = [
			"เช่น ขวดเซรั่มบำรุงผิวขวดแก้วใส วางตั้งอยู่บนแท่นหินอ่อนสีขาว มีหยดน้ำเกาะ...",
			"เช่น แก้วกาแฟลาเต้ร้อนฟองนมลายหัวใจ วางบนโต๊ะไม้เก่าๆ ในคาเฟ่วินเทจ มีควันลอย...",
			"เช่น ผู้หญิงกำลังเดินสวมเสื้อยืดสีขาวคอกลมแบบเรียบๆ ทรงโอเวอร์ไซส์ ยืนโพสท่าอย่างมั่นใจ..."
		];
		const randomExample = examples[Math.floor(Math.random() * examples.length)];
		setPlaceholderText(randomExample);
	}, []);

	return (
		<DashboardLayout>
			<div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
				{/* Title Section */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
					<div>
						<h1 className="text-2xl font-black text-dark-bg tracking-tight flex items-center gap-2">
							<PackageOpen className="w-6 h-6 text-primary-red" />
							{t('prompt_title')}
						</h1>
						{/* <p className="text-text-main/60 text-sm mt-1 font-medium">{t('prompt_sub')}</p> */}
						<div className="mt-2">
							<button
								onClick={() => setShowInfo(true)}
								className="flex items-center gap-1.5 text-xs font-bold text-text-main/60 hover:text-primary-red transition-colors"
							>
								<div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-black">?</div>
								{t('show_info')}
							</button>

							{/* Modal Overlay */}
							{showInfo && (
								<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/40 backdrop-blur-sm animate-in fade-in">

									{/* Modal Box */}
									<div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

										{/* Modal Header */}
										<div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-light-gray/20 shrink-0">
											<div className="flex items-center gap-4">
												<h3 className="text-lg font-black text-dark-bg flex items-center gap-2">
													<PackageOpen className="w-5 h-5 text-primary-red" />
													{modalLang === 'th' ? 'คู่มือการใช้งาน Prompt Magic' : 'Prompt Magic Guide'}
												</h3>

												{/* TH/EN Toggle Button */}
												<div className="flex bg-gray-200 rounded-lg p-0.5">
													<button
														onClick={() => setModalLang('th')}
														className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${modalLang === 'th' ? 'bg-white text-primary-red shadow-sm' : 'text-gray-500 hover:text-dark-bg'}`}
													>
														TH
													</button>
													<button
														onClick={() => setModalLang('en')}
														className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${modalLang === 'en' ? 'bg-white text-primary-red shadow-sm' : 'text-gray-500 hover:text-dark-bg'}`}
													>
														EN
													</button>
												</div>
											</div>
											<button
												onClick={() => setShowInfo(false)}
												className="text-text-main/40 hover:text-primary-red transition-colors text-xl leading-none font-bold p-1 absolute top-4 right-4 sm:static"
											>
												✕
											</button>
										</div>

										{/* Modal Body (Scrollable) */}
										<div className="p-6 overflow-y-auto space-y-6 text-sm text-text-main/80">
											<p className="font-bold text-dark-bg text-lg border-l-4 border-primary-red pl-3 bg-light-gray/20 py-2.5 rounded-r-lg">
												{modalLang === 'th'
													? 'ระบบนี้จะช่วยขยายไอเดียสั้นๆ ของคุณ ให้กลายเป็นคำสั่ง (Prompt) ระดับมืออาชีพที่ AI สร้างภาพเข้าใจได้ดีที่สุด'
													: 'This tool transforms your short ideas into highly detailed, professional prompts that image-generation AIs understand best.'}
											</p>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{(modalLang === 'th' ? [
													{ title: "1. ไอเดียของคุณ", desc: "พิมพ์สิ่งที่คุณต้องการสั้นๆ เช่น 'สบู่บนโขดหิน' หรือ 'ขวดน้ำหอมหรูหรา' ให้ระบบรู้เป้าหมายหลัก" },
													{ title: "2. หมวดหมู่", desc: "เลือกประเภทงานเพื่อให้ AI เข้าใจโครงสร้างภาพหลัก เช่น 'ถ่ายภาพสินค้า' จะเน้นจุดเด่นที่ตัวสินค้าเป็นหลัก" },
													{ title: "3. โทน", desc: "กำหนดบรรยากาศและอารมณ์ของภาพ เช่น โทน 'หรูหรา' จะทำให้ AI เลือกใช้คำศัพท์ที่เกี่ยวกับความพรีเมียมและสง่างาม" },
													{ title: "4. ความยาว", desc: "กำหนดความละเอียดของ Prompt ยิ่งระบุว่า 'ยาว' AI จะยิ่งเพิ่มเติมรายละเอียดของสภาพแวดล้อมและพื้นหลังได้สมบูรณ์ขึ้น" },
													{ title: "5. ภาษาที่ต้องการ", desc: "แนะนำให้เลือก 'English' เสมอ เนื่องจาก AI สร้างภาพระดับโลกส่วนใหญ่จะเข้าใจและประมวลผลภาษาอังกฤษได้แม่นยำที่สุด" },
													{ title: "6. แสง", desc: "กำหนดลักษณะการตกกระทบของแสง เช่น 'แสงสตูดิโอ' ให้ภาพที่เคลียร์ชัดเจน ส่วน 'แสงธรรมชาติ' จะดูนุ่มนวลสมจริง" },
													{ title: "7. มุมกล้อง", desc: "กำหนดระยะการมองเห็น เช่น 'ระยะใกล้' เพื่อเน้นรายละเอียดและพื้นผิวสินค้า หรือ 'มุมกว้าง' เพื่อให้เห็นบริบทและบรรยากาศโดยรอบ" }
												] : [
													{ title: "1. Your Idea", desc: "Type a simple concept, e.g., 'soap on a rock' or 'luxury perfume bottle' to set the main subject." },
													{ title: "2. Category", desc: "Select the artwork type to help AI structure the core image (e.g., 'Product Photography' for product-centric ads)." },
													{ title: "3. Tone", desc: "Sets the mood and atmosphere. For instance, 'Luxury' will prompt the AI to use premium-related keywords." },
													{ title: "4. Length", desc: "Determines the level of detail. Selecting 'Long' allows the AI to thoroughly describe backgrounds and environments." },
													{ title: "5. Output Language", desc: "'English' is highly recommended as most global image-generation AIs understand and process it best." },
													{ title: "6. Lighting", desc: "Defines the illumination style. 'Studio Light' gives a clean and crisp look, while 'Natural Light' feels softer." },
													{ title: "7. Camera Angle", desc: "Sets the perspective. 'Close-up' focuses on product textures, while 'Wide Angle' shows the surrounding environment." }
												]).map((item, idx) => (
													<div key={idx} className="bg-light-gray/30 p-4 rounded-xl border border-gray-100 hover:border-primary-red/30 transition-colors">
														<h4 className="font-bold text-dark-bg mb-1.5 text-base">{item.title}</h4>
														<p className="text-sm text-text-main/70 leading-relaxed">{item.desc}</p>
													</div>
												))}
											</div>
										</div>

										{/* Modal Footer */}
										<div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
											<button
												onClick={() => setShowInfo(false)}
												className="px-6 py-2.5 bg-dark-bg text-white rounded-xl text-sm font-bold hover:bg-primary-red transition-all active:scale-95 shadow-sm"
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
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Left Side: Input Form */}
					<section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
						<div className="p-5 sm:p-6 border-b border-gray-100 bg-light-gray/20">
							<h2 className="text-lg font-bold text-dark-bg">{t('prompt_input_label')}</h2>
							<p className="text-xs text-text-main/50 font-medium">{t('prompt_sub')}</p>
						</div>

						<div className="p-5 sm:p-6 flex-1 flex flex-col gap-5">

							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
									<Tags className="w-4 h-4 text-primary-red" /> {t('image_category')}
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
											{CAT_KEYS[cat] ? t(CAT_KEYS[cat]) : cat}
										</button>
									))}
								</div>
							</div>

							{/* Advanced Settings */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-light-gray/30 p-3.5 rounded-xl border border-gray-100">
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Type className="w-3.5 h-3.5 text-primary-red" /> {t('prompt_tone')}
									</label>
									<select
										value={tone}
										onChange={(e) => setTone(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{toneOptions.map(opt => <option key={opt} value={opt}>{TONE_KEYS[opt] ? t(TONE_KEYS[opt]) : opt}</option>)}
									</select>
								</div>
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<AlignLeft className="w-3.5 h-3.5 text-primary-red" /> {t('prompt_length')}
									</label>
									<select
										value={length}
										onChange={(e) => setLength(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{lengthOptions.map(opt => <option key={opt} value={opt}>{LEN_KEYS[opt] ? t(LEN_KEYS[opt]) : opt}</option>)}
									</select>
								</div>
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Globe className="w-3.5 h-3.5 text-primary-red" /> {t('prompt_language')}
									</label>
									<select
										value={outputLanguage}
										onChange={(e) => setOutputLanguage(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{languageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
									</select>
								</div>

								{/* 🟢 ส่วนที่เพิ่มใหม่: แสงและมุมกล้อง */}
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Sparkles className="w-3.5 h-3.5 text-primary-red" /> {t('image_lighting') || 'Lighting'}
									</label>
									<select
										value={lighting}
										onChange={(e) => setLighting(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{lightingOptions.map(opt => <option key={opt} value={opt}>{LIGHT_KEYS[opt] ? t(LIGHT_KEYS[opt]) : opt}</option>)}
									</select>
								</div>

								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Wand2 className="w-3.5 h-3.5 text-primary-red" /> {t('image_camera') || 'Camera Angle'}
									</label>
									<select
										value={cameraAngle}
										onChange={(e) => setCameraAngle(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{cameraOptions.map(opt => <option key={opt} value={opt}>{CAM_KEYS[opt] ? t(CAM_KEYS[opt]) : opt}</option>)}
									</select>
								</div>
							</div>

							<div className="space-y-3 flex-1 flex flex-col">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">{t('prompt_enhance_btn')}</label>
								<textarea
									rows={4}
									value={idea}
									onChange={(e) => setIdea(e.target.value)}
									placeholder={placeholderText}
									className="flex-1 w-full bg-light-gray/30 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-dark-bg focus:bg-white focus:border-primary-red/40 focus:ring-4 focus:ring-primary-red/5 outline-none transition-all resize-none"
								/>
							</div>

							<div className="mt-auto">
								{isBanned && (
									<div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold flex items-center gap-2">
										<ShieldAlert className="w-4 h-4" /> {t('general_suspended')}
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
										<><Sparkles className="w-4 h-4 animate-spin" />{t('image_generating')}</>
									) : isBanned ? (
										t('general_suspended')
									) : currentCoins < currentCost ? (
										t('general_not_enough_coins')
									) : (
										<><Wand2 className="w-4 h-4" />{t('prompt_enhance_btn')} (-{currentCost} Coins)</>
									)}
								</button>
							</div>
						</div>
					</section>

					{/* Right Side: Result Output */}
					<section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative group">
						<div className="p-5 sm:p-6 border-b border-gray-100 bg-light-gray/20 flex justify-between items-center">
							<div>
								<h2 className="text-lg font-bold text-dark-bg">{t('prompt_result_placeholder')}</h2>
								<p className="text-xs text-text-main/50 font-medium">{t('image_let_ai_think')}</p>
							</div>
							{enhancedPrompt && (
								<button
									onClick={copyToClipboard}
									className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-light-gray text-text-main/60 hover:text-dark-bg hover:bg-gray-200'
										}`}
								>
									{isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
									{isCopied ? t('general_copied') : t('general_copy')}
								</button>
							)}
						</div>

						<div className="p-5 sm:p-6 flex-1 bg-light-gray/10 relative">
							{isEnhancing ? (
								<div className="absolute inset-0 flex flex-col items-center justify-center text-primary-red animate-pulse">
									<Sparkles className="w-10 h-10 mb-2" />
									<p className="text-sm font-bold text-dark-bg">{t('image_generating')}</p>
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
									<p className="text-sm font-medium">{t('prompt_result_placeholder')}</p>
								</div>
							)}
						</div>
					</section>
				</div>
			</div>
		</DashboardLayout>
	);
}