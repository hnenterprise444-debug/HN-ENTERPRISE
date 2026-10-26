import React from 'react';
import Products from './Products';
import { useTheme } from '../../context/ThemeContext';

/**
 * AddProduct Component
 * Renders the product creation panel by rendering the unified Products entrypoint.
 */
function AddProduct() {
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

export default AddProduct;
