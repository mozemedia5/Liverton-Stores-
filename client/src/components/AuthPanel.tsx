import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Send,
} from "lucide-react";
import {
  OAuthProvider,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFirebaseAuth } from "@/lib/firebase";
import { getFirebaseConfigError } from "@/lib/runtimeConfig";

export type AuthPanelProps = {
  compact?: boolean;
  onGuest?: () => void;
};

type AuthMode = "login" | "create";

type AuthErrorLike = {
  code?: string;
  message?: string;
};

function friendlyAuthError(error: unknown) {
  const code = (error as AuthErrorLike)?.code ?? "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-login-credentials": "The email or password is incorrect.",
    "auth/user-not-found": "No account was found for this email.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/email-already-in-use": "An account already exists for this email. Try signing in instead.",
    "auth/weak-password": "Use a stronger password with at least 6 characters.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/popup-closed-by-user": "The sign-in window was closed before completion.",
    "auth/popup-blocked": "Your browser blocked the sign-in window. Allow popups and try again.",
    "auth/account-exists-with-different-credential": "This email already uses another sign-in method. Sign in with that method first.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase yet.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "The network connection failed. Check your connection and try again.",
  };
  return messages[code] ?? ((error as AuthErrorLike)?.message ?? "Authentication could not be completed. Please try again.").replace(/^Firebase:\s*/i, "");
}

function GoogleMark() {
  return (
    <svg className="provider-brand-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.5 4.5 0 0 1-1.94 2.96v2.48h3.18c1.86-1.71 2.87-4.23 2.87-7.47z" />
      <path fill="#34A853" d="M12 21.75c2.66 0 4.89-.88 6.52-2.38l-3.18-2.48c-.88.59-2.01.94-3.34.94-2.57 0-4.75-1.74-5.53-4.08H3.18v2.56A9.85 9.85 0 0 0 12 21.75z" />
      <path fill="#FBBC05" d="M6.47 13.75A5.96 5.96 0 0 1 6.16 12c0-.61.11-1.2.31-1.75V7.69H3.18A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05.93 4.31l3.29-2.56z" />
      <path fill="#EA4335" d="M12 6.17c1.45 0 2.75.5 3.77 1.48l2.82-2.82C16.88 3.24 14.66 2.25 12 2.25a9.85 9.85 0 0 0-8.82 5.44l3.29 2.56C7.25 7.91 9.43 6.17 12 6.17z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg className="provider-brand-icon apple-brand-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M19.67 13.22c-.02-2.14 1.75-3.17 1.83-3.22a3.9 3.9 0 0 0-3.1-1.67c-1.31-.14-2.58.78-3.25.78-.68 0-1.73-.77-2.84-.75-1.46.02-2.81.85-3.56 2.16-1.5 2.6-.38 6.44 1.07 8.55.72 1.03 1.56 2.18 2.67 2.14 1.07-.04 1.47-.69 2.76-.69 1.29 0 1.65.69 2.77.67 1.15-.02 1.88-1.05 2.58-2.09.82-1.2 1.16-2.36 1.18-2.42-.03-.01-2.27-.87-2.31-3.46ZM17.52 6.94c.59-.72.99-1.72.88-2.72-.85.03-1.88.57-2.49 1.28-.54.62-1.01 1.64-.89 2.6.95.07 1.92-.48 2.5-1.16Z" />
    </svg>
  );
}

function authConfigurationMessage() {
  const issue = getFirebaseConfigError();
  return issue
    ? `Account sign-in is unavailable: ${issue}. Add it to Vercel Production and redeploy. You can continue as a guest.`
    : "Account sign-in is unavailable. Check the Firebase Authentication provider settings or continue as a guest.";
}

function providerFor(kind: "google" | "apple") {
  if (kind === "google") return new GoogleAuthProvider();
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  return provider;
}

async function sendVerification(user: User) {
  if (!user.emailVerified) await sendEmailVerification(user);
}

