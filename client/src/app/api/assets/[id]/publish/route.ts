import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		const userId = (session?.user as any)?.id;
		if (!userId) {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { isPublic } = body;
		const { id: assetId } = await params;

		if (typeof isPublic !== "boolean") {
			return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
		}

		// Verify ownership
		const asset = await prisma.generatedAsset.findUnique({
			where: { id: assetId }
		});

		if (!asset) {
			return NextResponse.json({ status: "error", message: "Asset not found" }, { status: 404 });
		}

		if (asset.userId !== userId) {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
		}

		// Update visibility
		const updatedAsset = await prisma.generatedAsset.update({
			where: { id: assetId },
			data: { isPublic }
		});

		return NextResponse.json({
			status: "success",
			message: isPublic ? "Asset published to community" : "Asset is now private",
			asset: updatedAsset
		});
	} catch (error) {
		console.error("Publishing error:", error);
		return NextResponse.json(
			{ status: "error", message: "Internal server error" },
			{ status: 500 }
		);
	}
}
