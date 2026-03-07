/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
	Sparkles,
	Download,
	Wand2,
	RefreshCw,
	ImagePlus,
	UploadCloud, // 🟢 เพิ่ม Icon สำหรับกล่องอัปโหลด
	X            // 🟢 เพิ่ม Icon สำหรับปุ่มลบรูป
} from "lucide-react";

export default function ImageStudio() {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsLoading] = useState(false);
	const [generatedImage, setGeneratedImage] = useState<string | null>(null);
	const [aspectRatio, setAspectRatio] = useState("1:1");

	// 🟢 เพิ่ม State สำหรับจัดการไฟล์รูปภาพ
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	// 🟢 ฟังก์ชันจัดการเมื่อผู้ใช้อัปโหลดไฟล์ (ตรวจสอบนามสกุลและขนาด)
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// 1. ตรวจสอบนามสกุลไฟล์
		const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!validTypes.includes(file.type)) {
			return alert("กรุณาอัปโหลดไฟล์รูปภาพนามสกุล .jpg, .png หรือ .webp เท่านั้นครับ");
		}

		// 2. ตรวจสอบขนาดไฟล์ (กำหนดไว้ที่ 5MB)
		const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSizeInBytes) {
			return alert("ขนาดไฟล์รูปภาพใหญ่เกินไป (ต้องไม่เกิน 5MB) ครับ");
		}

		// ผ่านการตรวจสอบ: บันทึกไฟล์และสร้าง URL สำหรับ Preview รูป
		setSelectedFile(file);
		setImagePreview(URL.createObjectURL(file));
	};

	// 🟢 ฟังก์ชันลบรูปภาพที่เลือกไว้
	const removeImage = () => {
		setSelectedFile(null);
		setImagePreview(null);
		// รีเซ็ตค่าใน input file
		const fileInput = document.getElementById('dropzone-file') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	};

	const handleGenerate = async () => {
		if (!prompt) return alert("กรุณาพิมพ์คำอธิบายรูปภาพ");

		setIsLoading(true);
		setGeneratedImage(null);

		try {
			// 🟢 เปลี่ยนมาใช้ FormData แทน JSON เพื่อให้ส่งไฟล์รูปภาพได้
			const formData = new FormData();
			formData.append('prompt', prompt);
			formData.append('aspectRatio', aspectRatio);

			// ถ้ามีไฟล์รูปภาพแนบมาด้วย ให้เพิ่มเข้าไปใน FormData
			if (selectedFile) {
				formData.append('image', selectedFile);
			}

			const response = await fetch('http://localhost:5000/api/generate/image', {
				method: 'POST',
				// หมายเหตุ: ไม่ต้องใส่ Content-Type เพราะเดี๋ยว Browser จะจัดการตั้งค่า multipart/form-data ให้เอง
				body: formData,
			});

			const data = await response.json();

			if (response.ok && data.status === 'success') {
				setGeneratedImage(`data:image/png;base64,${data.image}`);
				// ล้างฟอร์มเมื่อเจนรูปสำเร็จ
				setPrompt("");
				removeImage();
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

			<main className="flex-1 flex flex-col h-screen overflow-y-auto">

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
									rows={4}
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder="Describe your imagination... e.g., A futuristic city at sunset, 8k resolution."
									className="w-full bg-light-gray/50 border border-gray-200 rounded-lg p-4 text-sm text-dark-bg placeholder:text-text-main/40 focus:border-primary-red/50 focus:ring-4 focus:ring-primary-red/10 outline-none transition-all resize-none"
								/>
							</div>

							{/* 🟢 Image Upload Section */}
							<div className="space-y-3">
								<label className="text-sm font-bold text-dark-bg flex items-center gap-2">
									<UploadCloud className="w-4 h-4 text-primary-red" />
									Reference Image <span className="text-text-main/40 font-normal">(Optional)</span>
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
										<img
											src={imagePreview}
											alt="Reference Preview"
											className="h-28 w-auto rounded object-contain"
										/>
										<button
											onClick={removeImage}
											className="absolute -top-2 -right-2 bg-dark-bg text-white rounded-full p-1.5 hover:bg-primary-red shadow-md transition-all"
											title="Remove image"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								)}
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
					<div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden min-h-125 shadow-sm">

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