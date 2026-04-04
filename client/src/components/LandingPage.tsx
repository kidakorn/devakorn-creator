/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";

import { signIn } from "next-auth/react";
import useSWR from "swr";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { Activity, Clock, ImageIcon, VideoIcon, Play, Download, Loader2, LayoutGrid, ArrowRight, LineChart, Server, Calendar as CalendarIcon } from "lucide-react";
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
		<div className="min-h-screen bg-[#fafafa] font-sans flex flex-col text-gray-900 selection:bg-red-100">

			<style>{`
				.react-datepicker-wrapper {
					width: 100%;
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
					box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
					padding: 8px;
				}
				.react-datepicker__header {
					background-color: white;
					border-bottom: none;
				}
				.react-datepicker__close-icon::after {
					background-color: transparent !important;
					color: #9CA3AF !important;
					font-size: 18px !important;
				}
			`}</style>

			<nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full shrink-0 border-b border-gray-200/50">
				<div className="flex items-center gap-3">
					<img src="/favicon.ico" alt="Devakorn Logo" className="w-8 h-8 object-contain" />
					<span className="font-black text-xl tracking-tight text-gray-900">DEVAKORN AI</span>
				</div>
				<button
					onClick={() => signIn()}
					className="px-6 py-2.5 bg-gray-900 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow-md"
				>
					Sign In
				</button>
			</nav>

			<main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8">

				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
					<div>
						<h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
						<p className="text-gray-500 text-sm mt-1 font-medium">Global production statistics and community showcase.</p>
					</div>
					<div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 shadow-sm sm:flex">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
						System Online
					</div>
				</div>

				<div className="flex flex-col md:flex-row items-stretch gap-6 w-full">

					<div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-red-500/40 hover:shadow-md transition-all group">
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

					<div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-md transition-all group">
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

					<div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-gray-900/40 hover:shadow-md transition-all group">
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

				<div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
						<div>
							<h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
								<LineChart className="w-5 h-5 text-red-600" />
								Global Generation Trends
							</h2>
							<p className="text-xs text-gray-500 font-medium mt-1">Platform activity based on selected date</p>
						</div>

						<div className="relative w-full sm:w-64 z-50 flex items-center">
							<CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 z-10 pointer-events-none" />
							<DatePicker
								selected={selectedDate}
								onChange={(date: Date | null) => setSelectedDate(date)}
								placeholderText="Select a date to filter"
								dateFormat="MMMM d, yyyy"
								isClearable={true}
								className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none cursor-pointer shadow-sm"
							/>
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

				<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
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
									<div key={asset.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group">
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
													className="w-full h-full object-cover"
													muted loop autoPlay playsInline
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
				</div>

				<div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-lg border border-gray-200">
					<h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">Start generating today.</h2>
					<p className="text-gray-500 text-sm font-medium mb-8 max-w-xl mx-auto">
						Sign in to access the full suite of AI tools, claim your free coins, and start building high-quality commercial assets.
					</p>
					<button
						onClick={() => signIn()}
						className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 mx-auto transition-all hover:-translate-y-0.5"
					>
						Sign In to Dashboard <ArrowRight className="w-4 h-4" />
					</button>
				</div>

			</main>

			<footer className="py-6 text-center text-gray-500 text-xs font-medium border-t border-gray-200 bg-white mt-auto">
				<p>&copy; {new Date().getFullYear()} Devakorn Creator AI. All rights reserved.</p>
			</footer>

		</div>
	);
}