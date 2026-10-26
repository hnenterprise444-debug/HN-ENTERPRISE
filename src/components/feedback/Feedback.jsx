import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Loader from "../../components/loader/Loader";
import { feedbackService } from "../../services/feedback/feedbackService";
import { toast } from "react-toastify";

const FeedbackPage = () => {
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
      console.error(error);
      toast.error("Failed to send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-5 py-12 bg-bg-base">
      {loading && <Loader />}

      <div className="w-full max-w-2xl rounded-3xl border border-border-subtle shadow-sm p-8 md:p-10 transition-all duration-300 bg-card text-text-base">
        {/* Heading */}
        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-base">
            We&apos;d Love Your Feedback
          </h2>

          <p className="text-sm text-text-muted">
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
            className="w-full h-48 resize-none rounded-2xl border border-border-subtle bg-bg-base px-5 py-4 text-base text-text-base placeholder:text-text-subtle transition-all duration-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-subtle text-xs">
              Maximum 500 characters
            </span>

            <span className="font-semibold text-text-muted text-xs">
              {message.length}/500
            </span>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSendClick}
            disabled={loading}
            className="rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-compli font-bold px-7 py-3.5 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Sending..." : "Send Feedback"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeedbackPage;