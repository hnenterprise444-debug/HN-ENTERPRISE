import { useState } from "react";
import ReviewStats from "./sections/ReviewStats";
import ReviewFilters from "./sections/ReviewFilters";
import ReviewTable from "./sections/ReviewTable";
import DeleteReviewModal from "./sections/DeleteReviewModal";
import ReviewDetailsModal from "./sections/ReviewDetailsModal";
import { useReviews } from "../../hooks/common/useReviews";
import Header from "../Components/Header";

/**
 * Review Management Page
 * Allows admins to view all product reviews, filter by rating/product/user,
 * and delete inappropriate or fake reviews.
 */
function Review() {
    const { reviews, products, loading, deleteReview } = useReviews();

    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("ALL");
    const [productFilter, setProductFilter] = useState("ALL");

    const [selectedReview, setSelectedReview] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleViewReview = (review) => {
        setSelectedReview(review);
        setIsDetailOpen(true);
    };

    const handleDeleteRequest = (review) => {
        setSelectedReview(review);
        setIsDetailOpen(false);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleting(true);
        try {
            await deleteReview(selectedReview);
            setIsDeleteOpen(false);
            setIsDetailOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    // Derived filtered list
    const filteredReviews = reviews.filter((r) => {
        const searchLower = search.toLowerCase();
        const matchSearch =
            !search ||
            r.userName?.toLowerCase().includes(searchLower) ||
            r.review?.toLowerCase().includes(searchLower) ||
            r.userId?.toLowerCase().includes(searchLower);

        const matchRating = ratingFilter === "ALL" || String(r.rating) === ratingFilter;
        const matchProduct = productFilter === "ALL" || r.productId === productFilter;

        return matchSearch && matchRating && matchProduct;
    });

    return (
        <div className="space-y-6 lg:space-y-5 px-4 md:px-0">
            {/* Header Action Row */}
            <Header title="Product Reviews Moderation" description="Monitor customer feedback, manage review moderation, and remove inappropriate content." />

            <ReviewStats reviews={reviews} />

            <ReviewFilters
                search={search}
                setSearch={setSearch}
                ratingFilter={ratingFilter}
                setRatingFilter={setRatingFilter}
                productFilter={productFilter}
                setProductFilter={setProductFilter}
                products={products}
            />

            <ReviewTable
                reviews={filteredReviews}
                products={products}
                loading={loading}
                onViewReview={handleViewReview}
                onDelete={handleDeleteRequest}
            />

            {/* Review Full Details & Action Modal */}
            <ReviewDetailsModal
                open={isDetailOpen}
                review={selectedReview}
                products={products}
                onClose={() => setIsDetailOpen(false)}
                onDelete={handleDeleteRequest}
            />

            {/* Review Deletion Confirmation Modal */}
            <DeleteReviewModal
                open={isDeleteOpen}
                review={selectedReview}
                products={products}
                deleting={deleting}
                onClose={() => setIsDeleteOpen(false)}
                onDelete={handleDeleteConfirm}
            />
        </div>
    );
}

export default Review;