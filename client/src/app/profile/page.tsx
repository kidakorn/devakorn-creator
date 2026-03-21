/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signOut } from "next-auth/react";
import useSWR from "swr";
import { Mail, Shield, Coins, LogOut, CreditCard, Loader2, History, ArrowUpRight, ArrowDownRight, User } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
	const { data: session, status } = useSession();

	const { data: balanceData } = useSWR(
		status === "authenticated" ? '/api/user/balance' : null,
		fetcher
	);
	const currentCoins = balanceData?.coinBalance ?? 0;

	const { data: txData } = useSWR(
		status === "authenticated" ? '/api/user/transactions' : null,
		fetcher
	);
	const transactions = txData?.transactions || [];

	if (status === "loading") {
		return (
			<DashboardLayout>
				<div className="flex justify-center items-center min-h-[60vh]">
					<Loader2 className="w-8 h-8 animate-spin text-red-600" />
				</div>
			</DashboardLayout>
		);
	}

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

	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

				<div>
					<h1 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>
					<p className="text-gray-500 text-sm mt-1 font-medium">Manage your account information and preferences.</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

					<div className="md:col-span-2 space-y-6">
						<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
							<div className="p-6 border-b border-gray-100 flex items-center gap-5 bg-linear-to-r from-gray-50 to-white">

								{/* 🟢 --- 2. เปลี่ยนจากวงกลมตัวอักษร มาใช้รูปภาพจริง (หรืออวาตาร์ตัวอักษร) --- 🟢 */}
								<img
									src={userProfileImage}
									alt="Profile Avatar"
									referrerPolicy="no-referrer"
									className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-lg shadow-red-500/30 ring-4 ring-gray-100"
								/>

								<div>
									<h2 className="text-2xl font-black text-gray-900">{user?.name || 'Creator'}</h2>
									<p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-1">
										<Mail className="w-4 h-4" /> {user?.email}
									</p>
								</div>
							</div>

							<div className="p-6 space-y-4">
								<div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
									<div className="flex items-center gap-3">
										<Shield className="w-5 h-5 text-emerald-500" />
										<div>
											<p className="text-sm font-bold text-gray-900">Account Status</p>
											<p className="text-xs text-gray-500 font-medium">Active & Verified</p>
										</div>
									</div>
									<span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${user?.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
										{user?.role || 'USER'}
									</span>
								</div>
							</div>
						</div>

						<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
							<div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
								<h3 className="font-bold text-gray-900 flex items-center gap-2">
									<History className="w-5 h-5 text-gray-400" /> Billing & History
								</h3>
							</div>
							<div className="p-0">
								{transactions.length > 0 ? (
									<ul className="divide-y divide-gray-100">
										{transactions.map((tx: any) => (
											<li key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
												<div className="flex items-center gap-4">
													<div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
														{tx.amount > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
													</div>
													<div>
														<p className="text-sm font-bold text-gray-900">{tx.description || tx.type}</p>
														<p className="text-xs text-gray-500 font-medium">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}</p>
													</div>
												</div>
												<div className="text-right">
													<p className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
														{tx.amount > 0 ? '+' : ''}{tx.amount} <span className="text-xs">c</span>
													</p>
													<p className="text-xs text-gray-400 font-bold">Bal: {tx.balanceAfter}</p>
												</div>
											</li>
										))}
									</ul>
								) : (
									<div className="p-8 text-center text-gray-500 font-medium text-sm">
										No transaction history found.
									</div>
								)}
							</div>
						</div>

					</div>

					<div className="space-y-6">
						<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center relative overflow-hidden group hover:border-red-300 transition-colors">
							<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-orange-400"></div>
							<Coins className="w-10 h-10 mx-auto text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
							<h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Available Balance</h3>
							<p className="text-4xl font-black text-gray-900 mb-5">{currentCoins.toLocaleString()}</p>

							<Link href="/pricing" className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-md active:scale-95">
								<CreditCard className="w-4 h-4" /> Top Up Coins
							</Link>
						</div>

						<button
							onClick={() => signOut({ callbackUrl: '/' })}
							className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
						>
							<LogOut className="w-4 h-4" /> Sign Out
						</button>
					</div>

				</div>
			</div>
		</DashboardLayout>
	);
}