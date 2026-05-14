import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  console.log("onlineUsers: ", onlineUsers);
  // display spin load if it is checking
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="workspace-shell flex items-center gap-3 rounded-[var(--radius-lg)] px-5 py-4 text-[color:var(--text-strong)]">
          <Loader className="size-4 animate-spin text-[color:var(--brand-500)]" />
          <span className="text-[13px] font-medium">Preparing workspace</span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen text-[color:var(--text-body)]">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--surface-1)",
            color: "var(--text-strong)",
            border: "1px solid var(--border-soft)",
            borderRadius: "14px",
            boxShadow: "var(--shadow-md)",
            padding: "10px 12px",
            fontSize: "13px",
          },
          success: {
            iconTheme: {
              primary: "var(--success-500)",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--danger-500)",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
};

export default App;
