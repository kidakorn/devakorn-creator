"use client";

import Link from "next/link";
import { ChevronLeft, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SupportPage() {
	const [copied, setCopied] = useState(false);
	const supportEmail = "kidakorn.1@gmail.com";

	const handleCopy = () => {
		navigator.clipboard.writeText(supportEmail);
		setCopied(true);
		toast.success("Email copied to clipboard!");
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
			<div className="max-w-3xl mx-auto">
				<Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors mb-8 relative z-20">
					<ChevronLeft className="w-4 h-4" /> Back to Home
				</Link>

				<div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200 text-center relative z-20">
					<div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<MessageCircle className="w-8 h-8" />
					</div>
					<h1 className="text-3xl font-black tracking-tight mb-4">How can we help you?</h1>
					<p className="text-sm text-gray-500 font-medium mb-10 max-w-md mx-auto">
						If you have any questions, billing issues, or need technical assistance, our support team is ready to help.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						{/* ปุ่มส่งอีเมลหลัก */}
						<a
							href={`mailto:${supportEmail}`}
							className="flex items-center gap-3 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all w-full sm:w-auto justify-center pointer-events-auto"
						>
							<Mail className="w-5 h-5" />
							Email Support
						</a>

						{/* ปุ่มก๊อปปี้อีเมล (กรณีปุ่มแรกไม่ทำงาน) */}
						<button
							onClick={handleCopy}
							className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 hover:border-gray-900 text-gray-900 rounded-xl font-bold transition-all w-full sm:w-auto justify-center"
						>
							{copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
							{copied ? "Copied!" : "Copy Email"}
						</button>
					</div>

					<p className="text-xs text-gray-400 font-bold mt-8">Expected response time: 24-48 hours</p>
				</div>
			</div>
		</div>
	);
}