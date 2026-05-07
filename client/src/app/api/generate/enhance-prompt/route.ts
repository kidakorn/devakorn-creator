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

        // 🟢 รับพารามิเตอร์ที่ยืดหยุ่นมากขึ้นจากหน้าเว็บ
        const { idea, category, tone, length, outputLanguage } = await req.json();
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

        // 🟢 Dynamic System Instruction: ปรุงคำสั่งใหม่ตามค่าที่ User เลือกมาจากหน้าบ้าน
        const systemInstruction = `You are an elite AI Prompt Engineer. Your task is to transform a simple user idea into a highly detailed, professional prompt suitable for Midjourney, Stable Diffusion, or Veo.
        
        Target Category: ${category || 'General'}
        Desired Tone: ${tone || 'Creative & Professional'}
        Expected Length: ${length || 'Medium (around 50-80 words)'}
        Output Language: ${outputLanguage || 'English'}
        
        RULES:
        1. Expand the simple idea by adding vivid descriptions, lighting conditions, camera angles, and stylistic keywords.
        2. Strictly follow the expected length and output language. If the output language is Thai, use proper Thai terminology.
        3. Provide ONLY the final enhanced prompt without any conversational text, explanations, or quotes.
        4. DO NOT include any technical parameters or suffixes like "--ar", "--v", or "--style". Provide only the descriptive text.`;
        

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