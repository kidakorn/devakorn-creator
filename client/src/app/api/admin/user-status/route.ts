/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		// 🟢 แก้เส้นแดง: ใส่ (session.user as any)
		if (!session || (session.user as any)?.role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
		}

		const { userId, isBanned } = await req.json();

		if (!userId) {
			return NextResponse.json({ status: "error", message: "User ID is required" }, { status: 400 });
		}

		// 🟢 แก้เส้นแดง: ใส่ (session.user as any) ป้องกันไม่ให้แอดมินแบนตัวเอง
		if (userId === (session.user as any)?.id) {
			return NextResponse.json({ status: "error", message: "You cannot ban yourself" }, { status: 400 });
		}

		// อัปเดตสถานะใน Database
		await prisma.user.update({
			where: { id: userId },
			data: { isBanned }
		});

		const actionText = isBanned ? "banned" : "restored";
		return NextResponse.json({ status: "success", message: `User successfully ${actionText}` });
	} catch (error: any) {
		return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
	}
}