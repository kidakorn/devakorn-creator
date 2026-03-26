/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";
import { Zap, Coins, History, CreditCard, X, CheckCircle2 } from "lucide-react";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 🟢 อัตราแลกเปลี่ยน 1 บาท = 10 เหรียญ
const EXCHANGE_RATE = 10;
const MIN_AMOUNT = 30;

// 🟢 เทคนิคจิตวิทยาการขาย (ราคาลงท้ายด้วย 9 + แจกโบนัส)
const PRESETS = [
	{ amount: 39, tag: null },
	{ amount: 59, tag: null },
	{ amount: 99, tag: "Starter" },
	{ amount: 199, tag: "Popular", bonusPercent: 5 }, // เริ่มแจกโบนัสที่ 199
	{ amount: 499, tag: "Best Value", bonusPercent: 10 },
	{ amount: 999, tag: "Max Bonus", bonusPercent: 15 },
];

export default function WalletDashboardPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [amount, setAmount] = useState<number | "">(99); // Default ที่ 99
	const [isCheckingOut, setIsCheckingOut] = useState(false);

	// State สำหรับ History
	const [showHistory, setShowHistory] = useState(false);
	const [transactions, setTransactions] = useState<any[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);

	const { data } = useSWR('/api/user/balance', fetcher, {
		refreshInterval: 10000,
		revalidateOnFocus: true
	});

	const currentCoins = data?.coinBalance ?? 0;

	useEffect(() => {
		if (searchParams.get('success') === 'true') {
			router.replace('/pricing');
		}
	}, [searchParams, router]);

	// ฟังก์ชันคำนวณเหรียญ + โบนัส (ประมวลผลอยู่เบื้องหลัง ไม่ให้รกลูกตา)
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

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		if (val === "") setAmount("");
		else setAmount(Number(val));
	};

	const handleCheckout = async () => {
		if (!isValidAmount) return;
		try {
			setIsCheckingOut(true);
			const response = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: amount }), // ส่งจำนวนเงินที่กรอก/เลือก ไป
			});
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				alert("Error: " + data.error);
				setIsCheckingOut(false);
			}
		} catch (error) {
			console.error("Checkout Error:", error);
			setIsCheckingOut(false);
		}
	};

	const handleOpenHistory = async () => {
		setShowHistory(true);
		setIsLoadingHistory(true);
		try {
			const res = await fetch('/api/user/transactions');
			if (res.ok) {
				const data = await res.json();
				setTransactions(data.transactions);
			}
		} catch (error) {
			console.error("Failed to fetch history:", error);
		} finally {
			setIsLoadingHistory(false);
		}
	};

	return (
		<DashboardLayout>
			<div className="min-h-screen bg-gray-50 text-gray-900 p-6 lg:p-10 font-sans pb-20">
				<div className="max-w-4xl mx-auto space-y-10">

					{/* 🟢 Header Profile */}
					<div className="flex items-center gap-4">
						<div className="w-14 h-14 rounded-full bg-white shadow-sm p-1 border border-gray-200">
							<img
								src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=ef4444&color=fff`}
								alt="Avatar"
								className="w-full h-full rounded-full object-cover"
							/>
						</div>
						<div>
							<h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
								Hello, <span className="text-red-600">@{session?.user?.name?.split(' ')[0] || 'Creator'}</span>
							</h1>
							<p className="text-sm text-gray-500 font-medium mt-0.5">Manage your DEVAKORN wallet and coin balance.</p>
						</div>
					</div>

					{/* 🟢 Main Wallet Card */}
					<div className="relative mb-8 rounded-3xl p-8 lg:p-10 bg-linear-to-r from-red-600 via-red-500 to-orange-500 shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 text-white">
						<div className="relative z-10">
							<div className="flex items-center gap-2 text-white/90 mb-4 font-semibold tracking-wide">
								<Coins className="w-5 h-5" /> DEVAKORN WALLET
							</div>
							<div className="flex items-baseline gap-3 drop-shadow-sm">
								<span className="text-6xl md:text-7xl font-black tracking-tighter">
									{currentCoins.toLocaleString()}
								</span>
								<span className="text-2xl font-bold text-white/80">COINS</span>
							</div>
						</div>

						<div className="relative z-10 flex flex-col sm:flex-row gap-3 min-w-50">
							<button
								onClick={() => document.getElementById('topup-section')?.scrollIntoView({ behavior: 'smooth' })}
								className="w-full sm:w-auto bg-white text-red-600 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 shadow-md transition-all active:scale-95"
							>
								+ Top up
							</button>
							<button
								onClick={handleOpenHistory}
								className="w-full sm:w-auto bg-black/15 text-white border border-white/20 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-black/25 transition-all flex justify-center items-center gap-2 backdrop-blur-sm active:scale-95"
							>
								<History className="w-4 h-4" /> History
							</button>
						</div>
					</div>

					{/* 🟢 Top-up Section (App Store Style) */}
					<div id="topup-section" className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 lg:p-10">
						<div className="mb-8 flex items-center justify-between">
							<div>
								<h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
									<Zap className="w-6 h-6 text-red-500" /> Get More Coins
								</h3>
								<p className="text-gray-500 font-medium mt-1">Select a package or enter a custom amount.</p>
							</div>
						</div>

						{/* Grid แพ็กเกจ */}
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
							{PRESETS.map((p) => {
								const result = calculateCoins(p.amount);
								const isSelected = amount === p.amount;
								return (
									<button
										key={p.amount}
										onClick={() => setAmount(p.amount)}
										className={`relative p-5 rounded-2xl border-2 text-left transition-all overflow-hidden group
											${isSelected ? 'border-red-500 bg-red-50/50' : 'border-gray-100 bg-white hover:border-red-200 hover:shadow-md'}`}
									>
										{/* Tag กระตุ้นการขาย */}
										{p.tag && (
											<div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl
												${isSelected ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
												{p.tag}
											</div>
										)}

										<div className={`text-sm font-bold mb-1 ${isSelected ? 'text-red-500' : 'text-gray-400'}`}>
											฿ {p.amount}
										</div>
										<div className="flex items-baseline gap-1">
											<span className={`text-2xl font-black ${isSelected ? 'text-red-600' : 'text-gray-900'}`}>
												{result.total.toLocaleString()}
											</span>
											<span className="text-xs font-bold text-gray-500">Coins</span>
										</div>

										{/* ข้อความ Bonus เล็กๆ */}
										{result.bonus > 0 && (
											<div className="mt-2 text-xs font-bold text-green-500 flex items-center gap-1">
												<CheckCircle2 className="w-3 h-3" /> +{result.bonus} Bonus
											</div>
										)}
									</button>
								);
							})}
						</div>

						{/* ช่องกรอกจำนวนเงินแบบ Custom แบบมินิมอล */}
						<div className="p-1">
							<div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-red-500 focus-within:bg-white transition-all overflow-hidden">
								<div className="px-5 font-bold text-gray-500 whitespace-nowrap bg-gray-100 border-r border-gray-200 h-full flex items-center py-4">
									Custom ฿
								</div>
								<input
									type="number"
									min={MIN_AMOUNT}
									value={amount}
									onChange={handleAmountChange}
									className="flex-1 bg-transparent py-4 px-4 text-xl font-black text-gray-900 outline-none w-full"
									placeholder={`Min. ${MIN_AMOUNT}`}
								/>
								<div className="px-5 font-black text-red-600 text-xl whitespace-nowrap hidden sm:block">
									= {coinsResult.total.toLocaleString()} Coins
								</div>
							</div>
							{!isValidAmount && amount !== "" && (
								<p className="text-red-500 text-xs font-bold mt-2 ml-2">Minimum amount is ฿{MIN_AMOUNT}.</p>
							)}
						</div>

						{/* ปุ่ม Checkout แนวนอนใหญ่ๆ เน้นๆ */}
						<button
							onClick={handleCheckout}
							disabled={!isValidAmount || isCheckingOut}
							className={`w-full mt-8 py-4 rounded-2xl font-black text-lg transition-all flex justify-center items-center gap-3 shadow-lg
								${isValidAmount && !isCheckingOut
									? "bg-red-600 text-white hover:bg-red-700 hover:shadow-xl hover:-translate-y-1 active:scale-95"
									: "bg-gray-200 text-gray-400 cursor-not-allowed"
								}`}
						>
							{isCheckingOut ? (
								<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							) : (
								<>
									<CreditCard className="w-6 h-6" />
									Pay ฿{amount || 0} to get {coinsResult.total.toLocaleString()} Coins
								</>
							)}
						</button>

					</div>
				</div>
			</div>

			{/* 🟢 Modal History (เหมือนเดิมเป๊ะ) */}
			{showHistory && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
						<div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
							<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
								<History className="w-5 h-5 text-red-500" /> Transaction History
							</h3>
							<button
								onClick={() => setShowHistory(false)}
								className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
							{isLoadingHistory ? (
								<div className="flex flex-col items-center justify-center py-12">
									<div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
									<p className="mt-4 text-sm text-gray-500 font-medium">Loading history...</p>
								</div>
							) : transactions.length > 0 ? (
								<div className="space-y-3">
									{transactions.map((tx) => (
										<div key={tx.id} className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 hover:border-red-100 hover:shadow-sm transition-all bg-white">
											<div>
												<p className="font-bold text-gray-900 text-sm">{tx.description}</p>
												<p className="text-xs text-gray-400 mt-1 font-medium">
													{new Date(tx.createdAt).toLocaleDateString('en-GB', {
														day: 'numeric', month: 'short', year: 'numeric',
														hour: '2-digit', minute: '2-digit'
													})}
												</p>
											</div>
											<div className="text-right">
												<span className={`font-black text-lg ${tx.amount > 0 ? 'text-green-500' : 'text-gray-900'}`}>
													{tx.amount > 0 ? '+' : ''}{tx.amount}
												</span>
												<div className="flex items-center justify-end gap-1 mt-0.5 text-xs text-gray-400 font-medium">
													<Coins className="w-3 h-3" /> {tx.balanceAfter.toLocaleString()}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<div className="w-16 h-16 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
										<History className="w-8 h-8 text-gray-300" />
									</div>
									<h4 className="font-bold text-gray-900 mb-1">No transactions yet</h4>
									<p className="text-gray-500 text-sm font-medium">Your top-up history will appear here.</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}