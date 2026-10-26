import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

function TopNavigation({
    title,
    subtitle,
    rightContent,
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        // If a previous route is passed through state
        if (location.state?.backTo) {
            navigate(location.state.backTo, {
                state: location.state?.backState || {},
            });
            return;
        }

        // Default fallback
        navigate(-1);
    };

    return (
        <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle">

            <div className="max-w-7xl mx-auto h-20 px-8 flex items-center justify-between">

                <div className="flex items-center gap-5">

                    <button
                        onClick={handleBack}
                        className="w-11 h-11 rounded-xl border border-border-subtle hover:border-primary/40 bg-bg-surface hover:bg-card-hover text-text-muted hover:text-text-base transition flex items-center justify-center"
                    >
                        <FaArrowLeft />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-text-base">
                            {title}
                        </h1>

                        {subtitle && (
                            <p className="text-sm text-text-muted mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>

                </div>

                {rightContent && (
                    <div className="flex items-center gap-3">
                        {rightContent}
                    </div>
                )}

            </div>

        </div>
    );
}

export default TopNavigation;
