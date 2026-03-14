/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { GoogleAuth } from "google-auth-library";
import { Buffer } from "buffer";
import { v2 as cloudinary } from 'cloudinary';

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

		const COST_PER_IMAGE = 20;
		if (user.coinBalance < COST_PER_IMAGE) {
			return NextResponse.json({ status: "error", message: `Not enough coins! You need ${COST_PER_IMAGE} coins.` }, { status: 403 });
		}

		const formData = await req.formData();
		const rawPrompt = formData.get("prompt") as string;
		const aspectRatio = formData.get("aspectRatio") as string || "1:1";
		const category = formData.get("category") as string || "None";
		const file = formData.get("image") as File | null;

		if (!rawPrompt) {
			return NextResponse.json({ status: "error", message: "Prompt is required." }, { status: 400 });
		}

		let finalPrompt = rawPrompt;
		if (category !== "None") {
			finalPrompt = `Commercial Product Asset Style: ${category}. ${rawPrompt}. Highly detailed, professional studio quality.`;
		}

		const auth = new GoogleAuth({
			scopes: ['https://www.googleapis.com/auth/cloud-platform'],
		});
		const client = await auth.getClient();
		const projectId = 'devakorn-creator-ai';
		const location = 'us-central1';

		const model = file ? 'imagen-3.0-capability-001' : 'imagen-3.0-generate-001';
		const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

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
					referenceImage: {
						bytesBase64Encoded: imageBase64
					}
				}
			];
		}

		const response = await client.request({
			url: url,
			method: 'POST',
			data: {
				instances: [instanceData],
				parameters: {
					sampleCount: 1,
					aspectRatio: aspectRatio
				}
			}
		});

		const base64Image = (response.data as any).predictions[0].bytesBase64Encoded;

		// 🟢 1. ย้าย Cloudinary ขึ้นมาก่อน! ถ้าอัปโหลดไม่ผ่าน ระบบจะข้ามไป Catch Error โดยที่ยังไม่หักเหรียญ
		const uploadResponse = await cloudinary.uploader.upload(
			`data:image/png;base64,${base64Image}`,
			{
				folder: "devakorn-ai-creator/images",
				resource_type: "image"
			}
		);

		// 🛡️ 2. เริ่มระบบ Transaction (มัดรวม 3 คำสั่ง พังอันนึง คืนค่าทั้งหมด!)
		const [updatedUser, newAsset, ledgerEntry] = await prisma.$transaction([

			// 2.1 หักเหรียญลูกค้าอย่างปลอดภัย
			prisma.user.update({
				where: { id: user.id },
				data: { coinBalance: { decrement: COST_PER_IMAGE } }
			}),

			// 2.2 บันทึกผลงานลง Gallery
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

			// 2.3 จดบันทึกสมุดบัญชี (Ledger)
			prisma.transaction.create({
				data: {
					userId: user.id,
					type: 'SPEND_IMAGE',
					amount: -COST_PER_IMAGE,
					balanceAfter: user.coinBalance - COST_PER_IMAGE,
					description: `Generated Image (${aspectRatio}): ${finalPrompt.substring(0, 30)}...`,
					status: 'COMPLETED',
				}
			})
		]);

		return NextResponse.json({
			status: "success",
			imageUrl: newAsset.outputUrl,
			image: base64Image,
			remainingCoins: updatedUser.coinBalance
		});

	} catch (error: any) {
		console.error("Image Generation Error:", JSON.stringify(error.response?.data || error.message, null, 2));
		return NextResponse.json({
			status: "error",
			message: error.response?.data?.error?.message || "Failed to generate image. Don't worry, your coins were not deducted."
		}, { status: 500 });
	}
}