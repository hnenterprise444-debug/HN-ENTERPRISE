import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import Loader from "../../../components/loader/Loader";
import { feedbackService } from "../../../services/feedback/feedbackService";
import { toast } from "react-toastify";
import { getFriendlyErrorMessage } from "../../../utils/firebaseErrorHandler.js";

/**
 * Feedback Component
 * Renders a stylized, theme-aware feedback submission form.
 * Connects directly to project-wide brand and container CSS variables.
 */
const Feedback = () => {
  const { mode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const userData = JSON.parse(localStorage.getItem("user"))?.user ?? null;

  const handleSendClick = async () => {
    if (!message.trim()) {
      return toast.error("Please write your feedback.");
    }

    setLoading(true);

    try {
      await feedbackService.submitFeedback({
        message,
        email: userData?.email || null,
      });

      toast.success("Feedback sent successfully");
      setMessage("");
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, "Failed to send feedback. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4 py-8 bg-bg-base transition-colors duration-300">
      {loading && <Loader />}

      <div className="w-full max-w-2xl rounded-3xl border border-border-subtle bg-card text-text-base shadow-sm p-5 sm:p-8 md:p-10 transition-all duration-300">
        
        {/* Heading */}
        <div className="space-y-2 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-base">
            We&apos;d Love Your Feedback
          </h2>
          <p className="text-xs sm:text-sm text-text-muted font-medium">
            Help us improve your experience by sharing your thoughts, suggestions, or reporting any issues.
          </p>
        </div>

        {/* Textarea */}
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            placeholder="Tell us what you liked, what could be improved, or report any issue..."
            className="w-full h-36 sm:h-48 resize-none rounded-2xl border border-border-subtle px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-bg-base text-text-base placeholder:text-text-subtle"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted/60 font-medium">
              Maximum 500 characters
            </span>
            <span className="font-bold text-text-muted">
              {message.length}/500
            </span>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSendClick}
            disabled={loading}
            className="rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-compli font-black px-7 py-3.5 transition-all duration-200 shadow-md shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Sending..." : "Send Feedback"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Feedback;