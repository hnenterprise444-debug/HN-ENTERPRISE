import React from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fireDB } from '../../../firebase/FirebaseConfig';
import CommonProductCard from '../../../components/Common/ProductCard';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../redux/cartSlice';
import { toast } from 'react-toastify';
import { queryKeys } from '../../../utils/queryKeys';
import { computeTotalStock } from '../../../utils/productUtils';

/**
 * RelatedProducts Component
 * Displays matching catalog recommendations in a scrollable horizontal carousel.
 * Uses TanStack Query for caching recommendations and instant transitions.
 */
export default function RelatedProducts({ category, currentProductId }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const addCart = (product) => {
    const totalStock = computeTotalStock(product);
    if (totalStock <= 0 || product.isActive === false) {
      toast.error("This product is currently out of stock.");
      return;
    }
    const hasVariants = (product.variantTypes && product.variantTypes.length > 0) || 
                        (Array.isArray(product.variants) && product.variants.length > 1);
    if (hasVariants) {
      navigate(`/productdetails/${product.id}`);
      toast.info("Please select variant options first.");
      return;
    }
    const { time, ...serializableProduct } = product;
    dispatch(addToCart(serializableProduct));
    toast.success('Added to cart!');
  };

  const { data: relatedProducts = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.products.related(category),
    queryFn: async () => {
      if (!category) return [];
      const q = query(
        collection(fireDB, 'products'),
        where('category', '==', category),
        limit(10)
      );
      const snap = await getDocs(q);
      const results = [];
      snap.forEach((doc) => {
        const data = doc.data();
        const price = data.price || (data.variants && data.variants.length > 0 ? String(data.variants[0].price) : "");
        const imageUrl = data.imageUrl || (data.images && data.images.length > 0 ? data.images[0] : "");
        results.push({
          ...data,
          id: doc.id,
          price,
          imageUrl
        });
      });
      return results;
    },
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000,
  });

  const related = relatedProducts.filter((p) => p.id !== currentProductId);

  // Don't render if nothing to show
  if (!loading && related.length === 0) return null;

  return (
    <section className="sm:mt-20">
      <div className="flex justify-between items-center sm:mb-8">
        <h2 className="md:text-3xl text-xl font-semibold">You May Also Like</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const el = document.getElementById('related-scroll');
              if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
            }}
            className="w-10 h-10 rounded-full border border-border-subtle bg-card text-text-base flex items-center justify-center hover:bg-card-hover hover:border-primary/50 transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('related-scroll');
              if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
            }}
            className="w-10 h-10 rounded-full border border-border-subtle bg-card text-text-base flex items-center justify-center hover:bg-card-hover hover:border-primary/50 transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[280px] flex-shrink-0 animate-pulse bg-card border border-border-subtle rounded-2xl p-3 space-y-3">
              <div className="bg-bg-surface rounded-xl aspect-[4/3]" />
              <div className="h-4 bg-bg-surface rounded w-3/4" />
              <div className="h-4 bg-bg-surface rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div
          id="related-scroll"
          className="flex gap-6 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {related.map((prod, index) => (
            <div key={prod.id} className="w-[280px] flex-shrink-0">
              <CommonProductCard item={prod} index={index} addCart={addCart} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
