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
				message: "Account Suspended: You are not allowed to generate campaigns."
			}, { status: 403 });
		}

		// 🟢 รับค่าภาษา (Language) เพิ่มเข้ามา
		const { imageUrl, platform, tone, language } = await req.json();
		if (!imageUrl) return NextResponse.json({ status: "error", message: "Please select an image from your gallery." }, { status: 400 });

		const COST_PER_CAMPAIGN = 39;
		if (user.coinBalance < COST_PER_CAMPAIGN) {
			return NextResponse.json({ status: "error", message: `Not enough coins! You need ${COST_PER_CAMPAIGN} coins.` }, { status: 403 });
		}

		console.log("Fetching image for AI analysis...");
		const imageRes = await fetch(imageUrl);
		const arrayBuffer = await imageRes.arrayBuffer();
		const base64Image = Buffer.from(arrayBuffer).toString('base64');
		const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';

		const keyPath = path.resolve(process.cwd(), "vertex-key.json");
		const auth = new GoogleAuth({ keyFile: keyPath, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
		const client = await auth.getClient();
		const projectId = await auth.getProjectId();
		const location = 'us-central1';
		const selectedModel = 'gemini-2.0-flash-001';

		const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${selectedModel}:generateContent`;

		// 🔥 AGENCY LEVEL PROMPT ENGINEERING 🔥
		const systemInstruction = `You are an elite, top-tier Digital Marketing Agency Copywriter. 
		Your task is to analyze the provided product image and write a high-converting, deeply engaging social media campaign. Do not write a simple description; write a psychological sales copy.
		
		Target Platform: ${platform || 'Facebook'}
		Tone of Voice: ${tone || 'Engaging & Professional'}
		Output Language: ${language || 'Thai'}

		CRITICAL AGENCY-LEVEL STRUCTURE:
		1. 🪝 THE HOOK: A highly catchy headline or question that stops the user from scrolling.
		2. ✨ VALUE & DESIRE: Highlight the key benefits, aesthetic, and emotional mood based ONLY on the visual details of the image. Make the reader want it.
		3. 🎯 THE STORY/DETAILS: Brief, engaging details about the product's quality, texture, or vibe.
		4. 🚀 CALL TO ACTION (CTA): A clear, urgent next step (e.g., Click the link, Inbox us, Tag a friend, Shop now).
		5. 🏷️ HASHTAGS: 5-8 highly relevant, trendy marketing hashtags.

		RULES:
		- You MUST write the entire copy in the specified Output Language: ${language || 'Thai'}.
		- If writing in Thai, use natural, modern, and trendy marketing vocabulary (ภาษาการตลาดที่สละสลวย กระตุ้นความสนใจ).
		- Adapt the paragraph length and style specifically for ${platform}.
		- Use appropriate emojis to format and break up the text beautifully.
		- Output ONLY the final campaign text. Do not include introductory or concluding conversational text.`;

		console.log("Sending image and prompt to Gemini...");
		const response = await client.request({
			url: url,
			method: 'POST',
			data: {
				contents: [{
					role: "user",
					parts: [
						{ text: systemInstruction },
						{
							inlineData: {
								mimeType: mimeType,
								data: base64Image
							}
						}
					]
				}],
				generationConfig: { temperature: 0.75, maxOutputTokens: 1024 }
			}
		});

		const generatedCaption = (response.data as any).candidates[0].content.parts[0].text.trim();

		console.log("Saving campaign to database...");
		const [updatedUser, newAsset, ledgerEntry] = await prisma.$transaction([
			prisma.user.update({
				where: { id: user.id },
				data: { coinBalance: { decrement: COST_PER_CAMPAIGN } }
			}),
			prisma.generatedAsset.create({
				data: {
					userId: user.id,
					type: "CAMPAIGN",
					prompt: generatedCaption,
					category: platform || "Social Media",
					outputUrl: imageUrl,
					aspectRatio: "TEXT"
				}
			}),
			prisma.transaction.create({
				data: {
					userId: user.id,
					type: 'SPEND_CAMPAIGN',
					amount: -COST_PER_CAMPAIGN,
					balanceAfter: user.coinBalance - COST_PER_CAMPAIGN,
					description: `Campaign: ${platform}`,
					status: 'COMPLETED',
				}
			})
		]);

		return NextResponse.json({
			status: "success",
			caption: generatedCaption,
			remainingCoins: updatedUser.coinBalance,
			usedModel: selectedModel
		});

	} catch (error: any) {
		console.error("Campaign Builder Error:", error?.response?.data || error.message);
		return NextResponse.json({
			status: "error",
			message: "Failed to generate campaign. AI might be busy."
		}, { status: 500 });
	}
}