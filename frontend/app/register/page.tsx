"use client"

import Footer from "@/components/shared/Footer";
import RegisterForm from "@/components/auth/RegisterForm";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || undefined;
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col overflow-x-hidden"> {/* Light gold/cream background */}
      {/* Decorative background shapes */}
      <div className="absolute top-20 -left-8 w-64 h-64 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 pointer-events-none" /> {/* Gold */}
      <div className="absolute -bottom-8 right-8 w-32 h-32 bg-[#A0522D]/20 rounded-full z-0 pointer-events-none" /> {/* Brown */}
      <div className="absolute top-32 right-24 w-24 h-24 bg-[#C71585]/20 rounded-full z-0 pointer-events-none" /> {/* Rose */}
      <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-[#8e44ad]/20 rounded-full z-0 pointer-events-none" /> {/* Purple */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <RegisterForm redirect={redirect} />
      </div>
      <Footer />
    </div>
  )
} 