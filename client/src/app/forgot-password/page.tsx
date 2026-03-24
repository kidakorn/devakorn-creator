/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

const forgotSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
		resolver: zodResolver(forgotSchema),
	});

	const onSubmit = async (data: ForgotFormValues) => {
		setIsLoading(true);
		try {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: data.email }),
			});

			if (res.ok) {
				setIsSuccess(true);
				toast.success("Reset link sent!");
			} else {
				toast.error("Something went wrong. Please try again.");
			}
		} catch (error) {
			toast.error("Network error.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

				<Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-6">
					<ArrowLeft className="w-4 h-4" /> Back to login
				</Link>

				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<Mail className="w-8 h-8" />
					</div>
					<h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot Password?</h1>
					<p className="text-sm text-gray-500 mt-2 font-medium">No worries, we'll send you reset instructions.</p>
				</div>

				{isSuccess ? (
					<div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center">
						<p className="text-emerald-700 font-bold mb-2">Check your email</p>
						<p className="text-sm text-emerald-600 font-medium">We've sent a password reset link to your email address. Please check your inbox (and spam folder).</p>
					</div>
				) : (
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div>
							<label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Email Address</label>
							<input
								{...register("email")}
								type="email"
								placeholder="example@email.com"
								className={`w-full px-4 py-3.5 rounded-xl border bg-gray-50 outline-none transition-colors focus:bg-white font-medium ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-gray-900/50"}`}
							/>
							{errors.email && <p className="text-red-500 text-xs font-bold mt-2">{errors.email.message}</p>}
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-4 px-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
						>
							{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}