import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'
import { Link, useLocation } from 'react-router-dom'
import { Wallet, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/resonance', label: 'Resonance' },
]

export default function Navbar() {
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const walletAddress = user?.wallet?.address
  const displayAddress = walletAddress
    ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
    : ''

  const links = [
    ...NAV_LINKS,
    ...(ready && authenticated
      ? [{ to: '/profile', label: 'My Profile' }]
      : []),
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Sofia" className="h-7 w-7" />
            <span className="font-display text-lg">Sofia</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Auth + Mobile menu */}
        <div className="flex items-center gap-2">
          {ready && !authenticated && (
            <Button size="sm" onClick={() => login()}>
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}

          {ready && authenticated && walletAddress && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Wallet className="h-4 w-4" />
                  {displayAddress}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-6 flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
