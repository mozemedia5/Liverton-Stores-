import { useState, type FormEvent } from "react";
import {
  Apple,
  ArrowRight,
  CheckCircle2,
  Chrome,
  Mail,
  RefreshCw,
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
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verificationUser, setVerificationUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const authenticateWithProvider = async (kind: "google" | "apple") => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Sign-in is not configured yet. You can continue as a guest.");
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
      setError("Account sign-in is not configured yet. You can continue as a guest.");
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
      setError("Password reset is not configured yet.");
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
        <Button type="button" variant="outline" onClick={() => void authenticateWithProvider("google")} disabled={busy}><Chrome size={16} /> Continue with Google</Button>
        <Button type="button" variant="outline" onClick={() => void authenticateWithProvider("apple")} disabled={busy}><Apple size={16} /> Continue with Apple</Button>
      </div>
      <div className="auth-divider"><span>or use email</span></div>
      <form onSubmit={submitEmail} className="auth-email-form">
        <Input type="email" autoComplete="email" placeholder="Email address" value={email} onChange={event => setEmail(event.target.value)} required />
        <Input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} minLength={6} required />
        <Button type="submit" disabled={busy}>{busy ? "Working…" : mode === "login" ? "Sign in with email" : "Create account"} <ArrowRight size={15} /></Button>
      </form>
      {mode === "login" && <button type="button" className="auth-link-button" onClick={() => void resetPassword()} disabled={busy}>Forgot password?</button>}
      {notice && <p className="account-success" role="status">{notice}</p>}
      {error && <p className="login-error" role="alert">{error}</p>}
      {onGuest && <button className="guest-button" type="button" onClick={onGuest}>Continue as guest</button>}
    </div>
  );
}
