import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-[#FDFCF5] text-black pt-8 overflow-hidden">
      {/* LEFT: Login form */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-10 scale-[0.9]">
        <div
          className="
            w-full max-w-md bg-white border-4 border-black rounded-xl 
            p-6 shadow-[4px_4px_0_#000] overflow-y-auto max-h-[90vh]
          "
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div
              className="
                inline-flex items-center justify-center w-14 h-14 rounded-lg
                bg-yellow-300 border-4 border-black mb-3
                shadow-[3px_3px_0_#000]
              "
            >
              <MessageSquare className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-2xl font-extrabold uppercase tracking-wide">
              Welcome Back!
            </h1>
            <p className="text-sm font-medium mt-1 text-gray-700">
              Sign in to continue your conversations 💬
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-bold mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="
                    w-full pl-10 pr-4 py-2.5 border-2 border-black rounded-lg 
                    bg-[#FFF2AC] shadow-[3px_3px_0_#000] focus:outline-none
                    focus:translate-y-[1px] focus:shadow-none transition-all
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Lock className="w-5 h-5 text-black" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="
                    w-full pl-10 pr-10 py-2.5 border-2 border-black rounded-lg 
                    bg-[#B9E6C9] shadow-[3px_3px_0_#000] focus:outline-none
                    focus:translate-y-[1px] focus:shadow-none transition-all
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-black"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="
                w-full mt-5 bg-blue-400 border-2 border-black 
                text-black font-bold py-2.5 rounded-lg shadow-[3px_3px_0_#000]
                hover:translate-y-[2px] hover:shadow-none transition-all
                flex items-center justify-center gap-2
              "
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-5">
            <p className="font-medium text-sm">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="
                  underline font-bold hover:text-blue-600
                  decoration-2 decoration-black
                "
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Illustration */}
      <AuthImagePattern
        title="Let's chat freely!"
        subtitle="Join your friends in fun and creative conversations. Be yourself!"
      />
    </div>
  );
};

export default LoginPage;
