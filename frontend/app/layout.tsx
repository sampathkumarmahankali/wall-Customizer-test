import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from "@/components/ClientLayout"
import LayoutWithHeader from "@/components/LayoutWithHeader"

export const metadata: Metadata = {
  title: 'MIALTER',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          <LayoutWithHeader>{children}</LayoutWithHeader>
        </ClientLayout>
      </body>
    </html>
  )
}
