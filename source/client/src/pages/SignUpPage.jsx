import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import Panel from "../components/ui/Panel";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen px-4 pb-4 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-stretch gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Panel elevated className="flex items-center rounded-[24px] p-6 sm:p-7">
          <div className="w-full">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
              Create account
            </p>
            <h1 className="mt-3 text-[24px] font-semibold leading-8 text-[color:var(--text-strong)]">
              Create account
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-[color:var(--text-muted)]">
              Set up access to direct messages, group rooms and shared files.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-[color:var(--text-strong)]">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-base text-[13px]"
                />
              </div>

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
                    placeholder="Minimum 6 characters"
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
                disabled={isSigningUp}
                className="primary-button min-h-10 w-full px-4 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="mt-6 text-[13px] text-[color:var(--text-muted)]">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-[color:var(--brand-500)] hover:text-[color:var(--brand-600)]">
                Sign in
              </Link>
            </p>
          </div>
        </Panel>

        <AuthImagePattern
          title="Built for team conversation"
          subtitle="Direct chat, group rooms, shared files and live presence in one quiet workspace."
        />
      </div>
    </div>
  );
};

export default SignUpPage;
