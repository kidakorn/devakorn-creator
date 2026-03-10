import { Request, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GoogleGenAI } = require('@google/genai');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Storage } = require('@google-cloud/storage');

const client = new GoogleGenAI({
  vertexai: true,
  project: 'devakorn-creator-ai',
  location: 'us-central1',
});
const storage = new Storage();

export const generateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, category, aspectRatio } = req.body;

    if (!prompt) {
      res.status(400).json({ status: 'error', message: 'Please provide a video prompt.' });
      return;
    }

    const finalPrompt = category && category !== 'Other'
      ? `Video Style: ${category}. ${prompt}`
      : prompt;

    console.log("🎬 [1/3] Submitting video job to Veo AI...");

    let operation = await client.models.generateVideos({
      model: 'veo-3.1-generate-001',
      prompt: finalPrompt,
      config: {
        aspectRatio: aspectRatio || "16:9",
      }
    });

    console.log(`🎫 [2/3] Got Ticket: ${operation.name}`);
    console.log("⏳ Waiting for AI to render (approx 1-3 mins)...");

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 15000));
      operation = await client.operations.get({ operation: operation });
      console.log("🔄 Still rendering... checking again in 15 seconds.");
    }

    console.log("✅ [3/3] Video generation complete!");

    let videoBase64 = null;
    const videoData = operation.response?.generatedVideos?.[0]?.video;

    if (!videoData) {
      throw new Error("No video data received from AI.");
    }

    // 🟢 จุดสำคัญที่สุด: แก้ปัญหา Double Base64 Encoding
    if (videoData.videoBytes) {
      // ตรวจสอบว่าถ้า AI ส่งมาเป็น String Base64 อยู่แล้ว ให้ใช้งานได้เลยทันที
      if (typeof videoData.videoBytes === 'string') {
        videoBase64 = videoData.videoBytes;
      } else {
        // ถ้ามาเป็น Buffer ค่อยแปลง (ดักกันเหนียว)
        videoBase64 = Buffer.from(videoData.videoBytes).toString('base64');
      }
    }
    else if (videoData.uri && videoData.uri.startsWith('gs://')) {
      const bucketName = videoData.uri.split('/')[2];
      const fileName = videoData.uri.split('/').slice(3).join('/');
      const [fileContents] = await storage.bucket(bucketName).file(fileName).download();
      videoBase64 = fileContents.toString('base64');
    }

    if (!videoBase64) {
      throw new Error("Could not process the video data.");
    }

    res.status(200).json({
      status: 'success',
      videoBase64: videoBase64
    });

  } catch (error: any) {
    console.error("❌ Error generating video:", error.message || error);
    res.status(500).json({ status: 'error', message: "Failed to generate video. AI might be busy." });
  }
};