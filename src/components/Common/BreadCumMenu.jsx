import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaChevronRight, FaArrowLeft } from "react-icons/fa";

/**
 * Breadcrumb Component
 * Dynamically generates breadcrumb navigation from the current URL path.
 * Segments are parsed, humanized, and rendered as clickable links (except the last one).
 * Includes a back-navigate button that uses browser history.
 *
 * Props:
 *   - rootName: Label for the root/home crumb (default: "Dashboard")
 *   - rootPath: Route for the root crumb (default: "/dashboard")
 *   - labels: Optional map of { segment: "Custom Label" } overrides
 *             e.g. { addproduct: "Add Product", updateproduct: "Update Product" }
 */
function Breadcrumb({
    rootName = "Dashboard",
    rootPath = "/dashboard",
    labels = {},
}) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const segments = pathname.split("/").filter(Boolean);

    const humanize = (segment) => {
        // Check for an explicit override first
        if (labels[segment]) return labels[segment];
        return segment
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const crumbs = segments.map((segment, index) => ({
        name: humanize(segment),
        path: "/" + segments.slice(0, index + 1).join("/"),
    }));

    // Filter out the root path from crumbs to avoid duplication
    const filteredCrumbs = crumbs.filter((c) => c.path !== rootPath);

    return (
        <div className="flex items-center gap-3">

            {/* Back button — go to previous page in history */}
            <button
                onClick={() => navigate(-1)}
                className="w-6 h-6 flex items-center justify-center rounded-md border border-border-subtle hover:border-primary/40 bg-bg-surface hover:bg-card-hover text-text-muted hover:text-text-base transition text-[10px]"
                title="Go Back"
            >
                <FaArrowLeft />
            </button>

            <nav aria-label="breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs">

                {/* Root Crumb */}
                <Link
                    to={rootPath}
                    className="text-text-muted hover:text-primary transition font-medium"
                >
                    {rootName}
                </Link>

                {filteredCrumbs.map((crumb, index) => {
                    const isLast = index === filteredCrumbs.length - 1;

                    return (
                        <div key={crumb.path} className="flex items-center gap-1.5">

                            <FaChevronRight className="text-[8px] text-text-muted" />

                            {isLast ? (
                                <span className="font-semibold text-text-base">
                                    {crumb.name}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className="text-text-muted hover:text-primary transition font-medium"
                                >
                                    {crumb.name}
                                </Link>
                            )}

                        </div>
                    );
                })}

            </nav>

        </div>
    );
}

export default Breadcrumb;