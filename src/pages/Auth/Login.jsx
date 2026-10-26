import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/auth/useAuth';
import Loader from '../../components/loader/Loader';
import { FaEnvelope, FaPhoneAlt, FaLock, FaKey, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { getFriendlyErrorMessage } from '../../utils/firebaseErrorHandler.js';

/**
 * Login Component (Adaptive Modal or Page)
 * Renders centered login form over a blurred backdrop overlay if modal,
 * or as a styled standalone container if page.
 * Supports Email/Password & Phone OTP with reCAPTCHA verification.
 */
function Login() {
    const [authMode, setAuthMode] = useState('email'); // 'email' | 'phone'
    
    // Email Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Password Reset State
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    // Phone Auth State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneStep, setPhoneStep] = useState(1); // 1: Phone input, 2: OTP input
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [timer, setTimer] = useState(0);

    const { loading, login, setupRecaptcha, sendOtp, verifyOtp, sendPasswordResetEmail, setIsLoginOpen, setIsSignupOpen } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isPage = location.pathname === '/login';

    // Countdown Timer for OTP Resend
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Password Reset Email Handler (Firebase default technique)
    const handlePasswordReset = async (e) => {
        if (e) e.preventDefault();
        const targetEmail = (resetEmail || email || "").trim();
        if (!targetEmail) {
            return toast.error("Please enter your registered email address.");
        }

        setResetLoading(true);
        try {
            await sendPasswordResetEmail(targetEmail);
            setResetSent(true);
            toast.success(`Password reset link sent to ${targetEmail}`);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, "Failed to send password reset email. Please verify your email and try again."));
        } finally {
            setResetLoading(false);
        }
    };

    // Email Signin Handler
    const handleEmailSignin = async (e) => {
        if (e) e.preventDefault();
        if (!email.trim() || !password.trim()) {
            return toast.error("Please enter email and password.");
        }
        try {
            await login(email, password);
            toast.success('Signed in successfully!');
            setIsLoginOpen(false);
            if (isPage) {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, 'Signin Failed. Please check your credentials and try again.'));
        }
    };

    // Send OTP Handler
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        if (!cleanPhone || cleanPhone.length < 10) {
            return toast.error("Please enter a valid 10-digit mobile number.");
        }

        setOtpSending(true);
        try {
            const verifier = setupRecaptcha("recaptcha-container", "invisible");
            const result = await sendOtp(cleanPhone, verifier);
            setConfirmationResult(result);
            setPhoneStep(2);
            setTimer(30);
            toast.success(`OTP sent to +91 ${cleanPhone}`);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, "Failed to send OTP. Please retry."));
        } finally {
            setOtpSending(false);
        }
    };

    // Verify OTP Handler
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        if (!otp.trim() || otp.trim().length < 6) {
            return toast.error("Please enter valid 6-digit OTP.");
        }

        setOtpVerifying(true);
        try {
            await verifyOtp(confirmationResult, otp.trim());
            toast.success("Phone Authentication Successful!");
            setIsLoginOpen(false);
            if (isPage) {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, "Invalid OTP code. Please try again."));
        } finally {
            setOtpVerifying(false);
        }
    };

    const formContent = (
        <div 
            className={`relative z-10 w-full max-w-sm mx-auto bg-card border border-border-subtle p-6 sm:p-8 rounded-2xl shadow-2xl text-text-base ${isPage ? 'my-8 sm:my-16' : ''}`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Cross Button (Only for modal) */}
            {!isPage && (
                <button
                    type="button"
                    onClick={() => setIsLoginOpen(false)}
                    className="absolute top-4 right-4 text-text-muted hover:text-text-base transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* Header */}
            <div className="mb-5 mt-1 text-center">
                <h1 className="text-text-base text-2xl font-bold tracking-tight">
                    {authMode === 'forgot_password' ? 'Reset Password' : 'Welcome Back'}
                </h1>
                <p className="text-xs text-text-muted mt-1 font-medium">
                    {authMode === 'forgot_password'
                        ? 'Enter your email to receive a password reset link'
                        : 'Choose your sign in method'}
                </p>
            </div>

            {/* Mode Switcher Tabs (Only shown when not in forgot_password mode) */}
            {authMode !== 'forgot_password' ? (
                <div className="flex bg-bg-base p-1 rounded-xl mb-6 border border-border-subtle">
                    <button
                        type="button"
                        onClick={() => { setAuthMode('email'); setPhoneStep(1); }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            authMode === 'email' ? 'bg-card text-text-base border border-border-subtle shadow-xs' : 'text-text-muted hover:text-text-base'
                        }`}
                    >
                        <FaEnvelope size={11} /> Email
                    </button>
                    <button
                        type="button"
                        onClick={() => { setAuthMode('phone'); setPhoneStep(1); }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            authMode === 'phone' ? 'bg-card text-text-base border border-border-subtle shadow-xs' : 'text-text-muted hover:text-text-base'
                        }`}
                    >
                        <FaPhoneAlt size={10} /> Phone OTP
                    </button>
                </div>
            ) : null}

            {/* Mode 1: Email & Password Form */}
            {authMode === 'email' && (
                <form onSubmit={handleEmailSignin}>
                    {/* Email Field */}
                    <div className="mb-4">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-bg-base border border-border-subtle text-text-base placeholder:text-text-subtle pl-9 pr-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                                placeholder="name@example.com"
                                required
                            />
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                        </div>
                    </div>

                    {/* Password Field with Forgot Password Link */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Password</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setResetEmail(email);
                                    setResetSent(false);
                                    setAuthMode('forgot_password');
                                }}
                                className="text-[11px] font-bold text-primary hover:underline cursor-pointer focus:outline-none"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-bg-base border border-border-subtle text-text-base placeholder:text-text-subtle pl-9 pr-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mb-5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary text-compli text-sm font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                            Sign In with Email
                        </button>
                    </div>
                </form>
            )}

            {/* Mode 3: Forgot / Reset Password Form */}
            {authMode === 'forgot_password' && (
                <div>
                    {resetSent ? (
                        <div className="space-y-4 mb-5 text-center">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                <FaCheckCircle size={22} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-text-base">Check Your Inbox</h3>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    We sent a password reset link to <strong className="text-primary font-semibold">{resetEmail}</strong>. Follow the instructions in the email to set a new password.
                                </p>
                            </div>

                            <div className="pt-2 space-y-2">
                                <button
                                    type="button"
                                    onClick={handlePasswordReset}
                                    disabled={resetLoading}
                                    className="w-full py-2 bg-card hover:bg-card-hover border border-border-subtle text-text-base text-xs font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    {resetLoading ? "Resending..." : "Resend Reset Link"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthMode('email');
                                        setResetSent(false);
                                    }}
                                    className="w-full py-2.5 bg-primary text-compli text-xs font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <FaArrowLeft size={10} /> Back to Sign In
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordReset}>
                            <div className="mb-5">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Registered Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full bg-bg-base border border-border-subtle text-text-base placeholder:text-text-subtle pl-9 pr-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                                        placeholder="name@example.com"
                                        required
                                        autoFocus
                                    />
                                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                                </div>
                                <p className="text-[10.5px] text-text-subtle mt-1.5">Firebase will send a secure link to reset your account password.</p>
                            </div>

                            <div className="space-y-2.5 mb-5">
                                <button
                                    type="submit"
                                    disabled={resetLoading || !resetEmail.trim()}
                                    className="w-full py-2.5 bg-primary text-compli text-sm font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {resetLoading ? "Sending Reset Link..." : "Send Password Reset Link"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('email')}
                                    className="w-full py-2 bg-transparent text-text-muted hover:text-text-base text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <FaArrowLeft size={10} /> Cancel & Return to Login
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Mode 2: Phone OTP Form */}
            {authMode === 'phone' && (
                <div>
                    {/* Invisible Recaptcha Container */}
                    <div id="recaptcha-container"></div>

                    {phoneStep === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <div className="mb-5">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Mobile Number</label>
                                <div className="flex rounded-xl border border-border-subtle bg-bg-base overflow-hidden focus-within:border-primary transition-all">
                                    <span className="px-3 py-2.5 bg-card text-text-muted text-xs font-bold flex items-center border-r border-border-subtle">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                                        className="w-full bg-transparent text-text-base placeholder:text-text-subtle px-3 py-2.5 text-sm focus:outline-none font-semibold tracking-wider"
                                        placeholder="9876543210"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-text-subtle mt-1.5">We will send a 6-digit verification code via SMS.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={otpSending || phoneNumber.length < 10}
                                className="w-full py-2.5 bg-primary text-compli text-sm font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50 mb-5"
                            >
                                {otpSending ? "Sending OTP..." : "Get OTP Verification Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Enter 6-Digit OTP</label>
                                    <button
                                        type="button"
                                        onClick={() => setPhoneStep(1)}
                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <FaArrowLeft size={8} /> Change Number
                                    </button>
                                </div>

                                <div className="p-2.5 bg-bg-base rounded-xl border border-border-subtle text-center mb-3">
                                    <p className="text-[11px] text-text-muted">
                                        Sent to <strong className="text-primary font-mono">+91 {phoneNumber}</strong>
                                    </p>
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        className="w-full bg-bg-base border border-border-subtle text-text-base tracking-[0.5em] text-center font-mono font-bold text-lg px-3 py-2 rounded-xl focus:outline-none focus:border-primary transition-all"
                                        placeholder="••••••"
                                        required
                                        autoFocus
                                    />
                                    <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                                </div>

                                {/* Timer & Resend Button */}
                                <div className="flex items-center justify-between mt-2.5 text-xs">
                                    {timer > 0 ? (
                                        <span className="text-[10.5px] text-text-subtle">Resend code in <strong className="text-text-base">{timer}s</strong></span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={otpSending}
                                            className="text-[10.5px] font-bold text-primary hover:underline cursor-pointer"
                                        >
                                            Resend OTP Code
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={otpVerifying || otp.length < 6}
                                className="w-full py-2.5 bg-primary text-compli text-sm font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50 mb-5"
                            >
                                {otpVerifying ? "Verifying..." : "Verify & Sign In"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Footer Link */}
            <p className="text-center text-xs text-text-muted">
                Don&apos;t have an account?{' '}
                {isPage ? (
                    <button
                        type="button"
                        onClick={() => navigate('/signup', { state: location.state })}
                        className="text-primary font-bold hover:underline transition-colors focus:outline-none cursor-pointer"
                    >
                        Create one
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            setIsLoginOpen(false);
                            setIsSignupOpen(true);
                        }}
                        className="text-primary font-bold hover:underline transition-colors focus:outline-none cursor-pointer"
                    >
                        Create one
                    </button>
                )}
            </p>
        </div>
    );

    if (isPage) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-bg-base py-12 px-4 sm:px-6 lg:px-8">
                {loading && <Loader />}
                {formContent}
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 z-[100] flex justify-center items-center bg-black/70 backdrop-blur-md overflow-hidden"
            onClick={() => setIsLoginOpen(false)}
        >
            {loading && <Loader />}
            {formContent}
        </div>
    );
}

export default Login;
