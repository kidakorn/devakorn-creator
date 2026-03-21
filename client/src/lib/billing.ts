/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export async function deductCoins({
	userId,
	amount,
	type,
	description
}: {
	userId: string;
	amount: number;
	type: TransactionType;
	description: string;
}) {
	try {
		// 1. เช็คยอดเงินของลูกค้าก่อนว่าพอจ่ายไหม
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { coinBalance: true }
		});

		if (!user) throw new Error("User not found");
		if (user.coinBalance < amount) throw new Error("Insufficient coins"); // เหรียญไม่พอ!

		// 2. ใช้ prisma.$transaction เพื่อให้แน่ใจว่า หักเงิน+เขียนใบเสร็จ ทำงานพร้อมกันสำเร็จ 100%
		const result = await prisma.$transaction(async (tx) => {
			// หักเหรียญ (-amount)
			const updatedUser = await tx.user.update({
				where: { id: userId },
				data: { coinBalance: { decrement: amount } }
			});

			// เขียนประวัติลงตาราง
			const transaction = await tx.transaction.create({
				data: {
					userId,
					type, // เช่น SPEND_IMAGE หรือ SPEND_VIDEO
					amount: -amount, // 🟢 ใส่เครื่องหมายลบ เพื่อให้รู้ว่าเป็นรายจ่าย
					balanceAfter: updatedUser.coinBalance,
					description,
					status: 'COMPLETED'
				}
			});

			return { success: true, balance: updatedUser.coinBalance, transaction };
		});

		return result;

	} catch (error: any) {
		console.error("Coin Deduction Error:", error.message);
		return { success: false, error: error.message };
	}
}