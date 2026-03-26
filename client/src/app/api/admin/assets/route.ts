import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// ดึงข้อมูล Asset ทั้งหมด
export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (!session || (session.user as any).role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized." }, { status: 401 });
		}

		const assets = await prisma.generatedAsset.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { name: true, email: true, isBanned: true }
				}
			}
		});

		return NextResponse.json({ status: "success", assets });
	} catch (error) {
		console.error("Fetch Assets Error:", error);
		return NextResponse.json({ status: "error", message: "Failed to fetch assets" }, { status: 500 });
	}
}

// ลบ Asset ทิ้ง
export async function DELETE(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (!session || (session.user as any).role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized." }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const assetId = searchParams.get("id");

		if (!assetId) {
			return NextResponse.json({ status: "error", message: "Asset ID is required" }, { status: 400 });
		}

		await prisma.generatedAsset.delete({
			where: { id: assetId }
		});

		return NextResponse.json({ status: "success", message: "Asset deleted successfully." });
	} catch (error) {
		console.error("Delete Asset Error:", error);
		return NextResponse.json({ status: "error", message: "Failed to delete asset" }, { status: 500 });
	}
}