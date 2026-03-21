/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// 🟢 เปลี่ยนข้อความ Error ใน Form เป็นภาษาอังกฤษทั้งหมด
const loginSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);

	const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormValues) => {
		setIsCredentialsLoading(true);
		const res = await signIn("credentials", {
			email: data.email,
			password: data.password,
			redirect: false,
		});
		setIsCredentialsLoading(false);

		if (res?.error) {
			// 🟢 เปลี่ยนแจ้งเตือนเมื่อรหัสผิดเป็นภาษาอังกฤษ
			toast.error("Invalid email or password");
		} else {
			// 🟢 เปลี่ยนเป็นภาษาอังกฤษ และตั้งเวลาให้หายไปไวขึ้นนิดนึง (2.5 วินาที) จะได้ไม่ค้างหน้าจอนานไป
			toast.success("Login successful!", { duration: 2500 });
			router.push("/");
			router.refresh();
		}
	};

	const handleGoogleLogin = async () => {
		setIsGoogleLoading(true);
		await signIn("google", { callbackUrl: "/" });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

				{/* --- ส่วน Header & Logo --- */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-2">
						<img
							src="/favicon.ico"
							alt="DEVAKORN Logo"
							className="w-16 h-16"
						/>
					</div>
					<h1 className="text-2xl font-black text-dark-bg tracking-tight uppercase"><span className="text-primary-red">Creator AI</span></h1>
					<p className="text-sm text-text-main/50 mt-2 font-medium">Sign in to continue your creative journey.</p>
				</div>

				{/* --- ปุ่ม Google Login --- */}
				<button
					onClick={handleGoogleLogin}
					disabled={isGoogleLoading || isCredentialsLoading}
					className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-dark-bg py-3 px-4 rounded-xl font-bold hover:border-dark-bg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
				>
					{isGoogleLoading ? (
						<Loader2 className="w-5 h-5 animate-spin text-text-main/50" />
					) : (
						<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
					)}
					Continue with Google
				</button>

				<div className="flex items-center my-6">
					<div className="flex-1 border-t border-gray-200"></div>
					<span className="px-4 text-xs font-bold text-text-main/40 uppercase tracking-widest">Or login with email</span>
					<div className="flex-1 border-t border-gray-200"></div>
				</div>

				{/* --- ฟอร์ม Email/Password --- */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					<div>
						<label className="block text-xs font-bold text-dark-bg uppercase tracking-wider mb-2">Email Address</label>
						<input
							{...register("email")}
							type="email"
							placeholder="example@email.com"
							className={`w-full px-4 py-3.5 rounded-xl border bg-gray-50 outline-none transition-colors focus:bg-white font-medium ${errors.email ? "border-primary-red focus:border-primary-red" : "border-gray-200 focus:border-dark-bg/50"
								}`}
						/>
						{errors.email && <p className="text-primary-red text-xs font-bold mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary-red"></span>{errors.email.message}</p>}
					</div>

					<div>
						<label className="block text-xs font-bold text-dark-bg uppercase tracking-wider mb-2">Password</label>
						<input
							{...register("password")}
							type="password"
							placeholder="••••••••"
							className={`w-full px-4 py-3.5 rounded-xl border bg-gray-50 outline-none transition-colors focus:bg-white font-medium ${errors.password ? "border-primary-red focus:border-primary-red" : "border-gray-200 focus:border-dark-bg/50"
								}`}
						/>
						{errors.password && <p className="text-primary-red text-xs font-bold mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary-red"></span>{errors.password.message}</p>}
					</div>

					<button
						type="submit"
						disabled={isCredentialsLoading || isGoogleLoading}
						className="w-full flex items-center justify-center gap-2 bg-primary-red text-white py-4 px-4 rounded-xl font-bold hover:bg-dark-bg transition-colors shadow-lg shadow-dark-bg/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
					>
						{isCredentialsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
						Sign In
					</button>
				</form>

				<p className="text-center text-sm text-gray-500 mt-8">
					Don&apos;t have an account?{" "}
					<Link href="/register" className="text-red-600 font-bold hover:underline">
						Sign Up
					</Link>
				</p>

			</div>
		</div>
	);
}