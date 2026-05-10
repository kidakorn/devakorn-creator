/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';
import { GoogleAuth } from "google-auth-library";
import path from "path";

// Cloudinary Configuration
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

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });

        if (user.isBanned) {
            return NextResponse.json({
                status: "error",
                message: "Account Suspended: You are not allowed to generate assets."
            }, { status: 403 });
        }

        // Receive flexible parameters from frontend (FormData since there's file upload)
        const formData = await req.formData();
        const prompt = formData.get('prompt') as string;
        const category = formData.get('category') as string;
        const aspectRatio = formData.get('aspectRatio') as string;
        const cameraAngle = formData.get('cameraAngle') as string;
        const style = formData.get('style') as string;
        const lighting = formData.get('lighting') as string;
        const presenter = formData.get('presenter') as string;

        // 🟢 1. ดึงไฟล์รูปภาพ Reference Sketch แปลงเป็น Base64 (ถ้าลูกค้าแนบมา)
        const imageFile = formData.get('image') as File | null;
        let base64Image = null;
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            base64Image = Buffer.from(arrayBuffer).toString('base64');
        }

        if (!prompt) return NextResponse.json({ status: "error", message: "Please provide an image prompt." }, { status: 400 });

        const COST_PER_IMAGE = 39;

        if (user.coinBalance < COST_PER_IMAGE) {
            return NextResponse.json({ status: "error", message: `Not enough coins! You need ${COST_PER_IMAGE} coins.` }, { status: 403 });
        }

        const keyPath = path.resolve(process.cwd(), "vertex-key.json");
        const auth = new GoogleAuth({ keyFile: keyPath, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const location = 'us-central1';

        // 🟢 2. AI MIDDLEMAN: เพิ่มกฎเหล็กแบน 18+ ขั้นเด็ดขาด
        const translatorUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.0-flash-001:generateContent`;
        const systemInstruction = `You are an elite AI Prompt Translator and Moderator for commercial product photography.
        1. Translate the user's Thai prompt to highly descriptive English.
        2. CONTENT MODERATION: Sanitize any inappropriate Thai slang.
        3. STRICT NSFW BAN: If the user's prompt requests nudity, pornography, explicit sexual content, or suggestive adult material, you MUST reply with exactly "REJECTED_NSFW". Do not output anything else.
        4. Incorporate these settings naturally into the English prompt:
           - Category: ${category || 'None'}
           - Style: ${style || 'None'}
           - Camera Angle: ${cameraAngle || 'None'}
           - Lighting: ${lighting || 'None'}
           - Presenter: ${presenter || 'None'}
        5. CRITICAL: At the very end of your output, you MUST add exactly this string: " | NEGATIVE PROMPT: ugly, deformed, blurry, poor quality, watermark, text, out of frame, animal, cat, dog, extra fingers, nsfw, nude".
        6. Output ONLY the final English prompt. No explanations.`;

        let finalEnglishPrompt = prompt;

        try {
            const translateRes = await client.request({
                url: translatorUrl,
                method: 'POST',
                data: {
                    contents: [{ role: "user", parts: [{ text: `User Prompt: ${prompt}` }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: { temperature: 0.2, maxOutputTokens: 300 }
                }
            });

            const resultText = (translateRes.data as any).candidates[0].content.parts[0].text.trim();

            // 🟢 ดักจับถ้า Middleman เจอข้อความ 18+ คืนเงินให้เลยไม่หักเหรียญ
            if (resultText === "REJECTED_NSFW") {
                return NextResponse.json({ status: "error", message: "ไม่อนุญาตให้สร้างภาพที่มีเนื้อหาโป๊เปลือย หรือผิดกฎหมาย (NSFW is strictly prohibited)." }, { status: 400 });
            }
            finalEnglishPrompt = resultText;

        } catch (err) {
            console.error("AI Middleman Failed, using fallback prompt.", err);
            finalEnglishPrompt = `A commercial product photo of ${prompt}. Style: ${style}. Lighting: ${lighting}. | NEGATIVE PROMPT: ugly, text, watermark, animal, cat, dog, nsfw, nude`;
        }

        const selectedModel = 'imagen-3.0-generate-001';
        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${selectedModel}:predict`;

        // 🟢 3. ประกอบร่างคำสั่งสำหรับ Imagen
        const instanceData: any = { prompt: finalEnglishPrompt };

        // ถ้ามีการแนบรูปภาพอ้างอิงมา (Reference Sketch) ให้ส่งไปให้ AI ด้วย!
        if (base64Image) {
            instanceData.image = { bytesBase64Encoded: base64Image };
        }

        const requestData = {
            instances: [instanceData],
            parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio || "16:9",
                safetySetting: "block_most", // 🟢 เปิดเซนเซอร์ภาพล่อแหลมขั้นสูงสุดของ Google (ป้องกันรูปแนบที่โป๊เปลือย)
                personGeneration: "allow_adult"
            }
        };

        const response = await client.request({ url, method: 'POST', data: requestData });
        const prediction: any = (response.data as any).predictions[0];

        if (!prediction.bytesBase64Encoded) {
            throw new Error("No image data received from Vertex AI.");
        }

        // Upload Base64 to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(`data:image/png;base64,${prediction.bytesBase64Encoded}`, {
            folder: "devakorn-ai-creator/images",
        });

        // Database Transaction: Deduct coins and save asset
        const [updatedUser, newAsset, ledgerEntry] = await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { coinBalance: { decrement: COST_PER_IMAGE } }
            }),
            prisma.generatedAsset.create({
                data: {
                    userId: user.id,
                    type: "IMAGE",
                    prompt: `[TH]: ${prompt}\n[EN]: ${finalEnglishPrompt}`,
                    category: category || "General",
                    outputUrl: uploadResponse.secure_url,
                    aspectRatio: aspectRatio || "16:9",
                    // usedModel: selectedModel
                }
            }),
            prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: 'SPEND_IMAGE',
                    amount: -COST_PER_IMAGE,
                    balanceAfter: user.coinBalance - COST_PER_IMAGE,
                    description: `Generated Image: ${prompt.substring(0, 30)}...`,
                    status: 'COMPLETED',
                }
            })
        ]);

        return NextResponse.json({
            status: "success",
            imageUrl: uploadResponse.secure_url,
            remainingCoins: updatedUser.coinBalance,
            usedModel: selectedModel
        });

    } catch (error: any) {
        console.error("Image Generation Error:", error?.response?.data || error.message);
        const errorMsg = JSON.stringify(error?.response?.data || "");

        // 🟢 ถ้าระบบหลังบ้านจับได้ว่ารูปหรือข้อความผิดกฎหมาย
        if (errorMsg.includes("safety") || errorMsg.includes("blocked")) {
            return NextResponse.json({ status: "error", message: "ระบบตรวจพบเนื้อหาหรือรูปภาพที่ไม่เหมาะสม (Safety Filter Triggered)." }, { status: 400 });
        }

        return NextResponse.json({
            status: "error",
            message: "Failed to generate image. AI might be busy. Coins not deducted."
        }, { status: 500 });
    }
}