import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import { toast } from "react-toastify";
import { getFriendlyErrorMessage } from "../../utils/firebaseErrorHandler.js";
import { queryKeys } from "../../utils/queryKeys.js";

/**
 * useReviews
 * Encapsulates all Firestore operations for the admin Review management page using TanStack Query.
 */
export function useReviews() {
    const queryClient = useQueryClient();

    const { data: reviewsData, isLoading: reviewsLoading, isError: isReviewsError, error: reviewsError } = useQuery({
        queryKey: queryKeys.reviews.all,
        queryFn: async () => {
            const reviewsSnap = await getDocs(
                query(collection(fireDB, "ratings"), orderBy("createdAt", "desc"))
            );
            return reviewsSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));
        },
        staleTime: 3 * 60 * 1000, // 3 minutes cache
    });

    const { data: productsMap = {} } = useQuery({
        queryKey: ['products', 'titles-map'],
        queryFn: async () => {
            const productsSnap = await getDocs(collection(fireDB, "products"));
            const productMap = {};
            productsSnap.forEach((d) => {
                productMap[d.id] = d.data().title || d.id;
            });
            return productMap;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes cache for product names map
    });

    const deleteReview = async (review) => {
        if (!review?.id) return;
        try {
            await deleteDoc(doc(fireDB, "ratings", review.id));
            toast.success("Review deleted successfully");
            queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, "Failed to delete review."));
            throw err;
        }
    };

    return {
        reviews: reviewsData || [],
        products: productsMap,
        loading: reviewsLoading,
        isError: isReviewsError,
        error: reviewsError,
        deleteReview
    };
}

export default useReviews;

