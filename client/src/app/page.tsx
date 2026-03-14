"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
  Server,
  PackageOpen,
  History
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from "@/components/DashboardLayout";

// ข้อมูลจำลองสำหรับกราฟ (ในอนาคตสามารถทำ API มาดึงยอดรายวันได้ครับ)
const usageData = [
  { name: 'Mon', image: 4, video: 0 },
  { name: 'Tue', image: 7, video: 1 },
  { name: 'Wed', image: 5, video: 0 },
  { name: 'Thu', image: 12, video: 2 },
  { name: 'Fri', image: 8, video: 1 },
  { name: 'Sat', image: 15, video: 3 },
  { name: 'Sun', image: 10, video: 2 },
];

interface Asset {
  id: string;
  type: string;
  prompt: string;
  createdAt: string;
  category: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // 🟢 ดึงข้อมูลผลงานล่าสุดมาโชว์ใน Dashboard
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/assets');
        const data = await response.json();
        if (data.status === "success") {
          setRecentAssets(data.assets.slice(0, 5)); // เอาแค่ 5 รายการล่าสุด
          setTotalCount(data.assets.length);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

        {/* --- Title Section --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Overview Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Welcome back, {session?.user?.name || 'Creator'}. Here is your production summary.</p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            AI Engines Operational
          </div>
        </div>

        {/* --- Stats Row --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Generations */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-red-500/40 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                Live Data
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900">{totalCount}</h3>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Total Commercial Assets</p>
            </div>
          </div>

          {/* Current Balance */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-yellow-500/40 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <Link href="/top-up" className="text-primary-red text-xs font-bold hover:underline">Top up coins</Link>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-gray-900">{session?.user?.coinBalance || 0}</h3>
                <span className="text-gray-400 text-sm font-bold ml-1">Coins</span>
              </div>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Available Balance</p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-gray-500 text-xs font-bold flex items-center bg-gray-100 px-2 py-1 rounded-md">
                Efficiency
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
                <p className="text-xs text-gray-500 font-medium">Generations trend over time</p>
              </div>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
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
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Start Production</h2>

            <Link href="/image-studio" className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-red-500 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-md">
                  <PackageOpen className="w-5 h-5" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors group-hover:translate-x-1" />
              </div>
              <h3 className="font-black text-lg text-gray-900 group-hover:text-red-500 transition-colors">Product Studio</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Create commercial product images</p>
            </Link>

            <Link href="/video-creator" className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-md">
                  <VideoIcon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors group-hover:translate-x-1" />
              </div>
              <h3 className="font-black text-lg text-gray-900 group-hover:text-gray-900 transition-colors">Video Ads</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">30s high-quality commercial video</p>
            </Link>

            <Link href="/gallery" className="block bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-5 hover:bg-white hover:border-solid hover:border-gray-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary-red transition-colors">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">View Gallery</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">History</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* --- Recent Activity Table (Dynamic) --- */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight">Recent Activity</h2>
              <p className="text-xs text-gray-500 font-medium">Your latest 5 generations</p>
            </div>
            <Link href="/gallery" className="text-xs font-bold text-red-600 hover:underline">View All</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                  <th className="font-bold py-4 px-6">Prompt Concept</th>
                  <th className="font-bold py-4 px-4 w-32">Module</th>
                  <th className="font-bold py-4 px-4 w-32">Engine</th>
                  <th className="font-bold py-4 px-6 text-right w-40">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentAssets.length > 0 ? recentAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6 max-w-50 sm:max-w-md">
                      <p className="truncate text-gray-900 font-bold group-hover:text-red-600 transition-colors">
                        {asset.prompt}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 text-[10px] font-black uppercase tracking-wider ${asset.type === 'VIDEO' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}>
                        {asset.type === 'IMAGE' ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />} {asset.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1.5 text-gray-600 text-xs font-medium uppercase">
                        {asset.type === 'IMAGE' ? 'Imagen 3' : 'Veo 3.1'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400 text-[10px] font-bold">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400 font-bold">No recent activities found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}