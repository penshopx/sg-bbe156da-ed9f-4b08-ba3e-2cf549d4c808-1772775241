import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Video, Mail, Lock, User, ArrowLeft, CheckCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { mode } = router.query; // 'login' or 'register'
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle email input change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError("Format email tidak valid");
    } else {
      setEmailError("");
    }
  };

  useEffect(() => {
    if (mode === "register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [mode]);

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format before submitting
    if (!validateEmail(email)) {
      toast({
        title: "Email Tidak Valid",
        description: "Mohon periksa kembali format email Anda. Contoh: nama@email.com",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccess("Login berhasil! Mengalihkan...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        // Register
        if (!fullName.trim()) {
          throw new Error("Nama lengkap harus diisi");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        setSuccess("Pendaftaran berhasil! Silakan cek email untuk verifikasi.");
        
        // Auto login after register (if email confirmation not required)
        if (data.session) {
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={isLogin ? "Masuk - Chaesa Live" : "Daftar - Chaesa Live"}
        description="Masuk atau daftar untuk mengakses fitur lengkap Chaesa Live"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white/5 backdrop-blur-sm border-white/10">
          {/* Back to Home */}
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-gray-300 hover:text-white -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Video className="w-10 h-10 text-purple-400" />
            <span className="text-2xl font-bold text-white">Chaesa Live</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Masuk ke Akun Anda" : "Daftar Akun Baru"}
          </h1>
          <p className="text-gray-400 mb-8">
            {isLogin 
              ? "Masukkan email dan password untuk melanjutkan" 
              : "Mulai transformasi meeting Anda jadi sumber penghasilan"}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (Register only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-300">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isLoading || !!emailError}
            >
              {isLoading ? "Memproses..." : (isLogin ? "Masuk" : "Daftar Gratis")}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                  router.push(`/auth?mode=${isLogin ? "register" : "login"}`, undefined, { shallow: true });
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                {isLogin ? "Daftar di sini" : "Masuk di sini"}
              </button>
            </p>
          </div>

          {/* Benefits (Register only) */}
          {!isLogin && (
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-4">Dengan mendaftar, Anda mendapatkan:</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Meeting unlimited 40 menit (Gratis)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Max 100 peserta per meeting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Akses chatbot AI support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Upgrade ke Pro kapan saja (Rp 99K/bulan)
                </li>
              </ul>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}