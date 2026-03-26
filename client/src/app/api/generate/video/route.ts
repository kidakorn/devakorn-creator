/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { GoogleGenAI } = require('@google/genai');
const { Storage } = require('@google-cloud/storage');

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user?.email) {
			return NextResponse.json({ status: "error", message: "Unauthorized. Please log in." }, { status: 401 });
		}

		const user = await prisma.user.findUnique({ where: { email: session.user.email } });
		if (!user) return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });

		if (user.isBanned) {
			return NextResponse.json({
				status: "error",
				message: "Account Suspended: You are not allowed to generate assets."
			}, { status: 403 });
		}

		const COST_PER_VIDEO = 350;
		if (user.coinBalance < COST_PER_VIDEO) {
			return NextResponse.json({
				status: "error",
				message: `Premium feature! Not enough coins. You need ${COST_PER_VIDEO} coins to produce a video ad.`
			}, { status: 403 });
		}

		const { prompt, category, aspectRatio } = await req.json();
		if (!prompt) return NextResponse.json({ status: "error", message: "Please provide a video prompt." }, { status: 400 });

		const finalPrompt = `Commercial Video Style: ${category}. High-quality product showcase, sharp focus, cinematic lighting. ${prompt}`;

		// โค้ดดึงการตั้งค่าเพื่อรองรับโมเดล Veo เวอร์ชั่นใหม่ๆ ในอนาคต
		const apiKeySetting = await prisma.systemSetting.findUnique({ where: { key: 'GOOGLE_API_KEY' } });

		const client = new GoogleGenAI({ vertexai: true, project: 'devakorn-creator-ai', location: 'us-central1' });
		const storage = new Storage();

		console.log("[1/3] Submitting video job to Veo AI...");
		let operation = await client.models.generateVideos({
			model: 'veo-3.1-generate-001',
			prompt: finalPrompt,
			config: { aspectRatio: aspectRatio || "16:9" }
		});

		console.log(`[2/3] Got Ticket: ${operation.name}`);
		console.log("Waiting for AI to render (approx 1-3 mins)...");

		while (!operation.done) {
			await new Promise(resolve => setTimeout(resolve, 15000));
			operation = await client.operations.get({ operation: operation });
			console.log("Still rendering... checking again in 15 seconds.");
		}
		console.log("[3/3] Video generation complete!");

		let videoBase64 = null;
		const videoData = operation.response?.generatedVideos?.[0]?.video;

		if (!videoData) throw new Error("No video data received from AI.");

		if (videoData.videoBytes) {
			if (typeof videoData.videoBytes === 'string') {
				videoBase64 = videoData.videoBytes;
			} else {
				videoBase64 = Buffer.from(videoData.videoBytes).toString('base64');
			}
		} else if (videoData.uri && videoData.uri.startsWith('gs://')) {
			const bucketName = videoData.uri.split('/')[2];
			const fileName = videoData.uri.split('/').slice(3).join('/');
			const [fileContents] = await storage.bucket(bucketName).file(fileName).download();
			videoBase64 = fileContents.toString('base64');
		}

		if (!videoBase64) throw new Error("Could not process the video data.");

		console.log("Uploading to Cloudinary...");
		const uploadResponse = await cloudinary.uploader.upload(
			`data:video/mp4;base64,${videoBase64}`,
			{
				folder: "devakorn-ai-creator/videos",
				resource_type: "video"
			}
		);

		console.log("Saving to Database & Deducting Coins...");
		const [updatedUser, newAsset, ledgerEntry] = await prisma.$transaction([
			prisma.user.update({
				where: { id: user.id },
				data: { coinBalance: { decrement: COST_PER_VIDEO } }
			}),
			prisma.generatedAsset.create({
				data: {
					userId: user.id,
					type: "VIDEO",
					prompt: finalPrompt,
					category: category || "None",
					outputUrl: uploadResponse.secure_url,
					aspectRatio: aspectRatio || "16:9"
				}
			}),
			prisma.transaction.create({
				data: {
					userId: user.id,
					type: 'SPEND_VIDEO',
					amount: -COST_PER_VIDEO,
					balanceAfter: user.coinBalance - COST_PER_VIDEO,
					description: `Generated Video (${aspectRatio}): ${finalPrompt.substring(0, 30)}...`,
					status: 'COMPLETED',
				}
			})
		]);

		return NextResponse.json({
			status: "success",
			videoUrl: uploadResponse.secure_url,
			video: videoBase64,
			remainingCoins: updatedUser.coinBalance
		});

	} catch (error: any) {
		console.error("Error generating video:", error.message || error);
		return NextResponse.json({
			status: 'error',
			message: "Failed to generate video. AI might be busy. Coins not deducted."
		}, { status: 500 });
	}
}