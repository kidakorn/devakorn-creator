/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-3xl mx-auto">
				<Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors mb-8">
					<ChevronLeft className="w-4 h-4" /> Back to Home
				</Link>

				<div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200">
					<div className="flex items-center gap-3 mb-4">
						<ShieldAlert className="w-8 h-8 text-red-600" />
						<h1 className="text-3xl font-black tracking-tight">Terms of Service</h1>
					</div>
					<p className="text-sm text-gray-500 font-medium mb-8">Effective Date: {new Date().toLocaleDateString()}</p>

					<div className="space-y-8 text-sm leading-relaxed text-gray-600">
						<section className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
							<h2 className="text-lg font-bold text-gray-900 mb-3">1. AI-Generated Content & Liability Disclaimer</h2>
							<p className="mb-3"><strong>Important:</strong> Devakorn Creator AI provides tools powered by third-party AI models (Google Cloud). While the platform allows for commercial use of generated assets, <strong>we do not guarantee that the output is free from third-party copyright or intellectual property claims.</strong></p>
							<p>The User acknowledges that AI-generated content's copyright status is an evolving legal area. <strong>The User assumes all risks and legal responsibilities</strong> arising from the commercial use, distribution, or publication of any assets generated through our service.</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-gray-900 mb-3">2. User Responsibility & Indemnification</h2>
							<p>You agree to indemnify, defend, and hold harmless Devakorn Creator AI and its owner from and against any claims, damages, or legal costs arising from your use of the generated content. If your use of an AI-generated image or video results in a copyright infringement lawsuit, <strong>Devakorn Creator AI shall not be held liable under any circumstances.</strong></p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-gray-900 mb-3">3. Anti-Abuse & Multi-Account Policy</h2>
							<p>The "50 Free Coins" promotion is strictly limited to <strong>one claim per unique device and person.</strong> We use advanced fingerprinting technology to detect abuse. Any attempt to exploit this system via multiple accounts or virtual environments will lead to an immediate ban and forfeiture of all assets.</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-gray-900 mb-3">4. Content Restrictions</h2>
							<p>Users must not use the service to create content that is illegal, defamatory, or violates any third-party rights. We reserve the right to terminate access for users who attempt to bypass AI safety filters.</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}