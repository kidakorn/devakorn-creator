/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session || (session.user as any)?.role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
		}

		const user = await prisma.user.findUnique({ where: { email: session.user?.email as string } });

		return NextResponse.json({
			status: "success",
			user: { name: user?.name, email: user?.email },
		});
	} catch (error: any) {
		return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || (session.user as any)?.role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
		}

		const body = await req.json();
		const { name, email } = body;

		await prisma.user.update({
			where: { email: session.user?.email as string },
			data: { name, email }
		});

		return NextResponse.json({ status: "success", message: "Profile saved successfully" });
	} catch (error: any) {
		return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
	}
}