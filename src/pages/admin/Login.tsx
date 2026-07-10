import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Lock,
  Shield,
  Smartphone,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import lauratekLogo from "@/Assets/lauratek.png";
import welcomeImage from "@/Assets/welcome.png";

const API_BASE_URL = "https://lauratek.in:8000";

type Step =
  | "login"
  | "mfa"
  | "enroll"
  | "finalMfa"
  | "backupCodes"
  | "reenroll";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [backupCode, setBackupCode] = useState("");

  const [loginTempToken, setLoginTempToken] = useState("");
  const [enrollTempToken, setEnrollTempToken] = useState("");

  const [qrImage, setQrImage] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupInput, setShowBackupInput] = useState(false);
  const [finalAccessToken, setFinalAccessToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = (err: any): string => {
    if (err?.response?.data?.detail) {
      return typeof err.response.data.detail === "string"
        ? err.response.data.detail
        : err.response.data.detail[0]?.msg || "Authentication failed";
    }
    return "Something went wrong";
  };

  /* ================= LOGIN ================= */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8 || password.length > 30) {
      setError("Password must be between 8 and 30 characters");
      return;
    }

    const hasCapital = /[A-Z]/.test(password);
    const hasSmall = /[a-z]/.test(password);
    const hasInteger = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_+=\/\\\[\]~`]/.test(password);

    if (!hasCapital || !hasSmall || !hasInteger || !hasSpecial) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password,
      });

      /*  NO MFA REQUIRED */
      if (
        typeof res.data === "string" ||
        res.data?.access_token ||
        res.data?.token
      ) {
        const token =
          res.data.access_token ||
          res.data.token ||
          res.data;

        // SAVE TOKEN (FIX)
        localStorage.setItem("access_token", token);
        localStorage.setItem("token", token);

        navigate("/dashboard");
        return;
      }

      /* MFA SETUP REQUIRED */
      const isSetupRequired = res.data?.mfa_setup_required || res.data?.setup_required;
      if (isSetupRequired && res.data?.temp_token) {
        setLoginTempToken(res.data.temp_token);
        startEnrollment(res.data.temp_token);
        return;
      }

      /* MFA REQUIRED */
      if (res.data?.mfa_required && res.data?.temp_token) {
        setLoginTempToken(res.data.temp_token);
        setStep("mfa");
        return;
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ================= MFA ================= */
  const handleMfa = async () => {
    if (!loginTempToken) return;

    setLoading(true);
    setError("");

    try {
      /*BACKUP CODE → RE-ENROLL FLOW */
      if (showBackupInput) {
        const res = await axios.post(`${API_BASE_URL}/mfa/re-enroll/start`, {
          token: loginTempToken,
          current_code: backupCode.trim(),
        });

        // Fallback to loginTempToken if the backend doesn't issue a new token
        const nextToken = res.data?.token || res.data?.temp_token || loginTempToken;
        setEnrollTempToken(nextToken);

        const qrRes = await axios.get(
          `${API_BASE_URL}/mfa/re-enroll/qr?token=${nextToken}`,
          { responseType: "blob" }
        );

        setQrImage(URL.createObjectURL(qrRes.data));
        setStep("reenroll");
        return;
      }

      /* MFA VERIFY LOGIN */
      const res = await axios.post(`${API_BASE_URL}/mfa/verify-login`, {
        temp_token: loginTempToken,
        code: otp,
      });

      const token =
        res.data.access_token ||
        res.data.token ||
        res.data;

      localStorage.setItem("access_token", token);
      localStorage.setItem("admin_password", password);
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY ENROLL ================= */
  const handleVerifyEnroll = async () => {
    if (!enrollTempToken || otp.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = step === "reenroll" ? "/mfa/re-enroll/verify" : "/mfa/enroll/verify";
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, {
        token: enrollTempToken,
        data: {
          code: otp,
        }
      });

      const token = res.data.access_token || res.data.token;
      if (token) {
        setFinalAccessToken(token);
      }

      if (res.data.backup_codes) {
        setBackupCodes(res.data.backup_codes);
        setStep("backupCodes");
      } else if (token) {
        localStorage.setItem("access_token", token);
        localStorage.setItem("admin_password", password);
        localStorage.setItem("token", token);
        navigate("/dashboard");
      } else {
        setStep("finalMfa");
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ================= ENROLL START ================= */
  const startEnrollment = async (token: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/mfa/enroll/start`, {
        token: token,
      });

      const nextToken = res.data?.token || res.data?.temp_token || token;
      setEnrollTempToken(nextToken);

      const qrRes = await axios.get(
        `${API_BASE_URL}/mfa/enroll/qr?token=${nextToken}`,
        { responseType: "blob" }
      );

      setQrImage(URL.createObjectURL(qrRes.data));
      setStep("enroll");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStart = () => {
    if (loginTempToken) {
      startEnrollment(loginTempToken);
    }
  };

  /* ================= FINAL MFA ================= */
  const handleFinalMfa = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/mfa/verify-login`, {
        temp_token: loginTempToken,
        code: otp,
      });

      const token =
        res.data.access_token ||
        res.data.token ||
        res.data;

      localStorage.setItem("access_token", token);
      localStorage.setItem("admin_password", password);
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  if (step === "login") {
    return (
      <div className="flex min-h-screen bg-white">
        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 flex-col">
          <div className="h-[55%] w-full">
            <img
              src={welcomeImage}
              alt="Students"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-[45%] w-full bg-[#3b82f6] flex items-center justify-center p-8">
            <div className="w-full max-w-xl bg-gradient-to-br from-[#5b43c5] to-[#7f4ef2] p-10 shadow-xl relative">
              <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-white"></div>
              <div className="pl-6">
                <h2 className="text-white text-3xl mb-4">
                  Welcome To <span className="font-semibold text-4xl">Lauratek</span>
                </h2>
                <p className="text-white/90 text-[15px] leading-relaxed">
                  A powerful platform designed to streamline learning, assessments,
                  and student success with a modern, centralized experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 relative bg-white">
          <div className="mb-auto">
            <img
              src={lauratekLogo}
              alt="Lauratek Logo"
              className="h-16 object-contain"
            />
          </div>

          <div className="w-full max-w-[420px] mx-auto my-auto">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-semibold text-gray-900">Login</h1>
              <p className="text-gray-500 text-sm">
                Enter your credentials to login your account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-300 focus-visible:ring-blue-500 rounded-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-300 focus-visible:ring-blue-500 rounded-lg pr-10"
                    minLength={8}
                    maxLength={30}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm flex items-center gap-1.5">
                  <AlertCircle size={16} /> {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-sm font-medium bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white shadow-md rounded-lg mt-4"
              >
                {loading ? "Signing In..." : "Login"}
              </Button>
            </form>
          </div>

          <div className="mt-auto"></div>
        </div>
      </div>
    );
  }

  // MFA and other steps
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[80px]"></div>

      <div className="p-8 relative z-10">
        <img src={lauratekLogo} alt="Lauratek Logo" className="h-16 object-contain" />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        {step === "mfa" && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 md:p-10 space-y-8 border border-gray-100">
            <div className="text-center space-y-2">
              <h2 className="text-[#1a1744] text-2xl font-bold tracking-tight">MFA Verification</h2>
              <p className="text-gray-500 text-sm">Enter 6-digit code from your authenticator app</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1a1744]">
                  {showBackupInput ? "Enter 6 Digit Backup Code" : "Enter 6 Digit Code"}
                </label>
                <Input
                  value={showBackupInput ? backupCode : otp}
                  onChange={(e) =>
                    showBackupInput
                      ? setBackupCode(e.target.value)
                      : setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder={showBackupInput ? "" : "0 0 0 0 0"}
                  className={`h-12 border-gray-300 focus-visible:ring-blue-500 rounded-lg ${!showBackupInput ? 'text-center text-xl tracking-[0.5em] font-mono' : ''}`}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-500 select-none">
                  <input
                    type="checkbox"
                    checked={showBackupInput}
                    onChange={(e) => {
                      setShowBackupInput(e.target.checked);
                      setOtp("");
                      setBackupCode("");
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Use Backup code instead</span>
                </label>
                {!showBackupInput && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleEnrollStart();
                    }}
                    className="text-sm text-blue-500 font-medium hover:underline"
                  >
                    First Time Setup
                  </button>
                )}
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  className="h-11 px-6 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => setStep("login")}
                >
                  &larr; Back
                </Button>
                <Button
                  onClick={handleMfa}
                  disabled={loading}
                  className="h-11 px-8 rounded-lg bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white shadow-md border-0"
                >
                  Continue &rarr;
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ENROLL */}
        {step === "enroll" && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 md:p-10 space-y-6 border border-gray-100 text-center">
            <Smartphone className="w-14 h-14 text-[#4f46e5] mx-auto" />
            <h2 className="text-[#1a1744] text-xl font-bold">Setup Authenticator</h2>
            <p className="text-gray-500 text-sm">Scan the QR code with your authenticator app</p>
            {qrImage && (
              <img src={qrImage} alt="QR Code" className="mx-auto" />
            )}
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="h-12 text-center text-xl tracking-[0.5em] font-mono border-gray-300 rounded-lg"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleVerifyEnroll} disabled={loading} className="w-full h-12 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg">
              Verify
            </Button>
          </div>
        )}

        {/* RE-ENROLL */}
        {step === "reenroll" && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 md:p-10 space-y-6 border border-gray-100 text-center">
            <Smartphone className="w-14 h-14 text-[#4f46e5] mx-auto" />
            <h2 className="text-[#1a1744] text-xl font-bold">Re-enroll Authenticator</h2>
            {qrImage && (
              <img src={qrImage} alt="QR Code" className="mx-auto" />
            )}
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="h-12 text-center text-xl tracking-[0.5em] font-mono border-gray-300 rounded-lg"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleVerifyEnroll} disabled={loading} className="w-full h-12 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg">
              Verify
            </Button>
          </div>
        )}

        {/* BACKUP CODES */}
        {step === "backupCodes" && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 md:p-10 space-y-6 border border-gray-100 text-center">
            <Key className="w-14 h-14 text-amber-500 mx-auto" />
            <h2 className="text-[#1a1744] text-xl font-bold">Save Backup Codes</h2>
            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
              {backupCodes.map((c, i) => (
                <div key={i} className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-gray-700">
                  {c}
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                if (finalAccessToken) {
                  localStorage.setItem("access_token", finalAccessToken);
                  localStorage.setItem("token", finalAccessToken);
                  navigate("/dashboard");
                } else {
                  setStep("finalMfa");
                }
              }}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
            >
              Continue
            </Button>
          </div>
        )}

        {/* FINAL MFA */}
        {step === "finalMfa" && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 md:p-10 space-y-6 border border-gray-100 text-center">
            <Shield className="w-14 h-14 text-green-500 mx-auto" />
            <h2 className="text-[#1a1744] text-xl font-bold">Final Verification</h2>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="h-12 text-center text-xl tracking-[0.5em] font-mono border-gray-300 rounded-lg"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleFinalMfa} disabled={loading} className="w-full h-12 bg-green-500 hover:bg-green-600 text-white rounded-lg">
              Complete Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
