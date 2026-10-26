import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/auth/useAuth';
import Loader from '../../components/loader/Loader';
import { FaUser, FaEnvelope, FaPhoneAlt, FaLock, FaKey, FaArrowLeft } from 'react-icons/fa';
import { getFriendlyErrorMessage } from '../../utils/firebaseErrorHandler.js';
import { useSiteConfig } from '../../context/SiteConfigContext';

/**
 * Signup Component (Adaptive Modal or Page)
 * Renders centered registration form over a blurred backdrop overlay if modal,
 * or as a styled standalone container if page.
 * Supports Email & Password registration AND Phone OTP registration with reCAPTCHA verification.
 */
function Signup() {
    const { config } = useSiteConfig();
    const companyName = config?.companyName || "Company Name";
    const [authMode, setAuthMode] = useState('email'); // 'email' | 'phone'

    // Email Signup State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone Signup State
    const [phoneName, setPhoneName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneStep, setPhoneStep] = useState(1); // 1: Info input, 2: OTP verification
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [timer, setTimer] = useState(0);

    const { loading, signup, setupRecaptcha, checkPhoneExists, sendOtp, verifyOtp, setIsLoginOpen, setIsSignupOpen } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isPage = location.pathname === '/signup';

    // Countdown Timer for Resend OTP
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handle Email & Password Signup
    const handleEmailSignup = async (e) => {
        if (e) e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            return toast.error("All fields are required.");
        }

        try {
            await signup(name.trim(), email.trim(), password);
            toast.success("Account created successfully!");
            setName("");
            setEmail("");
            setPassword("");
            setIsSignupOpen(false);
            if (isPage) {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, "Registration failed. Please try again."));
        }
    };

    // Handle Sending OTP for Phone Signup
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!phoneName.trim()) {
            return toast.error("Please enter your Full Name.");
        }
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        if (!cleanPhone || cleanPhone.length < 10) {
            return toast.error("Please enter a valid 10-digit mobile number.");
        }

        setOtpSending(true);
        try {
            // Verify if account already exists with this phone number
            const phoneExists = await checkPhoneExists(cleanPhone);
            if (phoneExists) {
                toast.info("An account with this mobile number already exists. Redirecting to Login...");
                setIsSignupOpen(false);
                setIsLoginOpen(true);
                if (isPage) {
                    navigate('/login');
                }
                return;
            }

            const verifier = setupRecaptcha("recaptcha-signup-container", "invisible");
            const result = await sendOtp(cleanPhone, verifier);
            setConfirmationResult(result);
            setPhoneStep(2);
            setTimer(30);
            toast.success(`OTP sent to +91 ${cleanPhone}`);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, "Failed to send OTP code. Please try again."));
        } finally {
            setOtpSending(false);
        }
    };

    // Handle OTP Verification & Account Creation
    const handleVerifyOtpSignup = async (e) => {
        if (e) e.preventDefault();
        if (!otp.trim() || otp.trim().length < 6) {
            return toast.error("Please enter valid 6-digit OTP code.");
        }

        setOtpVerifying(true);
        try {
            await verifyOtp(confirmationResult, otp.trim(), phoneName.trim());
            toast.success("Phone Registration Successful!");
            setIsSignupOpen(false);
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
                    onClick={() => setIsSignupOpen(false)}
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
                <h1 className="text-text-base text-2xl font-bold tracking-tight">Create Account</h1>
                <p className="text-xs text-text-muted mt-1 font-medium">Join {companyName} today</p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-bg-base p-1 rounded-xl mb-6 border border-border-subtle">
                <button
                    type="button"
                    onClick={() => { setAuthMode('email'); setPhoneStep(1); }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        authMode === 'email' ? 'bg-card text-text-base border border-border-subtle shadow-xs' : 'text-text-muted hover:text-text-base'
                    }`}
                >
                    <FaEnvelope size={11} /> Email Signup
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

            {/* Mode A: Email Registration */}
            {authMode === 'email' && (
                <form onSubmit={handleEmailSignup}>
                    {/* Full Name Field */}
                    <div className="mb-4">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Full Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-bg-base border border-border-subtle text-text-base placeholder:text-text-subtle pl-9 pr-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                                placeholder="John Doe"
                                required
                            />
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
                        </div>
                    </div>

                    {/* Email Address Field */}
                    <div className="mb-4">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-bg-base border border-border-subtle text-text-base placeholder:text-text-subtle pl-9 pr-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                                placeholder="name@example.com"
                                required
                            />
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-bg-base border border-border-subtle text-text-base placeholder:text-text-subtle pl-9 pr-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mb-5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary text-compli text-sm font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            )}

            {/* Mode B: Phone OTP Registration */}
            {authMode === 'phone' && (
                <div>
                    {/* Recaptcha Container */}
                    <div id="recaptcha-signup-container"></div>

                    {phoneStep === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            {/* Full Name Field */}
                            <div className="mb-4">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={phoneName}
                                        onChange={(e) => setPhoneName(e.target.value)}
                                        className="w-full bg-bg-base border border-border-subtle text-text-base placeholder:text-text-subtle pl-9 pr-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                                        placeholder="John Doe"
                                        required
                                    />
                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
                                </div>
                            </div>

                            {/* Mobile Number Field */}
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
                                <p className="text-[10px] text-text-subtle mt-1.5">We will send a 6-digit OTP verification code via SMS.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={otpSending || !phoneName.trim() || phoneNumber.length < 10}
                                className="w-full py-2.5 bg-primary text-compli text-sm font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50 mb-5"
                            >
                                {otpSending ? "Sending OTP..." : "Get OTP Verification Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtpSignup}>
                            <div className="mb-5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Enter 6-Digit OTP</label>
                                    <button
                                        type="button"
                                        onClick={() => setPhoneStep(1)}
                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <FaArrowLeft size={8} /> Change Details
                                    </button>
                                </div>

                                <div className="p-2.5 bg-bg-base rounded-xl border border-border-subtle text-center mb-3 space-y-0.5">
                                    <p className="text-xs font-bold text-text-base">{phoneName}</p>
                                    <p className="text-[10.5px] text-text-muted">
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

                                {/* Resend Timer */}
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
                                {otpVerifying ? "Verifying..." : "Verify & Register Account"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Footer Link */}
            <p className="text-center text-xs text-text-muted">
                Have an account?{' '}
                {isPage ? (
                    <button
                        type="button"
                        onClick={() => navigate('/login', { state: location.state })}
                        className="text-primary font-bold hover:underline transition-colors focus:outline-none cursor-pointer"
                    >
                        Log In
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignupOpen(false);
                            setIsLoginOpen(true);
                        }}
                        className="text-primary font-bold hover:underline transition-colors focus:outline-none cursor-pointer"
                    >
                        Log In
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
            onClick={() => setIsSignupOpen(false)}
        >
            {loading && <Loader />}
            {formContent}
        </div>
    );
}

export default Signup;