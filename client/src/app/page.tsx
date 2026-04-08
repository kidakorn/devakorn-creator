/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import fpPromise from "@fingerprintjs/fingerprintjs";
import toast, { Toaster } from "react-hot-toast";
import {
  ImageIcon, VideoIcon, Activity, Zap, Clock, ChevronRight, PackageOpen,
  History, Loader2, Gift, Heart, Play, ChevronLeft, Download // 🟢 ลบ Copy ออก
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from "@/components/DashboardLayout";
import LandingPage from "@/components/LandingPage";

interface Asset {
  id: string; type: string; prompt: string; createdAt: string; category: string;
}

interface CommunityAsset {
  id: string; type: string; prompt: string; outputUrl: string; createdAt: string;
  user: { name: string }; likeCount: number; hasLiked?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: session, status } = useSession();

  const [isClaiming, setIsClaiming] = useState(false);
  const [hideBonusButton, setHideBonusButton] = useState(false);
  const [likingId, setLikingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const { data: balanceData } = useSWR(
    status === "authenticated" ? '/api/user/balance' : null,
    fetcher, { refreshInterval: 10000, revalidateOnFocus: true }
  );
  const currentCoins = balanceData?.coinBalance ?? 0;

  const { data: assetsData } = useSWR(
    status === "authenticated" ? '/api/user/assets' : null,
    fetcher, { refreshInterval: 10000, revalidateOnFocus: true }
  );

  const { data: communityData, mutate: mutateCommunity } = useSWR(
    status === "authenticated" ? `/api/public/showcase?page=${currentPage}` : null,
    fetcher, { refreshInterval: 15000 }
  );

  const allAssets: Asset[] = assetsData?.status === "success" ? assetsData.assets : [];
  const recentAssets = allAssets.slice(0, 5);
  const totalCount = allAssets.length;

  const communityAssets: CommunityAsset[] = communityData?.status === "success" ? communityData.assets : [];
  const totalPages = communityData?.pagination?.totalPages || 1;

  const generateChartData = (assets: Asset[]) => {
    const chart = [
      { name: 'Mon', image: 0, video: 0 }, { name: 'Tue', image: 0, video: 0 },
      { name: 'Wed', image: 0, video: 0 }, { name: 'Thu', image: 0, video: 0 },
      { name: 'Fri', image: 0, video: 0 }, { name: 'Sat', image: 0, video: 0 },
      { name: 'Sun', image: 0, video: 0 },
    ];
    assets.forEach(asset => {
      const date = new Date(asset.createdAt);
      let dayIndex = date.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6;
      if (asset.type === 'IMAGE') chart[dayIndex].image += 1;
      else if (asset.type === 'VIDEO') chart[dayIndex].video += 1;
    });
    return chart;
  };
  const dynamicUsageData = generateChartData(allAssets);

  const getAssetSrc = (asset: CommunityAsset) => {
    if (asset.outputUrl.startsWith('http')) return asset.outputUrl;
    const mimeType = asset.type === "IMAGE" ? "image/png" : "video/mp4";
    return `data:${mimeType};base64,${asset.outputUrl}`;
  };

  const handleClaimBonus = async () => {
    setIsClaiming(true);
    const toastId = toast.loading('กำลังตรวจสอบอุปกรณ์ของคุณ...');
    try {
      const fp = await fpPromise.load();
      const result = await fp.get();
      const response = await fetch('/api/user/claim-free-coins', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId: result.visitorId })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message, { id: toastId, duration: 4000 });
        mutate('/api/user/balance'); setHideBonusButton(true);
      } else {
        toast.error(data.message, { id: toastId, duration: 5000 });
        if (response.status === 403) setHideBonusButton(true);
      }
    } catch (error) { toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ', { id: toastId }); } finally { setIsClaiming(false); }
  };

  const handleLike = async (assetId: string) => {
    if (likingId) return;
    setLikingId(assetId);
    try {
      const res = await fetch('/api/social/like', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId })
      });
      const data = await res.json();
      if (res.ok) {
        mutateCommunity();
        mutate('/api/user/balance');
      } else {
        toast.error(data.message || 'Cannot like this asset');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      console.error(err);
    } finally {
      setLikingId(null);
    }
  };

  if (status === "loading") return <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]"><Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" /><p className="text-gray-500 font-bold">Loading Devakorn AI...</p></div>;
  if (status === "unauthenticated") return <LandingPage />;

  return (
    <DashboardLayout>
      <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Overview Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Welcome back, {session?.user?.name || 'Creator'}. Let's build something amazing today.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600 fill-current" /> Community Trending
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Explore, get inspired, and earn coins by supporting creators.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-500 px-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 min-h-75">
            {communityAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {communityAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group relative"
                    // 🟢 เพิ่ม Event onMouseEnter / onMouseLeave ให้วิดีโอเล่นแค่ตอน Hover
                    onMouseEnter={(e) => {
                      const video = e.currentTarget.querySelector("video");
                      if (video) video.play().catch(() => { });
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget.querySelector("video");
                      if (video) {
                        video.pause();
                        video.currentTime = 0;
                      }
                    }}
                  >

                    <div className="absolute top-3 right-3 z-50">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(asset.id); }}
                        disabled={likingId === asset.id}
                        className={`px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5 border border-white/10 ${asset.hasLiked ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-black/40 text-white hover:bg-black/60'} disabled:opacity-50`}
                      >
                        {likingId === asset.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Heart className={`w-4 h-4 ${asset.hasLiked ? 'fill-current' : ''}`} />
                        )}
                        <span className="text-xs font-bold">{asset.likeCount || 0}</span>
                      </button>
                    </div>

                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {asset.type === "IMAGE" ? (
                        <img src={getAssetSrc(asset)} alt="Asset" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        // 🟢 เอา autoPlay ออก ใส่แค่ muted loop playsInline
                        <video src={getAssetSrc(asset)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop playsInline />
                      )}

                      {/* 🟢 แสดงไอคอน VIDEO */}
                      {asset.type === "VIDEO" && (
                        <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded md flex items-center gap-1.5 text-[10px] font-bold tracking-wider z-10">
                          <Play className="w-3 h-3 fill-current" /> VIDEO
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1 z-10 bg-white relative">
                      <p className="text-[11px] text-gray-500 font-medium truncate mb-3 flex-1 block" title={asset.prompt}>"{asset.prompt}"</p>
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold">
                        <span className="truncate pr-2">By {asset.user?.name || "Creator"}</span>
                        <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <Heart className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500">No community trends found on this page.</p>
              </div>
            )}
          </div>
        </div>

        {/* ... ส่วนสถิติและอื่นๆ ด้านล่างเหมือนเดิมครับ ... */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-red-500/40 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Activity className="w-5 h-5" /></div>
              <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Live Data</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900">{totalCount}</h3>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Total Commercial Assets</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-yellow-500/40 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Zap className="w-5 h-5" /></div>
              <Link href="/pricing" className="text-red-600 text-xs font-bold hover:underline">Top up coins</Link>
            </div>
            <div>
              <div className="flex items-baseline gap-1"><h3 className="text-3xl font-black text-gray-900">{currentCoins.toLocaleString()}</h3><span className="text-gray-400 text-sm font-bold ml-1">Coins</span></div>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Available Balance</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Clock className="w-5 h-5" /></div>
              <span className="text-gray-500 text-xs font-bold flex items-center bg-gray-100 px-2 py-1 rounded-md">Efficiency</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900">1.8<span className="text-base text-gray-400 font-bold ml-1">sec</span></h3>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-wider">Avg. Response Time</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-base font-black text-gray-900 tracking-tight">Usage Analytics</h2><p className="text-xs text-gray-500 font-medium">Generations trend over time (Real-time)</p></div>
            </div>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImage" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#111827" stopOpacity={0.3} /><stop offset="95%" stopColor="#111827" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '14px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="image" name="Images" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorImage)" />
                  <Area type="monotone" dataKey="video" name="Videos" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorVideo)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Start Production</h2>
            <Link href="/image-studio" className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-red-500 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="flex justify-between items-center mb-3"><div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-md"><PackageOpen className="w-5 h-5" /></div><ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors group-hover:translate-x-1" /></div>
              <h3 className="font-black text-lg text-gray-900 group-hover:text-red-500 transition-colors">Product Studio</h3><p className="text-xs text-gray-500 mt-1 font-medium">Create commercial product images</p>
            </Link>
            <Link href="/video-creator" className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="flex justify-between items-center mb-3"><div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-md"><VideoIcon className="w-5 h-5" /></div><ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors group-hover:translate-x-1" /></div>
              <h3 className="font-black text-lg text-gray-900 group-hover:text-gray-900 transition-colors">Video Ads</h3><p className="text-xs text-gray-500 mt-1 font-medium">30s high-quality commercial video</p>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center">
            <div><h2 className="text-base font-black text-gray-900 tracking-tight">Recent Activity</h2><p className="text-xs text-gray-500 font-medium">Your latest 5 generations</p></div>
            <Link href="/gallery" className="text-xs font-bold text-red-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <tbody className="divide-y divide-gray-100">
                {recentAssets.length > 0 ? recentAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6 max-w-50 sm:max-w-md"><p className="truncate text-gray-900 font-bold group-hover:text-red-600 transition-colors">{asset.prompt}</p></td>
                    <td className="py-4 px-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 text-[10px] font-black uppercase tracking-wider ${asset.type === 'VIDEO' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}>{asset.type}</span></td>
                    <td className="py-4 px-6 text-right text-gray-400 text-[10px] font-bold">{new Date(asset.createdAt).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 font-bold">No recent activities found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}