import express from 'express';
import multer from 'multer';
import { generateImage } from '../controllers/generate.controller';
import { enhancePrompt } from '../controllers/prompt.controller';

const router = express.Router();

// 🟢 ตั้งค่า multer ให้เก็บไฟล์ไว้ใน Memory ชั่วคราว (เพื่อเอาไปแปลงเป็น Base64)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // ล็อกขนาดไฟล์ไม่เกิน 5MB ฝั่งเซิร์ฟเวอร์ด้วย
});

router.post('/image', upload.single('image'), generateImage);

router.post('/enhance-prompt', enhancePrompt);

export default router;