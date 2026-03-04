my-content-generator/

├── client/                 # Frontend: Next.js + daisyUI + React Query

└── server/                 # Backend: Node.js + Express



Frontend

client/

├── public/                 # เก็บไฟล์ Static เช่น โลโก้เพจ, ฟอนต์

├── src/

│   ├── app/                # Next.js App Router (จัดการหน้า Routing)

│   │   ├── layout.tsx      # โครงสร้างหลัก (Navbar, Sidebar)

│   │   ├── page.tsx        # หน้า Home (Dashboard หลัก)

│   │   ├── image-gen/      # หน้าสำหรับสร้างรูปภาพ

│   │   │   └── page.tsx

│   │   └── video-gen/      # หน้าสำหรับสร้างวีดิโอลง TikTok

│   │       └── page.tsx

│   ├── components/         # UI Components (ใช้ daisyUI เป็นหลัก)

│   │   ├── ui/             # ปุ่ม, Input, Loading Spinner, Card

│   │   └── forms/          # ฟอร์มสำหรับรับ Prompt

│   ├── lib/                # ไฟล์ตั้งค่าและ Utilities

│   │   ├── axios.ts        # ตั้งค่า Base URL สำหรับยิง API ไปหา Backend

│   │   └── utils.ts        # ฟังก์ชันช่วยเหลือต่างๆ

│   ├── store/              # Zustand (จัดการ State เช่น เก็บสถานะ/ผลลัพธ์ที่เจนเสร็จ)

│   │   └── useContentStore.ts

│   └── types/              # TypeScript Interfaces

├── tailwind.config.ts      # ตั้งค่า Tailwind และเรียกใช้งาน Plugin daisyUI

├── package.json

└── .env.local              # เก็บตัวแปรแวดล้อม (เช่น NEXT\_PUBLIC\_API\_URL)



Backend

server/

├── src/

│   ├── config/             # ตั้งค่าระบบ

│   │   └── env.ts          # ดึงค่าจาก .env มาตรวจสอบก่อนใช้งาน

│   ├── controllers/        # รับ Request จากหน้าเว็บ และส่ง Response กลับ

│   │   ├── image.controller.ts

│   │   └── video.controller.ts

│   ├── routes/             # กำหนด Endpoint ของ API

│   │   ├── image.routes.ts # เช่น POST /api/generate/image

│   │   └── video.routes.ts # เช่น POST /api/generate/video

│   ├── services/           # โลจิกหลักที่คุยกับ Gemini API

│   │   ├── geminiImage.service.ts

│   │   └── geminiVideo.service.ts

│   ├── middlewares/        # ดักจับ Error หรือ Validate ข้อมูลด้วย Zod

│   │   └── validateRequest.ts

│   ├── types/              # TypeScript Interfaces ฝั่ง Backend

│   └── index.ts            # จุดเริ่มต้นของ Server (Express Setup \& App Listen)

├── package.json

├── tsconfig.json           # ตั้งค่า TypeScript สำหรับ Node.js

└── .env                    # เก็บ API Key ของ Gemini (ห้ามหลุดไปที่ Frontend เด็ดขาด)

