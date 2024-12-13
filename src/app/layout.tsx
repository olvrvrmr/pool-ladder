import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Billiards Ladder',
  description: 'Manage your local billiards club ladder competition',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="flex min-h-screen bg-[#f8f9fc]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <TopNav />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <div className="p-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}

