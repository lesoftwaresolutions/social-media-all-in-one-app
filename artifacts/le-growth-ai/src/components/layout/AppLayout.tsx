import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  PenTool, 
  Sparkles, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Settings, 
  CreditCard,
  LogOut,
  Menu
} from 'lucide-react';
import { SiInstagram, SiFacebook, SiTiktok } from 'react-icons/si';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LE_Growth_Logo from '@assets/LE_Growth_1782045791566.png';

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const contentNavigation = [
  { name: 'Create Post', href: '/content-studio', icon: PenTool },
  { name: 'AI Generator', href: '/ai-generator', icon: Sparkles },
  { name: 'Scheduled Posts', href: '/scheduler', icon: Clock },
  { name: 'Content Calendar', href: '/calendar', icon: Calendar },
  { name: 'Media Library', href: '/media', icon: ImageIcon },
];

const socialNavigation = [
  { name: 'Instagram', href: '/social-accounts', icon: SiInstagram },
  { name: 'Facebook', href: '/social-accounts', icon: SiFacebook },
  { name: 'TikTok', href: '/social-accounts', icon: SiTiktok },
];

const accountNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const { profile, company, signOut } = useAuth();
  
  const NavItem = ({ item }: { item: any }) => {
    const isActive = location === item.href;
    const Icon = item.icon;
    
    return (
      <Link href={item.href}>
        <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
          isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
        }`}>
          <Icon className="w-4 h-4" />
          <span className="text-sm">{item.name}</span>
        </div>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 text-sidebar-foreground">
      <div className="p-6">
        <img src={LE_Growth_Logo} alt="LE Growth AI" className="h-8 object-contain" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        <div>
          <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50">MAIN</p>
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50">CONTENT</p>
          <div className="space-y-1">
            {contentNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50">SOCIAL ACCOUNTS</p>
          <div className="space-y-1">
            {socialNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50">ACCOUNT</p>
          <div className="space-y-1">
            {accountNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 bg-sidebar-accent/20 border border-sidebar-border">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{profile?.full_name || 'User'}</span>
              <span className="text-xs text-sidebar-foreground/60 truncate">{company?.company_name || 'Company'}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/10" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-card">
          <img src={LE_Growth_Logo} alt="LE Growth AI" className="h-6 object-contain" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
};
