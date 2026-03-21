/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
		}

		const { userId, amount } = await req.json();
		const parsedAmount = parseInt(amount);

		if (!userId || isNaN(parsedAmount) || parsedAmount <= 0) {
			return NextResponse.json({ status: "error", message: "Invalid amount" }, { status: 400 });
		}

		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

		// 💰 ทำ 2 อย่างพร้อมกัน: 1.เพิ่มเหรียญ 2.จดบันทึกลงสมุดบัญชีว่าแอดมินเป็นคนเสกให้
		await prisma.$transaction([
			prisma.user.update({
				where: { id: userId },
				data: { coinBalance: { increment: parsedAmount } }
			}),
			prisma.transaction.create({
				data: {
					userId: userId,
					type: 'TOPUP',
					amount: parsedAmount,
					balanceAfter: user.coinBalance + parsedAmount,
					description: `System Admin manually added ${parsedAmount} coins`,
					status: 'COMPLETED'
				}
			})
		]);

		return NextResponse.json({ status: "success", message: `Added ${parsedAmount} coins to ${user.name || user.email}` });
	} catch (error: any) {
		return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
	}
}