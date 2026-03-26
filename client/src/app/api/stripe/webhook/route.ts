/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
	try {
		console.log("--- Starting Webhook Receiver (Fixed Email Metadata) ---");

		const payload = await req.text();
		const signature = req.headers.get("stripe-signature");

		if (!signature) {
			console.log("Error: Missing Signature");
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
			console.error("Signature verification failed:", err.message);
			return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
		}

		if (event.type === "checkout.session.completed") {
			const session = event.data.object as Stripe.Checkout.Session;

			// 1. ดึง Email และ Amount จาก Metadata
			const userEmail = session.metadata?.userEmail || session.customer_details?.email || session.customer_email;
			const amountTHB = parseInt(session.metadata?.topupAmount || "0");
			const referenceId = session.id;

			console.log(`Payment successful: THB ${amountTHB} | Email: ${userEmail}`);

			if (userEmail && amountTHB > 0) {
				// 2. คำนวณเหรียญและโบนัส
				const baseCoins = amountTHB * 10;
				let bonusPercent = 0;

				if (amountTHB >= 999) bonusPercent = 15;
				else if (amountTHB >= 499) bonusPercent = 10;
				else if (amountTHB >= 199) bonusPercent = 5;

				const bonusCoins = Math.floor(baseCoins * (bonusPercent / 100));
				const totalCoinsToAdd = baseCoins + bonusCoins;

				try {
					// 3. ค้นหา User ด้วย Email และอัปเดตเหรียญ
					const updatedUser = await prisma.user.update({
						where: { email: userEmail },
						data: { coinBalance: { increment: totalCoinsToAdd } },
					});

					await prisma.transaction.create({
						data: {
							userId: updatedUser.id,
							type: 'TOPUP',
							amount: totalCoinsToAdd,
							balanceAfter: updatedUser.coinBalance,
							description: `Top-up: THB ${amountTHB} (+${bonusPercent}% Bonus)`,
							referenceId: referenceId,
							status: 'COMPLETED'
						}
					});

					console.log(`Success! Added ${totalCoinsToAdd} coins to ${userEmail}`);
				} catch (dbError) {
					console.error("Database error while adding coins:", dbError);
				}
			} else {
				console.log("Warning: Coins not added. Missing Email or Invalid Amount");
			}
		}

		console.log("--- Webhook processing completed ---");
		return new NextResponse("Webhook received", { status: 200 });

	} catch (error: any) {
		console.error("CRITICAL ERROR detected:", error);
		return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
	}
}