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

		// ดึงค่า new_user_coins จาก SystemSetting
		const setting = await prisma.systemSetting.findUnique({ where: { key: "new_user_coins" } });
		const newUserCoins = setting ? parseInt(setting.value) : 0;

		return NextResponse.json({
			status: "success",
			user: { name: user?.name, email: user?.email },
			newUserCoins,
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
		const { name, email, newUserCoins } = body;

		// บันทึก Admin Profile
		await prisma.user.update({
			where: { email: session.user?.email as string },
			data: { name, email }
		});

		// บันทึก new_user_coins ถ้ามีการส่งมา
		if (newUserCoins !== undefined) {
			const coins = Math.max(0, parseInt(newUserCoins) || 0);
			await prisma.systemSetting.upsert({
				where: { key: "new_user_coins" },
				update: { value: String(coins) },
				create: { key: "new_user_coins", value: String(coins) },
			});
		}

		return NextResponse.json({ status: "success", message: "Settings saved successfully" });
	} catch (error: any) {
		return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
	}
}