/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, Globe } from "lucide-react";

export default function PrivacyPage() {
	const [lang, setLang] = useState<"en" | "th">("en");

	const content = {
		en: {
			title: "Privacy Policy",
			updated: "Last updated:",
			sections: [
				{
					title: "1. Information We Collect",
					body: "We collect information necessary to provide our AI generation and Social-to-Earn services. This includes account details (email, name) via standard registration or Google OAuth, transaction logs (Coin balances, Daily Check-ins, Likes), generation history, and Device Fingerprint data (browser version, OS details)."
				},
				{
					title: "2. Community Showcase & Public Data",
					body: "Devakorn Creator AI features a \"Community Trending\" system. By using our platform, you acknowledge that your generated assets (Images/Videos) and the text prompts used to create them may be displayed publicly. This public display allows other users to interact with your content (e.g., liking), which directly powers our Social-to-Earn reward mechanics."
				},
				{
					title: "3. Fraud Prevention & Security",
					body: "To ensure fair use of our free coin promotions and Daily Check-in rewards, we utilize your Device Fingerprint. This data is strictly used for the internal purpose of preventing automated abuse, bot activity, and multiple account creations on the same hardware."
				},
				{
					title: "4. Third-Party Data Processing",
					body: "Your text prompts are securely transmitted to Google Cloud Vertex AI (Imagen and Veo models) for processing. We do not sell your personal identification, prompts, or generated assets to third-party advertisers."
				},
				{
					title: "5. Data Retention & Your Rights",
					body: "We retain your account information, coin balances, and generated assets as long as your account remains active. You reserve the right to request a full export of your data or complete account deletion at any time by contacting our support team."
				}
			]
		},
		th: {
			title: "นโยบายความเป็นส่วนตัว",
			updated: "อัปเดตล่าสุดเมื่อ:",
			sections: [
				{
					title: "1. ข้อมูลที่เราเก็บรวบรวม",
					body: "เรารวบรวมข้อมูลที่จำเป็นสำหรับการให้บริการ AI และระบบ Social-to-Earn ซึ่งรวมถึงข้อมูลบัญชี (อีเมล, ชื่อ) ผ่านการลงทะเบียนปกติหรือ Google OAuth, ประวัติการทำธุรกรรม (ยอดเหรียญ, การเช็คอินรายวัน, การกดไลก์), ประวัติการสร้างผลงาน และ ข้อมูลลายนิ้วมือของอุปกรณ์ (เวอร์ชันเบราว์เซอร์, ระบบปฏิบัติการ)"
				},
				{
					title: "2. การจัดแสดงผลงานสู่สาธารณะ",
					body: "Devakorn Creator AI มีระบบ \"Community Trending\" เมื่อคุณใช้งานแพลตฟอร์มของเรา ถือว่าคุณรับทราบว่าผลงานที่สร้างขึ้น (รูปภาพ/วิดีโอ) และข้อความคำสั่ง (Prompt) อาจถูกแสดงต่อสาธารณะ เพื่อให้ผู้ใช้รายอื่นสามารถโต้ตอบได้ (เช่น การกดไลก์) ซึ่งเป็นกลไกหลักของระบบรางวัล Social-to-Earn ของเรา"
				},
				{
					title: "3. การป้องกันการทุจริตและความปลอดภัย",
					body: "เพื่อให้การแจกเหรียญฟรีและรางวัลเช็คอินรายวันเป็นไปอย่างยุติธรรม เราจึงใช้ข้อมูลลายนิ้วมือของอุปกรณ์ (Device Fingerprint) ข้อมูลนี้ถูกใช้เป็นการภายในเพื่อป้องกันการใช้บอท การทุจริตอัตโนมัติ และการสร้างหลายบัญชีบนฮาร์ดแวร์เดียวกันเท่านั้น"
				},
				{
					title: "4. การประมวลผลข้อมูลโดยบุคคลที่สาม",
					body: "ข้อความคำสั่ง (Prompt) ของคุณจะถูกส่งไปยัง Google Cloud Vertex AI (โมเดล Imagen และ Veo) อย่างปลอดภัยเพื่อทำการประมวลผล เราไม่มีนโยบายขายข้อมูลระบุตัวตน คำสั่ง หรือผลงานที่สร้างขึ้นของคุณให้กับผู้โฆษณาที่เป็นบุคคลที่สาม"
				},
				{
					title: "5. การเก็บรักษาข้อมูลและสิทธิของคุณ",
					body: "เราจะเก็บรักษาข้อมูลบัญชี ยอดเหรียญ และผลงานของคุณไว้ตราบเท่าที่บัญชีของคุณยังเปิดใช้งานอยู่ คุณมีสิทธิ์ที่จะร้องขอให้ส่งออกข้อมูลทั้งหมดของคุณ หรือขอลบบัญชีอย่างถาวรได้ตลอดเวลาโดยการติดต่อทีมสนับสนุนของเรา"
				}
			]
		}
	};

	const t = content[lang];

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-3xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
						<ChevronLeft className="w-4 h-4" /> Back to Home
					</Link>

					{/* 🟢 ปุ่มสลับภาษา */}
					<div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
						<button onClick={() => setLang("en")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${lang === "en" ? "bg-red-50 text-red-600" : "text-gray-500 hover:bg-gray-50"}`}>
							EN
						</button>
						<button onClick={() => setLang("th")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${lang === "th" ? "bg-red-50 text-red-600" : "text-gray-500 hover:bg-gray-50"}`}>
							TH
						</button>
					</div>
				</div>

				<div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200">
					<div className="flex items-center gap-3 mb-4">
						<Lock className="w-8 h-8 text-emerald-600" />
						<h1 className="text-3xl font-black tracking-tight">{t.title}</h1>
					</div>
					<p className="text-sm text-gray-500 font-medium mb-8" suppressHydrationWarning>
						{t.updated} {new Date().toLocaleDateString()}
					</p>

					<div className="space-y-8 text-sm leading-relaxed text-gray-600">
						{t.sections.map((section, index) => (
							<section key={index}>
								<h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
								<p>{section.body}</p>
							</section>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}