/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		// 1. ตรวจสอบว่าใครกำลังเรียกดูข้อมูล
		const session = await getServerSession(authOptions);
		if (!session || !session.user?.email) {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({ where: { email: session.user.email } });
		if (!user) return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

		// 2. ดึงประวัติการสร้างทั้งหมดของยูสเซอร์คนนี้ เรียงจากใหม่ไปเก่า
		const assets = await prisma.generatedAsset.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		});

		return NextResponse.json({ status: "success", assets });

	} catch (error: any) {
		console.error("Fetch Assets Error:", error.message);
		return NextResponse.json({ status: "error", message: "Failed to fetch assets" }, { status: 500 });
	}
}