/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 🟢 1. สร้างกฎเกณฑ์ (Schema) สำหรับเช็คความถูกต้อง
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address format"),
  
  // 🔐 อัปเกรดความปลอดภัยรหัสผ่าน
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least 1 special character"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	// 🟢 2. เรียกใช้ React Hook Form
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
	});

	

	const onSubmit = async (data: RegisterFormValues) => {
		setLoading(true);

		try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await res.json();

			if (res.ok) {
				toast.success("Account created successfully!");
				router.push("/login");
			} else {
				toast.error(result.message || "Registration failed");
			}
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

				<div className="text-center mb-8">
					<div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
						<img src="/favicon.ico" alt="DEVAKORN Logo" className="w-12 h-12 rounded-md" />
					</div>
					<h1 className="text-2xl font-black text-dark-bg">Create an Account</h1>
					<p className="text-sm text-text-main/60 mt-2">Join Creator AI today.</p>
				</div>

				{/* 🟢 3. ผูก Form เข้ากับฟังก์ชัน handleSubmit */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<label className="text-xs font-bold text-dark-bg uppercase tracking-wider">Full Name</label>
						<input
							type="text"
							{...register("name")} // ผูก input กับกฎเกณฑ์
							className={`w-full mt-1.5 px-4 py-3 bg-light-gray/30 border rounded-xl text-sm outline-none transition-all ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:bg-white focus:border-primary-red/40"
								}`}
						/>
						{errors.name && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name.message}</p>}
					</div>

					<div>
						<label className="text-xs font-bold text-dark-bg uppercase tracking-wider">Email Address</label>
						<input
							type="email"
							{...register("email")}
							className={`w-full mt-1.5 px-4 py-3 bg-light-gray/30 border rounded-xl text-sm outline-none transition-all ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:bg-white focus:border-primary-red/40"
								}`}
						/>
						{errors.email && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email.message}</p>}
					</div>

					<div>
						<label className="text-xs font-bold text-dark-bg uppercase tracking-wider">Password</label>
						<input
							type="password"
							{...register("password")}
							className={`w-full mt-1.5 px-4 py-3 bg-light-gray/30 border rounded-xl text-sm outline-none transition-all ${errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:bg-white focus:border-primary-red/40"
								}`}
						/>
						{errors.password && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.password.message}</p>}
					</div>

					<button
						type="submit" disabled={loading}
						className="w-full mt-6 bg-primary-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
					>
						{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
					</button>
				</form>

				<p className="text-center text-sm text-text-main/60 mt-8">
					Already have an account?{" "}
					<Link href="/login" className="text-primary-red font-bold hover:underline">Sign In</Link>
				</p>

			</div>
		</div>
	);
}