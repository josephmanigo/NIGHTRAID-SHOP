import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NIGHTRAID SHOP',
  description: 'High-performance gaming gear and apparel engineered for the elite. Dominate every server.',
  icons: {
    icon: '/images/nightraid logo - Edited.png',
    apple: '/images/nightraid logo - Edited.png',
  },
}

import { CartSidebar } from "@/components/cart-sidebar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased bg-background overflow-x-hidden`}>
        <CartSidebar />
        {children}
      </body>
    </html>
  )
}