export default function AuthPanel({ compact = false, onGuest }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verificationUser, setVerificationUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const authenticateWithProvider = async (kind: "google" | "apple") => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError(authConfigurationMessage());
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await signInWithPopup(auth, providerFor(kind));
      if (result.user.email && !result.user.emailVerified && kind === "apple") {
        await sendVerification(result.user);
        setVerificationUser(result.user);
        setNotice("Please verify your email before using account-only features.");
      }
    } catch (nextError) {
      setError(friendlyAuthError(nextError));
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    const auth = getFirebaseAuth();
    if (!auth) {
      setError(authConfigurationMessage());
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "create") {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await sendEmailVerification(result.user);
        setVerificationUser(result.user);
        setNotice(`Verification email sent to ${result.user.email ?? email}. Open the link in that email, then return here and select “I verified my email”.`);
      } else {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (!result.user.emailVerified) {
          await sendVerification(result.user);
          setVerificationUser(result.user);
          setNotice("Your email is not verified yet. We sent a new verification email.");
        }
      }
    } catch (nextError) {
      setError(friendlyAuthError(nextError));
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    if (!verificationUser) return;
    setBusy(true);
    setError("");
    try {
      await sendEmailVerification(verificationUser);
      setNotice(`A new verification email was sent to ${verificationUser.email ?? "your email"}.`);
    } catch (nextError) {
      setError(friendlyAuthError(nextError));
    } finally {
      setBusy(false);
    }
  };

  const checkVerification = async () => {
    if (!verificationUser) return;
    setBusy(true);
    setError("");
    try {
      await reload(verificationUser);
      if (verificationUser.emailVerified) {
        setVerificationUser(null);
        setNotice("Email verified. Your account is ready.");
      } else {
        setNotice("We still do not see verification. Open the latest email link and try again.");
      }
    } catch (nextError) {
      setError(friendlyAuthError(nextError));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError(authConfigurationMessage());
      return;
    }
    if (!email.trim()) {
      setError("Enter your email address first, then choose Forgot password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(`Password reset instructions were sent to ${email.trim()}.`);
    } catch (nextError) {
      setError(friendlyAuthError(nextError));
    } finally {
      setBusy(false);
    }
  };

  if (verificationUser) {
    return (
      <div className={`auth-panel ${compact ? "auth-panel-compact" : ""}`}>
        <div className="auth-verification-icon"><Mail size={22} /></div>
        <h3>Verify your email</h3>
        <p>We sent a verification link to <strong>{verificationUser.email}</strong>. Verification is required before account-only benefits are activated.</p>
        {notice && <p className="account-success" role="status">{notice}</p>}
        {error && <p className="login-error" role="alert">{error}</p>}
        <div className="auth-action-stack">
          <Button type="button" onClick={() => void checkVerification()} disabled={busy}><CheckCircle2 size={16} /> {busy ? "Checking…" : "I verified my email"}</Button>
          <Button type="button" variant="outline" onClick={() => void resendVerification()} disabled={busy}><Send size={16} /> Resend verification email</Button>
        </div>
        {onGuest && <button className="guest-button" type="button" onClick={onGuest}>Continue as guest</button>}
      </div>
    );
  }

  return (
    <div className={`auth-panel ${compact ? "auth-panel-compact" : ""}`}>
      <div className="login-tabs" role="tablist" aria-label="Account action">
        <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); setNotice(""); }}>Sign in</button>
        <button type="button" role="tab" aria-selected={mode === "create"} className={mode === "create" ? "active" : ""} onClick={() => { setMode("create"); setError(""); setNotice(""); }}>Create account</button>
      </div>
      <div className="auth-provider-actions">
        <Button type="button" variant="outline" onClick={() => void authenticateWithProvider("google")} disabled={busy}><GoogleMark /> Continue with Google</Button>
        <Button type="button" variant="outline" onClick={() => void authenticateWithProvider("apple")} disabled={busy}><AppleMark /> Continue with Apple</Button>
      </div>
      <div className="auth-divider"><span>or use email</span></div>
      <form onSubmit={submitEmail} className="auth-email-form">
        <Input type="email" autoComplete="email" placeholder="Email address" value={email} onChange={event => setEmail(event.target.value)} required />
        <div className="password-field">
          <Input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} minLength={6} required />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <Button type="submit" disabled={busy}>{busy ? "Working…" : mode === "login" ? "Sign in with email" : "Create account"} <ArrowRight size={15} /></Button>
      </form>
      {mode === "login" && <button type="button" className="auth-link-button" onClick={() => void resetPassword()} disabled={busy}>Forgot password?</button>}
      {notice && <p className="account-success" role="status">{notice}</p>}
      {error && <p className="login-error" role="alert">{error}</p>}
      {onGuest && <button className="guest-button" type="button" onClick={onGuest}>Continue as guest</button>}
    </div>
  );
}
