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

		// ลบคำขอออกจากฐานข้อมูล
		await prisma.passwordResetToken.delete({
			where: { id: requestId }
		});

		return NextResponse.json({ status: "success", message: "Request rejected and removed." });
	} catch (error: any) {
		console.error("Reject Reset Error:", error);
		return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
	}
}