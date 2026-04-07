/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { forwardRef, useState } from "react";
import { signIn } from "next-auth/react";
import useSWR from "swr";
import DatePicker from "react-datepicker";
import { Activity, Clock, ImageIcon, VideoIcon, Play, Download, Loader2, LayoutGrid, ArrowRight, LineChart, Server, Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PublicAsset {
	id: string;
	type: string;
	prompt: string;
	outputUrl: string;
	user: {
		name: string;
	};
	createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatNumber = (num: number) => {
	if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
	if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
	return num.toString();
};

const DashboardCalendarButton = forwardRef<HTMLButtonElement, any>(({ value, onClick }, ref) => (
	<button
		onClick={onClick}
		ref={ref}
		className="flex items-center justify-between gap-3 min-w-45 w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-2 focus:ring-red-500/20 outline-none"
	>
		<div className="flex items-center gap-2">
			<CalendarIcon className="w-4 h-4 text-red-600" />
			<span>{value || "Select date..."}</span>
		</div>
		<ChevronDown className="w-4 h-4 text-gray-400" />
	</button>
));
DashboardCalendarButton.displayName = "DashboardCalendarButton";

export default function LandingPage() {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const queryParams = new URLSearchParams();
	if (selectedDate) {
		const year = selectedDate.getFullYear();
		const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
		const day = String(selectedDate.getDate()).padStart(2, '0');
		const formattedDate = `${year}-${month}-${day}`;

		queryParams.append('start', formattedDate);
		queryParams.append('end', formattedDate);
	}

	const { data, isLoading } = useSWR(`/api/public/showcase?${queryParams.toString()}`, fetcher, {
		revalidateOnFocus: false,
	});

	const showcaseAssets: PublicAsset[] = data?.status === "success" ? data.assets : [];

	const totalAssets = data?.stats?.totalAssets || 0;
	const formattedTotal = formatNumber(totalAssets);

	const globalUsageData = data?.stats?.chartData || [
		{ name: 'Mon', image: 0, video: 0 },
		{ name: 'Tue', image: 0, video: 0 },
		{ name: 'Wed', image: 0, video: 0 },
		{ name: 'Thu', image: 0, video: 0 },
		{ name: 'Fri', image: 0, video: 0 },
		{ name: 'Sat', image: 0, video: 0 },
		{ name: 'Sun', image: 0, video: 0 },
	];

	const getAssetSrc = (asset: PublicAsset) => {
		if (asset.outputUrl.startsWith('http')) {
			return asset.outputUrl;
		}
		const mimeType = asset.type === "IMAGE" ? "image/png" : "video/mp4";
		return `data:${mimeType};base64,${asset.outputUrl}`;
	};

	return (
		<div className="min-h-screen bg-[#fafafa] font-sans flex flex-col text-gray-900 selection:bg-red-100 relative">

			<style>{`
				.react-datepicker-wrapper {
					width: auto;
				}
				.react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
					background-color: #EF4444 !important;
					color: white !important;
					border-radius: 8px !important;
				}
				.react-datepicker {
					font-family: inherit;
					border: 1px solid #E5E7EB;
					border-radius: 12px;
					box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
					padding: 12px;
				}
				.react-datepicker__header {
					background-color: white;
					border-bottom: 1px solid #F3F4F6;
					padding-bottom: 8px;
				}
				.react-datepicker-popper[data-placement^=bottom] .react-datepicker__triangle {
					fill: white;
					color: white;
					stroke: #E5E7EB;
				}
			`}</style>

			{/* Background accent - subtle red glow top right */}
			<div className="absolute top-0 right-0 w-125 h-125 bg-red-100/30 rounded-full blur-3xl pointer-events-none z-0"></div>

			{/* 🟢 Sticky Navbar: ล็อกติดขอบบนสุด พร้อมเอฟเฟกต์เบลอกระจก */}
			<div className="sticky top-0 z-50 w-full px-4 sm:px-6 pt-4">
				<nav className="flex items-center justify-between p-4 sm:p-5 max-w-7xl mx-auto w-full border border-gray-200/50 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm transition-all">
					<div className="flex items-center gap-3">
						<img src="/favicon.ico" alt="Devakorn Logo" className="w-8 h-8 object-contain" />
						<span className="font-black text-xl tracking-tight text-gray-900 hidden sm:block">DEVAKORN AI</span>
					</div>
					<button
						onClick={() => signIn()}
						className="px-6 py-2.5 bg-gray-900 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow-md"
					>
						Sign In
					</button>
				</nav>
			</div>

			<main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 space-y-16 z-10 relative">

				{/* Section 1: Hero Section */}
				<section className="text-center pt-10 pb-20 sm:pt-16 sm:pb-28 flex flex-col items-center justify-center">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900 text-white font-bold text-xs shadow-lg mb-8 tracking-wide uppercase">
						<Server className="w-4 h-4 text-red-500" />
						Commercial AI Tools
					</div>
					<h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-[0.95] max-w-4xl">
						CREATE <span className="text-red-600">PROFESSIONAL</span> AI VISUALS & VIDEOS IN SECONDS
					</h1>
					<p className="text-gray-500 text-lg sm:text-xl font-medium mt-8 max-w-2xl leading-relaxed">
						Unlock the power of <strong className="text-gray-900 font-bold">advanced AI models</strong> to build high-quality commercial assets instantly. Join the future of content creation.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 mt-12 w-full sm:w-auto">
						<button
							onClick={() => signIn()}
							className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-red-500/20 shadow-xl"
						>
							START CREATING - IT'S FREE
						</button>
						<button
							onClick={() => signIn()}
							className="px-10 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl text-lg border-2 border-gray-200 transition-all shadow-lg flex items-center justify-center gap-2"
						>
							EXPLORE SHOWCASE <ArrowRight className="w-5 h-5" />
						</button>
					</div>
				</section>

				{/* Section 2: Platform Overview & Trend Chart */}
				<section className="space-y-8">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
						<div>
							<h2 className="text-2xl font-black text-gray-900 tracking-tight">Platform Overview</h2>
							<p className="text-gray-500 text-sm mt-1 font-medium">Real-time global production statistics.</p>
						</div>
						<div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl items-center gap-2 text-xs font-bold text-emerald-700 shadow-sm hidden sm:flex">
							<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
							System Online
						</div>
					</div>

					<div className="flex flex-col md:flex-row items-stretch gap-6 w-full">
						<div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-red-500/40 hover:shadow-md transition-all group shadow-lg shadow-gray-100/30">
							<div className="flex justify-between items-start mb-6">
								<div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
									<Activity className="w-5 h-5" />
								</div>
								<span className="text-gray-500 text-xs font-bold flex items-center bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
									Global Data
								</span>
							</div>
							<div>
								<div className="flex items-baseline gap-1">
									<h3 className="text-3xl font-black text-gray-900">{formattedTotal.replace(/[A-Z]/g, '')}</h3>
									{formattedTotal.match(/[A-Z]/) && (
										<span className="text-xl text-gray-500 font-bold">{formattedTotal.match(/[A-Z]/)?.[0]}</span>
									)}
								</div>
								<p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Total Assets Generated</p>
							</div>
						</div>

						<div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-md transition-all group shadow-lg shadow-gray-100/30">
							<div className="flex justify-between items-start mb-6">
								<div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
									<Server className="w-5 h-5" />
								</div>
								<span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
									Operational
								</span>
							</div>
							<div>
								<h3 className="text-3xl font-black text-gray-900">99.9<span className="text-xl text-gray-500 ml-1">%</span></h3>
								<p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Platform Uptime</p>
							</div>
						</div>

						<div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-gray-900/40 hover:shadow-md transition-all group shadow-lg shadow-gray-100/30">
							<div className="flex justify-between items-start mb-6">
								<div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
									<Clock className="w-5 h-5" />
								</div>
								<span className="text-gray-500 text-xs font-bold flex items-center bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
									Performance
								</span>
							</div>
							<div>
								<h3 className="text-3xl font-black text-gray-900">{"<"} 2.0<span className="text-base text-gray-400 font-bold ml-1">sec</span></h3>
								<p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Avg. Generation Time</p>
							</div>
						</div>
					</div>

					<div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-100/30 flex flex-col">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
							<div>
								<h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
									<LineChart className="w-5 h-5 text-red-600" />
									All-Time Generation Trend
								</h2>
								<p className="text-xs text-gray-500 font-medium mt-1">Historical platform activity aggregation</p>
							</div>

							<div className="relative z-40 flex items-center gap-2 w-full sm:w-auto">
								<DatePicker
									selected={selectedDate}
									onChange={(date: Date | null) => setSelectedDate(date)}
									dateFormat="MMMM d, yyyy"
									customInput={<DashboardCalendarButton />}
									popperPlacement="bottom-end"
								/>
								{selectedDate && (
									<button
										onClick={() => setSelectedDate(null)}
										className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
										title="Clear filter"
									>
										<X className="w-4 h-4" />
									</button>
								)}
							</div>
						</div>

						<div className="w-full h-72">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={globalUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
									<defs>
										<linearGradient id="colorImageGlobal" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
											<stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
										</linearGradient>
										<linearGradient id="colorVideoGlobal" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#111827" stopOpacity={0.3} />
											<stop offset="95%" stopColor="#111827" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
									<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
									<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} allowDecimals={false} />
									<Tooltip
										contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
										itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
									/>
									<Area type="monotone" dataKey="image" name="Images" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorImageGlobal)" />
									<Area type="monotone" dataKey="video" name="Videos" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorVideoGlobal)" />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				</section>

				{/* Section 3: Community Showcase */}
				<section className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-100/30 overflow-hidden flex flex-col">
					<div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center">
						<div>
							<h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
								<LayoutGrid className="w-5 h-5 text-red-600" />
								Community Showcase
							</h2>
							<p className="text-xs text-gray-500 font-medium mt-1">Recent generations from our creators</p>
						</div>
					</div>

					<div className="p-6 bg-gray-50/50 min-h-75">
						{isLoading ? (
							<div className="flex flex-col items-center justify-center py-20 h-full">
								<Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
								<p className="text-gray-500 font-bold text-sm">Loading gallery data...</p>
							</div>
						) : showcaseAssets.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{showcaseAssets.map((asset) => (
									<div
										key={asset.id}
										className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all group hover:-translate-y-1"
										onMouseEnter={(e) => {
											const video = e.currentTarget.querySelector("video");
											if (video) video.play().catch(() => { });
										}}
										onMouseLeave={(e) => {
											const video = e.currentTarget.querySelector("video");
											if (video) {
												video.pause();
												video.currentTime = 0;
											}
										}}
									>
										<div className="aspect-square bg-gray-100 relative overflow-hidden">
											{asset.type === "IMAGE" ? (
												<img
													src={getAssetSrc(asset)}
													alt="Asset"
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
													loading="lazy"
												/>
											) : (
												<video
													src={getAssetSrc(asset)}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
													muted loop playsInline
												/>
											)}

											{asset.type === "VIDEO" && (
												<div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded md flex items-center gap-1.5 text-[10px] font-bold tracking-wider">
													<Play className="w-3 h-3 fill-current" /> VIDEO
												</div>
											)}

											<div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
												<button onClick={() => signIn()} className="px-4 py-2 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-lg hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2">
													<Download className="w-4 h-4" /> Try Prompt
												</button>
											</div>
										</div>

										<div className="p-4 flex flex-col flex-1">
											<div className="flex items-center gap-2 mb-2">
												<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${asset.type === 'VIDEO' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
													{asset.type === 'IMAGE' ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />} {asset.type}
												</span>
											</div>
											<p
												className="text-[11px] text-gray-500 font-medium truncate mb-3 flex-1 block"
												title={asset.prompt}
											>
												"{asset.prompt}"
											</p>
											<div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold">
												<span className="truncate pr-2">By {asset.user?.name || "Creator"}</span>
												<span>{new Date(asset.createdAt).toLocaleDateString()}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
								<ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
								<h3 className="text-sm font-bold text-gray-900">No public assets found</h3>
								<p className="text-xs text-gray-500 font-medium mt-1">Try adjusting your date filter.</p>
							</div>
						)}
					</div>
				</section>

				{/* Bottom CTA */}
				<section className="bg-gray-900 rounded-3xl p-8 sm:p-16 text-center shadow-2xl border border-gray-800 shadow-red-500/10">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase mb-5">
						FREE TRIAL
					</div>
					<h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Start generating today. Claim your free coins.</h2>
					<p className="text-gray-400 text-base font-medium mb-8 max-w-xl mx-auto">
						Sign in to access advanced AI models, claim your welcome gift, and start building commercial-grade assets instantly.
					</p>
					<button
						onClick={() => signIn()}
						className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-lg flex items-center justify-center gap-2 mx-auto transition-all hover:-translate-y-1 hover:shadow-red-500/30 hover:shadow-2xl"
					>
						Sign In to Dashboard <ArrowRight className="w-5 h-5" />
					</button>
				</section>

			</main>

			{/* Section 4: Footer */}
			<footer className="py-8 text-center bg-white border-t border-gray-200 mt-16 z-10 relative">
				<div className="max-w-7xl mx-auto px-6">
					<p className="text-gray-900 font-black text-sm mb-4">DEVAKORN CREATOR AI</p>
					<p className="text-gray-500 text-xs font-medium max-w-lg mx-auto leading-relaxed mb-6">
						Building high-quality commercial assets using advanced AI models. The future of creative AI is here.
					</p>
					<div className="flex justify-center items-center gap-6 text-xs font-bold text-gray-400">
						<button onClick={() => signIn()} className="hover:text-red-600 transition-colors">Terms of Service</button>
						<span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
						<button onClick={() => signIn()} className="hover:text-red-600 transition-colors">Privacy Policy</button>
						<span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
						<button onClick={() => signIn()} className="hover:text-red-600 transition-colors">Contact Support</button>
					</div>
					<p className="text-gray-400 text-[10px] font-bold mt-10 tracking-wider">
						&copy; {new Date().getFullYear()} Devakorn Creator AI. All rights reserved.
					</p>
				</div>
			</footer>

		</div>
	);
}