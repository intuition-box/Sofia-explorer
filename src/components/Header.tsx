import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'
import { Link, useLocation } from 'react-router-dom'
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Search, Bell, Home, Wallet, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from '../hooks/useTheme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function Header() {
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const walletAddress = user?.wallet?.address
  const displayAddress = walletAddress
    ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
    : ''

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
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
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{displayAddress.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                  {displayAddress}
                </DropdownMenuItem>
                <Link to="/profile">
                  <DropdownMenuItem>My Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => logout()}>
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
