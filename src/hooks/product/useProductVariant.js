import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * useProductVariant
 * Production-grade variant selection engine implementing closest-match switching,
 * global option enablement, auto-selection, and dynamic pricing calculations.
 */
export default function useProductVariant(product) {
  const [selectedOptions, setSelectedOptions] = useState({});

  // 1. Reset selections on product change, pre-selecting the 0th index variant by default
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) {
      setSelectedOptions({});
      return;
    }

    // Pre-select attributes of the first variant
    setSelectedOptions(product.variants[0].attributes || {});
  }, [product]);

  // 2. Derive if the selection is complete
  const isComplete = useMemo(() => {
    if (!product?.variantTypes || product.variantTypes.length === 0) return true;
    return product.variantTypes.every(type => selectedOptions[type.name] !== undefined);
  }, [product, selectedOptions]);

  // 3. Find selected variant (matching all current selections exactly)
  const selectedVariant = useMemo(() => {
    if (!product?.variants || !isComplete) return null;
    return product.variants.find(variant => {
      return Object.entries(selectedOptions).every(([key, value]) => {
        return variant.attributes?.[key] === value;
      });
    }) || null;
  }, [product, selectedOptions, isComplete]);

  // 4. Calculate dynamic pricing ranges
  const priceInfo = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) {
      const p = product?.price ? Number(product.price) : 0;
      const op = product?.originalPrice ? Number(product.originalPrice) : null;
      return {
        minPrice: p,
        maxPrice: op || p,
        isRange: false,
        startingPrice: p
      };
    }

    const prices = product.variants.map(v => Number(v.price)).filter(p => !isNaN(p));
    if (prices.length === 0) {
      const p = product?.price ? Number(product.price) : 0;
      return {
        minPrice: p,
        maxPrice: p,
        isRange: false,
        startingPrice: p
      };
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      minPrice,
      maxPrice,
      isRange: minPrice !== maxPrice,
      startingPrice: minPrice
    };
  }, [product]);

  // 5. Check if a specific option value is enabled globally
  // (Disable an option ONLY if no variant in the entire product contains that value)
  const isOptionEnabled = useCallback((typeName, value) => {
    if (!product?.variants) return false;
    return product.variants.some(variant => variant.attributes?.[typeName] === value);
  }, [product]);

  // 6. Handle selection changes using closest-match similarity ranking
  const selectOption = useCallback((typeName, value) => {
    if (!product?.variants || product.variants.length === 0) return;

    // Find all variants that match the selected target option
    const candidates = product.variants.filter(v => v.attributes?.[typeName] === value);

    if (candidates.length === 0) {
      // Fallback if no matching variant is found
      setSelectedOptions(prev => ({
        ...prev,
        [typeName]: value
      }));
      return;
    }

    // Find the candidate variant with the highest matching attributes to our current selection
    let bestCandidate = candidates[0];
    let maxMatches = -1;

    candidates.forEach(candidate => {
      let matches = 0;
      Object.entries(selectedOptions).forEach(([k, val]) => {
        // Evaluate matches on other attributes (excluding the clicked one)
        if (k !== typeName && candidate.attributes?.[k] === val) {
          matches++;
        }
      });

      if (matches > maxMatches) {
        maxMatches = matches;
        bestCandidate = candidate;
      }
    });

    // Update the entire selected options state to align with the closest valid candidate
    if (bestCandidate?.attributes) {
      setSelectedOptions(bestCandidate.attributes);
    }
  }, [product, selectedOptions]);

  return {
    selectedOptions,
    selectedVariant,
    isComplete,
    priceInfo,
    isOptionEnabled,
    selectOption,
    setSelectedOptions
  };
}
