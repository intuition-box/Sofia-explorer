import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'
import { Link, useLocation } from 'react-router-dom'
import { Button } from "./ui/button";
import { Search, Bell, Home, Wallet, LogOut, Sun, Moon, ShoppingCart } from "lucide-react";
import { useTheme } from '../hooks/useTheme'
import { useEnsNames } from '../hooks/useEnsNames'
import { useCart } from '../hooks/useCart'
import type { Address } from 'viem'
import './styles/header.css'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function Header({ onCartClick }: { onCartClick?: () => void } = {}) {
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const cart = useCart()

  const walletAddress = user?.wallet?.address
  const addresses = walletAddress ? [walletAddress as Address] : []
  const { getDisplay, getAvatar } = useEnsNames(addresses)
  const ensName = walletAddress ? getDisplay(walletAddress as Address) : ''
  const ensAvatar = walletAddress ? getAvatar(walletAddress as Address) : ''
  const displayAddress = walletAddress
    ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
    : ''

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b" style={{ zoom: 1.50 }}>
      <div className="flex h-14 items-center justify-between px-4 w-full">
        {/* Left side - Logo and Search */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img src={theme === 'dark' ? '/logo.png' : '/logo_invert.png'} alt="Sofia" className="h-6 w-6" />
              <h1 className="text-xl font-bold">Sofia</h1>
            </Link>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search Sofia..."
              className="w-full h-9 rounded-full bg-muted pl-10 pr-4 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
        </div>

        {/* Right side - Navigation + Auth */}
        <nav className="flex items-center space-x-1 flex-shrink-0 ml-4">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-9 w-9 hdr-cart-btn" onClick={onCartClick}>
              <img src={theme === 'dark' ? '/logo.png' : '/logo_invert.png'} alt="Cart" className="h-5 w-5" />
            </Button>
            {cart.count > 0 && (
              <span className="min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none flex-shrink-0 px-[3px] -ml-1">
                {cart.count}
              </span>
            )}
          </div>

          <Link to="/">
            <Button variant={location.pathname === '/' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9">
              <Home className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {ready && !authenticated && (
            <Button size="sm" onClick={() => login()} className="ml-2">
              <Wallet className="h-4 w-4 mr-1" />
              Connect
            </Button>
          )}

          {ready && authenticated && walletAddress && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="p-1 h-9 w-9">
                  <img src={ensAvatar} alt={ensName} className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
                  <span className="sr-only">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="hdr-dropdown">
                {/* User info header */}
                <div className="hdr-user-info">
                  <img src={ensAvatar} alt={ensName} className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
                  <div className="hdr-user-meta">
                    <div className="hdr-user-name">{ensName}</div>
                    <div className="hdr-user-address">{displayAddress}</div>
                  </div>
                </div>
                <div className="hdr-divider" />
                <Link to="/profile">
                  <DropdownMenuItem className="hdr-menu-item">My Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => logout()} className="hdr-menu-item">
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
