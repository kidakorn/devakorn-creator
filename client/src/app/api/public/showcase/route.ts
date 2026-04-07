import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let dateFilter = {};
    let isFilteringDate = false;
    let chartStartDate = new Date();
    let chartEndDate = new Date();

    if (start && end) {
      isFilteringDate = true;
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      };

      chartStartDate = startDate;
      chartEndDate = endDate;
    }

    // 1. ดึงข้อมูล Showcase พร้อมกรองวันที่
    const rawAssets = await prisma.generatedAsset.findMany({
      where: {
        type: { in: ["IMAGE", "VIDEO"] },
        user: { role: "USER" },
        ...dateFilter
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        prompt: true,
        outputUrl: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true } },
      },
    });

    const userAssetCount: Record<string, number> = {};
    const filteredAssets = [];

    for (const asset of rawAssets) {
      const uId = asset.userId;
      if (!userAssetCount[uId]) userAssetCount[uId] = 0;

      if (userAssetCount[uId] < 2) {
        filteredAssets.push(asset);
        userAssetCount[uId]++;
      }

      if (filteredAssets.length >= 12) break;
    }

    // 2. ดึงจำนวน Total Assets 
    const totalAssetsCount = await prisma.generatedAsset.count({
      where: dateFilter
    });

    // 3. ดึงข้อมูลวาดกราฟ
    let chartAssets;
    if (isFilteringDate) {
      // ถ้ามีการเลือกวันที่: ดึงข้อมูลเฉพาะวันที่เลือก
      chartAssets = await prisma.generatedAsset.findMany({
        where: {
          createdAt: { gte: chartStartDate, lte: chartEndDate }
        },
        select: { type: true, createdAt: true }
      });
    } else {
      // 🟢 ถ้าไม่ได้เลือกวันที่ (ตอนเปิดหน้าเว็บครั้งแรก): ดึงข้อมูล "ทั้งหมด" มาจัดกลุ่มเป็นกราฟรวม
      chartAssets = await prisma.generatedAsset.findMany({
        select: { type: true, createdAt: true }
      });
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const chartMap: Record<string, { name: string, image: number, video: number }> = {};
    orderedDays.forEach(d => {
      chartMap[d] = { name: d, image: 0, video: 0 };
    });

    chartAssets.forEach(asset => {
      const dayName = daysOfWeek[asset.createdAt.getDay()];
      if (chartMap[dayName]) {
        if (asset.type === "IMAGE") chartMap[dayName].image += 1;
        if (asset.type === "VIDEO") chartMap[dayName].video += 1;
      }
    });

    const chartData = orderedDays.map(d => chartMap[d]);

    return NextResponse.json({
      status: "success",
      assets: filteredAssets,
      stats: {
        totalAssets: totalAssetsCount,
        chartData: chartData
      }
    });

  } catch (error) {
    console.error("Failed to fetch public showcase:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}