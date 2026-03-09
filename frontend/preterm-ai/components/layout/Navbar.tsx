'use client'
// components/layout/Navbar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Activity, Brain, Code2, ChevronRight } from 'lucide-react'

const NAV_LINKS = [
  { href: '/', label: 'Overview', icon: Activity },
  { href: '/simulation', label: 'AI Simulation', icon: Brain },
  { href: '/architecture', label: 'Architecture', icon: Code2 },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-3">
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-cyan-500/15 rounded-lg blur-md group-hover:bg-cyan-500/25 transition-all" />
              <div className="relative bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center w-8 h-8">
                <Activity size={16} className="text-white" />
              </div>
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm tracking-tight">PreTermAI</span>
              <div className="text-[10px] text-cyan-700/80 leading-none font-mono">v2.0 • Clinical AI</div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-xl ring-1 ring-cyan-300/50"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* CTA */}
          <Link href="/simulation">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-shadow"
            >
              Try Demo <ChevronRight size={12} />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

