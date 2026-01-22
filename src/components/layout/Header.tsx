import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header = ({ title, onToggleSidebar }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden mr-2"
        onClick={onToggleSidebar}
      >
        <Menu className="w-5 h-5" />
      </Button>
      <h1 className="text-xl font-semibold">{title}</h1>
    </header>
  );
};
