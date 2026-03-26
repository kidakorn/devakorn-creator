/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { GoogleAuth } from "google-auth-library";

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

		const COST_PER_PROMPT = 10;
		if (user.coinBalance < COST_PER_PROMPT) {
			return NextResponse.json({ status: "error", message: "Not enough coins! Please top up." }, { status: 403 });
		}

		const { idea, category } = await req.json();
		if (!idea) return NextResponse.json({ status: "error", message: "Idea is required." }, { status: 400 });

        // ดึงการตั้งค่า API Key จากระบบหลังบ้าน
        const apiKeySetting = await prisma.systemSetting.findUnique({ where: { key: 'GOOGLE_API_KEY' } });

		const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
		const client = await auth.getClient();
		const projectId = 'devakorn-creator-ai';
		const location = 'us-central1';
		const model = 'gemini-2.0-flash-001';
		const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

		const systemInstruction = `You are an expert AI commercial product prompt engineer. Your job is to take a simple user idea and turn it into a highly detailed, professional prompt ready for a text-to-image model.
		
        The user wants to create a commercial asset for: "${category}".
		
		Instructions based on category:
		- If "Product Photography": Add keywords like "studio lighting, 8k resolution, photorealistic, sharp focus, premium aesthetic, macro details".
		- If "T-Shirt Design": Add keywords like "isolated on solid white background, flat vector style, clear outlines, t-shirt graphic, no shading, clean edges".
		- If "Sticker & Die-cut": Add keywords like "white border edge, die-cut sticker, solid white background, vector illustration, vibrant colors, 2D".
		- If "Seamless Pattern": Add keywords like "seamless repeating pattern, flat design, textile print, wallpaper, edge-to-edge".
		- If "Logo Concept": Add keywords like "minimalist logo, clean typography, solid background, brand identity, vector".
		
        Keep the output as a single, highly descriptive paragraph. Do not include introductory or concluding text like "Here is your prompt:". Just return the raw prompt ready to be copy-pasted.`;

		const response = await client.request({
			url: url,
			method: 'POST',
			data: {
				contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUser Idea: ${idea}` }] }],
				generationConfig: { temperature: 0.7, maxOutputTokens: 256 }
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
			remainingCoins: updatedUser.coinBalance
		});

	} catch (error: any) {
		console.error("Prompt Enhancement Error:", error?.response?.data || error.message);
		return NextResponse.json({
			status: "error",
			message: "Failed to enhance prompt. Your coins were not deducted."
		}, { status: 500 });
	}
}