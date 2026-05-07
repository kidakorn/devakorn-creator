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
        const quality = formData.get('quality') as string;
        
        if (!prompt) return NextResponse.json({ status: "error", message: "Please provide an image prompt." }, { status: 400 });

        // Calculate cost based on Render Quality (pro = 49, fast = 29)
        const COST_PER_IMAGE = quality === 'pro' ? 49 : 29; 
        
        if (user.coinBalance < COST_PER_IMAGE) {
            return NextResponse.json({ status: "error", message: `Not enough coins! You need ${COST_PER_IMAGE} coins.` }, { status: 403 });
        }

        // Dynamic Prompt construction: Assemble new command based on User's choices
        let finalPrompt = prompt;
        if (category && category !== "None") finalPrompt += `, Category: ${category}`;
        if (style && style !== "None") finalPrompt += `, Style: ${style}`;
        if (cameraAngle && cameraAngle !== "None") finalPrompt += `, Camera: ${cameraAngle}`;
        if (lighting && lighting !== "None") finalPrompt += `, Lighting: ${lighting}`;
        if (presenter && presenter !== "None") finalPrompt += `, Feature a highly photorealistic ${presenter} holding or interacting with the product`;

        // Load credentials from Google Cloud json file
        const keyPath = path.resolve(process.cwd(), "vertex-key.json");
        const auth = new GoogleAuth({ keyFile: keyPath, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const location = 'us-central1';
        const selectedModel = 'imagen-3.0-generate-001'; // Update to latest Imagen 3

        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${selectedModel}:predict`;

        // 🟢 ปรับพารามิเตอร์ของ Imagen 3 ให้ยืดหยุ่น
        const requestData = {
            instances: [{ prompt: finalPrompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio || "16:9", // TEXT, 1:1, 16:9, 9:16
                safetySetting: "block_few",
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
                    prompt: finalPrompt,
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
        return NextResponse.json({
            status: "error",
            message: "Failed to generate image. AI might be busy. Coins not deducted."
        }, { status: 500 });
    }
}