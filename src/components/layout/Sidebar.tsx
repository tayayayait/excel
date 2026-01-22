import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  PenSquare,
  Calendar,
  CalendarDays,
  CalendarRange,
  FolderKanban,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/input', icon: PenSquare, label: '업무 입력' },
  { path: '/daily', icon: Calendar, label: '일간' },
  { path: '/weekly', icon: CalendarDays, label: '주간' },
  { path: '/monthly', icon: CalendarRange, label: '월간' },
  { path: '/projects', icon: FolderKanban, label: '프로젝트' },
  { path: '/settings', icon: Settings, label: '설정' },
];

const adminItems: { path: string; icon: React.ElementType; label: string }[] = [
];

export const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const { signOut, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: React.ElementType; label: string }) => {
    const link = (
      <NavLink
        to={path}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            'hover:bg-accent hover:text-accent-foreground',
            isActive
              ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
              : 'text-muted-foreground',
            !open && 'justify-center'
          )
        }
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {open && <span className="font-medium truncate">{label}</span>}
      </NavLink>
    );

    if (open) {
      return link;
    }

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onToggle}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-[100] h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col',
          open ? 'w-64' : 'w-16',
          // Mobile: Hidden when closed, visible when open
          // Desktop: Always visible (width changes)
          !open && '-translate-x-full md:translate-x-0',
          open && 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          open ? 'justify-between' : 'justify-center'
        )}>
          {open && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">WorkLog</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8"
            onClick={onToggle}
          >
            {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
          
          {isAdmin && (
            <>
              <div className={cn('my-4 border-t border-sidebar-border', !open && 'mx-2')} />
              {adminItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className={cn(
          'p-3 border-t border-sidebar-border',
          !open && 'flex justify-center'
        )}>
          {open && user && (
            <div className="mb-2 px-3 py-2 rounded-lg bg-muted">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? '관리자' : '사용자'}
              </p>
            </div>
          )}
          {open ? (
            <Button
              variant="ghost"
              className={cn(
                'w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                !open && 'w-10 h-10 p-0'
              )}
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              {open && <span className="ml-2">로그아웃</span>}
            </Button>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                    !open && 'w-10 h-10 p-0'
                  )}
                  onClick={handleSignOut}
                >
                  <LogOut className="w-5 h-5" />
                  {open && <span className="ml-2">로그아웃</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">로그아웃</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  );
};
