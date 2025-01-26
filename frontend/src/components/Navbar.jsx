import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LogOut, Bell, User } from "lucide-react";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await api.post("/users/logout");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-700">{user.name || "User"}</p>
            <p className="text-gray-500">{user.email || "user@example.com"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">
            {isLoading ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
