/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || (session.user as any).role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized. Admin only." }, { status: 401 });
		}

		const { requestId } = await req.json();

		const resetRequest = await prisma.passwordResetToken.findUnique({
			where: { id: requestId }
		});

		if (!resetRequest || resetRequest.status !== "PENDING") {
			return NextResponse.json({ status: "error", message: "Request not found or already processed." }, { status: 400 });
		}

		// อัปเดตสถานะเป็น APPROVED และตั้งเวลาหมดอายุเป็น 15 นาที
		const newExpires = new Date(new Date().getTime() + 15 * 60 * 1000);

		await prisma.passwordResetToken.update({
			where: { id: requestId },
			data: {
				status: "APPROVED",
				expires: newExpires
			}
		});

		// สร้างลิงก์สำหรับส่งต่อให้ลูกค้า
		const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetRequest.token}`;

		// ส่งลิงก์กลับไปให้หน้า Admin Dashboard แทนการส่งอีเมล
		return NextResponse.json({
			status: "success",
			message: "Request approved and link generated.",
			link: resetLink,
			email: resetRequest.email
		});
	} catch (error: any) {
		console.error("Approve Reset Error:", error);
		return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
	}
}