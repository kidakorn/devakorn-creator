/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from 'swr';
import {
	Sparkles, Download, Wand2, RefreshCw, ImagePlus, UploadCloud, X, Tags, PackageOpen, ShieldAlert,
	Camera, Palette, Sun, Layers, User // Added icons
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/lib/useLanguage";
import type { TranslationKey } from "@/lib/translations";

const CATEGORIES = [
	"None", "Product Photography", "T-Shirt Design", "Sticker & Die-cut",
	"Packaging Design", "Seamless Pattern", "Logo Concept", "3D Icon"
];

// Options for new features
const styleOptions = ['None', 'Cinematic', 'Muji Style', 'Cyberpunk', 'Anime', 'Vintage', '3D Animation', 'Realistic', 'Fantasy'];
const cameraOptions = ['None', 'Drone View', 'Close-up', 'Wide Angle', 'Macro', 'Tracking Shot', 'Pan', 'First-Person View (FPV)'];
const lightingOptions = ['None', 'Cinematic Lighting', 'Natural Light', 'Neon', 'Golden Hour', 'Studio Lighting', 'Dark & Moody'];
const presenterOptions = ['None', 'Thai Female Model', 'Korean Female Idol', 'Caucasian Male Model', 'Minimalist Hand Model', 'Lifestyle Group'];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CAT_KEYS: Record<string, TranslationKey> = {
	'None': 'cat_none', 'Product Photography': 'cat_product_photo', 'T-Shirt Design': 'cat_tshirt',
	'Sticker & Die-cut': 'cat_sticker', 'Packaging Design': 'cat_packaging', 'Seamless Pattern': 'cat_pattern',
	'Logo Concept': 'cat_logo', '3D Icon': 'cat_3d',
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

export default function ImageStudio() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { data: session } = useSession();
	const { t } = useLanguage();
	const [prompt, setPrompt] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Product Photography");
	const [isGenerating, setIsLoading] = useState(false);
	const [generatedImage, setGeneratedImage] = useState<string | null>(null);
	const [aspectRatio, setAspectRatio] = useState("1:1");

	// State for Advanced Settings
	const [style, setStyle] = useState('None');
	const [cameraAngle, setCameraAngle] = useState('None');
	const [lighting, setLighting] = useState('None');
	const [presenter, setPresenter] = useState('None');

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const [generationMode, setGenerationMode] = useState<'standard' | 'bg_replacement'>('standard');
	const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

	const { data: balanceData, mutate } = useSWR('/api/user/balance', fetcher, {
		refreshInterval: 10000,
		revalidateOnFocus: true
	});

	const currentCoins = balanceData?.coinBalance ?? 0;
	const isBanned = balanceData?.isBanned ?? false;

	const currentCost = 39;

	const isButtonDisabled = isGenerating || !prompt || currentCoins < currentCost || isBanned;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!validTypes.includes(file.type)) {
			return alert("Please upload a .jpg, .png, or .webp image file.");
		}

		const maxSizeInBytes = 5 * 1024 * 1024;
		if (file.size > maxSizeInBytes) {
			return alert("Image file size is too large (max 5MB).");
		}

		setSelectedFile(file);
		setImagePreview(URL.createObjectURL(file));
	};

	const removeImage = () => {
		setSelectedFile(null);
		setImagePreview(null);
		const fileInput = document.getElementById('dropzone-file') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	};

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
					tone: 'Creative & Professional',
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
		if (!prompt) return alert("Please describe your product.");

		setIsLoading(true);
		setGeneratedImage(null);

		try {
			const formData = new FormData();
			formData.append('prompt', prompt);
			formData.append('aspectRatio', aspectRatio);
			formData.append('category', selectedCategory);

			// Send advanced settings within FormData
			formData.append('style', style);
			formData.append('cameraAngle', cameraAngle);
			formData.append('lighting', lighting);
			formData.append('presenter', presenter);

			if (selectedFile) {
				formData.append('image', selectedFile);
			}

			const response = await fetch('/api/generate/image', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				setGeneratedImage(data.imageUrl || `data:image/png;base64,${data.image}`);
				setPrompt("");
				removeImage();

				if (data.remainingCoins !== undefined) {
					mutate({ coinBalance: data.remainingCoins, isBanned: isBanned }, false);
				} else {
					mutate();
				}
			} else {
				alert(data.message || "Failed to generate product.");
			}
		} catch (error) {
			console.error("Fetch error:", error);
			alert("Cannot connect to the server.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = async () => {
		if (!generatedImage) return;

		try {
			if (generatedImage.startsWith('http')) {
				const response = await fetch(generatedImage);
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `Devakorn_Product_${Date.now()}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
			} else {
				const link = document.createElement('a');
				link.href = generatedImage;
				link.download = `Devakorn_Product_${Date.now()}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		} catch (error) {
			console.error("Download error:", error);
			alert("Failed to download image.");
		}
	};

	return (
		<DashboardLayout>
			<div className="w-full pb-12 animate-in fade-in duration-500">

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					<div className="lg:col-span-4 space-y-6">
						<div>
							<h1 className="text-2xl font-black text-dark-bg tracking-tight mb-1 flex items-center gap-2">
								<PackageOpen className="w-6 h-6 text-primary-red" />
								{t('image_title')}
							</h1>
							<div>
								<p className="text-sm font-medium text-text-main/50 mt-1">{t('image_sub')}</p>
							</div>
						</div>

						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-7">

							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
									<Layers className="w-4 h-4 text-primary-red" /> {t('image_generation_mode')}
								</label>
								<div className="flex gap-4">
									<button
										onClick={() => setGenerationMode('standard')}
										className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all border ${generationMode === 'standard' ? 'bg-primary-red/10 border-primary-red text-primary-red shadow-sm' : 'bg-light-gray/50 border-gray-200 text-text-main/60 hover:bg-white'}`}
									>
										<span className="text-xs font-black">Standard Generation</span>
									</button>
									<button
										onClick={() => setGenerationMode('bg_replacement')}
										className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all border ${generationMode === 'bg_replacement' ? 'bg-primary-red/10 border-primary-red text-primary-red shadow-sm' : 'bg-light-gray/50 border-gray-200 text-text-main/60 hover:bg-white'}`}
									>
										<span className="text-xs font-black">AI Background Replacement</span>
									</button>
								</div>
							</div>

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
												? 'bg-primary-red text-white border-primary-red shadow-sm'
												: 'bg-light-gray/50 text-text-main/60 border-gray-200 hover:border-primary-red/50 hover:text-dark-bg'
												}`}
										>
											{CAT_KEYS[cat] ? t(CAT_KEYS[cat]) : cat}
										</button>
									))}
								</div>
							</div>

							{/* Advanced Settings */}
							<div className="grid grid-cols-2 lg:grid-cols-2 gap-3 bg-light-gray/30 p-3.5 rounded-xl border border-gray-100">
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<User className="w-3.5 h-3.5 text-primary-red" /> {t('image_presenter')}
									</label>
									<select
										value={presenter}
										onChange={(e) => setPresenter(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{presenterOptions.map(opt => <option key={opt} value={opt}>{PRES_KEYS[opt] ? t(PRES_KEYS[opt]) : opt}</option>)}
									</select>
								</div>
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Palette className="w-3.5 h-3.5 text-primary-red" /> {t('image_style')}
									</label>
									<select
										value={style}
										onChange={(e) => setStyle(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{styleOptions.map(opt => <option key={opt} value={opt}>{STYLE_KEYS[opt] ? t(STYLE_KEYS[opt]) : opt}</option>)}
									</select>
								</div>
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Camera className="w-3.5 h-3.5 text-primary-red" /> {t('image_camera')}
									</label>
									<select
										value={cameraAngle}
										onChange={(e) => setCameraAngle(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{cameraOptions.map(opt => <option key={opt} value={opt}>{CAM_KEYS[opt] ? t(CAM_KEYS[opt]) : opt}</option>)}
									</select>
								</div>
								<div>
									<label className="flex items-center gap-1.5 text-[11px] font-bold text-dark-bg mb-1.5">
										<Sun className="w-3.5 h-3.5 text-primary-red" /> {t('image_lighting')}
									</label>
									<select
										value={lighting}
										onChange={(e) => setLighting(e.target.value)}
										className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs font-medium text-dark-bg focus:ring-2 focus:ring-primary-red/20 outline-none cursor-pointer"
									>
										{lightingOptions.map(opt => <option key={opt} value={opt}>{LIGHT_KEYS[opt] ? t(LIGHT_KEYS[opt]) : opt}</option>)}
									</select>
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
										<Wand2 className="w-4 h-4 text-primary-red" />
										Core Product Idea
									</label>
									<button
										onClick={handleAutoPrompt}
										disabled={isEnhancingPrompt || !prompt}
										className="text-xs font-bold text-primary-red bg-primary-red/10 hover:bg-primary-red/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all disabled:opacity-50"
									>
										{isEnhancingPrompt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
										{t('image_let_ai_think')}
									</button>
								</div>
								<textarea
									rows={4}
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder="e.g., A minimalist ceramic coffee mug... (Or paste a Shopee/Lazada URL and click 'Let AI Think')"
									className="w-full bg-light-gray/50 border border-gray-200 rounded-lg p-4 text-sm text-dark-bg placeholder:text-text-main/40 focus:border-primary-red/50 focus:ring-4 focus:ring-primary-red/10 outline-none transition-all resize-none"
								/>
							</div>

							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
									<UploadCloud className="w-4 h-4 text-primary-red" />
									{generationMode === 'bg_replacement' ? 'Product Image (Required)' : 'Reference Sketch (Optional)'}
								</label>

								{!imagePreview ? (
									<div className="flex items-center justify-center w-full">
										<label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-light-gray/30 hover:bg-light-gray/80 hover:border-primary-red/50 transition-all">
											<div className="flex flex-col items-center justify-center pt-5 pb-6">
												<UploadCloud className="w-7 h-7 mb-2 text-text-main/40" />
												<p className="mb-1 text-sm text-text-main/60"><span className="font-semibold text-dark-bg">Click to upload</span></p>
												<p className="text-xs text-text-main/40">PNG, JPG or WEBP (Max. 5MB)</p>
											</div>
											<input
												id="dropzone-file"
												type="file"
												className="hidden"
												accept="image/jpeg, image/png, image/webp"
												onChange={handleFileChange}
											/>
										</label>
									</div>
								) : (
									<div className="relative inline-block border border-gray-200 rounded-lg p-2 bg-light-gray/30">
										<img src={imagePreview} alt="Reference Preview" className="h-28 w-auto rounded object-contain" />
										<button onClick={removeImage} className="absolute -top-2 -right-2 bg-dark-bg text-white rounded-full p-1.5 hover:bg-primary-red shadow-md transition-all">
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								)}
							</div>

							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg">{t('image_aspect_ratio')}</label>
								<div className="grid grid-cols-3 gap-3">
									{["1:1", "16:9", "9:16"].map((ratio) => (
										<button
											key={ratio}
											onClick={() => setAspectRatio(ratio)}
											className={`py-3 rounded-lg border flex flex-col items-center justify-center transition-all ${aspectRatio === ratio ? "border-primary-red bg-primary-red/5 text-primary-red font-bold" : "border-gray-200 bg-white text-text-main/60 hover:border-gray-300 hover:text-dark-bg"}`}
										>
											<span className="text-xs tracking-wide font-semibold">{ratio === "1:1" ? "1:1 (Square)" : ratio === "16:9" ? "16:9 (Web)" : "9:16 (Story)"}</span>
										</button>
									))}
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
									className={`w-full font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all ${isButtonDisabled
										? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
										: 'bg-dark-bg hover:bg-primary-red text-white shadow-sm active:scale-95'
										}`}
								>
									{isGenerating ? (
										<><RefreshCw className="w-4 h-4 animate-spin" />{t('image_generating')}</>
									) : isBanned ? (
										t('general_suspended')
									) : currentCoins < currentCost ? (
										t('general_not_enough_coins')
									) : (
										<><Sparkles className="w-4 h-4" />{t('image_generate_btn')} (-{currentCost} Coins)</>
									)}
								</button>
							</div>
						</div>
					</div>

					<div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden min-h-150 shadow-sm">
						<div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none"></div>

						{isGenerating ? (
							<div className="flex flex-col items-center z-10 animate-in fade-in duration-300">
								<div className="w-16 h-16 bg-light-gray rounded-xl flex items-center justify-center mb-6 animate-pulse border border-gray-200">
									<Sparkles className="w-8 h-8 text-primary-red animate-bounce" />
								</div>
								<p className="font-bold text-dark-bg text-lg">Rendering your commercial asset...</p>
								<p className="text-sm text-text-main/60 mt-2">This usually takes 10-15 seconds</p>
							</div>
						) : generatedImage ? (
							<div className="w-full h-full p-6 flex flex-col items-center justify-center group relative z-10 animate-in fade-in zoom-in-95 duration-500">
								<img
									src={generatedImage}
									alt="AI Generated Art"
									className="max-w-full max-h-[75vh] rounded-lg shadow-xl object-contain ring-1 ring-gray-200"
								/>
								<div className="absolute bottom-10 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
									<button
										onClick={handleDownload}
										className="bg-dark-bg/90 backdrop-blur-md text-white hover:bg-primary-red px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
									>
										<Download className="w-4 h-4" /> {t('image_download')}
									</button>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center text-text-main/40 z-10">
								<div className="w-20 h-20 bg-light-gray rounded-full flex items-center justify-center mb-5 border border-gray-200">
									<ImagePlus className="w-8 h-8 text-text-main/30" />
								</div>
								<h3 className="font-bold text-dark-bg text-lg">No Asset Generated Yet</h3>
								<p className="text-sm font-medium mt-1">Select a product type and enter a prompt.</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}