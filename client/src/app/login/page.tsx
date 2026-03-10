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

const loginSchema = z.object({
	email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
	password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
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
			toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
		} else {
			toast.success("เข้าสู่ระบบสำเร็จ!");
			router.push("/");
			router.refresh();
		}
	};

	const handleGoogleLogin = async () => {
		setIsGoogleLoading(true);
		await signIn("google", { callbackUrl: "/" });
	};

	return (
		// 🟢 เปลี่ยนพื้นหลังเป็นสีเทาอ่อนให้ตัดกับ Card สีขาว
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			{/* 🟢 ใส่เงาให้ Card ดูลอยขึ้นมาและมนขึ้น (rounded-3xl) */}
			<div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

				{/* --- ส่วน Header & Logo --- */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-2">
						{/* 🟢 เรียกใช้ favicon.ico แทนตัวอักษร D */}
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
						// /eslint-disable-next-line @next/next/no-img-element
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

					{/* 🟢 ปุ่ม Login หลัก ใช้สี dark-bg (ดำสนิท) ตัดกับลูกเล่น hover เป็นสีแดง primary-red */}
					<button
						type="submit"
						disabled={isCredentialsLoading || isGoogleLoading}
						className="w-full flex items-center justify-center gap-2 bg-primary-red text-white py-4 px-4 rounded-xl font-bold hover:bg-dark-bg transition-colors shadow-lg shadow-dark-bg/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
					>
						{isCredentialsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
						Sign In
					</button>
				</form>

			</div>
		</div>
	);
}