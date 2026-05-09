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

		// รับรหัสเครื่อง (visitorId) จากหน้าบ้าน
		const { visitorId } = await req.json();
		if (!visitorId) {
			return NextResponse.json({ status: "error", message: "Device ID is required" }, { status: 400 });
		}

		// ดึงข้อมูล User
		const user = await prisma.user.findUnique({ where: { email: session.user.email } });
		if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

		// 🛡️ 1. อ่านค่าจาก Settings ที่แอดมินตั้งไว้
		const coinSetting = await prisma.systemSetting.findUnique({ where: { key: "new_user_coins" } });
		const BONUS_AMOUNT = coinSetting ? Math.max(0, parseInt(coinSetting.value) || 0) : 0;

		if (BONUS_AMOUNT <= 0) {
			return NextResponse.json({ 
				status: "error", 
				message: "ขออภัย ขณะนี้ยังไม่มีโปรโมชั่นแจกเหรียญฟรี" 
			}, { status: 400 });
		}

		// 🛡️ 2. เช็คว่าบัญชีนี้เคยกดรับไปหรือยัง?
		if (user.hasClaimedFreeCoins) {
			return NextResponse.json({ 
				status: "error", 
				message: `คุณได้รับสิทธิ์ ${BONUS_AMOUNT} เหรียญฟรีไปแล้ว` 
			}, { status: 403 });
		}

		// 🛡️ 3. เช็คว่ารหัสเครื่องนี้เคยกดรับไปหรือยัง?
		const existingDevice = await prisma.deviceFingerprint.findUnique({
			where: { visitorId: visitorId }
		});

		if (existingDevice) {
			return NextResponse.json({
				status: "error",
				message: "อุปกรณ์นี้ถูกใช้รับสิทธิ์ไปแล้ว (จำกัด 1 สิทธิ์ / 1 อุปกรณ์)"
			}, { status: 403 });
		}

		// 🛡️ 4. ดึง IP Address
		const forwarded = req.headers.get("x-forwarded-for");
		const realIp = req.headers.get("x-real-ip");
		const userIp = forwarded ? forwarded.split(',')[0] : (realIp || "127.0.0.1");

		// 💰 5. ทำการแจกเหรียญแบบ Transaction
		await prisma.$transaction([
			// เพิ่มเหรียญและเปลี่ยนสถานะ
			prisma.user.update({
				where: { id: user.id },
				data: {
					coinBalance: { increment: BONUS_AMOUNT },
					hasClaimedFreeCoins: true
				}
			}),

			// จดจำรหัสเครื่องและ IP
			prisma.deviceFingerprint.create({
				data: {
					visitorId: visitorId,
					userId: user.id,
					ip: userIp
				}
			}),

			// บันทึกประวัติ Transaction
			prisma.transaction.create({
				data: {
					userId: user.id,
					type: 'FREE_BONUS',
					amount: BONUS_AMOUNT,
					balanceAfter: user.coinBalance + BONUS_AMOUNT,
					description: `Claimed New User Free ${BONUS_AMOUNT} Coins`,
					status: 'COMPLETED',
				}
			})
		]);

		return NextResponse.json({
			status: "success",
			message: `ยินดีด้วย! คุณได้รับ ${BONUS_AMOUNT} เหรียญฟรีเรียบร้อยแล้ว`,
			newBalance: user.coinBalance + BONUS_AMOUNT
		});

	} catch (error: any) {
		console.error("Claim Free Coins Error:", error.message);
		return NextResponse.json({ 
			status: "error", 
			message: "เกิดข้อผิดพลาดในการรับเหรียญ โปรดลองใหม่อีกครั้ง" 
		}, { status: 500 });
	}
}