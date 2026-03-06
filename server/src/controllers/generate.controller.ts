import { Request, Response } from 'express';

// 🟢 ฟังก์ชันค้นหารหัสภาพแบบทะลวงทุกชั้น (ไม่สนชื่อ Key)
const extractImageString = (obj: any): string => {
    if (typeof obj === 'string' && obj.length > 1000) return obj;
    if (typeof obj !== 'object' || obj === null) return "";
    for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].length > 1000) {
            return obj[key]; // เจอข้อความที่ยาวเกิน 1000 ตัวอักษร (คือรูปแน่นอน!)
        }
        if (typeof obj[key] === 'object') {
            const found = extractImageString(obj[key]);
            if (found) return found;
        }
    }
    return "";
};

export const generateImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prompt, aspectRatio } = req.body;
        const apiKey = process.env.GEMINI_API_KEY || '';

        if (!apiKey) {
            res.status(500).json({ error: 'API Key is missing' });
            return;
        }

        const modelName = "imagen-4.0-generate-001"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;

        let formatRatio = "1:1";
        if (aspectRatio === "16:9") formatRatio = "16:9";
        if (aspectRatio === "9:16") formatRatio = "9:16";

        const payload = {
            instances: [
                { prompt: prompt } 
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: formatRatio
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Error:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "Google API Error");
        }

        // 🟢 เรียกใช้ฟังก์ชันทะลวงหาข้อมูลภาพ
        const base64Image = extractImageString(data);

        if (!base64Image) {
            console.error("❌ ข้อมูลที่ได้มาไม่มีรูปภาพ! ข้อมูล:", JSON.stringify(data, null, 2));
            throw new Error("ไม่สามารถดึงรูปภาพจากข้อมูลที่ตอบกลับมาได้");
        }

        res.status(200).json({
            status: 'success',
            image: base64Image,
            mimeType: "image/png" // จาก Terminal ของคุณ Google ส่งมาเป็น PNG เสมอ
        });

    } catch (error: any) {
        console.error('Generation Error:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
    }
};