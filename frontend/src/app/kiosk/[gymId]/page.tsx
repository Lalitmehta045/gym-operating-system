"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Dumbbell } from "lucide-react";

type KioskState = "idle" | "loading" | "success" | "error";

export default function KioskCheckInPage() {
  const params = useParams<{ gymId: string }>();
  const gymId = params?.gymId;

  const [state, setState] = useState<KioskState>("idle");
  const [memberCode, setMemberCode] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const [successData, setSuccessData] = useState<{ memberName: string; time: string } | null>(null);

  const [validationError, setValidationError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const memberCodeInputRef = useRef<HTMLInputElement>(null);

  const resetToIdle = () => {
    setState("idle");
    setMemberCode("");
    setPhoneLast4("");
    setErrorMsg("");
    setErrorStatus(null);
    setSuccessData(null);
    setValidationError("");
    setCountdown(0);
    // Focus back on member code after a short delay to allow render
    setTimeout(() => {
      memberCodeInputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === "success" || state === "error") {
      const duration = state === "success" ? 4 : 6;
      setCountdown(duration);

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            resetToIdle();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!memberCode.trim()) {
      setValidationError("Member ID is required.");
      return;
    }
    if (!/^\d{4}$/.test(phoneLast4)) {
      setValidationError("Phone must be exactly 4 digits.");
      return;
    }

    if (!gymId) {
      setValidationError("Gym ID is missing from URL.");
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/kiosk/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberCode: memberCode.trim(),
          phoneLast4,
          gymId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorStatus(res.status);
        if (res.status === 401) setErrorMsg("Invalid Member ID or Phone");
        else if (res.status === 403) setErrorMsg("Your membership is inactive. Please contact the gym.");
        else if (res.status === 409) setErrorMsg("Already checked in today!");
        else if (res.status === 404) setErrorMsg("Member not found");
        else setErrorMsg(data.message || "Something went wrong. Try again.");
        setState("error");
        return;
      }

      // Success
      const date = new Date(data.checkInAt);
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSuccessData({
        memberName: data.memberName,
        time: timeString,
      });
      setState("success");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30 font-sans">
      <AnimatePresence mode="wait">
        {state === "idle" || state === "loading" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <Dumbbell className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Welcome!</h1>
              <p className="text-zinc-400 text-lg">Enter your details to check in</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 pl-1">Member ID</label>
                <input
                  ref={memberCodeInputRef}
                  type="text"
                  inputMode="numeric"
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value)}
                  disabled={state === "loading"}
                  className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 text-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                  placeholder="e.g. 12345"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 pl-1">Last 4 digits of phone</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={phoneLast4}
                  onChange={(e) => setPhoneLast4(e.target.value)}
                  disabled={state === "loading"}
                  className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 text-xl tracking-[0.5em] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50 font-mono"
                  placeholder="••••"
                  autoComplete="off"
                />
              </div>

              {validationError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-center text-sm font-medium"
                >
                  {validationError}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full h-16 mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xl font-bold transition-all disabled:opacity-70 disabled:hover:bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.6)]"
              >
                {state === "loading" ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  "Check In"
                )}
              </button>
            </form>
          </motion.div>
        ) : state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="flex flex-col items-center justify-center text-center w-full max-w-md p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_60px_-10px_rgba(16,185,129,0.8)]"
            >
              <CheckCircle2 className="w-12 h-12 text-zinc-950" />
            </motion.div>
            <h2 className="text-4xl font-bold mb-4 text-white">Welcome, {successData?.memberName}!</h2>
            <p className="text-emerald-400 text-xl mb-12 font-medium">Check-in recorded at {successData?.time}</p>
            
            <div className="text-zinc-500 font-medium">
              Resetting in {countdown}...
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col items-center justify-center text-center w-full max-w-md p-8 rounded-3xl border ${errorStatus === 409 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-red-500/10 border-red-500/20'}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${errorStatus === 409 ? 'bg-orange-500/20 text-orange-500' : 'bg-red-500/20 text-red-500'}`}>
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              {errorStatus === 409 ? "Notice" : "Check-in Failed"}
            </h2>
            <p className={`text-lg mb-10 ${errorStatus === 409 ? 'text-orange-400' : 'text-red-400'}`}>
              {errorMsg}
            </p>
            
            <button
              onClick={resetToIdle}
              className={`w-full h-14 rounded-2xl text-lg font-bold transition-colors ${errorStatus === 409 ? 'bg-orange-500 hover:bg-orange-600 text-zinc-950' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            >
              Try Again
            </button>
            <div className="text-zinc-500 mt-6 font-medium text-sm">
              Resetting in {countdown}...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
