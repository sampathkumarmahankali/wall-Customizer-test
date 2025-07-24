"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Footer from "@/components/shared/Footer";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  const handleStart = () => {
    if (isLoggedIn) {
      router.push("/create");
    } else {
      router.push("/login");
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col overflow-x-hidden"> {/* Light gold/cream background */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Hero Text */}
          <div className="space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-green-700 uppercase tracking-wide">Welcome to MIALTER</h2>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Create a beautiful virtual altar and honor your loved ones with <span className="text-indigo-600">MIALTER</span>.
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-md">
              MIALTER lets you build heartfelt memorials and altars online. Share memories, photos, and tributes in a serene, customizable space. Invite family and friends to participate and keep memories alive together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
              <Button size="lg" className="px-8 py-3 text-lg w-full sm:w-auto" onClick={handleStart}>Start</Button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-green-700 font-semibold">★ 4.9/5</span>
              <span className="text-gray-500">from over 600 reviews</span>
            </div>
            <div className="mb-8 sm:mb-12" />
          </div>
          {/* Right: Hero Image */}
          <div className="relative flex justify-center items-center group min-h-[220px]">
            <div className="absolute -top-8 -left-8 w-40 h-40 md:w-64 md:h-64 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 transition-transform duration-300 group-hover:-rotate-3 group-hover:-translate-y-2 group-hover:-translate-x-2 hidden sm:block" /> {/* Gold */}
            <div className="absolute -bottom-8 -right-8 w-20 h-20 md:w-32 md:h-32 bg-[#A0522D]/20 rounded-full z-0 transition-transform duration-300 group-hover:rotate-3 group-hover:translate-y-2 group-hover:translate-x-2 hidden sm:block" /> {/* Brown */}
            <div className="absolute top-16 right-0 w-16 h-16 md:w-24 md:h-24 bg-[#C71585]/20 rounded-full z-0 hidden sm:block" /> {/* Rose */}
            <div className="absolute bottom-0 left-1/2 w-12 h-12 md:w-20 md:h-20 bg-[#8e44ad]/20 rounded-full z-0 hidden sm:block" /> {/* Purple */}
            <Image
              src="/uploads/mona-lisa.jpg"
              alt="MIALTER virtual altar preview"
              width={320}
              height={320}
              className="rounded-2xl shadow-2xl relative z-10 object-cover border-4 border-white transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105 w-48 h-48 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px]"
            />
            {/* Decorative swirl or icon */}
            <svg className="absolute top-4 right-4 w-8 h-8 md:w-12 md:h-12 text-[#FFD700]/60 z-20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" /><circle cx="24" cy="24" r="10" /></svg>
          </div>
        </div>
      </div>
      {/* Why MIALTER? section replaced with new hero features section */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">Create your virtual altar for remembrance and honoring</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* User/Photo icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Create an altar with your photos</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Share icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Share with family and friends to add their stories and memories</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Butterfly icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12c2-2 6-2 8 0s6 2 8 0"/><path d="M12 12v8"/><path d="M12 12c-2-2-6-2-8 0"/><path d="M12 12c2-2 6-2 8 0"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Add your favorite ofrendas</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Download icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Download your altar to keep forever</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Paintbrush icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2z"/><path d="M12 17v-6"/><path d="M8 13h8"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Customize your altar style and background</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Copy icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="2" y="2" width="13" height="13" rx="2"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Create multiple altars</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button className="mt-2 px-8 py-3 sm:px-10 sm:py-4 bg-[#FF9800] hover:bg-[#fb8c00] text-white text-base sm:text-lg font-bold rounded-md shadow transition w-full sm:w-auto">Create altar</button>
          </div>
        </div>
      </section>
      {/* Divider between Why MIALTER and How It Works */}
      <div className="flex justify-center my-0">
        <div className="w-20 h-1 sm:w-32 rounded-full bg-gradient-to-r from-[#FFD700]/40 via-[#FF9800]/40 to-[#C71585]/30 shadow-sm" />
      </div>
      {/* How It Works Section */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Rocket icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 20l4-1 5-5a5 5 0 1 0-5-5l-5 5-1 4z"/><circle cx="16.5" cy="7.5" r="1.5"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Start a project</div>
                <div className="text-gray-600">Begin by clicking 'Start' and create your altar session.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Plus icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Add images and ofrendas</div>
                <div className="text-gray-600">Upload your favorite photos or choose from our decor samples.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Edit icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Customize your altar</div>
                <div className="text-gray-600">Arrange, resize, and style your altar with powerful editing tools.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#FFE0CC] flex items-center justify-center shadow-sm">
                {/* Export/Share icon */}
                <svg width="28" height="28" fill="none" stroke="#FF9800" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-lg text-gray-900">Export or share</div>
                <div className="text-gray-600">Download your altar or share it with friends and family instantly.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <div className="py-10 sm:py-16" style={{ background: 'linear-gradient(90deg, #FFF3E0 0%, #FDEBD0 100%)' }}>
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 bg-gradient-to-r from-indigo-600 to-green-600 bg-clip-text text-transparent">What Our Users Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 overflow-x-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 via-white to-indigo-50 rounded-2xl shadow-lg border border-indigo-100">
                <div className="w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-2xl font-bold text-indigo-700 mb-4">
                  {t.avatar}
                </div>
                <p className="text-gray-700 text-center italic mb-3">“{t.quote}”</p>
                <div className="text-sm font-semibold text-indigo-700">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="py-10 sm:py-16" style={{ background: 'linear-gradient(90deg, #FFF8E1 0%, #FDEBD0 100%)' }}>
        <div className="max-w-3xl mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 bg-gradient-to-r from-green-600 to-indigo-600 bg-clip-text text-transparent">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={faq.q} className="bg-white rounded-xl shadow border border-indigo-100 p-4 group">
                <summary className="cursor-pointer font-semibold text-indigo-700 text-lg flex items-center justify-between">
                  {faq.q}
                  <span className="ml-2 text-indigo-400 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="mt-2 text-gray-600 text-base pl-2">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
      {/* Final Call to Action Section */}
      <div className="py-10 sm:py-16 bg-gradient-to-r from-[#FFD700]/80 via-[#C71585]/60 to-[#8e44ad]/60 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center px-2 sm:px-0">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 drop-shadow">Ready to create your dream wall?</h2>
          <p className="text-base sm:text-lg text-white/90 mb-8">Unleash your creativity and design a wall that inspires you every day. Get started now!</p>
          <Button size="lg" className="px-8 py-3 sm:px-10 sm:py-4 text-lg sm:text-xl font-bold bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg rounded-full w-full sm:w-auto" onClick={handleStart}>
            Get Started
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// --- Add Features/Benefits Section below the hero ---

// Insert after the hero section, before <Footer />
// Features data
const features = [
  {
    icon: "🎨",
    title: "AI-Powered Tools",
    description: "Enhance your wall designs with smart AI features for effortless creativity.",
  },
  {
    icon: "🖼️",
    title: "Easy Wall Design",
    description: "Drag, drop, and arrange images to visualize your perfect wall in minutes.",
  },
  {
    icon: "📤",
    title: "Export & Share",
    description: "Download your wall as an image or share it with friends and family instantly.",
  },
  {
    icon: "⚙️",
    title: "Customizable Layouts",
    description: "Choose backgrounds, borders, and more to match your unique style.",
  },
];

// How It Works steps data
const howItWorksSteps = [
  {
    icon: "🚀",
    title: "Start a Project",
    description: "Begin by clicking 'Start' and create your wall design session.",
  },
  {
    icon: "➕",
    title: "Add Images",
    description: "Upload your favorite photos or choose from our decor samples.",
  },
  {
    icon: "🛠️",
    title: "Customize",
    description: "Arrange, resize, and style your images with powerful editing tools.",
  },
  {
    icon: "📤",
    title: "Export or Share",
    description: "Download your wall or share it with friends and family instantly.",
  },
];

// Testimonials data
const testimonials = [
  {
    avatar: "A",
    name: "Alex P.",
    quote: "MIALTER made creating a memorial for my family so meaningful and easy! Highly recommended.",
  },
  {
    avatar: "S",
    name: "Sara K.",
    quote: "The collaborative features brought our relatives together to honor our loved one beautifully.",
  },
  {
    avatar: "J",
    name: "James L.",
    quote: "Sharing memories and photos on MIALTER was seamless. Our friends were touched!",
  },
];

// FAQ data
const faqs = [
  {
    q: "Is MIALTER free to use?",
    a: "Yes! You can create, customize, and share virtual altars for free. Some advanced features may require an account.",
  },
  {
    q: "Do I need to create an account?",
    a: "You can explore and create altars without an account, but saving and sharing requires signing up.",
  },
  {
    q: "Can I use my own images and stories?",
    a: "Absolutely! Upload your own photos, add stories, and invite others to contribute to your altar.",
  },
  {
    q: "How do I share my altar?",
    a: "After saving, use the Share button to get a link you can send to family and friends.",
  },
];

// Insert this section below the hero, before <Footer />
