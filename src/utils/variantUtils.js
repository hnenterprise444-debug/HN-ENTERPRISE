/**
 * Computes the Cartesian product of multiple arrays.
 * e.g., getCartesian([["A4", "A3"], ["Black", "Wooden"]]) 
 * => [["A4", "Black"], ["A4", "Wooden"], ["A3", "Black"], ["A3", "Wooden"]]
 */
export const getCartesian = (arrays) => {
    return arrays.reduce((acc, curr) => {
        return acc.flatMap(d => curr.map(e => [...d, e]));
    }, [[]]);
};

/**
 * Generates combinations of attributes based on the defined variantTypes list,
 * while preserving existing values where attributes match.
 * 
 * @param {Object} products - The product form state object.
 * @param {Array} products.variantTypes - The defined variant types (e.g. [{ name: 'Size', values: ['A4'] }]).
 * @param {Array} products.variants - Existing variants to match against.
 * @param {string|number} products.price - Base fallback price for new combinations.
 * @returns {Array} - The generated list of variants.
 */
export const generateVariantCombinations = (products) => {
    if (!products.variantTypes || products.variantTypes.length === 0) return [];
    
    // Filter out types with no name or no values
    const validTypes = products.variantTypes.filter(t => t.name && t.values && t.values.length > 0);
    if (validTypes.length === 0) return [];

    const typeValues = validTypes.map(t => t.values);
    const cartesianProduct = getCartesian(typeValues);

    return cartesianProduct.map(combination => {
        const attributes = {};
        combination.forEach((value, idx) => {
            attributes[validTypes[idx].name] = value;
        });

        // Check if a variant with these exact attributes already exists
        const existing = products.variants?.find(v => {
            return Object.keys(attributes).every(k => v.attributes?.[k] === attributes[k]);
        });

        if (existing) {
            return existing;
        }

        return {
            attributes,
            price: Number(products.price) || 0,
            originalPrice: Number(products.price) || 0,
            inStock: 10,
            isActive: true,
            images: []
        };
    });
};
