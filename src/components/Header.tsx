
import React from 'react';
import { IndianRupee, TrendingUp, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 animate-slide-down",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-subtle" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            className="lg:hidden p-2 rounded-full hover:bg-secondary transition-colors"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full">
              <IndianRupee size={22} className="text-primary" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold tracking-tight">StockBubbles</h1>
              <p className="text-xs text-muted-foreground">India</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center bg-secondary px-3 py-1 rounded-full text-sm font-medium">
            <TrendingUp size={16} className="mr-1 text-profit" />
            <span>NIFTY 50</span>
            <span className="ml-2 text-profit">+0.82%</span>
          </div>
          <div className="flex items-center bg-secondary px-3 py-1 rounded-full text-sm font-medium">
            <TrendingUp size={16} className="mr-1 text-profit" />
            <span>SENSEX</span>
            <span className="ml-2 text-profit">+0.76%</span>
          </div>
        </div>

        <div className="flex items-center">
          <button 
            className="px-4 py-2 rounded-full bg-primary text-white font-medium text-sm transition-all hover:bg-primary/90 transform hover:-translate-y-0.5 shadow-subtle"
          >
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
