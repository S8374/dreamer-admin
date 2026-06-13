"use client";

import { useState } from "react";
import { ArrowRight, Lock, Mail, KeyRound } from "lucide-react";
import { useAdminLoginMutation, useVerifyOtpMutation } from "../lib/redux/api/authApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [viewState, setViewState] = useState<"login" | "otp">("login");

  const [adminLogin, { isLoading: isLoggingIn }] = useAdminLoginMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminLogin({ email, password }).unwrap();
      toast.success(response.message || "Login successful!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const message = error?.data?.message || "Login failed.";
      if (message.includes("verify your email")) {
        toast.info("Verification required. An OTP has been sent to your email.");
        setViewState("otp");
      } else {
        toast.error(message);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await verifyOtp({ email, purpose: "email_verification", otp }).unwrap();
      toast.success(response.message || "Email verified successfully!");
      setViewState("login");
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid OTP.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-zinc-900 selection:bg-[#6b8f84]/30">
      
      {/* LEFT PANEL: Branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-zinc-50 lg:flex lg:flex-col lg:justify-between lg:p-12 border-r border-zinc-200">
        
        {/* Background Image */}
        <img
          src="/bg-login.png"
          alt="Dremarr Background"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        {/* Soft white fade to ensure text readability */}
      
        <div className="relative z-10 flex flex-col gap-6 animate-slide-up mt-24">
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <img src="/logo.png" alt="Dreamer Logo" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-zinc-900">
            Orchestrate your <br />
            <span className="text-[#6b8f84]">digital empire.</span>
          </h1>
          <p className="max-w-md text-lg text-zinc-500">
            Access the command center to manage users, monitor analytics, and scale your application effortlessly.
          </p>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#6b8f84]/10 blur-[80px] animate-float" />
        <div className="absolute left-24 bottom-24 h-48 w-48 rounded-full bg-[#6b8f84]/5 blur-[60px] animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex items-center justify-between text-sm text-zinc-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p>© 2026 Dremarr Inc.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic Form Area */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex flex-col items-center gap-3 text-center lg:hidden mb-12">
            <img src="/logo.png" alt="Dreamer Logo" className="h-12 w-auto object-contain" />
            <p className="text-sm text-zinc-500">Sign in to your admin dashboard</p>
          </div>

          {/* ------------- LOGIN VIEW ------------- */}
          {viewState === "login" && (
            <>
              <div className="hidden lg:block space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome back</h2>
                <p className="text-zinc-500">Enter your credentials to access the dashboard.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700" htmlFor="email">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder="admin@dremarr.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all hover:border-zinc-300 focus:border-[#6b8f84] focus:ring-2 focus:ring-[#6b8f84]/20"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-700" htmlFor="password">Password</label>
                      <a href="#" className="text-xs font-medium text-[#6b8f84] hover:text-[#55756c] transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="block w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all hover:border-zinc-300 focus:border-[#6b8f84] focus:ring-2 focus:ring-[#6b8f84]/20"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#6b8f84] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#55756c] focus:outline-none focus:ring-2 focus:ring-[#6b8f84]/50 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoggingIn ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ------------- OTP VERIFICATION VIEW ------------- */}
          {viewState === "otp" && (
            <>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Verify Email</h2>
                <p className="text-zinc-500">Please enter the OTP sent to {email}.</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700" htmlFor="otp">One-Time Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="block w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all hover:border-zinc-300 focus:border-[#6b8f84] focus:ring-2 focus:ring-[#6b8f84]/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setViewState("login")}
                    className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6b8f84] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#55756c] focus:outline-none focus:ring-2 focus:ring-[#6b8f84]/50 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isVerifying ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
