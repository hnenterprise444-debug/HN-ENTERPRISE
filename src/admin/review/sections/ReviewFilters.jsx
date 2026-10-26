import React from "react";
import FilterBar from "../../Components/FilterBar";

function ReviewFilters({
    search,
    setSearch,
    ratingFilter,
    setRatingFilter,
    productFilter,
    setProductFilter,
    products = {},
}) {
    const productEntries = Object.entries(products);

    const filtersConfig = [
        {
            value: ratingFilter,
            onChange: setRatingFilter,
            options: [
                { value: "ALL", label: "All Ratings" },
                { value: "5", label: "⭐⭐⭐⭐⭐ (5 Star)" },
                { value: "4", label: "⭐⭐⭐⭐ (4 Star)" },
                { value: "3", label: "⭐⭐⭐ (3 Star)" },
                { value: "2", label: "⭐⭐ (2 Star)" },
                { value: "1", label: "⭐ (1 Star)" }
            ]
        },
        {
            value: productFilter,
            onChange: setProductFilter,
            options: [
                { value: "ALL", label: "All Products" },
                ...productEntries.map(([id, name]) => ({
                    value: id,
                    label: name.length > 25 ? name.slice(0, 25) + "…" : name
                }))
            ]
        }
    ];

    return (
        <FilterBar
            search={search}
            setSearch={setSearch}
            searchPlaceholder="Search by user name, review text, or user ID..."
            filters={filtersConfig}
        />
    );
}

export default ReviewFilters;
