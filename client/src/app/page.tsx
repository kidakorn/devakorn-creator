"use client";

import {
  ImageIcon,
  VideoIcon,
  LayoutDashboard,
  Settings as SettingsIcon,
  Search,
  Bell,
  ArrowUpRight,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-light-gray text-text-main flex flex-col md:flex-row font-sans">

      {/* --- Sidebar --- */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight text-dark-bg">
              DEVAKORN<span className="text-primary-red">.</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          {/* เมนู Active ใช้สี primary-red อ่อนๆ */}
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 bg-primary-red/10 text-primary-red rounded-lg font-bold transition-all">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
          {/* เมนูธรรมดา Hover แล้วเป็นสี dark-bg */}
          <Link href="/image-studio" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
            <Sparkles className="w-4 h-4" /> Image Studio
          </Link>
          <Link href="/video-creator" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
            <VideoIcon className="w-4 h-4" /> Video Creator
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-text-main/60 hover:bg-light-gray hover:text-dark-bg rounded-lg font-medium transition-all">
            <SettingsIcon className="w-4 h-4" /> Settings
          </Link>
        </nav>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">

        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1">
            <label className="flex items-center gap-2 bg-light-gray border border-transparent focus-within:border-primary-red/30 w-96 rounded-lg px-3 py-2 transition-all">
              <Search className="w-4 h-4 text-text-main/40" />
              <input type="text" className="bg-transparent border-none outline-none text-sm w-full placeholder-text-main/40 text-dark-bg" placeholder="Search..." />
            </label>
          </div>

          <div className="flex-none flex items-center gap-6">
            <button className="relative text-text-main/40 hover:text-primary-red transition-colors">
              <Bell className="w-5 h-5" />
              {/* แจ้งเตือนใช้ secondary-red ให้ดูเด้งขึ้นมา */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-secondary-red rounded-full border border-white"></span>
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-dark-bg group-hover:text-primary-red transition-colors">Kidakorn Intha</p>
                <p className="text-xs text-text-main/50">Admin</p>
              </div>
              <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coke" alt="avatar" width={36} height={36} className="rounded-full bg-light-gray border border-gray-200" unoptimized />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">

          {/* Title Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-2xl font-black text-dark-bg tracking-tight">Overview</h1>
              <p className="text-text-main/60 text-sm mt-1 font-medium">Monitor your AI generation usage and recent activities.</p>
            </div>
            <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-md flex items-center gap-2 text-xs font-bold text-dark-bg shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              API Connected
            </div>
          </div>

          {/* --- Stats Row --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between hover:border-primary-red/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <p className="text-text-main/60 text-sm font-bold">Total Generations</p>
                <Activity className="w-4 h-4 text-primary-red" />
              </div>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-black text-dark-bg">128</h3>
                <span className="text-green-600 text-xs font-bold flex items-center mb-1 bg-green-50 px-2 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12%
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between hover:border-primary-red/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <p className="text-text-main/60 text-sm font-bold">Daily Quota</p>
                <Zap className="w-4 h-4 text-secondary-red" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-black text-dark-bg">45</h3>
                  <span className="text-text-main/50 text-sm font-bold">/ 70</span>
                </div>
                {/* หลอด Progress Bar สี primary-red */}
                <div className="w-full bg-light-gray rounded-full h-1.5 mt-4">
                  <div className="bg-primary-red h-1.5 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between hover:border-primary-red/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <p className="text-text-main/60 text-sm font-bold">Avg. Response Time</p>
                <Clock className="w-4 h-4 text-dark-bg" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-dark-bg">1.2<span className="text-base text-text-main/50 font-bold ml-1">sec</span></h3>
              </div>
            </div>
          </div>

          {/* --- Main Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Quick Tools */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-sm font-black text-dark-bg uppercase tracking-wider">Shortcuts</h2>

              <Link href="/image-studio" className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-red hover:shadow-md hover:shadow-primary-red/10 transition-all group">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-8 h-8 bg-primary-red/10 border border-primary-red/20 rounded-lg flex items-center justify-center text-primary-red">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-main/30 group-hover:text-primary-red transition-colors" />
                </div>
                <h3 className="font-bold text-dark-bg group-hover:text-primary-red transition-colors">Image Studio</h3>
                <p className="text-xs text-text-main/60 mt-1 font-medium">Generate images with Imagen 4</p>
              </Link>

              <Link href="/video-creator" className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-dark-bg hover:shadow-md transition-all group">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-8 h-8 bg-light-gray border border-gray-200 rounded-lg flex items-center justify-center text-dark-bg">
                    <VideoIcon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-main/30 group-hover:text-dark-bg transition-colors" />
                </div>
                <h3 className="font-bold text-dark-bg">Video Creator</h3>
                <p className="text-xs text-text-main/60 mt-1 font-medium">Generate videos with Veo 2</p>
              </Link>
            </div>

            {/* Recent Generations Table */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black text-dark-bg uppercase tracking-wider">Recent Activity</h2>
                <button className="text-xs font-bold text-primary-red hover:underline transition-colors">View All</button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex-1 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-light-gray/50">
                        <th className="font-bold text-dark-bg py-4 px-5">Prompt</th>
                        <th className="font-bold text-dark-bg py-4 px-4">Type</th>
                        <th className="font-bold text-dark-bg py-4 px-4">Status</th>
                        <th className="font-bold text-dark-bg py-4 px-5 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">

                      {/* Item 1 */}
                      <tr className="hover:bg-light-gray/50 transition-colors">
                        <td className="py-4 px-5 max-w-50">
                          <p className="truncate text-dark-bg font-semibold">A cute Golden Retriever wearing a Liverpool...</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-primary-red/20 bg-primary-red/5 text-primary-red text-xs font-bold">
                            <ImageIcon className="w-3 h-3" /> Image
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="flex items-center gap-1.5 text-dark-bg text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Success
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right text-text-main/50 text-xs font-semibold">
                          Just now
                        </td>
                      </tr>

                      {/* Item 2 */}
                      <tr className="hover:bg-light-gray/50 transition-colors">
                        <td className="py-4 px-5 max-w-50">
                          <p className="truncate text-dark-bg font-semibold">A tiny adorable fluffy dragon sleeping inside...</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-primary-red/20 bg-primary-red/5 text-primary-red text-xs font-bold">
                            <ImageIcon className="w-3 h-3" /> Image
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="flex items-center gap-1.5 text-dark-bg text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Success
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right text-text-main/50 text-xs font-semibold">
                          15 mins ago
                        </td>
                      </tr>

                      {/* Item 3 */}
                      <tr className="hover:bg-light-gray/50 transition-colors">
                        <td className="py-4 px-5 max-w-50">
                          <p className="truncate text-dark-bg font-semibold">Tactical analysis background with red arrows...</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 bg-white text-dark-bg text-xs font-bold">
                            <VideoIcon className="w-3 h-3" /> Video
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="flex items-center gap-1.5 text-dark-bg text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Success
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right text-text-main/50 text-xs font-semibold">
                          2 hours ago
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}