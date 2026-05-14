import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { LogOut, MessageSquareMore, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[color:var(--border-soft)] bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 text-[color:var(--text-strong)] transition hover:bg-[color:var(--surface-2)]"
        >
          <div className="flex size-8 items-center justify-center rounded-[10px] bg-[color:var(--brand-50)] text-[color:var(--brand-500)]">
            <MessageSquareMore className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[14px] font-semibold leading-5">HiChat</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[color:var(--text-faint)]">Realtime workspace</p>
          </div>
        </Link>

        {authUser && (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="secondary-button min-h-9 px-3 text-[12px] font-medium"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <button
              onClick={logout}
              className="ghost-button min-h-9 px-3 text-[12px] font-medium"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
