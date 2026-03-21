/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
	try {
		console.log("--- 🕵️‍♂️ Starting Webhook Receiver ---");

		const payload = await req.text();
		const signature = req.headers.get("stripe-signature");

		if (!signature) {
			console.log("❌ Error: Missing Signature");
			return new NextResponse("No signature", { status: 400 });
		}

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(
				payload,
				signature,
				process.env.STRIPE_WEBHOOK_SECRET || ""
			);
		} catch (err: any) {
			console.error("❌ Signature verification failed:", err.message);
			return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
		}

		if (event.type === "checkout.session.completed") {
			const session = event.data.object as Stripe.Checkout.Session;

			const userEmail = session.customer_details?.email || session.customer_email;
			const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
			// 🟢 ใช้ session.id เป็นรหัสบิลอ้างอิง เพื่อป้องกันการรันซ้ำ
			const referenceId = session.id;

			console.log(`💰 Payment successful: ${amountTotal} THB | Email: ${userEmail || "No Email found"}`);

			let coinsToAdd = 0;
			if (amountTotal === 50) coinsToAdd = 150;
			else if (amountTotal === 149) coinsToAdd = 500;
			else if (amountTotal === 499) coinsToAdd = 2200;
			else if (amountTotal === 999) coinsToAdd = 6000;

			if (userEmail && coinsToAdd > 0) {
				try {
					// 🟢 1. อัปเดตเหรียญให้ลูกค้า และดึงข้อมูล User ล่าสุดกลับมา
					const updatedUser = await prisma.user.update({
						where: { email: userEmail },
						data: { coinBalance: { increment: coinsToAdd } },
					});

					// 🟢 2. สร้างบันทึกประวัติ (Transaction History)
					await prisma.transaction.create({
						data: {
							userId: updatedUser.id,
							type: 'TOPUP', // ประเภทการเติมเงิน
							amount: coinsToAdd, // จำนวนเหรียญที่ได้
							balanceAfter: updatedUser.coinBalance, // ยอดคงเหลือล่าสุด
							description: `Top-up: ${amountTotal} THB package`, // รายละเอียดบิล
							referenceId: referenceId, // รหัสบิลอ้างอิงจาก Stripe
							status: 'COMPLETED' // สถานะสำเร็จ
						}
					});

					console.log(`🎉 Success!! Added ${coinsToAdd} coins and recorded transaction for Email: ${userEmail}`);
				} catch (dbError) {
					console.error("❌ Database error while adding coins/transaction:", dbError);
				}
			} else {
				console.log("⚠️ Coins not added: Missing Email or price doesn't match packages");
			}
		}

		console.log("--- 🏁 Webhook processing completed ---");
		return new NextResponse("Webhook received", { status: 200 });

	} catch (error: any) {
		console.error("🔥 CRITICAL ERROR detected:", error);
		return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
	}
}