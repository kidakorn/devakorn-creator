/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { GoogleAuth } from "google-auth-library";
import { Buffer } from "buffer";
import { v2 as cloudinary } from 'cloudinary';
import path from "path";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user?.email) {
			return NextResponse.json({ status: "error", message: "Unauthorized. Please log in." }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email }
		});

		if (!user) {
			return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });
		}

		if (user.isBanned) {
			return NextResponse.json({
				status: "error",
				message: "Account Suspended: You are not allowed to generate assets."
			}, { status: 403 });
		}

		const formData = await req.formData();
		const rawPrompt = formData.get("prompt") as string;
		const aspectRatio = formData.get("aspectRatio") as string || "1:1";
		const category = formData.get("category") as string || "None";
		const file = formData.get("image") as File | null;
		// 🟢 รับค่าตัวแปรโหมดคุณภาพจากหน้าเว็บ
		const quality = formData.get("quality") as string || "pro";

		if (!rawPrompt) {
			return NextResponse.json({ status: "error", message: "Prompt is required." }, { status: 400 });
		}

		// 🟢 กำหนดราคาและโมเดลตามที่บอสตั้งไว้ (Fast=29, Pro=49)
		const COST_PER_IMAGE = quality === "fast" ? 29 : 49;
		let selectedModel = quality === "fast" ? 'imagen-3.0-fast-generate-001' : 'imagen-3.0-generate-001';

		// ถ้ามีการอัปโหลดรูปภาพอ้างอิง ระบบต้องบังคับใช้รุ่น capability
		if (file) {
			selectedModel = 'imagen-3.0-capability-001';
		}

		if (user.coinBalance < COST_PER_IMAGE) {
			return NextResponse.json({ status: "error", message: `Not enough coins! You need ${COST_PER_IMAGE} coins.` }, { status: 403 });
		}

		let finalPrompt = rawPrompt;
		if (category !== "None") {
			finalPrompt = `${rawPrompt}, Commercial Product Asset Style: ${category}, Highly detailed, professional studio quality.`;
		}

		// 🟢 ใช้การอ้างอิง Key แบบ Absolute Path เพื่อความเสถียร
		const keyPath = path.resolve(process.cwd(), "vertex-key.json");
		const auth = new GoogleAuth({
			keyFile: keyPath,
			scopes: ['https://www.googleapis.com/auth/cloud-platform'],
		});

		const client = await auth.getClient();
		const projectId = await auth.getProjectId();
		const location = 'us-central1';

		const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${selectedModel}:predict`;

		const instanceData: any = { prompt: finalPrompt };

		if (file) {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const imageBase64 = buffer.toString('base64');

			if (!finalPrompt.includes('[1]')) {
				instanceData.prompt = finalPrompt + " [1]";
			}

			instanceData.referenceImages = [
				{
					referenceId: 1,
					referenceType: "REFERENCE_TYPE_RAW",
					referenceImage: { bytesBase64Encoded: imageBase64 }
				}
			];
		}

		const response = await client.request({
			url: url,
			method: 'POST',
			data: {
				instances: [instanceData],
				parameters: { sampleCount: 1, aspectRatio: aspectRatio }
			}
		});

		const base64Image = (response.data as any).predictions[0].bytesBase64Encoded;

		const uploadResponse = await cloudinary.uploader.upload(
			`data:image/png;base64,${base64Image}`,
			{ folder: "devakorn-ai-creator/images", resource_type: "image" }
		);

		const [updatedUser, newAsset, ledgerEntry] = await prisma.$transaction([
			prisma.user.update({
				where: { id: user.id },
				data: { coinBalance: { decrement: COST_PER_IMAGE } }
			}),
			prisma.generatedAsset.create({
				data: {
					userId: user.id,
					type: "IMAGE",
					prompt: finalPrompt,
					category: category,
					outputUrl: uploadResponse.secure_url,
					aspectRatio: aspectRatio
				}
			}),
			prisma.transaction.create({
				data: {
					userId: user.id,
					type: 'SPEND_IMAGE',
					amount: -COST_PER_IMAGE,
					balanceAfter: user.coinBalance - COST_PER_IMAGE,
					description: `Image (${quality === 'fast' ? 'Standard' : 'Premium'}): ${finalPrompt.substring(0, 30)}...`,
					status: 'COMPLETED',
				}
			})
		]);

		return NextResponse.json({
			status: "success",
			imageUrl: newAsset.outputUrl,
			image: base64Image,
			remainingCoins: updatedUser.coinBalance,
			usedModel: selectedModel
		});

	} catch (error: any) {
		console.error("Image Generation Error:", JSON.stringify(error.response?.data || error.message, null, 2));
		return NextResponse.json({
			status: "error",
			message: error.response?.data?.error?.message || "Failed to generate image. Don't worry, your coins were not deducted."
		}, { status: 500 });
	}
}