/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession();

		// ถ้ายังไม่ได้ล็อกอิน ให้ส่งยอดกลับไปเป็น 0
		if (!session?.user?.email) {
			return NextResponse.json({ coinBalance: 0 }, { status: 401 });
		}

		// ค้นหา User จาก Database ตรงๆ เพื่อเอายอดเงินล่าสุด
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { coinBalance: true }
		});

		return NextResponse.json({ coinBalance: user?.coinBalance || 0 });
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
	}
}