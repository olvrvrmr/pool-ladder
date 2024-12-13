'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="lg:hidden bg-blue-800 text-white">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-semibold">Billiards Ladder</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isOpen && (
        <nav className="px-6 py-4">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="block py-2" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="block py-2" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin" className="block py-2" onClick={() => setIsOpen(false)}>
                Admin
              </Link>
            </li>
            <li>
              <Link href="/schedule" className="block py-2" onClick={() => setIsOpen(false)}>
                Schedule
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

export default MobileHeader

