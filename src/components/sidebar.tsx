import React from 'react';
import { LayoutDashboard, ClipboardList, Package, ShoppingCart, RotateCcw, Home, LogOut, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

interface MenuItem {
  name: string;
  icon: React.ElementType;
  badge?: string;
  isActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'List of surgeries', icon: ClipboardList, badge: '01' },
    { name: 'Inventory Catalogue', icon: Package },
    { name: 'Purchase Orders', icon: ShoppingCart, badge: '01' },
    { name: 'Return Orders', icon: RotateCcw, badge: '04', isActive: true },
  ];

  const bottomMenuItems: MenuItem[] = [
    { name: 'Clinic', icon: Home },
    { name: 'Logout', icon: LogOut },
  ];

  return (
    <div
      className={`bg-[#0A1A2C] text-white transition-all duration-300 ease-in-out flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-64'
      } h-full`}
    >
      <div>
        <nav className="px-2 pt-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  href="#"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                    item.isActive
                      ? 'bg-blue-900/50 text-blue-400'
                      : 'hover:bg-blue-900/30'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute left-10 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs">
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="p-2 mt-auto">
        <nav>
          <ul className="space-y-2">
            {bottomMenuItems.map((item) => (
              <li key={item.name}>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 rounded-lg text-sm hover:bg-blue-900/30"
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm hover:bg-blue-900/30"
              >
                <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                {!isCollapsed && <span className="ml-3">Collapse menu</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

