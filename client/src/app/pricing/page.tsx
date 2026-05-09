/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";
import { Zap, Coins, History, CreditCard, X, CheckCircle2, Sparkles, Star, UploadCloud, QrCode } from "lucide-react";
import useSWR from 'swr';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const EXCHANGE_RATE = 10;
const MIN_AMOUNT = 30;

const PRESETS = [
	{ amount: 39, tag: null, highlight: false },
	{ amount: 59, tag: null, highlight: false },
	{ amount: 99, tag: "Starter", highlight: false },
	{ amount: 199, tag: "Popular", bonusPercent: 5, highlight: true },
	{ amount: 499, tag: "Best Value", bonusPercent: 10, highlight: false },
	{ amount: 999, tag: "Max Bonus", bonusPercent: 15, highlight: false },
];

function WalletDashboardPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [amount, setAmount] = useState<number | "">(199);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [transactions, setTransactions] = useState<any[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);

	// QR & Slip States
	const [showQR, setShowQR] = useState(false);
	const [qrPayload, setQrPayload] = useState("");
	const [promptpayName, setPromptpayName] = useState("");
	const [slipFile, setSlipFile] = useState<File | null>(null);
	const [slipPreview, setSlipPreview] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);

	const { data } = useSWR('/api/user/balance', fetcher, { refreshInterval: 10000, revalidateOnFocus: true });
	const currentCoins = data?.coinBalance ?? 0;

	useEffect(() => {
		if (searchParams.get('success') === 'true') router.replace('/pricing');
	}, [searchParams, router]);

	const calculateCoins = (thb: number | "") => {
		if (thb === "" || thb < MIN_AMOUNT) return { base: 0, bonus: 0, total: 0 };
		const base = thb * EXCHANGE_RATE;
		let bonusPercent = 0;
		if (thb >= 999) bonusPercent = 15;
		else if (thb >= 499) bonusPercent = 10;
		else if (thb >= 199) bonusPercent = 5;
		const bonus = Math.floor(base * (bonusPercent / 100));
		return { base, bonus, total: base + bonus };
	};

	const coinsResult = calculateCoins(amount);
	const isValidAmount = amount !== "" && amount >= MIN_AMOUNT;

	const handleCheckout = async () => {
		if (!isValidAmount) return;
		try {
			setIsCheckingOut(true);
			const response = await fetch('/api/payment/qr', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount }),
			});
			const data = await response.json();
			
			if (data.payload) {
				setQrPayload(data.payload);
				setPromptpayName(data.promptpayName);
				setShowQR(true);
				setSlipFile(null);
				setSlipPreview(null);
			} else {
				toast.error("Error: " + data.error);
			}
		} catch (error) {
			console.error("QR Error:", error);
			toast.error("Failed to generate QR Code");
		} finally {
			setIsCheckingOut(false);
		}
	};

	const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSlipFile(file);
			setSlipPreview(URL.createObjectURL(file));
		}
	};

	const handleVerifySlip = async () => {
		if (!slipFile) return;
		setIsVerifying(true);
		try {
			const formData = new FormData();
			formData.append('file', slipFile);
			formData.append('amount', String(amount));

			const res = await fetch('/api/payment/verify', {
				method: 'POST',
				body: formData,
			});
			const data = await res.json();
			
			if (data.success) {
				toast.success(`Successfully added ${data.coinsAdded} coins!`);
				setShowQR(false);
			} else {
				toast.error(`Verification failed: ${data.error}${data.details ? `\n${data.details}` : ''}`);
			}
		} catch (error) {
			console.error("Verify Error:", error);
			toast.error("An error occurred during verification");
		} finally {
			setIsVerifying(false);
		}
	};

	const handleOpenHistory = async () => {
		setShowHistory(true);
		setIsLoadingHistory(true);
		try {
			const res = await fetch('/api/user/transactions');
			if (res.ok) { const d = await res.json(); setTransactions(d.transactions); }
		} catch (error) { console.error(error); }
		finally { setIsLoadingHistory(false); }
	};

	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
							<Coins className="w-6 h-6 text-yellow-500" /> Wallet & Coins
						</h1>
						<p className="text-gray-500 text-sm mt-1 font-medium">Top up coins to generate images, videos, and campaigns.</p>
					</div>
					<button
						onClick={handleOpenHistory}
						className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
					>
						<History className="w-4 h-4" /> Transaction History
					</button>
				</div>

				{/* Balance Card */}
				<div className="relative rounded-3xl overflow-hidden p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
					style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
					<div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, #ef4444 0%, transparent 40%), radial-gradient(circle at 90% 10%, #f97316 0%, transparent 40%)' }} />
					<div className="relative z-10">
						<p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
							<Sparkles className="w-3.5 h-3.5" /> DEVAKORN WALLET
						</p>
						<p className="text-6xl md:text-7xl font-black tracking-tighter tabular-nums">{currentCoins.toLocaleString()}</p>
						<p className="text-white/40 text-sm font-bold mt-2">coins available</p>
					</div>
					<div className="relative z-10 flex flex-col sm:items-end gap-3">
						<div className="flex items-center gap-2">
							<img
								src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=ef4444&color=fff`}
								alt="Avatar"
								className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
							/>
							<div>
								<p className="text-sm font-bold text-white">{session?.user?.name?.split(' ')[0] || 'Creator'}</p>
								<p className="text-xs text-white/40 font-medium">Member</p>
							</div>
						</div>
						<button
							onClick={() => document.getElementById('topup-section')?.scrollIntoView({ behavior: 'smooth' })}
							className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 shadow-lg transition-all active:scale-95 flex items-center gap-2"
						>
							<CreditCard className="w-4 h-4 text-red-600" /> Top Up Now
						</button>
					</div>
				</div>

				{/* Packages */}
				<div id="topup-section" className="bg-white border border-gray-100 rounded-3xl shadow-sm p-7">
					<div className="mb-7">
						<h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
							<Zap className="w-5 h-5 text-red-500" /> Choose a Package
						</h2>
						<p className="text-gray-500 text-sm mt-1 font-medium">1 THB = 10 Coins. Bigger packages include bonus coins.</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
						{PRESETS.map((p) => {
							const result = calculateCoins(p.amount);
							const isSelected = amount === p.amount;
							return (
								<button
									key={p.amount}
									onClick={() => setAmount(p.amount)}
									className={`relative p-5 rounded-2xl border-2 text-left transition-all overflow-hidden group
										${isSelected
											? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 shadow-md shadow-red-100'
											: 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
										}`}
								>
									{p.tag && (
										<div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl
											${isSelected ? 'bg-red-600 text-white' : p.tag === 'Popular' ? 'bg-gray-900 text-white' : 'bg-gray-700 text-white'}`}>
											{p.tag === 'Popular' && <Star className="w-2.5 h-2.5 inline mr-0.5 mb-0.5" />}
											{p.tag}
										</div>
									)}
									<p className={`text-sm font-bold mb-1.5 ${isSelected ? 'text-red-500' : 'text-gray-400'}`}>฿ {p.amount}</p>
									<div className="flex items-baseline gap-1">
										<span className={`text-2xl font-black tabular-nums ${isSelected ? 'text-red-600' : 'text-gray-900'}`}>
											{result.total.toLocaleString()}
										</span>
										<span className="text-xs font-bold text-gray-400">coins</span>
									</div>
									{result.bonus > 0 && (
										<div className="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
											<CheckCircle2 className="w-3 h-3" /> +{result.bonus} Bonus
										</div>
									)}
								</button>
							);
						})}
					</div>

					{/* Custom Amount */}
					<div className="relative flex items-center bg-gray-50 rounded-2xl border-2 border-gray-100 focus-within:border-red-400 focus-within:bg-white transition-all overflow-hidden mb-2">
						<div className="px-5 py-4 font-bold text-gray-500 text-sm whitespace-nowrap bg-gray-100 border-r border-gray-200">
							Custom ฿
						</div>
						<input
							type="number"
							min={MIN_AMOUNT}
							value={amount}
							onChange={(e) => { const v = e.target.value; setAmount(v === "" ? "" : Number(v)); }}
							className="flex-1 bg-transparent py-4 px-4 text-xl font-black text-gray-900 outline-none"
							placeholder={`Min. ${MIN_AMOUNT}`}
						/>
						{coinsResult.total > 0 && (
							<div className="hidden sm:block px-5 font-black text-red-600 text-base whitespace-nowrap">
								= {coinsResult.total.toLocaleString()} coins
							</div>
						)}
					</div>
					{!isValidAmount && amount !== "" && (
						<p className="text-red-500 text-xs font-bold ml-1 mb-2">Minimum amount is ฿{MIN_AMOUNT}.</p>
					)}

					{/* Checkout Button */}
					<button
						onClick={handleCheckout}
						disabled={!isValidAmount || isCheckingOut}
						className={`w-full mt-5 py-4 rounded-2xl font-black text-lg transition-all flex justify-center items-center gap-3 shadow-lg
							${isValidAmount && !isCheckingOut
								? "bg-gradient-to-r from-red-600 to-orange-500 text-white hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
								: "bg-gray-100 text-gray-400 cursor-not-allowed"
							}`}
					>
						{isCheckingOut ? (
							<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							<><QrCode className="w-5 h-5" /> Generate QR for ฿{amount || 0}</>
						)}
					</button>
				</div>
			</div>

			{/* History Modal */}
			{showHistory && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
						<div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
							<h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
								<History className="w-4 h-4 text-red-500" /> Transaction History
							</h3>
							<button onClick={() => setShowHistory(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
								<X className="w-4 h-4" />
							</button>
						</div>
						<div className="p-5 overflow-y-auto flex-1">
							{isLoadingHistory ? (
								<div className="flex flex-col items-center justify-center py-12">
									<div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
									<p className="mt-3 text-sm text-gray-500 font-medium">Loading...</p>
								</div>
							) : transactions.length > 0 ? (
								<div className="space-y-2.5">
									{transactions.map((tx) => (
										<div key={tx.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-red-100 hover:bg-red-50/30 transition-all bg-white">
											<div>
												<p className="font-bold text-gray-900 text-sm">{tx.description}</p>
												<p className="text-xs text-gray-400 mt-0.5 font-medium">
													{new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
												</p>
											</div>
											<div className="text-right">
												<p className={`font-black text-base tabular-nums ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
													{tx.amount > 0 ? '+' : ''}{tx.amount}
												</p>
												<div className="flex items-center justify-end gap-1 mt-0.5 text-xs text-gray-400 font-medium">
													<Coins className="w-3 h-3" /> {tx.balanceAfter.toLocaleString()}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<History className="w-12 h-12 mx-auto mb-3 text-gray-200" />
									<p className="font-bold text-gray-900 mb-1">No transactions yet</p>
									<p className="text-gray-400 text-sm font-medium">Your history will appear here.</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			{/* QR Code & Slip Modal */}
			{showQR && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
						<div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
							<h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
								<QrCode className="w-4 h-4 text-red-500" /> PromptPay QR
							</h3>
							<button onClick={() => setShowQR(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
								<X className="w-4 h-4" />
							</button>
						</div>
						
						<div className="p-6 flex flex-col items-center overflow-y-auto">
							<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
								<QRCodeSVG value={qrPayload} size={200} />
							</div>
							
							<div className="text-center mb-6">
								<p className="text-2xl font-black text-gray-900">฿{amount}</p>
								<p className="text-sm font-medium text-gray-500 mt-1">{promptpayName}</p>
							</div>

							<div className="w-full space-y-3">
								<p className="text-sm font-bold text-gray-700">Upload Slip to Verify</p>
								
								{!slipPreview ? (
									<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer">
										<UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
										<p className="text-xs font-medium text-gray-500">Click to upload slip</p>
										<input type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
									</label>
								) : (
									<div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
										<img src={slipPreview} alt="Slip" className="w-full h-full object-cover" />
										<button 
											onClick={() => { setSlipFile(null); setSlipPreview(null); }}
											className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-all"
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								)}

								<button
									onClick={handleVerifySlip}
									disabled={!slipFile || isVerifying}
									className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2
										${slipFile && !isVerifying
											? "bg-red-600 text-white hover:bg-red-700 shadow-md"
											: "bg-gray-100 text-gray-400 cursor-not-allowed"
										}`}
								>
									{isVerifying ? (
										<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
									) : (
										"Verify Payment"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}

export default function PricingPage() {
	return (
		<Suspense fallback={<div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>}>
			<WalletDashboardPage />
		</Suspense>
	);
}