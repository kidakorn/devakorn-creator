import { Request, Response } from 'express';
import { GoogleAuth } from 'google-auth-library';

export const generateImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const prompt = req.body.prompt || "A futuristic city in cyberpunk style";
    const aspectRatio = req.body.aspectRatio || "1:1";
    const file = req.file;

    // ปลุกกุญแจ
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();

    const projectId = 'devakorn-creator-ai';
    const location = 'us-central1';

    // เลือกโมเดล: ถ้ามีรูปใช้ capability-001 (แก้ไข) | ถ้าไม่มีรูปใช้ generate-001 (เจนใหม่)
    const model = file ? 'imagen-3.0-capability-001' : 'imagen-3.0-generate-001';

    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

    const instanceData: any = { prompt: prompt };

    // 🟢 จุดสำคัญที่ 2 ที่แก้ไขแล้ว: เอา object 'image' ที่ครอบอยู่ออกไป
    if (file) {
      const imageBase64 = file.buffer.toString('base64');

      // ชี้เป้าให้ AI รู้ว่ารูปตั้งต้นคือ [1]
      if (!prompt.includes('[1]')) {
        instanceData.prompt = prompt + " [1]";
      }

      instanceData.referenceImages = [
        {
          referenceId: 1,
          referenceType: "REFERENCE_TYPE_RAW",
          referenceImage: {
            bytesBase64Encoded: imageBase64 // <-- ส่ง base64 เข้าไปตรงๆ แบบนี้เลยครับ
          }
        }
      ];
    }

    // สั่งลุย!
    const response = await client.request({
      url: url,
      method: 'POST',
      data: {
        instances: [instanceData],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio
        }
      }
    });

    // รับรูปภาพกลับมา
    const base64Image = (response.data as any).predictions[0].bytesBase64Encoded;

    res.status(200).json({
      status: 'success',
      image: base64Image
    });

  } catch (error: any) {
    console.error("Error generating image:", JSON.stringify(error.response?.data || error.message, null, 2));
    res.status(500).json({
      status: 'error',
      message: "เกิดข้อผิดพลาดในการเจนรูป: " + (error.response?.data?.error?.message || "ไม่สามารถเชื่อมต่อ Vertex AI ได้")
    });
  }
};