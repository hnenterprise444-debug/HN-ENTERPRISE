import React from 'react';
import Products from './Products';
import { useTheme } from '../../context/ThemeContext';

/**
 * UpdateProduct Component
 * Renders the product editing panel by rendering the unified Products entrypoint.
 */
function UpdateProduct() {
    const { mode } = useTheme();

    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        if (typeof dateValue.toDate === 'function') {
            return dateValue.toDate().toLocaleString();
        }
        return String(dateValue);
    };

    return <Products mode={mode} formatDate={formatDate} />;
}

export default UpdateProduct;
