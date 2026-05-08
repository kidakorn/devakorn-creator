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
  History, Loader2, Gift, Heart, Play, ChevronLeft, Copy, Calendar,
  Megaphone, Sparkles, TrendingUp, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from "@/components/DashboardLayout";
import LandingPage from "@/components/LandingPage";
import { useLanguage } from "@/lib/useLanguage";

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
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { t } = useLanguage();

  const handleDailyCheckIn = async () => {
    setIsCheckingIn(true);
    const toastId = toast.loading('Claiming daily reward...');
    try {
      const res = await fetch('/api/user/checkin', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message, { id: toastId, duration: 4000, icon: <Gift className="w-5 h-5 text-amber-500" /> });
        mutate('/api/user/balance');
      } else {
        toast.error(data.message || 'Failed to claim reward', { id: toastId, duration: 3000 });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: toastId });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const { data: balanceData } = useSWR(status === "authenticated" ? '/api/user/balance' : null, fetcher, { refreshInterval: 10000, revalidateOnFocus: true });
  const currentCoins = balanceData?.coinBalance ?? 0;

  const { data: assetsData } = useSWR(status === "authenticated" ? '/api/user/assets' : null, fetcher, { refreshInterval: 10000, revalidateOnFocus: true });
  const { data: communityData, mutate: mutateCommunity } = useSWR(status === "authenticated" ? `/api/public/showcase?page=${currentPage}` : null, fetcher, { refreshInterval: 15000 });

  const allAssets: Asset[] = assetsData?.status === "success" ? assetsData.assets : [];
  const recentAssets = allAssets.slice(0, 5);
  const totalCount = allAssets.length;
  const imageCount = allAssets.filter(a => a.type === 'IMAGE').length;
  const videoCount = allAssets.filter(a => a.type === 'VIDEO').length;

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
    const toastId = toast.loading('Checking your device...');
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
    } catch (error) { toast.error('Connection error', { id: toastId }); } finally { setIsClaiming(false); }
  };

  const handleLike = async (assetId: string) => {
    if (likingId) return;
    setLikingId(assetId);
    try {
      const res = await fetch('/api/social/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId }) });
      const data = await res.json();
      if (res.ok) { mutateCommunity(); mutate('/api/user/balance'); }
      else toast.error(data.message || 'Cannot like this asset');
    } catch (err) { toast.error('Network error.'); }
    finally { setLikingId(null); }
  };

  if (status === "loading") return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
      <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
      <p className="text-gray-500 font-bold">Loading Devakorn AI...</p>
    </div>
  );
  if (status === "unauthenticated") return <LandingPage />;

  return (
    <DashboardLayout>
      <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('overview_title')}</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              {t('overview_welcome')} <span className="text-gray-800 font-bold">{session?.user?.name?.split(' ')[0] || 'Creator'}</span>. {t('overview_subtitle')}
            </p>
          </div>
          <button
            onClick={handleDailyCheckIn}
            disabled={isCheckingIn}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
            {t('overview_daily_reward')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Activity, label: t('overview_total_assets'), value: totalCount, sub: t('overview_all_time'), color: 'bg-red-50 text-red-600', badge: 'Live', badgeColor: 'bg-emerald-100 text-emerald-700' },
            { icon: ImageIcon, label: t('overview_images'), value: imageCount, sub: t('overview_generated'), color: 'bg-blue-50 text-blue-600', badge: null, badgeColor: '' },
            { icon: VideoIcon, label: t('overview_videos'), value: videoCount, sub: t('overview_generated'), color: 'bg-gray-100 text-gray-600', badge: null, badgeColor: '' },
            { icon: Zap, label: t('overview_balance'), value: currentCoins.toLocaleString(), sub: t('overview_coins_available'), color: 'bg-yellow-50 text-yellow-600', badge: null, badgeColor: '', link: '/pricing' },
          ].map(({ icon: Icon, label, value, sub, color, badge, badgeColor, link }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                {badge && <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>}
                {link && <Link href={link} className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-0.5">Top up <ArrowUpRight className="w-3 h-3" /></Link>}
              </div>
              <p className="text-2xl font-black text-gray-900 tabular-nums">{value}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{label}</p>
              <p className="text-xs text-gray-400 font-medium">{sub}</p>
            </div>
          ))}
        </div>

        {/* Analytics + Quick Start */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-500" /> {t('overview_analytics')}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-1">{t('overview_analytics_sub')}</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Images</span>
                <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-gray-900 inline-block" /> Videos</span>
              </div>
            </div>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicUsageData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImage" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#111827" stopOpacity={0.2} /><stop offset="95%" stopColor="#111827" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="image" name="Images" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorImage)" />
                  <Area type="monotone" dataKey="video" name="Videos" stroke="#111827" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVideo)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Start */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('overview_quick_start')}</h2>
            {[
              { href: '/image-studio', icon: PackageOpen, title: 'Image Studio', sub: 'Product photography & design', iconBg: 'bg-red-600', border: 'hover:border-red-400', text: 'group-hover:text-red-600' },
              { href: '/video-creator', icon: VideoIcon, title: 'Video Creator', sub: 'Commercial ads up to 30s', iconBg: 'bg-gray-900', border: 'hover:border-gray-700', text: 'group-hover:text-gray-900' },
              { href: '/campaign-builder', icon: Megaphone, title: 'Campaign Builder', sub: 'AI social media copy', iconBg: 'bg-orange-500', border: 'hover:border-orange-400', text: 'group-hover:text-orange-600' },
              { href: '/prompt-enhancer', icon: Sparkles, title: 'Prompt Magic', sub: 'Enhance prompts with AI', iconBg: 'bg-purple-600', border: 'hover:border-purple-400', text: 'group-hover:text-purple-600' },
            ].map(({ href, icon: Icon, title, sub, iconBg, border, text }) => (
              <Link key={href} href={href} className={`flex items-center gap-3.5 bg-white border border-gray-100 rounded-2xl p-4 ${border} hover:shadow-md transition-all group`}>
                <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold text-gray-900 ${text} transition-colors`}>{title}</p>
                  <p className="text-xs text-gray-400 font-medium truncate">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Community Trending */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-current" /> {t('overview_community')}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{t('overview_community_sub')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-400 px-1">{currentPage}/{totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-5">
            {communityAssets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {communityAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-gray-50 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-all group relative border border-gray-100"
                    onMouseEnter={(e) => { const v = e.currentTarget.querySelector("video"); if (v) v.play().catch(() => {}); }}
                    onMouseLeave={(e) => { const v = e.currentTarget.querySelector("video"); if (v) { v.pause(); v.currentTime = 0; } }}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(asset.id); }}
                        disabled={likingId === asset.id}
                        className={`px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm transition-all flex items-center gap-1 text-[11px] font-bold border border-white/20 ${asset.hasLiked ? 'bg-red-500/90 text-white' : 'bg-black/40 text-white hover:bg-black/60'} disabled:opacity-50`}
                      >
                        {likingId === asset.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Heart className={`w-3 h-3 ${asset.hasLiked ? 'fill-current' : ''}`} />}
                        {asset.likeCount || 0}
                      </button>
                    </div>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {asset.type === "IMAGE" ? (
                        <img src={getAssetSrc(asset)} alt="Asset" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <video src={getAssetSrc(asset)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop playsInline />
                      )}
                      {asset.type === "VIDEO" && (
                        <div className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-bold">
                          <Play className="w-2.5 h-2.5 fill-current" /> VIDEO
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] text-gray-500 font-medium line-clamp-2 leading-snug mb-2">{asset.prompt}</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                        <span className="truncate pr-1">By {asset.user?.name || "Creator"}</span>
                        <span className="flex-shrink-0">{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                <p className="text-sm font-bold text-gray-400">{ t('overview_no_community')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" /> {t('overview_recent')}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{t('overview_recent_sub')}</p>
            </div>
            <Link href="/gallery" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">{t('overview_view_all')} <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAssets.length > 0 ? recentAssets.map((asset) => (
              <div key={asset.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/70 transition-colors group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${asset.type === 'VIDEO' ? 'bg-gray-900 text-white' : 'bg-red-100 text-red-600'}`}>
                  {asset.type === 'VIDEO' ? <VideoIcon className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                </div>
                <p className="flex-1 text-sm font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">{asset.prompt}</p>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex-shrink-0 ${asset.type === 'VIDEO' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'}`}>{asset.type}</span>
                <span className="text-[11px] text-gray-400 font-medium flex-shrink-0 hidden sm:block">{new Date(asset.createdAt).toLocaleDateString()}</span>
              </div>
            )) : (
              <div className="py-12 text-center text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">{t('overview_no_activity')}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}