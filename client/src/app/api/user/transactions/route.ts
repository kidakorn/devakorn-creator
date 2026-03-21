import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession();

		// เช็คว่าล็อกอินหรือยัง
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 1. ค้นหา User ปัจจุบัน
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true }
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// 2. ดึงประวัติทั้งหมดของ User คนนี้ โดยเรียงจากใหม่ไปเก่า (desc) เอาแค่ 20 รายการล่าสุด
		const transactions = await prisma.transaction.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			take: 20
		});

		return NextResponse.json({ transactions });

	} catch (error) {
		console.error("Failed to fetch transactions:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}