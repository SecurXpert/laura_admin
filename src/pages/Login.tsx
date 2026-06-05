import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Lock,
  Shield,
  Smartphone,
  AlertCircle,
  Key,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [otp, setOtp] = useState("");
  const [backupCode, setBackupCode] = useState("");

  const [loginTempToken, setLoginTempToken] = useState("");
  const [enrollTempToken, setEnrollTempToken] = useState("");

  const [qrImage, setQrImage] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupInput, setShowBackupInput] = useState(false);

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

      /* MFA REQUIRED */
      if (res.data?.mfa_required && res.data?.temp_token) {
        setLoginTempToken(res.data.temp_token);
        setStep("mfa");
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
        const res = await axios.post(`${API_BASE_URL}/mfa/reenroll/start`, {
          temp_token: loginTempToken,
          backup_code: backupCode,
        });

        setEnrollTempToken(res.data.token);

        const qrRes = await axios.get(
          `${API_BASE_URL}/mfa/reenroll/qr?token=${res.data.token}`,
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

      //  SAVE TOKEN (FIX)
      localStorage.setItem("access_token", token);
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
      const res = await axios.post(`${API_BASE_URL}/mfa/enroll/verify`, {
        temp_token: enrollTempToken,
        code: otp,
      });

      if (res.data.backup_codes) {
        setBackupCodes(res.data.backup_codes);
        setStep("backupCodes");
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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

      //  SAVE TOKEN (FIX)
      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Course Platform
          </h1>
        </div>

        {/* LOGIN */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-blue-50"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-blue-50"
              required
            />

            {error && (
              <p className="text-red-600 text-sm text-center flex items-center justify-center gap-1">
                <AlertCircle size={16} /> {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg bg-blue-600"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        )}

        {/* MFA */}
        {step === "mfa" && (
          <div className="space-y-6 text-center">
            <Shield className="w-14 h-14 text-indigo-600 mx-auto" />

            <Input
              value={showBackupInput ? backupCode : otp}
              onChange={(e) =>
                showBackupInput
                  ? setBackupCode(e.target.value)
                  : setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder={showBackupInput ? "Backup code" : "6-digit code"}
              className="h-14 text-center text-2xl font-mono"
            />

            <button
              onClick={() => {
                setShowBackupInput(!showBackupInput);
                setOtp("");
                setBackupCode("");
              }}
              className="text-sm text-blue-600 underline"
            >
              {showBackupInput
                ? "Use authenticator app"
                : "Use backup code"}
            </button>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button
              onClick={handleMfa}
              disabled={loading}
              className="w-full h-12 bg-blue-600"
            >
              Verify
            </Button>
          </div>
        )}

        {/* RE-ENROLL */}
        {step === "reenroll" && (
          <div className="space-y-6 text-center">
            <Smartphone className="w-14 h-14 text-blue-600 mx-auto" />
            {qrImage && (
              <img src={qrImage} alt="QR Code" className="mx-auto" />
            )}
            <Input
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="6-digit code"
              className="h-14 text-center text-2xl font-mono"
            />
            <Button
              onClick={handleVerifyEnroll}
              className="w-full h-12 bg-blue-600"
            >
              Verify
            </Button>
          </div>
        )}

        {/* BACKUP CODES */}
        {step === "backupCodes" && (
          <div className="space-y-6 text-center">
            <Key className="w-14 h-14 text-amber-600 mx-auto" />
            <div className="grid grid-cols-2 gap-3 font-mono">
              {backupCodes.map((c, i) => (
                <div key={i} className="bg-gray-100 p-2 rounded">
                  {c}
                </div>
              ))}
            </div>
            <Button
              onClick={() => setStep("finalMfa")}
              className="w-full h-12 bg-amber-600"
            >
              Continue
            </Button>
          </div>
        )}

        {/* FINAL MFA */}
        {step === "finalMfa" && (
          <div className="space-y-6 text-center">
            <Shield className="w-14 h-14 text-green-600 mx-auto" />
            <Input
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="6-digit code"
              className="h-14 text-center text-2xl font-mono"
            />
            <Button
              onClick={handleFinalMfa}
              className="w-full h-12 bg-green-600"
            >
              Complete Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
