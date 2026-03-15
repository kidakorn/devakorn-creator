/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";
import { Zap, Coins, History, CreditCard } from "lucide-react";
import useSWR from 'swr'; // 🟢 Import SWR

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const packages = [
	{ id: 'price_1TBFGYEFhFWEqseRbPqPtS1P', name: 'Mini Drop', price: 50, coins: 150, bonus: 0, popular: false },
	{ id: 'price_1TBFH6EFhFWEqseRUwprXoMj', name: 'Starter', price: 149, coins: 500, bonus: 0, popular: false },
	{ id: 'price_1TBFHaEFhFWEqseRovdkVX3k', name: 'Pro Creator', price: 499, coins: 2000, bonus: 200, popular: true },
	{ id: 'price_1TBFHuEFhFWEqseR69ZBfnfh', name: 'Agency', price: 999, coins: 5000, bonus: 1000, popular: false }
];

export default function WalletDashboardPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState<string | null>(null);

	// 🟢 Use SWR: It will share cache with Header.tsx
	const { data } = useSWR('/api/user/balance', fetcher, {
		refreshInterval: 10000,
		revalidateOnFocus: true
	});

	const currentCoins = data?.coinBalance ?? 0;

	// 🟢 Handle URL Cleanup only
	useEffect(() => {
		if (searchParams.get('success') === 'true') {
			console.log("Payment successful, cleaning URL...");
			router.replace('/pricing');
		}
	}, [searchParams, router]);

	const handleCheckout = async (priceId: string) => {
		try {
			setIsLoading(priceId);
			const response = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ priceId }),
			});
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				alert("Error: " + data.error);
				setIsLoading(null);
			}
		} catch (error) {
			console.error("Checkout Error:", error);
			setIsLoading(null);
		}
	};

	return (
		<DashboardLayout>
			<div className="min-h-screen bg-gray-50 text-gray-900 p-6 lg:p-10 font-sans">
				<div className="max-w-5xl mx-auto space-y-12">

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

					<div className="relative rounded-3xl p-8 lg:p-10 bg-linear-to-r from-red-600 via-red-500 to-orange-500 shadow-xl overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-8 text-white">
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
								className="w-full sm:w-auto bg-white text-red-600 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 shadow-md transition-all flex justify-center items-center gap-2 active:scale-95"
							>
								+ Top up
							</button>
							<button className="w-full sm:w-auto bg-black/15 text-white border border-white/20 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-black/25 transition-all flex justify-center items-center gap-2 backdrop-blur-sm active:scale-95">
								<History className="w-4 h-4" /> History
							</button>
						</div>
					</div>

					<div className="h-px w-full bg-gray-200 my-10" id="topup-section"></div>

					<div>
						<div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
							<div>
								<h3 className="text-2xl font-bold text-gray-900 mb-2">Buy Coins</h3>
								<p className="text-gray-500 text-sm">Select a package to top up your wallet instantly.</p>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
							{packages.map((pkg) => (
								<div
									key={pkg.id}
									className={`relative rounded-3xl p-6 bg-white transition-all duration-300 flex flex-col group cursor-pointer ${pkg.popular
										? 'border-2 border-red-500 shadow-lg lg:-translate-y-1'
										: 'border border-gray-200 hover:border-red-300 hover:shadow-md'
										}`}
									onClick={() => handleCheckout(pkg.id)}
								>
									<div className="flex-1">
										<div className="flex justify-between items-start mb-6">
											<h3 className="text-gray-900 font-bold text-lg">{pkg.name}</h3>
											<div className={`p-2 rounded-xl ${pkg.popular ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
												<Coins className="w-5 h-5" />
											</div>
										</div>
										<div className="mb-8">
											<span className="text-4xl font-black text-gray-900 tracking-tight">฿{pkg.price}</span>
										</div>
										<div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-500 font-medium">Coins</span>
												<span className="font-bold text-gray-900 text-base">{pkg.coins.toLocaleString()}</span>
											</div>
										</div>
									</div>

									<button
										disabled={isLoading === pkg.id}
										className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${pkg.popular
											? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
											: 'bg-white text-gray-900 border border-gray-200 hover:border-gray-900 hover:bg-gray-50'
											}`}
									>
										{isLoading === pkg.id ? (
											<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
										) : (
											<>
												<CreditCard className="w-4 h-4" /> Buy Now
											</>
										)}
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}