import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
	try {
		const { email } = await req.json();

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !user.password) {
			return NextResponse.json({ status: "success", message: "If an account exists, your request has been sent to the admin." });
		}

		// สร้างโค้ดลับ (Token) จำเพาะสำหรับคำขอนี้
		const token = uuidv4();
		// ตั้งเวลาหมดอายุหลอกไว้ก่อน 24 ชั่วโมง (เมื่อ Admin กดอนุมัติ เราจะหดเวลาลงเหลือ 15 นาที)
		const expires = new Date(new Date().getTime() + 24 * 3600 * 1000);

		// บันทึกคำขอลง Database โดยสถานะเริ่มต้นจะเป็น PENDING
		await prisma.passwordResetToken.deleteMany({ where: { email } });
		await prisma.passwordResetToken.create({
			data: {
				email,
				token,
				expires,
				status: "PENDING"
			}
		});

		return NextResponse.json({ status: "success", message: "Your request has been sent to the admin for approval." });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error("Forgot Password Request Error:", error);
		return NextResponse.json({ status: "error", message: "Failed to submit request." }, { status: 500 });
	}
}