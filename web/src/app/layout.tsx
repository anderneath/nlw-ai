import { ThemeProvider } from '@/components/theme-provider'
import { Button, ModeToggle, Separator } from '@/components/ui'
import { Github } from 'lucide-react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'upload.ai',
  description: 'Desenvolvido com 💜 no NLW da Rocketseat'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={twMerge(inter.className, 'min-h-screen flex flex-col')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="px-6 py-3 flex items-center justify-between border-b">
            <h1 className="text-xl font-bold">upload.ai</h1>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Desenvolvido com 💜 no NLW da Rocketseat
              </span>

              <Separator orientation="vertical" className="h-6" />

              <Button variant="outline" asChild>
                <Link href="https://github.com/anderneath/nlw-ai">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Link>
              </Button>
              <ModeToggle />
            </div>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
