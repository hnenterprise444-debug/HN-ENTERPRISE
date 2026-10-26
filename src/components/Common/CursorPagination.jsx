import React from 'react';
import Pagination from './Pagination';

/**
 * Reusable CursorPagination Component
 * Directly delegates to the unified Pagination component to guarantee 100% UI consistency across all tables.
 */
function CursorPagination(props) {
    return <Pagination {...props} />;
}

export default CursorPagination;
