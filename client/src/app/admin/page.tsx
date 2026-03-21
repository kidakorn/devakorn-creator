/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Users, ImageIcon, Coins, Loader2, ShieldCheck, Plus, Check, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	// State สำหรับจัดการฟอร์มเติมเงินแบบ Inline
	const [addingCoinToUser, setAddingCoinToUser] = useState<string | null>(null);
	const [addAmount, setAddAmount] = useState<string>("100");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// 🛡️ ดักเตะคนที่ไม่ใช่ Admin กลับไปหน้าแรก
	useEffect(() => {
		if (status === "authenticated" && session?.user?.role !== "ADMIN") {
			router.push("/");
			toast.error("Access Denied. Admins only.");
		}
	}, [status, session, router]);

	const { data, isLoading } = useSWR(
		status === "authenticated" && session?.user?.role === "ADMIN" ? '/api/admin/dashboard' : null,
		fetcher, { refreshInterval: 10000 }
	);

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
				<Loader2 className="w-10 h-10 animate-spin text-red-600" />
			</div>
		);
	}

	// ป้องกันหน้ากระพริบตอนกำลังเตะกลับ
	if (status === "unauthenticated" || session?.user?.role !== "ADMIN") return null;

	const handleAddCoins = async (userId: string) => {
		setIsSubmitting(true);
		const toastId = toast.loading("Adding coins...");
		try {
			const res = await fetch('/api/admin/add-coins', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, amount: addAmount })
			});
			const result = await res.json();

			if (res.ok) {
				toast.success(result.message, { id: toastId });
				mutate('/api/admin/dashboard'); // รีเฟรชข้อมูลตาราง
				setAddingCoinToUser(null);
			} else {
				toast.error(result.message, { id: toastId });
			}
		} catch (error) {
			toast.error("Failed to add coins", { id: toastId });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<DashboardLayout>
			<div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
					<div>
						<h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
							<ShieldCheck className="w-8 h-8 text-red-600" /> Command Center
						</h1>
						<p className="text-gray-500 text-sm mt-1 font-medium">Manage users, monitor platform usage, and grant coin bonuses.</p>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
					<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
						<div className="flex justify-between items-start mb-4">
							<div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
								<Users className="w-5 h-5" />
							</div>
						</div>
						<div>
							<h3 className="text-3xl font-black text-gray-900">{data?.stats?.totalUsers || 0}</h3>
							<p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Total Registered Users</p>
						</div>
					</div>

					<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
						<div className="flex justify-between items-start mb-4">
							<div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
								<ImageIcon className="w-5 h-5" />
							</div>
						</div>
						<div>
							<h3 className="text-3xl font-black text-gray-900">{data?.stats?.totalAssets || 0}</h3>
							<p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Assets Generated</p>
						</div>
					</div>

					<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
						<div className="flex justify-between items-start mb-4">
							<div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
								<Coins className="w-5 h-5" />
							</div>
						</div>
						<div>
							<h3 className="text-3xl font-black text-gray-900">{data?.stats?.totalCoinsInSystem?.toLocaleString() || 0}</h3>
							<p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Total Coins in Circulation</p>
						</div>
					</div>
				</div>

				{/* Users Table */}
				<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
					<div className="p-5 sm:p-6 border-b border-gray-100">
						<h2 className="text-base font-black text-gray-900 tracking-tight">User Management</h2>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse text-sm">
							<thead>
								<tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
									<th className="font-bold py-4 px-6">User / Email</th>
									<th className="font-bold py-4 px-4 text-center">Role</th>
									<th className="font-bold py-4 px-4 text-center">Generations</th>
									<th className="font-bold py-4 px-4 text-right">Balance</th>
									<th className="font-bold py-4 px-6 text-right w-48">Admin Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{data?.users?.map((user: any) => (
									<tr key={user.id} className="hover:bg-gray-50 transition-colors">
										<td className="py-4 px-6">
											<p className="font-bold text-gray-900">{user.name || 'No Name'}</p>
											<p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
										</td>
										<td className="py-4 px-4 text-center">
											<span className={`inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
												{user.role}
											</span>
										</td>
										<td className="py-4 px-4 text-center font-bold text-gray-600">
											{user._count.generatedAssets}
										</td>
										<td className="py-4 px-4 text-right font-black text-gray-900">
											{user.coinBalance.toLocaleString()} <span className="text-xs font-bold text-gray-400">c</span>
										</td>
										<td className="py-4 px-6 text-right">

											{/* UI สำหรับฟอร์มเติมเงินแบบ Inline */}
											{addingCoinToUser === user.id ? (
												<div className="flex items-center justify-end gap-2 animate-in slide-in-from-right-2 duration-300">
													<input
														type="number"
														value={addAmount}
														onChange={(e) => setAddAmount(e.target.value)}
														className="w-16 px-2 py-1.5 text-xs font-bold border border-gray-300 rounded-lg text-center focus:border-red-500 outline-none"
														placeholder="Amt"
													/>
													<button onClick={() => handleAddCoins(user.id)} disabled={isSubmitting} className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors">
														{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
													</button>
													<button onClick={() => setAddingCoinToUser(null)} disabled={isSubmitting} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
														<X className="w-4 h-4" />
													</button>
												</div>
											) : (
												<button
													onClick={() => { setAddingCoinToUser(user.id); setAddAmount("100"); }}
													className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm"
												>
													<Plus className="w-3 h-3" /> Add Coins
												</button>
											)}

										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

			</div>
		</DashboardLayout>
	);
}