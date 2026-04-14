import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/authContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils.ts";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/create", label: "New Survey", icon: PlusCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-indigo-600 shrink-0"
        >
          <img src="/llama.png" alt="SurveyLlama" className="w-8 h-8" />
          <span className="tracking-tight">SurveyLlama</span>
        </Link>

        {/* desktop navigation */}
        <div className="hidden md:flex items-center gap-1">
          {token ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive(link.to)
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-indigo-600",
                  )}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className="h-4 w-px bg-neutral-200 mx-2" />

              <div className="flex items-center gap-2 pl-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-full border border-neutral-100">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold uppercase shrink-0">
                    {(user?.displayName || user?.email || "?")[0]}
                  </div>
                  <span className="text-xs font-semibold text-neutral-700 max-w-30 truncate">
                    {user?.displayName || user?.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-indigo-100 transition-all active:scale-95"
            >
              Admin Login
            </Link>
          )}
        </div>

        {/* mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          {token && (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold uppercase">
              {(user?.displayName || user?.email || "?")[0]}
            </div>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* mobile navigation overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-neutral-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {token ? (
                <>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                          isActive(link.to)
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-neutral-600 hover:bg-neutral-50",
                        )}
                      >
                        <link.icon size={20} />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-neutral-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full bg-indigo-600 text-white px-4 py-3 rounded-xl text-center font-semibold shadow-sm"
                >
                  Admin Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
