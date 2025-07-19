"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

const Navbar = () => {
  const pathname = usePathname();
  return (
    <div className='mx-28 my-6 px-8 py-2 flex items-center gap-24 shadow-md border border-blue-200 bg-blue-400 bg-opacity-15 rounded-full '>
      <Link href="/dashboard" className="font-sans font-bold italic text-2xl text-black">
        VisualizeIt
        <span className="font-bold text-blue-500">.ai</span>
      </Link>
      <div className='flex items-center gap-4'>
        <Link href="/generate" className={`flex items-center gap-3 rounded-full px-3 text-lg font-semibold text-muted-foreground py-1 my-2 transition-all hover:bg-blue-300 ${pathname === "/generate" ? "bg-blue-400 text-white" : ""
          }`}>
          Generate
        </Link>
        <Link href="/my-assets" className={`flex items-center gap-3 rounded-full px-3 text-lg font-semibold text-muted-foreground py-1 my-2 transition-all hover:bg-blue-300 ${pathname === "/my-assets" ? "bg-blue-400 text-white" : ""
          }`}>
          My Assets
        </Link>
      </div>
    </div>
  )
}

export default Navbar