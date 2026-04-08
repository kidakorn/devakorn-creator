/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let currentUserId: string | undefined = undefined;

    try {
      const session = await getServerSession(authOptions);
      const currentUser = session?.user as { id?: string } | undefined;
      currentUserId = currentUser?.id;
    } catch (e) {
      console.warn("Session check skipped.");
    }

    const searchParams = req.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 8;
    const skip = (page - 1) * limit;

    let dateFilter = {};
    if (start && end) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { gte: startDate, lte: endDate } };
    }

    // 🟢 1. กรองนับเฉพาะผลงานของ "USER" เท่านั้น (ซ่อนแอดมิน)
    const totalAssetsInFeed = await prisma.generatedAsset.count({
      where: { type: { in: ["IMAGE", "VIDEO"] }, user: { role: "USER" }, ...dateFilter }
    });
    const totalPages = Math.ceil(totalAssetsInFeed / limit);

    const queryInclude: any = {
      user: { select: { name: true } }
    };

    if (currentUserId) {
      queryInclude.likes = {
        where: { userId: currentUserId },
        select: { id: true }
      };
    }

    // 🟢 2. ดึงข้อมูลเฉพาะของ "USER" เท่านั้น (ซ่อนแอดมิน)
    const rawAssets = await prisma.generatedAsset.findMany({
      where: { type: { in: ["IMAGE", "VIDEO"] }, user: { role: "USER" }, ...dateFilter },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: skip,
      include: queryInclude
    });

    const formattedAssets = rawAssets.map((asset: any) => ({
        id: asset.id,
        type: asset.type,
        prompt: asset.prompt,
        outputUrl: asset.outputUrl,
        createdAt: asset.createdAt,
        userId: asset.userId,
        user: asset.user,
        likeCount: asset.likeCount || 0,
        hasLiked: Array.isArray(asset.likes) && asset.likes.length > 0
    }));

    const totalAssetsCount = await prisma.generatedAsset.count({ where: dateFilter });
    const chartAssets = await prisma.generatedAsset.findMany({
        where: dateFilter,
        select: { type: true, createdAt: true }
    });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const chartMap: Record<string, { name: string, image: number, video: number }> = {};
    orderedDays.forEach(d => { chartMap[d] = { name: d, image: 0, video: 0 }; });

    chartAssets.forEach(asset => {
       const dayName = daysOfWeek[asset.createdAt.getDay()];
       if (chartMap[dayName]) {
           if (asset.type === "IMAGE") chartMap[dayName].image += 1;
           if (asset.type === "VIDEO") chartMap[dayName].video += 1;
       }
    });

    return NextResponse.json({
      status: "success",
      assets: formattedAssets,
      pagination: { page, totalPages, totalItems: totalAssetsInFeed },
      stats: { totalAssets: totalAssetsCount, chartData: orderedDays.map(d => chartMap[d]) }
    });

  } catch (error) {
    console.error("Failed to fetch public showcase:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}