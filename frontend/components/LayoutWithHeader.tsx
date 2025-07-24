"use client";
import React from "react";
import Header from "@/components/shared/Header";

export default function LayoutWithHeader({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
} 