/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-3xl mx-auto">
				<Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors mb-8">
					<ChevronLeft className="w-4 h-4" /> Back to Home
				</Link>

				<div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200">
					<div className="flex items-center gap-3 mb-4">
						<Lock className="w-8 h-8 text-emerald-600" />
						<h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
					</div>
					<p className="text-sm text-gray-500 font-medium mb-8">Last updated: {new Date().toLocaleDateString()}</p>

					<div className="space-y-8 text-sm leading-relaxed text-gray-600">
						<section>
							<h2 className="text-lg font-bold text-gray-900 mb-3">1. Fraud Prevention Data</h2>
							<p>To ensure fair use of our free coin promotions, we collect <strong>Device Fingerprint data</strong> (including browser version, hardware specs, and OS details). This data is used solely for the internal purpose of preventing automated abuse and multiple account creations on the same device.</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-gray-900 mb-3">2. Third-Party Data Processing</h2>
							<p>Your text prompts are sent to <strong>Google Cloud Vertex AI</strong> for processing. While we store your generation history for your convenience in the 'Gallery' section, we do not share your personal identification with third-party advertisers.</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-gray-900 mb-3">3. Data Retention</h2>
							<p>We retain your account information and generated assets as long as your account is active. You may request account deletion at any time by contacting our support team.</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}