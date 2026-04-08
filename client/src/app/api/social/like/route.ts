import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		const currentUser = session?.user as { id?: string; name?: string; email?: string } | undefined;

		if (!currentUser?.id) {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
		}

		const userId = currentUser.id;
		const body = await req.json();
		const { assetId } = body;

		if (!assetId) {
			return NextResponse.json({ status: "error", message: "Asset ID is required" }, { status: 400 });
		}

		// ค้นหาผลงานที่ต้องการกด Like
		const asset = await prisma.generatedAsset.findUnique({
			where: { id: assetId },
			select: { id: true, userId: true, likeCount: true }
		});

		if (!asset) {
			return NextResponse.json({ status: "error", message: "Asset not found" }, { status: 404 });
		}

		// 🟢 เอาโค้ดที่บล็อกการกดไลก์งานตัวเองออกไปแล้วครับ ตรงนี้โล่งๆ เลย!

		// เช็คว่า User คนนี้เคยกด Like ผลงานนี้ไปแล้วหรือยัง
		const existingLike = await prisma.like.findUnique({
			where: {
				userId_assetId: {
					userId: userId,
					assetId: assetId,
				}
			}
		});

		let isLiked = false;
		let newLikeCount = asset.likeCount;

		// เริ่ม Prisma Transaction
		await prisma.$transaction(async (tx) => {
			if (existingLike) {
				// กรณี: เคย Like แล้ว (Unlike)
				await tx.like.delete({ where: { id: existingLike.id } });
				await tx.generatedAsset.update({
					where: { id: assetId },
					data: { likeCount: { decrement: 1 } }
				});
				isLiked = false;
				newLikeCount -= 1;
			} else {
				// กรณี: ยังไม่เคย Like (Like)
				await tx.like.create({ data: { userId, assetId } });
				const updatedAsset = await tx.generatedAsset.update({
					where: { id: assetId },
					data: { likeCount: { increment: 1 } }
				});
				isLiked = true;
				newLikeCount += 1;

				// S2E Logic: แจกเหรียญอัตโนมัติเมื่อ Like ครบกำหนด
				const REWARD_MILESTONE = 5;
				const REWARD_AMOUNT = 1;

				if (updatedAsset.likeCount > 0 && updatedAsset.likeCount % REWARD_MILESTONE === 0) {
					const creator = await tx.user.findUnique({
						where: { id: asset.userId },
						select: { id: true, coinBalance: true }
					});

					if (creator) {
						await tx.user.update({
							where: { id: creator.id },
							data: { coinBalance: { increment: REWARD_AMOUNT } }
						});

						await tx.transaction.create({
							data: {
								userId: creator.id,
								type: "EARN_CREATOR_REWARD",
								amount: REWARD_AMOUNT,
								balanceAfter: creator.coinBalance + REWARD_AMOUNT,
								description: `Reward for hitting ${updatedAsset.likeCount} likes!`,
								referenceId: `reward_${assetId}_likes_${updatedAsset.likeCount}`
							}
						});
					}
				}
			}
		});

		return NextResponse.json({ status: "success", isLiked, likeCount: newLikeCount });

	} catch (error) {
		console.error("Like API Error:", error);
		if (error instanceof Error && error.message.includes('Unique constraint failed')) {
			return NextResponse.json({ status: "success", message: "Liked, but reward already issued." }, { status: 200 });
		}
		return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
	}
}