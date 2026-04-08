"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";

export default function TermsPage() {
	const [lang, setLang] = useState<"en" | "th">("en");

	const content = {
		en: {
			title: "Terms of Service",
			updated: "Effective Date:",
			sections: [
				{
					title: "1. AI-Generated Content & Liability Disclaimer",
					body: "Important: Devakorn Creator AI provides tools powered by third-party AI models (Google Cloud). While the platform allows for commercial use of generated assets, we do not guarantee that the output is free from third-party copyright or intellectual property claims. The User acknowledges that AI-generated content's copyright status is an evolving legal area. The User assumes all risks and legal responsibilities arising from the commercial use, distribution, or publication of any assets generated through our service.",
					isAlert: true
				},
				{
					title: "2. Virtual Currency (Coins) & Reward Systems",
					body: "\"Coins\" are a digital utility token used exclusively within the Devakorn Creator AI platform to generate content. Coins hold no real-world monetary value, and cannot be redeemed, refunded, sold, or exchanged for fiat currency (cash) under any circumstances. We reserve the right to modify, expire, or revoke Coins, as well as alter the reward rates for Daily Check-ins and Social-to-Earn milestones at any time without prior notice.",
					isAlert: false
				},
				{
					title: "3. Anti-Abuse & Multi-Account Policy",
					body: "Promotions such as \"50 Free Coins\", \"Daily Check-ins\", and \"Social-to-Earn\" rewards are strictly limited. We use advanced fingerprinting technology to detect abuse. Any attempt to exploit these systems—including but not limited to using multiple accounts, automated liking bots, or virtual environments—will lead to an immediate permanent ban and forfeiture of all assets and coin balances.",
					isAlert: false
				},
				{
					title: "4. User Responsibility & Indemnification",
					body: "You agree to indemnify, defend, and hold harmless Devakorn Creator AI and its owner from and against any claims, damages, or legal costs arising from your use of the generated content. If your use of an AI-generated image or video results in a copyright infringement lawsuit, Devakorn Creator AI shall not be held liable under any circumstances.",
					isAlert: false
				},
				{
					title: "5. Content Restrictions",
					body: "Users must not use the service to create content that is illegal, defamatory, highly sexually explicit, or violates any third-party rights. We reserve the right to terminate access for users who repeatedly attempt to bypass AI safety filters.",
					isAlert: false
				}
			]
		},
		th: {
			title: "ข้อกำหนดการให้บริการ",
			updated: "มีผลบังคับใช้ตั้งแต่วันที่:",
			sections: [
				{
					title: "1. เนื้อหาที่สร้างโดย AI และการปฏิเสธความรับผิดชอบ",
					body: "สำคัญ: Devakorn Creator AI ให้บริการเครื่องมือที่ขับเคลื่อนโดยโมเดล AI ของบุคคลที่สาม (Google Cloud) แม้ว่าแพลตฟอร์มจะอนุญาตให้นำผลงานไปใช้ในเชิงพาณิชย์ได้ แต่เราไม่รับประกันว่าผลลัพธ์ที่ได้จะปราศจากการละเมิดลิขสิทธิ์หรือทรัพย์สินทางปัญญาของบุคคลที่สาม ผู้ใช้รับทราบว่าสถานะทางลิขสิทธิ์ของเนื้อหาที่สร้างโดย AI เป็นประเด็นทางกฎหมายที่กำลังพัฒนา ผู้ใช้ต้องรับความเสี่ยงและรับผิดชอบทางกฎหมายทั้งหมดที่เกิดจากการใช้งานเชิงพาณิชย์ การแจกจ่าย หรือการเผยแพร่ผลงานที่สร้างผ่านบริการของเรา",
					isAlert: true
				},
				{
					title: "2. สกุลเงินจำลอง (Coins) และระบบรางวัล",
					body: "\"Coins\" เป็นโทเค็นดิจิทัลที่ใช้เพื่อสร้างเนื้อหาภายในแพลตฟอร์ม Devakorn Creator AI เท่านั้น เหรียญ (Coins) ไม่มีมูลค่าเป็นเงินจริง และไม่สามารถแลกคืน ขอคืนเงิน ขาย หรือแลกเปลี่ยนเป็นเงินสดได้ในทุกกรณี เราขอสงวนสิทธิ์ในการแก้ไข ยกเลิก หรือเพิกถอนเหรียญ รวมถึงเปลี่ยนแปลงอัตราการให้รางวัลสำหรับการเช็คอินรายวันและ Social-to-Earn ได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า",
					isAlert: false
				},
				{
					title: "3. นโยบายต่อต้านการทุจริตและการใช้หลายบัญชี",
					body: "โปรโมชั่นต่างๆ เช่น \"รับฟรี 50 Coins\", \"การเช็คอินรายวัน\" และรางวัล \"Social-to-Earn\" มีการจำกัดสิทธิ์อย่างเข้มงวด เราใช้เทคโนโลยีการจดจำลายนิ้วมืออุปกรณ์ขั้นสูงเพื่อตรวจจับการละเมิด ความพยายามใดๆ ที่จะทุจริตระบบเหล่านี้ ซึ่งรวมถึงแต่ไม่จำกัดเพียง การใช้หลายบัญชี, การใช้บอทกดไลก์อัตโนมัติ หรือการสร้างสภาพแวดล้อมจำลอง จะส่งผลให้บัญชีถูกแบนถาวรทันที และริบผลงานพร้อมยอดเหรียญทั้งหมด",
					isAlert: false
				},
				{
					title: "4. ความรับผิดชอบของผู้ใช้และการชดเชยค่าเสียหาย",
					body: "คุณตกลงที่จะชดใช้ ปกป้อง และไม่เอาความต่อ Devakorn Creator AI และเจ้าของแพลตฟอร์ม จากการเรียกร้อง ค่าเสียหาย หรือค่าใช้จ่ายทางกฎหมายใดๆ ที่เกิดจากการใช้งานเนื้อหาที่คุณสร้างขึ้น หากการใช้งานภาพหรือวิดีโอที่สร้างโดย AI ของคุณนำไปสู่การฟ้องร้องเรื่องการละเมิดลิขสิทธิ์ Devakorn Creator AI จะไม่รับผิดชอบใดๆ ทั้งสิ้นในทุกกรณี",
					isAlert: false
				},
				{
					title: "5. ข้อจำกัดของเนื้อหา",
					body: "ผู้ใช้ต้องไม่ใช้บริการเพื่อสร้างเนื้อหาที่ผิดกฎหมาย หมิ่นประมาท อนาจารอย่างร้ายแรง หรือละเมิดสิทธิ์ของบุคคลที่สาม เราขอสงวนสิทธิ์ในการยุติการเข้าถึงสำหรับผู้ใช้ที่พยายามหลบเลี่ยงตัวกรองความปลอดภัยของ AI อย่างซ้ำซาก",
					isAlert: false
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
						<ShieldAlert className="w-8 h-8 text-red-600" />
						<h1 className="text-3xl font-black tracking-tight">{t.title}</h1>
					</div>
					<p className="text-sm text-gray-500 font-medium mb-8">{t.updated} {new Date().toLocaleDateString()}</p>

					<div className="space-y-8 text-sm leading-relaxed text-gray-600">
						{t.sections.map((section, index) => (
							<section key={index} className={section.isAlert ? "bg-red-50/50 p-6 rounded-2xl border border-red-100" : ""}>
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