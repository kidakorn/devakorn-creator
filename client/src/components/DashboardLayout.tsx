"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	// สร้าง State สำหรับเปิด/ปิด Sidebar (ค่าเริ่มต้นคือ true = เปิด)
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	// ฟังก์ชันสำหรับสลับสถานะ
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div className="min-h-screen bg-[#F8F9FA] text-text-main flex font-sans overflow-hidden">
			{/* ส่งสถานะไปบอก Sidebar ว่าให้กางหรือหุบ */}
			<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

			<div className="flex-1 flex flex-col h-screen overflow-hidden relative">
				{/* ส่งฟังก์ชันไปให้ปุ่ม Menu ใน Header กดใช้งาน */}
				<Header toggleSidebar={toggleSidebar} />

				{/* พื้นที่ Content หลัก (จะ Scroll ได้แค่ตรงนี้) */}
				<main className="flex-1 overflow-y-auto p-4 md:p-8">
					<div className="max-w-7xl mx-auto">
						{children}
					</div>
				</main>

				{/* Footer แปะไว้ล่างสุดของเนื้อหา */}
				<Footer />
			</div>
		</div>
	);
}