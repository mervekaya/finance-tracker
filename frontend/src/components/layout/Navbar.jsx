import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-indigo-600 text-lg">💰 Bütçe Takip</span>
        <Link
          to="/"
          className={`text-sm font-medium ${loc.pathname === "/" ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
        >
          Dashboard
        </Link>
        <Link
          to="/transactions"
          className={`text-sm font-medium ${loc.pathname === "/transactions" ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
        >
          İşlemler
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.name}</span>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-500 transition"
        >
          Çıkış
        </button>
      </div>
    </nav>
  );
}
