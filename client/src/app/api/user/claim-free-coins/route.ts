/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user?.email) {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
		}

		// รับรหัสเครื่อง (visitorId) ที่ส่งมาจากหน้าบ้าน
		const { visitorId } = await req.json();
		if (!visitorId) {
			return NextResponse.json({ status: "error", message: "Device ID is required" }, { status: 400 });
		}

		const user = await prisma.user.findUnique({ where: { email: session.user.email } });
		if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

		// 🛡️ เช็คด่านที่ 1: บัญชีนี้เคยกดรับไปหรือยัง?
		if (user.hasClaimedFreeCoins) {
			return NextResponse.json({ status: "error", message: "คุณได้รับสิทธิ์ 50 เหรียญฟรีไปแล้ว" }, { status: 403 });
		}

		// 🛡️ เช็คด่านที่ 2: คอมพิวเตอร์/มือถือ เครื่องนี้เคยกดรับไปหรือยัง?
		const existingDevice = await prisma.deviceFingerprint.findUnique({
			where: { visitorId: visitorId }
		});

		if (existingDevice) {
			return NextResponse.json({
				status: "error",
				message: "อุปกรณ์นี้ถูกใช้รับสิทธิ์ไปแล้ว (จำกัด 1 สิทธิ์ / 1 อุปกรณ์)"
			}, { status: 403 });
		}

		const BONUS_AMOUNT = 50;

		// 💰 ทำการแจกเหรียญ (ใช้ Transaction เพื่อความชัวร์ว่าทุกอย่างบันทึกพร้อมกัน)
		await prisma.$transaction([
			// 1. เพิ่มเหรียญและเปลี่ยนสถานะว่ารับแล้ว
			prisma.user.update({
				where: { id: user.id },
				data: {
					coinBalance: { increment: BONUS_AMOUNT },
					hasClaimedFreeCoins: true
				}
			}),

			// 2. จดจำรหัสเครื่องนี้ลง Database
			prisma.deviceFingerprint.create({
				data: {
					visitorId: visitorId,
					userId: user.id
				}
			}),

			// 3. บันทึกประวัติลงสมุดบัญชี (Ledger)
			prisma.transaction.create({
				data: {
					userId: user.id,
					type: 'FREE_BONUS', // หมวดหมู่ที่เราเพิ่งเพิ่มไป
					amount: BONUS_AMOUNT,
					balanceAfter: user.coinBalance + BONUS_AMOUNT,
					description: "Claimed New User Free 50 Coins",
					status: 'COMPLETED',
				}
			})
		]);

		return NextResponse.json({
			status: "success",
			message: "ยินดีด้วย! คุณได้รับ 50 เหรียญฟรีเรียบร้อยแล้ว",
			newBalance: user.coinBalance + BONUS_AMOUNT
		});

	} catch (error: any) {
		console.error("Claim Free Coins Error:", error.message);
		return NextResponse.json({ status: "error", message: "Failed to claim free coins" }, { status: 500 });
	}
}