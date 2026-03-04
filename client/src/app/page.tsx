import {
  ImageIcon,
  VideoIcon,
  ArrowRight,
  Zap,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-light-gray text-text-main">
      {/* --- Navigation Bar --- */}
      <nav className="navbar bg-white border-b border-gray-200 px-6 lg:px-12 sticky top-0 z-50">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-red rounded-xl flex items-center justify-center shadow-lg shadow-primary-red/20">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter text-dark-bg">
              DEVAKORN <span className="text-primary-red">CREATOR</span>
            </span>
          </div>
        </div>
        <div className="flex-none gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              System Admin
            </span>
            <span className="text-sm font-semibold text-dark-bg">
              Kidakorn Intha
            </span>
          </div>
          <div className="avatar">
            <div className="w-10 rounded-full ring ring-primary-red ring-offset-base-100 ring-offset-2">
              <Image
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coke"
                alt="admin avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* --- Hero Section --- */}
        <section className="mb-16 text-center">
          <div className="badge badge-outline border-primary-red text-primary-red font-bold mb-4 px-4 py-3">
            POWERED BY GEMINI 3.1 FLASH
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-dark-bg mb-6 tracking-tight">
            Next-Gen AI <span className="text-primary-red">Content.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed">
            Empowering creators with advanced AI-driven image and video
            generation. Transform your ideas into high-impact social media
            content for Facebook and TikTok.
          </p>
        </section>

        {/* --- Tools Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Tool: Image Generation */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-linear-to-r from-primary-red to-secondary-red rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative card bg-white shadow-sm border border-gray-100 p-8 rounded-3xl overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-primary-red/5 rounded-2xl">
                  <ImageIcon className="w-10 h-10 text-primary-red" />
                </div>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                  Nano Banana 2
                </span>
              </div>
              <h2 className="text-3xl font-bold text-dark-bg mb-3">
                Image Generator
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Generate high-fidelity sports graphics, match-day posters, and
                professional visuals. Optimized for 1:1 square and 16:9
                landscape social media formats.
              </p>
              <button className="btn bg-dark-bg hover:bg-primary-red border-none text-white w-full rounded-2xl group/btn transition-all duration-300">
                Launch Image Tool
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Tool: Video Generation */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-linear-to-r from-dark-bg to-primary-red rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative card bg-white shadow-sm border border-gray-100 p-8 rounded-3xl overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-dark-bg/5 rounded-2xl">
                  <VideoIcon className="w-10 h-10 text-dark-bg" />
                </div>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                  Veo Model
                </span>
              </div>
              <h2 className="text-3xl font-bold text-dark-bg mb-3">
                Video Creator
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Create cinematic short-form videos from text prompts for TikTok
                and Reels. Auto-formatted to 9:16 vertical ratio for maximum
                engagement.
              </p>
              <button className="btn bg-primary-red hover:bg-secondary-red border-none text-white w-full rounded-2xl group/btn transition-all duration-300">
                Launch Video Tool
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* --- Footer / Status Bar --- */}
        <footer className="mt-20 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 pt-8 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            API Gemini Status:{" "}
            <span className="text-dark-bg font-semibold uppercase">
              Active & Connected
            </span>
          </div>
          <div className="text-sm font-medium text-gray-400">
            &copy; 2026 Devakorn Creator. All Rights Reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
