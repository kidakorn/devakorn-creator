/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		// 🛡️ ดักไว้ก่อนเลย! ถ้าไม่ใช่แอดมิน ห้ามเรียก API นี้เด็ดขาด
		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
		}

		// ดึงข้อมูล User ทั้งหมด พร้อมนับจำนวนผลงานที่แต่ละคนเจนไป
		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				coinBalance: true,
				role: true,
				createdAt: true,
				_count: { select: { generatedAssets: true } }
			}
		});

		// คำนวณสถิติรวมของทั้งระบบ
		const totalUsers = users.length;
		const totalAssets = await prisma.generatedAsset.count();
		const totalCoinsInSystem = users.reduce((sum, user) => sum + user.coinBalance, 0);

		return NextResponse.json({
			status: "success",
			stats: { totalUsers, totalAssets, totalCoinsInSystem },
			users
		});
	} catch (error: any) {
		return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
	}
}