/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Users, ImageIcon, Coins, Loader2, ShieldCheck, Plus, Check, X, ShieldAlert, Shield, Key, Copy } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [addingCoinToUser, setAddingCoinToUser] = useState<string | null>(null);
	const [addAmount, setAddAmount] = useState<string>("100");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isApproving, setIsApproving] = useState<string | null>(null);
	const [isRejecting, setIsRejecting] = useState<string | null>(null);

	const [banModal, setBanModal] = useState({
		isOpen: false,
		userId: "",
		name: "",
		isBanned: false
	});

	const [rejectModal, setRejectModal] = useState({
		isOpen: false,
		requestId: "",
		email: ""
	});

	// State สำหรับเก็บและแสดงลิงก์ที่สร้างสำเร็จ
	const [generatedLinkModal, setGeneratedLinkModal] = useState({
		isOpen: false,
		email: "",
		link: ""
	});

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
			router.push("/");
			toast.error("Access Denied. Admins only.");
		}
	}, [status, session, router]);

	const { data, isLoading } = useSWR(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		status === "authenticated" && (session?.user as any)?.role === "ADMIN" ? '/api/admin/dashboard' : null,
		fetcher, { refreshInterval: 10000 }
	);

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
				<Loader2 className="w-10 h-10 animate-spin text-red-600" />
			</div>
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") return null;

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
				mutate('/api/admin/dashboard');
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

	const handleApproveReset = async (requestId: string) => {
		setIsApproving(requestId);
		const toastId = toast.loading("Generating reset link...");
		try {
			const res = await fetch('/api/admin/approve-reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ requestId })
			});
			const result = await res.json();

			if (res.ok) {
				toast.success("Link generated successfully!", { id: toastId });
				mutate('/api/admin/dashboard');
				// เปิด Modal แสดงลิงก์ให้แอดมินกดก๊อปปี้
				setGeneratedLinkModal({
					isOpen: true,
					email: result.email,
					link: result.link
				});
			} else {
				toast.error(result.message || "Failed to generate link", { id: toastId });
			}
		} catch (error) {
			toast.error("Network error", { id: toastId });
		} finally {
			setIsApproving(null);
		}
	};

	const confirmRejectAction = async () => {
		const { requestId } = rejectModal;
		setRejectModal({ isOpen: false, requestId: "", email: "" });

		setIsRejecting(requestId);
		const toastId = toast.loading("Rejecting request...");
		try {
			const res = await fetch('/api/admin/reject-reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ requestId })
			});

			if (res.ok) {
				toast.success("Request rejected", { id: toastId });
				mutate('/api/admin/dashboard');
			} else {
				const result = await res.json();
				toast.error(result.message || "Failed to reject request", { id: toastId });
			}
		} catch (error) {
			toast.error("Network error", { id: toastId });
		} finally {
			setIsRejecting(null);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const openBanModal = (user: any) => {
		setBanModal({
			isOpen: true,
			userId: user.id,
			name: user.name || "this user",
			isBanned: user.isBanned
		});
	};

	const confirmBanAction = async () => {
		setBanModal({ ...banModal, isOpen: false });

		const { userId, isBanned } = banModal;
		const toastId = toast.loading(`${isBanned ? "Restoring" : "Banning"} user...`);

		try {
			const res = await fetch('/api/admin/user-status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, isBanned: !isBanned })
			});
			const result = await res.json();

			if (res.ok) {
				toast.success(result.message, { id: toastId });
				mutate('/api/admin/dashboard');
			} else {
				toast.error(result.message, { id: toastId });
			}
		} catch (error) {
			toast.error("Failed to change user status", { id: toastId });
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Link copied to clipboard!");
	};

	return (
		<DashboardLayout>
			<div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative">

				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
					<div>
						<h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
							<ShieldCheck className="w-8 h-8 text-red-600" /> Command Center
						</h1>
						<p className="text-gray-500 text-sm mt-1 font-medium">Manage users, monitor platform usage, and grant coin bonuses.</p>
					</div>
				</div>

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

				{/* Section: Password Reset Requests */}
				<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
					<div className="p-5 sm:p-6 border-b border-gray-100">
						<h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
							<Key className="w-5 h-5 text-orange-500" /> Pending Password Resets
						</h2>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse text-sm">
							<thead>
								<tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
									<th className="font-bold py-4 px-6">Email Address</th>
									<th className="font-bold py-4 px-4 text-center">Requested At</th>
									<th className="font-bold py-4 px-4 text-center">Status</th>
									<th className="font-bold py-4 px-6 text-right">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{data?.pendingResets && data.pendingResets.length > 0 ? (
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									data.pendingResets.map((req: any) => (
										<tr key={req.id} className="hover:bg-gray-50 transition-colors">
											<td className="py-4 px-6 font-bold text-gray-900">{req.email}</td>
											<td className="py-4 px-4 text-center text-gray-500">
												{new Date(req.createdAt).toLocaleString()}
											</td>
											<td className="py-4 px-4 text-center">
												<span className="inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
													Pending
												</span>
											</td>
											<td className="py-4 px-6 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={() => handleApproveReset(req.id)}
														disabled={isApproving === req.id || isRejecting === req.id}
														className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all shadow-sm"
													>
														{isApproving === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
														Approve
													</button>
													<button
														onClick={() => setRejectModal({ isOpen: true, requestId: req.id, email: req.email })}
														disabled={isApproving === req.id || isRejecting === req.id}
														className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all shadow-sm"
													>
														{isRejecting === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
														Reject
													</button>
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={4} className="py-8 text-center text-gray-500 font-medium">No pending requests at the moment.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Section: User Management */}
				<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
					<div className="p-5 sm:p-6 border-b border-gray-100">
						<h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
							<Users className="w-5 h-5 text-blue-500" /> User Management
						</h2>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse text-sm">
							<thead>
								<tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
									<th className="font-bold py-4 px-6">User / Email</th>
									<th className="font-bold py-4 px-4 text-center">Status</th>
									<th className="font-bold py-4 px-4 text-center">Generations</th>
									<th className="font-bold py-4 px-4 text-right">Balance</th>
									<th className="font-bold py-4 px-6 text-right w-70">Admin Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
								{data?.users?.map((user: any) => (
									<tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.isBanned ? 'opacity-60 bg-red-50/30' : ''}`}>
										<td className="py-4 px-6">
											<p className={`font-bold ${user.isBanned ? 'text-red-600 line-through' : 'text-gray-900'}`}>{user.name || 'No Name'} {user.role === 'ADMIN' && '👑'}</p>
											<p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
										</td>
										<td className="py-4 px-4 text-center">
											{user.isBanned ? (
												<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700">
													<ShieldAlert className="w-3 h-3" /> Banned
												</span>
											) : (
												<span className={`inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
													{user.role}
												</span>
											)}
										</td>
										<td className="py-4 px-4 text-center font-bold text-gray-600">
											{user._count.generatedAssets}
										</td>
										<td className="py-4 px-4 text-right font-black text-gray-900">
											{user.coinBalance.toLocaleString()} <span className="text-xs font-bold text-gray-400">c</span>
										</td>

										<td className="py-4 px-6 text-right">
											<div className="flex items-center justify-end gap-2 whitespace-nowrap min-w-max">
												{addingCoinToUser === user.id ? (
													<div className="flex items-center justify-end gap-1 animate-in slide-in-from-right-2 duration-300">
														<input
															type="number"
															value={addAmount}
															onChange={(e) => setAddAmount(e.target.value)}
															className="w-16 px-2 py-1.5 text-xs font-bold border border-gray-300 rounded-lg text-center focus:border-red-500 outline-none"
															placeholder="Amt"
														/>
														<button onClick={() => handleAddCoins(user.id)} disabled={isSubmitting} style={{ backgroundColor: '#d1fae5', color: '#047857' }} className="p-1.5 rounded-lg transition-colors">
															{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
														</button>
														<button onClick={() => setAddingCoinToUser(null)} disabled={isSubmitting} style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }} className="p-1.5 rounded-lg transition-colors">
															<X className="w-4 h-4" />
														</button>
													</div>
												) : (
													<button
														onClick={() => { setAddingCoinToUser(user.id); setAddAmount("100"); }}
														disabled={user.isBanned}
														className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all shadow-sm"
													>
														<Plus className="w-3 h-3" /> Coins
													</button>
												)}

												{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
												{user.id !== (session?.user as any)?.id && (
													<button
														onClick={() => openBanModal(user)}
														className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all shadow-sm ${user.isBanned
															? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
															: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
															}`}
													>
														{user.isBanned ? <><Shield className="w-3 h-3" /> Restore</> : <><ShieldAlert className="w-3 h-3" /> Ban</>}
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Modal แจ้งเตือนแบนผู้ใช้ */}
				{banModal.isOpen && (
					<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
						<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">

							<div className="p-6 sm:p-8 text-center">
								<div
									className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner"
									style={{ backgroundColor: banModal.isBanned ? '#d1fae5' : '#fee2e2', color: banModal.isBanned ? '#059669' : '#dc2626' }}
								>
									{banModal.isBanned ? <Shield className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
								</div>

								<h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
									{banModal.isBanned ? 'Restore User Access?' : 'Suspend User Account?'}
								</h3>

								<p className="text-sm text-gray-500 font-medium leading-relaxed">
									{banModal.isBanned
										? <>Are you sure you want to restore access for <strong>{banModal.name}</strong>? They will be able to log in and generate assets again.</>
										: <>Are you sure you want to suspend <strong>{banModal.name}</strong>? They will be immediately blocked from logging in and generating assets.</>}
								</p>
							</div>

							<div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
								<button
									onClick={() => setBanModal({ ...banModal, isOpen: false })}
									className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
								>
									Cancel
								</button>

								{banModal.isBanned ? (
									<button
										onClick={confirmBanAction}
										style={{ backgroundColor: '#059669', color: '#ffffff' }}
										className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all flex justify-center items-center gap-2 shadow-md"
									>
										<Check className="w-4 h-4" /> Yes, Restore
									</button>
								) : (
									<button
										onClick={confirmBanAction}
										style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
										className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all flex justify-center items-center gap-2 shadow-md"
									>
										<ShieldAlert className="w-4 h-4" /> Yes, Suspend
									</button>
								)}
							</div>

						</div>
					</div>
				)}

				{/* Modal แจ้งเตือนปฏิเสธคำขอ Reset Password */}
				{rejectModal.isOpen && (
					<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
						<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">

							<div className="p-6 sm:p-8 text-center">
								<div
									className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner"
									style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
								>
									<X className="w-8 h-8" />
								</div>

								<h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
									Reject Request?
								</h3>

								<p className="text-sm text-gray-500 font-medium leading-relaxed">
									Are you sure you want to reject and delete the password reset request for <strong>{rejectModal.email}</strong>? This action cannot be undone.
								</p>
							</div>

							<div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
								<button
									onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
									className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
								>
									Cancel
								</button>

								<button
									onClick={confirmRejectAction}
									style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
									className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all flex justify-center items-center gap-2 shadow-md"
								>
									<X className="w-4 h-4" /> Yes, Reject
								</button>
							</div>

						</div>
					</div>
				)}

				{/* Modal แสดงลิงก์ให้แอดมินก๊อปปี้ */}
				{generatedLinkModal.isOpen && (
					<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
						<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">

							<div className="p-6 sm:p-8 text-center">
								<div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner bg-green-100 text-green-600">
									<Key className="w-8 h-8" />
								</div>

								<h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
									Link Generated
								</h3>

								<p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
									Please copy this link and send it to <strong>{generatedLinkModal.email}</strong>. It will expire in 15 minutes.
								</p>

								<div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 text-left mb-2">
									<code className="text-xs text-gray-800 break-all flex-1 select-all">{generatedLinkModal.link}</code>
								</div>
							</div>

							<div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
								<button
									onClick={() => setGeneratedLinkModal({ isOpen: false, email: "", link: "" })}
									className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
								>
									Close
								</button>

								<button
									onClick={() => copyToClipboard(generatedLinkModal.link)}
									style={{ backgroundColor: '#111827', color: '#ffffff' }}
									className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all flex justify-center items-center gap-2 shadow-md"
								>
									<Copy className="w-4 h-4" /> Copy Link
								</button>
							</div>

						</div>
					</div>
				)}

			</div>
		</DashboardLayout>
	);
}