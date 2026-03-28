/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { GoogleAuth } from "google-auth-library";
import path from "path";

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
				message: "Account Suspended: You are not allowed to use the prompt enhancer."
			}, { status: 403 });
		}

		// รับค่าจากหน้าเว็บ
		const { idea, category } = await req.json();
		if (!idea) return NextResponse.json({ status: "error", message: "Idea is required." }, { status: 400 });

		// 🟢 ราคาเดียว 15 Coins ไปเลยครับบอส
		const COST_PER_PROMPT = 15;
		// 🟢 ใช้ตัว 2.0 Flash ตัวเดียวรันผ่านฉลุย
		const selectedModel = 'gemini-2.0-flash-001';

		if (user.coinBalance < COST_PER_PROMPT) {
			return NextResponse.json({ status: "error", message: `Not enough coins! You need ${COST_PER_PROMPT} coins.` }, { status: 403 });
		}

		const keyPath = path.resolve(process.cwd(), "vertex-key.json");
		const auth = new GoogleAuth({ keyFile: keyPath, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
		const client = await auth.getClient();
		const projectId = await auth.getProjectId();
		const location = 'us-central1';

		const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${selectedModel}:generateContent`;

		// 🟢 อัปเกรดคำสั่งใหม่: บังคับให้ AI เคารพข้อมูลของ User เป็นอันดับ 1
		const systemInstruction = `You are an expert AI commercial product prompt engineer. Your job is to take a simple user idea and turn it into a highly detailed, professional prompt ready for a text-to-image model.
		
		The user wants to create a commercial asset for: "${category}".

		CRITICAL RULES:
		1. PRESERVE CORE SUBJECT & HANDLE LANGUAGES (HIGHEST PRIORITY): You MUST strictly keep any specific brand names, store names, or text on products. IF the brand name or text is in a non-English language (e.g., Thai), you MUST transliterate or translate it into English alphabets (e.g., "เทวากร" -> "DEVAKORN"), because image models cannot render non-English fonts. Ensure the text is clearly described as being part of the product.
		2. LENGTH & DEPTH: MUST be a long, highly descriptive, and intricate paragraph (at least 60-120 words).
		3. ATMOSPHERE: Include exhaustive details on lighting, camera settings, textures, and environment.

		Instructions based on category (Use these to enhance the style, but do NOT let them overwrite the core subject):
		- If "Product Photography": Add keywords like "studio lighting, 8k resolution, photorealistic, sharp focus, premium aesthetic, macro details, dramatic shadows".
		- If "T-Shirt Design": Add keywords like "isolated on solid white background, flat vector style, clear outlines, t-shirt graphic, no shading, clean edges".
		- If "Sticker & Die-cut": Add keywords like "white border edge, die-cut sticker, solid white background, vector illustration, vibrant colors, 2D flat".
		- If "Seamless Pattern": Add keywords like "seamless repeating pattern, flat design, textile print, wallpaper, edge-to-edge".
		- If "Logo Concept": Add keywords like "minimalist logo, clean typography, solid background, brand identity, vector shape".
		- If "Product Mockup": Add keywords like "3D render, professional mockup, high-quality materials, photorealistic, clean minimalist setting, studio lighting, soft shadows".

		Keep the output as a single paragraph. Do not include introductory or concluding text like "Here is your prompt:". Just return the raw prompt.`;

		const response = await client.request({
			url: url,
			method: 'POST',
			data: {
				contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUser Idea: ${idea}` }] }],
				generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
			}
		});

		const generatedText = (response.data as any).candidates[0].content.parts[0].text.trim();

		const [updatedUser, newAsset, ledgerEntry] = await prisma.$transaction([
			prisma.user.update({
				where: { id: user.id },
				data: { coinBalance: { decrement: COST_PER_PROMPT } }
			}),
			prisma.generatedAsset.create({
				data: {
					userId: user.id,
					type: "PROMPT",
					prompt: idea,
					category: category || "None",
					outputUrl: generatedText,
					aspectRatio: "TEXT"
				}
			}),
			prisma.transaction.create({
				data: {
					userId: user.id,
					type: 'SPEND_PROMPT',
					amount: -COST_PER_PROMPT,
					balanceAfter: user.coinBalance - COST_PER_PROMPT,
					description: `Enhanced Prompt: ${idea.substring(0, 30)}...`,
					status: 'COMPLETED',
				}
			})
		]);

		return NextResponse.json({
			status: "success",
			prompt: generatedText,
			remainingCoins: updatedUser.coinBalance,
			usedModel: selectedModel
		});

	} catch (error: any) {
		console.error("Prompt Enhancement Error:", error?.response?.data || error.message);
		return NextResponse.json({
			status: "error",
			message: "Failed to enhance prompt. Your coins were not deducted."
		}, { status: 500 });
	}
}