import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { LogOut, MessageSquare } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="
        fixed top-0 left-0 w-full z-40
        bg-[#FDFCF5] border-b-4 border-black
        shadow-[4px_4px_0_#000] px-6 py-2
      "
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          to="/"
          className="
            flex items-center gap-2 border-2 border-black 
            px-3 py-1 rounded-md bg-yellow-300 hover:translate-y-[2px] 
            hover:shadow-none transition-all shadow-[3px_3px_0_#000]
          "
        >
          <div className="size-8 flex items-center justify-center bg-white border-2 border-black rounded-md">
            <MessageSquare className="w-4 h-4 text-black" />
          </div>
          <h1 className="font-extrabold text-black text-lg uppercase tracking-wide">
            HiChat
          </h1>
        </Link>

        {/* Logout */}
        {authUser && (
          <button
            onClick={logout}
            className="
              flex items-center gap-2
              bg-blue-400 text-black font-semibold px-4 py-2 rounded-md
              border-2 border-black shadow-[3px_3px_0_#000]
              hover:bg-blue-500 hover:translate-y-[2px] hover:shadow-none
              transition-all
            "
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
