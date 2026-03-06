import { Router } from 'express';
import { generateImage } from '../controllers/generate.controller';

const router = Router();

// เมื่อมี Request แบบ POST เข้ามาที่ /image ให้ไปเรียกใช้ Controller
router.post('/image', generateImage);

// ในอนาคตถ้ามี Video ก็มาเพิ่มตรงนี้ได้เลย เช่น router.post('/video', generateVideo);

export default router;