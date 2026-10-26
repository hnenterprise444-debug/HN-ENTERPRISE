/**
 * Category Utility Helpers
 * Centralized defaults and normalization to guarantee consistency across database and UI.
 */

export const DEFAULT_CATEGORIES = [
  "Accessories",
  "Beauty & Personal Care",
  "Books & Stationery",
  "Electronics",
  "Fashion",
  "Footwear",
  "Grocery",
  "Home & Kitchen",
  "Sports & Fitness",
  "Toys & Games"
];

/**
 * Normalizes a category string:
 * - Trims whitespace
 * - Converts to standard Title Case (e.g., 'tiles' -> 'Tiles', 'home & kitchen' -> 'Home & Kitchen')
 * - Preserves short acronyms (e.g., 'LED', 'DIY')
 * @param {string} cat
 * @returns {string}
 */
export function normalizeCategoryName(cat) {
  if (!cat || typeof cat !== 'string') return '';
  const trimmed = cat.trim();
  if (!trimmed) return '';

  return trimmed
    .split(/\s+/)
    .map(word => {
      if (word.length <= 1) return word.toUpperCase();
      // Keep short all-caps words (e.g. LED, DIY, TV, USB)
      if (word === word.toUpperCase() && word.length <= 4) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
