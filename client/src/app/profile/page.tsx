/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signOut } from "next-auth/react";
import useSWR from "swr";
import { Mail, Shield, Coins, LogOut, CreditCard, Loader2, History, ArrowUpRight, ArrowDownRight, TrendingUp, Activity, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
	const { data: session, status } = useSession();
	const { data: balanceData } = useSWR(status === "authenticated" ? '/api/user/balance' : null, fetcher);
	const currentCoins = balanceData?.coinBalance ?? 0;
	const { data: txData } = useSWR(status === "authenticated" ? '/api/user/transactions' : null, fetcher);
	const transactions = txData?.transactions || [];

	if (status === "loading") return (
		<DashboardLayout>
			<div className="flex justify-center items-center min-h-[60vh]">
				<Loader2 className="w-8 h-8 animate-spin text-red-600" />
			</div>
		</DashboardLayout>
	);

	if (status === "unauthenticated") {
		if (typeof window !== "undefined") window.location.href = "/login";
		return null;
	}

	const user = session?.user as any;
	const imagePath = session?.user?.image;
	const hasValidImage = typeof imagePath === 'string' && imagePath.trim() !== '' && imagePath !== 'null' && imagePath !== 'undefined';
	const userProfileImage = hasValidImage
		? imagePath
		: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=DC2626&color=FFFFFF&size=128&bold=true`;

	const totalSpent = transactions.filter((t: any) => t.amount < 0).reduce((acc: number, t: any) => acc + Math.abs(t.amount), 0);
	const totalTopUp = transactions.filter((t: any) => t.amount > 0).reduce((acc: number, t: any) => acc + t.amount, 0);

	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

				{/* Hero Banner */}
				<div className="relative rounded-3xl overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-red-900" />
					<div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #ef4444 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f97316 0%, transparent 50%)' }} />
					<div className="relative z-10 p-7 flex flex-col sm:flex-row items-center sm:items-end gap-6">
						<div className="relative flex-shrink-0">
							<img src={userProfileImage} alt="Profile" referrerPolicy="no-referrer" className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-2xl" />
							<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-gray-900" />
						</div>
						<div className="flex-1 text-center sm:text-left">
							<span className={`inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full mb-2 ${user?.role === 'ADMIN' ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-white/10 text-white/60 border border-white/20'}`}>
								{user?.role || 'USER'}
							</span>
							<h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{user?.name || 'Creator'}</h1>
							<p className="text-white/50 text-sm font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
								<Mail className="w-3.5 h-3.5" /> {user?.email}
							</p>
						</div>
						<div className="text-center sm:text-right flex-shrink-0">
							<p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-1">Balance</p>
							<p className="text-4xl font-black text-white tabular-nums">{currentCoins.toLocaleString()}</p>
							<p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">Coins</p>
						</div>
					</div>
				</div>

				{/* Stats Row */}
				<div className="grid grid-cols-3 gap-4">
					{[
						{ icon: TrendingUp, label: 'Total Top Up', value: `+${totalTopUp.toLocaleString()}`, sub: 'coins earned', color: 'text-emerald-600' },
						{ icon: Activity, label: 'Total Spent', value: totalSpent.toLocaleString(), sub: 'coins used', color: 'text-gray-900' },
						{ icon: Sparkles, label: 'Generations', value: transactions.filter((t: any) => t.amount < 0).length.toString(), sub: 'total created', color: 'text-gray-900' },
					].map(({ icon: Icon, label, value, sub, color }) => (
						<div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
							<div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
								<Icon className="w-3.5 h-3.5" /> {label}
							</div>
							<p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
							<p className="text-xs text-gray-400 font-medium mt-0.5">{sub}</p>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Transaction History */}
					<div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
						<div className="p-5 border-b border-gray-100 flex items-center justify-between">
							<h3 className="font-bold text-gray-900 flex items-center gap-2">
								<History className="w-4 h-4 text-red-500" /> Transaction History
							</h3>
							<span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{transactions.length} records</span>
						</div>
						<div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
							{transactions.length > 0 ? transactions.map((tx: any) => (
								<div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
									<div className="flex items-center gap-3.5">
										<div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
											{tx.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
										</div>
										<div>
											<p className="text-sm font-bold text-gray-900 leading-tight">{tx.description || tx.type}</p>
											<p className="text-xs text-gray-400 font-medium mt-0.5">{new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
										</div>
									</div>
									<div className="text-right">
										<p className={`text-sm font-black tabular-nums ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
											{tx.amount > 0 ? '+' : ''}{tx.amount}
										</p>
										<p className="text-[11px] text-gray-400 font-medium mt-0.5">Bal: {tx.balanceAfter.toLocaleString()}</p>
									</div>
								</div>
							)) : (
								<div className="py-16 text-center text-gray-400">
									<History className="w-10 h-10 mx-auto mb-3 opacity-20" />
									<p className="font-medium text-sm">No transaction history found.</p>
								</div>
							)}
						</div>
					</div>

					{/* Right Column */}
					<div className="space-y-4">
						<div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white relative overflow-hidden">
							<div className="absolute top-0 right-0 w-28 h-28 bg-red-500/10 rounded-full -translate-y-8 translate-x-8" />
							<Coins className="w-7 h-7 text-yellow-400 mb-3 relative z-10" />
							<p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-1 relative z-10">Available Balance</p>
							<p className="text-3xl font-black tabular-nums relative z-10 mb-4">{currentCoins.toLocaleString()} <span className="text-base font-bold text-white/40">coins</span></p>
							<Link href="/pricing" className="relative z-10 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95">
								<CreditCard className="w-4 h-4" /> Top Up Now
							</Link>
						</div>

						<div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
							<h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Account Status</h4>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<Shield className="w-4 h-4 text-emerald-500" />
									<div>
										<p className="text-sm font-bold text-gray-900">Active & Verified</p>
										<p className="text-xs text-gray-400 font-medium">All features unlocked</p>
									</div>
								</div>
								<div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
							</div>
						</div>

						<button
							onClick={() => signOut({ callbackUrl: '/' })}
							className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
						>
							<LogOut className="w-4 h-4" /> Sign Out
						</button>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}