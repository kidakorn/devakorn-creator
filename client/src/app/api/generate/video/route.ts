/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';
import path from "path";
import { GoogleAuth } from "google-auth-library";

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

		// 🟢 เติมโค้ดชุดนี้เข้าไป เพื่อรับค่าตัวแปรทั้งหมดจากหน้าเว็บ
		const formData = await req.formData();
		const prompt = formData.get('prompt') as string;
		const category = formData.get('category') as string;
		const aspectRatio = formData.get('aspectRatio') as string;
		const style = formData.get('style') as string;
		const cameraAngle = formData.get('cameraAngle') as string;
		const lighting = formData.get('lighting') as string;
		const presenter = formData.get('presenter') as string;

		// ดึงไฟล์รูปภาพอ้างอิง (ถ้าลูกค้าแนบรูปมา)
		const imageFile = formData.get('image') as File | null;
		let inputImageBase64 = null;
		let inputImageMimeType = null;

		if (imageFile) {
			const arrayBuffer = await imageFile.arrayBuffer();
			inputImageBase64 = Buffer.from(arrayBuffer).toString('base64');
			inputImageMimeType = imageFile.type;
		}

		if (!prompt) return NextResponse.json({ status: "error", message: "Please provide a prompt." }, { status: 400 });

		const COST_PER_VIDEO = 499; // ตั้งราคาหักเหรียญ

		if (user.coinBalance < COST_PER_VIDEO) {
			return NextResponse.json({ status: "error", message: "เหรียญไม่เพียงพอ (Not enough coins)." }, { status: 403 });
		}

		// Load credentials
		const keyPath = path.resolve(process.cwd(), "vertex-key.json");
		process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

		const auth = new GoogleAuth({ keyFile: keyPath, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
		const authClient = await auth.getClient();
		const projectId = await auth.getProjectId();
		const location = 'us-central1';

		// 🟢 AI MIDDLEMAN: แปลภาษา, กรองคำหยาบ, และจัดทรง Prompt
		const translatorUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.0-flash-001:generateContent`;
		const systemInstruction = `You are an elite AI Prompt Translator and Moderator for commercial video generation.
        1. Translate the user's Thai prompt to highly descriptive English.
        2. CONTENT MODERATION: Sanitize any inappropriate Thai slang (e.g., "Naa Hee").
        3. STRICT NSFW BAN: If the user's prompt requests nudity, pornography, or explicit adult material, you MUST reply with exactly "REJECTED_NSFW".
        4. Incorporate these settings naturally into the English prompt:
           - Category: ${category || 'None'}
           - Style: ${style || 'None'}
           - Camera Angle: ${cameraAngle || 'None'}
           - Lighting: ${lighting || 'None'}
           - Presenter: ${presenter || 'None'}
        5. Output ONLY the final English prompt. No explanations.`;

		let finalEnglishPrompt = prompt;

		try {
			const translateRes = await authClient.request({
				url: translatorUrl,
				method: 'POST',
				data: {
					contents: [{ role: "user", parts: [{ text: `User Prompt: ${prompt}` }] }],
					systemInstruction: { parts: [{ text: systemInstruction }] },
					generationConfig: { temperature: 0.2, maxOutputTokens: 300 }
				}
			});

			const resultText = (translateRes.data as any).candidates[0].content.parts[0].text.trim();

			if (resultText === "REJECTED_NSFW") {
				return NextResponse.json({ status: "error", message: "ไม่อนุญาตให้สร้างวิดีโอที่มีเนื้อหาโป๊เปลือย (NSFW is strictly prohibited)." }, { status: 400 });
			}
			finalEnglishPrompt = resultText;
		} catch (err) {
			console.error("AI Middleman Failed", err);
			finalEnglishPrompt = `A high quality commercial video of ${prompt}. Style: ${style}. Lighting: ${lighting}.`;
		}

		const client = new GoogleGenAI({ vertexai: true, project: projectId, location: location });
		const storage = new Storage({ keyFilename: keyPath });

		console.log(`[1/3] Submitting video job to Veo AI (Price: ${COST_PER_VIDEO} Coins)...`);

		const videoOptions: any = {
			model: 'veo-3.1-generate-001',
			prompt: finalEnglishPrompt, // 🟢 ส่ง Prompt ที่แปลแล้วไปให้ Veo
			config: { aspectRatio: aspectRatio || "16:9" }
		};

		// Pass the image reference to Veo if provided
		if (inputImageBase64) {
			videoOptions.inputImage = {
				mimeType: inputImageMimeType,
				bytesBase64Encoded: inputImageBase64,
				bytes: inputImageBase64 // Added for SDK compatibility
			};
		}

		let operation = await client.models.generateVideos(videoOptions);

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
					prompt: `[TH]: ${prompt}\n[EN]: ${finalEnglishPrompt}`,
					category: category || "None",
					outputUrl: uploadResponse.secure_url,
					aspectRatio: aspectRatio || "16:9",
					style: style || null,
                    cameraAngle: cameraAngle || null,
                    lighting: lighting || null,
                    presenter: presenter || null
				}
			}),
			prisma.transaction.create({
				data: {
					userId: user.id,
					type: 'SPEND_VIDEO',
					amount: -COST_PER_VIDEO,
					balanceAfter: user.coinBalance - COST_PER_VIDEO,
					description: `Video Ad Creation: ${prompt.substring(0, 15)}...`,
					status: 'COMPLETED',
				}
			})
		]);

		return NextResponse.json({
			status: "success",
			videoUrl: uploadResponse.secure_url,
			video: videoBase64,
			remainingCoins: updatedUser.coinBalance,
			usedModel: 'veo-3.1-generate-001'
		});

	} catch (error: any) {
		console.error("Error generating video:", error.message || error);
		return NextResponse.json({
			status: 'error',
			message: "Failed to generate video. AI might be busy. Coins not deducted."
		}, { status: 500 });
	}
}