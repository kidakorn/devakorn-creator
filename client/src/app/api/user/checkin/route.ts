/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const REWARD_TIERS = [5, 10, 15, 20, 25, 30, 50];

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		const currentUser = session?.user as { id?: string } | undefined;

		if (!currentUser?.id) {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
		}

		// 🟢 1. ดึง ID ออกมาให้เป็น string ชัดเจน (แก้เส้นแดง TS)
		const userId = currentUser.id;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, checkInStreak: true, lastCheckIn: true, coinBalance: true }
		});

		if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		let lastCheckInDate = null;
		if (user.lastCheckIn) {
			lastCheckInDate = new Date(user.lastCheckIn.getFullYear(), user.lastCheckIn.getMonth(), user.lastCheckIn.getDate());
		}

		if (lastCheckInDate && lastCheckInDate.getTime() === today.getTime()) {
			return NextResponse.json({
				status: "error",
				message: "You already claimed your reward today. Come back tomorrow!"
			}, { status: 400 });
		}

		let newStreak = 1;
		if (lastCheckInDate && lastCheckInDate.getTime() === yesterday.getTime()) {
			newStreak = user.checkInStreak >= 7 ? 1 : user.checkInStreak + 1;
		}

		const rewardAmount = REWARD_TIERS[newStreak - 1];

		let newBalance = 0;
		await prisma.$transaction(async (tx) => {
			const updatedUser = await tx.user.update({
				where: { id: userId },
				data: {
					coinBalance: { increment: rewardAmount },
					checkInStreak: newStreak,
					lastCheckIn: now
				}
			});
			newBalance = updatedUser.coinBalance;

			// 🟢 2. ใช้ userId และ "as any" ข้ามการแจ้งเตือนจุกจิกของ VS Code
			await tx.transaction.create({
				data: {
					userId: userId,
					type: "DAILY_CHECKIN" as any,
					amount: rewardAmount,
					balanceAfter: newBalance,
					description: `Daily Check-in Day ${newStreak}`,
					referenceId: `checkin_${userId}_${today.getTime()}`
				}
			});
		});

		return NextResponse.json({
			status: "success",
			// 🟢 3. เอา Emoji 🎁 ออกจากตรงนี้
			message: `Day ${newStreak} Claimed! You got ${rewardAmount} free coins`,
			newBalance,
			streak: newStreak
		});

	} catch (error) {
		console.error("Check-in Error:", error);
		return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
	}
}