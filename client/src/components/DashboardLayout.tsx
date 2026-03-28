/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	// 🟢 1. สร้าง State เช็คว่าระบบอ่านความจำเสร็จหรือยัง
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const savedState = localStorage.getItem("devakorn_sidebar_state");

		if (savedState !== null) {
			setIsSidebarOpen(savedState === "true");
		} else {
			setIsSidebarOpen(window.innerWidth > 768);
		}

		// 🟢 2. อ่านความจำเสร็จแล้ว อนุญาตให้แสดงผลได้!
		setIsMounted(true);
	}, []);

	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => {
			const newState = !prev;
			localStorage.setItem("devakorn_sidebar_state", String(newState));
			return newState;
		});
	};

	// 🟢 3. เบรกระบบ: ถ้ายังอ่านไม่เสร็จ ให้โชว์พื้นหลังเปล่าๆ ไปก่อน (เสี้ยววินาที) ป้องกันการกระตุกกางออก
	if (!isMounted) {
		return <div className="min-h-screen bg-[#F8F9FA]"></div>;
	}

	return (
		<div className="min-h-screen w-full bg-[#F8F9FA] text-text-main flex font-sans overflow-hidden">
			<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

			<div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
				<Header toggleSidebar={toggleSidebar} />

				{/* 🟢 เพิ่ม w-full ให้ main */}
				<main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
					{/* 🟢 เพิ่ม w-full ให้กล่อง max-w-7xl ตรงนี้สำคัญมาก! ถ้าไม่มีมันจะหดตัว */}
					<div className="max-w-7xl w-full mx-auto">
						{children}
					</div>
				</main>

				<Footer />
			</div>
		</div>
	);
}