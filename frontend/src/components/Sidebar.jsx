import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { authAPI } from "../services/api";
import { toast } from "react-hot-toast";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Settings,
  ChevronRight,
  LogOut,
  ClipboardList
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get user data from query
  const { data: userData } = useQuery({
    queryKey: ["auth"],
    queryFn: authAPI.getProfile,
  });

  const user = userData?.data?.user;

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      // Clear all queries from the cache
      queryClient.clear();
      // Navigate to login page
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/products', label: 'Products', icon: Package },
    { path: '/dashboard/customers', label: 'Customers', icon: Users },
    { path: '/dashboard/invoices', label: 'Invoices', icon: FileText },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          <span className="text-blue-600">Invoice</span> Sathi
        </h2>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight size={16} className="ml-auto text-blue-600" />}
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <Link
            to="/dashboard/admin/logs"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
              location.pathname === '/dashboard/admin/logs' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <ClipboardList size={20} className={location.pathname === '/dashboard/admin/logs' ? 'text-blue-600' : 'text-gray-400'} />
            <span className="font-medium">System Logs</span>
            {location.pathname === '/dashboard/admin/logs' && <ChevronRight size={16} className="ml-auto text-blue-600" />}
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} className="text-red-400" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;