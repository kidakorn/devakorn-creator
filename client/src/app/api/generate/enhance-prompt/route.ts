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
                message: "Account Suspended: You are not allowed to use this feature."
            }, { status: 403 });
        }

        // Receive flexible parameters from frontend
        const { idea, category, tone, length, outputLanguage, lighting, cameraAngle } = await req.json(); // 🟢 เพิ่ม lighting, cameraAngle ตรงนี้เส้นแดงจะหายไป
        if (!idea) return NextResponse.json({ status: "error", message: "Idea is required." }, { status: 400 });

        const COST_PER_PROMPT = 15;
        if (user.coinBalance < COST_PER_PROMPT) {
            return NextResponse.json({ status: "error", message: `Not enough coins! You need ${COST_PER_PROMPT} coins.` }, { status: 403 });
        }

        const keyPath = path.resolve(process.cwd(), "vertex-key.json");
        const auth = new GoogleAuth({ keyFile: keyPath, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const location = 'us-central1';
        const selectedModel = 'gemini-2.0-flash-001';

        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${selectedModel}:generateContent`;

        // Dynamic System Instruction
        const systemInstruction = `You are an elite AI Prompt Engineer. Your task is to transform a simple user idea into a highly detailed, professional prompt suitable for Midjourney, Stable Diffusion, or Veo.
        
        Target Category: ${category || 'General'}
        Desired Tone: ${tone || 'Creative & Professional'}
        Expected Length: ${length || 'Medium (around 50-80 words)'}
        Output Language: ${outputLanguage || 'English'}
        Lighting Style: ${lighting || 'Studio Light'}
        Camera Angle: ${cameraAngle || 'Close-up'}
        
        STRICT RULES:
        1. CORE SUBJECT FIRST: You MUST focus strictly on the "Core Subject" provided in the User Idea. DO NOT hallucinate or add random objects, humans, or animals (e.g., cats, dogs) unless explicitly requested by the user.
        2. If the user provides a URL (e.g. Shopee, Lazada), extract the core product features from that URL and use it to build the prompt.
        3. Expand the simple idea ONLY by adding relevant lighting conditions, camera angles, textures, background environment, and stylistic keywords that match the Target Category. (If a specific Lighting Style or Camera Angle is provided above, YOU MUST USE IT).
        4. Strictly follow the expected length and output language.
        5. Provide ONLY the final enhanced prompt without any conversational text, explanations, or quotes. DO NOT include technical parameters (like "--ar").`;


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
                    category: category || "General",
                    outputUrl: generatedText,
                    aspectRatio: "TEXT",
                    // usedModel: selectedModel
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
            enhancedPrompt: generatedText,
            remainingCoins: updatedUser.coinBalance,
            usedModel: selectedModel
        });

    } catch (error: any) {
        console.error("Enhance Prompt Error:", error?.response?.data || error.message);
        return NextResponse.json({
            status: "error",
            message: "Failed to enhance prompt. AI might be busy."
        }, { status: 500 });
    }
}