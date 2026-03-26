/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
	try {
		// 1. ตรวจสอบ Session
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. รับยอดเงินจากหน้าบ้าน
		const body = await req.json();
		const { amount } = body;

		if (!amount || amount < 30) {
			return NextResponse.json({ error: "Minimum amount is 30 THB" }, { status: 400 });
		}

		// 3. สร้างหน้าชำระเงิน
		const stripeSession = await stripe.checkout.sessions.create({
			payment_method_types: ["card", "promptpay"],
			line_items: [
				{
					price_data: {
						currency: "thb",
						product_data: {
							name: "DEVAKORN AI Coins",
							description: `Top up for ${amount * 10} Coins + Bonus`,
						},
						unit_amount: Math.round(amount * 100), // แปลงเป็นสตางค์
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?success=true`,
			cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?canceled=true`,
			customer_email: session.user.email,
			metadata: {
				userEmail: session.user.email, // ส่ง Email เพื่อความแม่นยำในการค้นหาบัญชี
				topupAmount: amount.toString(),
			},
		});

		return NextResponse.json({ url: stripeSession.url });

	} catch (error: any) {
		console.error("Stripe Checkout Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}