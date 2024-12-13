'use client'

import { Search, Bell } from 'lucide-react'
import { SignInButton, SignOutButton, useAuth } from '@clerk/nextjs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function TopNav() {
  const { userId } = useAuth()
  const pathSegments = window.location.pathname.split('/').filter(Boolean)

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center">
          <div className="flex items-center text-gray-500 text-sm">
            <span>Pages</span>
            {pathSegments.map((segment, index) => (
              <span key={index}>
                <span className="mx-2">/</span>
                <span className="capitalize">{segment}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-64 bg-gray-50"
            />
          </div>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-500" />
          </Button>

          {userId ? (
            <SignOutButton>
              <Button variant="outline">Sign out</Button>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  )
}

