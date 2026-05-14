import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import Panel from "../components/ui/Panel";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen px-4 pb-4 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-stretch gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Panel elevated className="flex items-center rounded-[24px] p-6 sm:p-7">
          <div className="w-full">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
              Welcome back
            </p>
            <h1 className="mt-3 text-[24px] font-semibold leading-8 text-[color:var(--text-strong)]">
              Sign in
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-[color:var(--text-muted)]">
              Continue to your conversations, groups and shared files.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-base text-[13px]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-base pr-11 text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-2)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="primary-button min-h-10 w-full px-4 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="mt-6 text-[13px] text-[color:var(--text-muted)]">
              New here?{" "}
              <Link to="/signup" className="font-medium text-[color:var(--brand-500)] hover:text-[color:var(--brand-600)]">
                Create an account
              </Link>
            </p>
          </div>
        </Panel>

        <AuthImagePattern
          title="Calm, focused messaging"
          subtitle="A compact workspace for direct chat, groups, unread state and live presence."
        />
      </div>
    </div>
  );
};

export default LoginPage;
