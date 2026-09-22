import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate("/dashboard")
    }, 800)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0e1a]">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(221,83%,65%,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(262,83%,58%,0.06),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[420px] px-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-center text-sm text-white/50">
              Sign in to your risk intelligence workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Email</label>
              <Input
                type="email"
                placeholder="analyst@fraudshield.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-white/[0.08] bg-white/[0.05] text-white placeholder:text-white/30 focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Password</label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary/80 hover:text-primary"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-white/[0.08] bg-white/[0.05] pr-10 text-white placeholder:text-white/30 focus-visible:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="h-11 w-full bg-primary text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
              or continue with
            </span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          {/* SSO */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 21 21">
                <path d="M1 1h9v9H1V1z" fill="#F25022" />
                <path d="M11 1h9v9h-9V1z" fill="#7FBA00" />
                <path d="M1 11h9v9H1v-9z" fill="#00A4EF" />
                <path d="M11 11h9v9h-9v-9z" fill="#FFB900" />
              </svg>
              Microsoft
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-white/20">
          Protected by FraudShield AI Enterprise Security
        </p>
      </div>
    </div>
  )
}
