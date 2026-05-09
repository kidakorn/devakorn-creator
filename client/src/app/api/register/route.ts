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

		// เข้ารหัสผ่าน
		const hashedPassword = await bcrypt.hash(password, 10);

		// อ่านค่า new_user_coins จาก SystemSetting (Admin ตั้งค่าได้)
		const coinSetting = await prisma.systemSetting.findUnique({ where: { key: "new_user_coins" } });
		const bonusCoins = coinSetting ? Math.max(0, parseInt(coinSetting.value) || 0) : 0;

		// สร้าง User + บันทึก Transaction (ถ้ามี bonus) แบบ Atomic
		const newUser = await prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					coinBalance: bonusCoins,
				}
			});

			// บันทึก Transaction ถ้ามี bonus coins
			if (bonusCoins > 0) {
				await tx.transaction.create({
					data: {
						userId: user.id,
						type: "FREE_BONUS",
						amount: bonusCoins,
						balanceAfter: bonusCoins,
						description: `Welcome bonus — ${bonusCoins} coins`,
					}
				});
			}

			return user;
		});

		return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ!", user: newUser }, { status: 201 });

	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }, { status: 500 });
	}
}