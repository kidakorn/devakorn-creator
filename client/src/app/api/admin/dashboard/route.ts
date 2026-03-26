/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		// ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะ Admin เท่านั้น)
		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
		}

		// 1. ดึงข้อมูล User ทั้งหมด
		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				coinBalance: true,
				role: true,
				isBanned: true,
				createdAt: true,
				_count: { select: { generatedAssets: true } }
			}
		});

		// 2. ดึงข้อมูลและแยกประเภทการสร้างผลงาน (เพื่อนำไปคำนวณต้นทุน)
		const assetCounts = await prisma.generatedAsset.groupBy({
			by: ['type'],
			_count: { type: true }
		});

		let imageCount = 0;
		let videoCount = 0;
		let promptCount = 0;

		assetCounts.forEach(item => {
			if (item.type === 'IMAGE') imageCount = item._count.type;
			if (item.type === 'VIDEO') videoCount = item._count.type;
			if (item.type === 'PROMPT') promptCount = item._count.type;
		});

		const totalAssets = imageCount + videoCount + promptCount;

		// 3. คำนวณรายได้จากประวัติการเติมเงิน (ค้นหาจากคำว่า THB ในรายละเอียด)
		const topupTransactions = await prisma.transaction.findMany({
			where: {
				type: 'TOPUP',
				status: 'COMPLETED'
			},
			select: { description: true, amount: true }
		});

		let totalRevenue = 0;
		topupTransactions.forEach(tx => {
			const match = tx.description?.match(/THB (\d+)/i);
			if (match && match[1]) {
				totalRevenue += parseInt(match[1], 10);
			} else {
				totalRevenue += tx.amount / 10;
			}
		});

		// 4. คำนวณต้นทุน (อิงจากราคา API Google Cloud ที่ประเมินไว้)
		const COST_PER_IMAGE_THB = 1.4;
		const COST_PER_VIDEO_THB = 14.0;
		const COST_PER_PROMPT_THB = 0.1;

		const totalCost = (imageCount * COST_PER_IMAGE_THB) +
			(videoCount * COST_PER_VIDEO_THB) +
			(promptCount * COST_PER_PROMPT_THB);

		// 5. คำนวณกำไรสุทธิ
		const netProfit = totalRevenue - totalCost;

		// 6. ข้อมูลอื่นๆ
		const totalUsers = users.length;
		const totalCoinsInSystem = users.reduce((sum, user) => sum + user.coinBalance, 0);

		const pendingResets = await prisma.passwordResetToken.findMany({
			where: { status: "PENDING" },
			orderBy: { createdAt: "desc" }
		});

		return NextResponse.json({
			status: "success",
			stats: {
				totalUsers,
				totalAssets,
				totalCoinsInSystem,
				imageCount,
				videoCount,
				promptCount,
				totalRevenue,
				totalCost,
				netProfit
			},
			users,
			pendingResets: pendingResets
		});
	} catch (error: any) {
		return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
	}
}