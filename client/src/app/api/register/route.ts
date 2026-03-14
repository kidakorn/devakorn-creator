import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, email, password } = body;

		// เช็คว่ากรอกข้อมูลครบไหม
		if (!email || !password) {
			return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
		}

		// เช็คว่ามีอีเมลนี้ในระบบแล้วหรือยัง
		const existingUser = await prisma.user.findUnique({
			where: { email: email }
		});

		if (existingUser) {
			return NextResponse.json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" }, { status: 409 });
		}

		// เข้ารหัสผ่านให้เป็นข้อความที่อ่านไม่ออก (เพื่อความปลอดภัยสูงสุด)
		const hashedPassword = await bcrypt.hash(password, 10);

		// บันทึก User ลงฐานข้อมูล (แถมฟรี 100 เหรียญตาม Schema ที่เราตั้งไว้!)
		const newUser = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			}
		});

		return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ!", user: newUser }, { status: 201 });

	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }, { status: 500 });
	}
}