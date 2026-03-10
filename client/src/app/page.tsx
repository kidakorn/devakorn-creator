"use client";

import {
  ImageIcon,
  VideoIcon,
  ArrowUpRight,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MoreHorizontal,
  Server
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const usageData = [
  { name: 'Mon', image: 12, video: 2 },
  { name: 'Tue', image: 19, video: 5 },
  { name: 'Wed', image: 15, video: 3 },
  { name: 'Thu', image: 28, video: 7 },
  { name: 'Fri', image: 22, video: 4 },
  { name: 'Sat', image: 35, video: 10 },
  { name: 'Sun', image: 42, video: 15 },
];

export default function Home() {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* --- Title Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Monitor your AI generation usage and system health.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Operational
        </div>
      </div>

      {/* --- Stats Row --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-red-500/40 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +24%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900">173</h3>
            <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Total Generations</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-gray-900/40 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-xs font-bold flex items-center bg-gray-100 px-2 py-1 rounded-md">
              Free Tier
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-gray-900">45</h3>
              <span className="text-gray-400 text-sm font-bold">/ 100</span>
            </div>
            <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Daily Quota Used</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-gray-900 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-xs font-bold flex items-center bg-gray-100 px-2 py-1 rounded-md">
              Latency
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900">1.8<span className="text-base text-gray-400 font-bold ml-1">sec</span></h3>
            <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Avg. Response Time</p>
          </div>
        </div>
      </div>

      {/* --- Middle Row: Chart & Shortcuts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight">Usage Analytics</h2>
              <p className="text-xs text-gray-500 font-medium">Generations over the last 7 days</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-red-500/50">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>

          {/* ปรับแก้ความสูงตรงนี้ให้กราฟแสดงผลได้ชัดเจนขึ้น */}
          <div className="w-full h-75">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="image" name="Images" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorImage)" />
                <Area type="monotone" dataKey="video" name="Videos" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorVideo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Quick Tools</h2>

          <Link href="/image-studio" className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-center mb-3">
              <div className="w-10 h-10 bg-red-600 border border-red-500/20 rounded-xl flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors group-hover:translate-x-1" />
            </div>
            <h3 className="font-black text-lg text-gray-900 group-hover:text-red-500 transition-colors">Image Studio</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Text to high-fidelity image</p>
          </Link>

          <Link href="/video-creator" className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-lg hover:shadow-gray-900/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-center mb-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-md">
                <VideoIcon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors group-hover:translate-x-1" />
            </div>
            <h3 className="font-black text-lg text-gray-900 group-hover:text-gray-900 transition-colors">Video Creator</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Animate your imagination</p>
          </Link>
        </div>
      </div>

      {/* --- Bottom Row: Recent Activity Table --- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-black text-gray-900 tracking-tight">System Logs</h2>
            <p className="text-xs text-gray-500 font-medium">Recent processing tasks and statuses</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                <th className="font-bold py-4 px-6">Task Description</th>
                <th className="font-bold py-4 px-4 w-32">Module</th>
                <th className="font-bold py-4 px-4 w-32">Model Engine</th>
                <th className="font-bold py-4 px-4 w-32">Status</th>
                <th className="font-bold py-4 px-6 text-right w-40">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">

              <tr className="hover:bg-gray-50 transition-colors group cursor-pointer">
                <td className="py-4 px-6 max-w-50 sm:max-w-md">
                  <p className="truncate text-gray-900 font-bold group-hover:text-red-600 transition-colors">Generate product background for POS interface</p>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-700 text-[11px] font-black uppercase tracking-wider">
                    <ImageIcon className="w-3 h-3" /> Image
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="flex items-center gap-1.5 text-gray-600 text-xs font-medium">
                    <Server className="w-3 h-3" /> Imagen 3
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="flex items-center gap-1.5 text-gray-900 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Success
                  </span>
                </td>
                <td className="py-4 px-6 text-right text-gray-400 text-xs font-bold">
                  Just now
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors group cursor-pointer">
                <td className="py-4 px-6 max-w-50 sm:max-w-md">
                  <p className="truncate text-gray-900 font-bold group-hover:text-red-600 transition-colors">Cinematic shot of flying Thai Tuk-Tuk hovering...</p>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider">
                    <VideoIcon className="w-3 h-3" /> Video
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="flex items-center gap-1.5 text-gray-600 text-xs font-medium">
                    <Server className="w-3 h-3" /> Veo 3.1
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="flex items-center gap-1.5 text-gray-900 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Success
                  </span>
                </td>
                <td className="py-4 px-6 text-right text-gray-400 text-xs font-bold">
                  2 hours ago
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}