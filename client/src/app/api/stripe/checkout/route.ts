/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

// 🟢 แก้เส้นแดงด้วยการใช้ as any เพื่อบอก TypeScript ให้ผ่านไปได้เลย
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
	try {
		// 1. เช็คว่าลูกค้าล็อกอินอยู่ไหม
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. รับรหัส priceId ที่หน้าบ้านส่งมาให้
		const body = await req.json();
		const { priceId } = body;

		if (!priceId) {
			return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
		}

		// 3. สร้างหน้าชำระเงินของ Stripe
		const stripeSession = await stripe.checkout.sessions.create({
			payment_method_types: ["card", "promptpay"],
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?success=true`,
			cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?canceled=true`,
			customer_email: session.user.email,
			metadata: {
				userId: (session.user as any).id, // 🟢 แอบแนบ ID ลูกค้าไปกับบิลด้วย
			},
		});

		// 4. ส่ง URL หน้าจ่ายเงินกลับไปให้หน้าบ้าน
		return NextResponse.json({ url: stripeSession.url });

	} catch (error: any) {
		console.error("Stripe Checkout Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}