import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const assets = await prisma.generatedAsset.findMany({
			where: { 
				isPublic: true,
				type: { in: ["IMAGE"] } // For now, only show public images
			},
			orderBy: { createdAt: 'desc' },
			take: 50,
			select: {
				id: true,
				type: true,
				prompt: true,
				outputUrl: true,
				category: true,
				createdAt: true,
				likeCount: true,
				user: {
					select: {
						name: true,
						image: true
					}
				}
			}
		});

		return NextResponse.json({
			status: "success",
			assets
		});
	} catch (error) {
		console.error("Explore API error:", error);
		return NextResponse.json(
			{ status: "error", message: "Failed to fetch public assets" },
			{ status: 500 }
		);
	}
}
