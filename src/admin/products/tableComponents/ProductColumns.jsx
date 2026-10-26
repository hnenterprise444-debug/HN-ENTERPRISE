import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import StatusBadge from '../../Components/common/StatusBadge';
import ToggleButton from '../../../components/Common/ToggleButton';
import {
  getProductStockCount,
  getProductStockInfo,
  getProductDisplayPrice,
  getStockBadgeProps,
  formatProductDate,
} from '../utils/productTableUtils';
import VariantStockDropdown from './VariantStockDropdown';

/**
 * Builds table column definitions for desktop product table view
 */
function getProductTableColumns({
  startIndex = 0,
  onEditClick,
  onDeleteClick,
  toggleActiveStatus,
  formatDate,
}) {
  return [
    {
      key: 'sno',
      header: 'S.No',
      align: 'center',
      className: 'w-14 hidden lg:table-cell',
      cellClassName: 'text-text-muted font-bold text-center hidden lg:table-cell',
      render: (item, idx) => startIndex + idx + 1,
    },
    {
      key: 'image',
      header: 'Product',
      className: 'w-16',
      render: (item) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-subtle bg-bg-base flex items-center justify-center">
          <img
            src={item.imageUrl || item.images?.[0] || 'https://via.placeholder.com/80'}
            alt={item.title}
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Product Title',
      cellClassName: 'font-bold text-text-base',
      render: (item) => (
        <div className="max-w-[200px] lg:max-w-[280px]">
          <div className="truncate" title={item.title}>{item.title}</div>
          <div className="text-[11px] text-text-muted font-normal uppercase tracking-wider">{item.brand || 'No Brand'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      className: 'w-32 hidden sm:table-cell',
      cellClassName: 'text-text-muted hidden sm:table-cell',
      render: (item) => item.category || 'General',
    },
    {
      key: 'price',
      header: 'Price',
      className: 'w-24',
      cellClassName: 'font-extrabold text-text-base',
      render: (item) => {
        const price = getProductDisplayPrice(item);
        return `₹${Number(price || 0).toLocaleString('en-IN')}`;
      },
    },
    {
      key: 'stock',
      header: 'Stock Status',
      align: 'center',
      className: 'w-44 text-center hidden md:table-cell',
      cellClassName: 'text-center hidden md:table-cell',
      render: (item) => {
        const stockInfo = getProductStockInfo(item);
        const badgeProps = getStockBadgeProps(stockInfo.totalStock);
        return (
          <div className="flex flex-col items-center justify-center gap-1.5 py-1">
            <StatusBadge {...badgeProps} />
            {stockInfo.hasVariants && (
              <VariantStockDropdown
                product={item}
                stockInfo={stockInfo}
                onEditClick={onEditClick}
                align="center"
              />
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      className: 'w-32 text-center',
      cellClassName: 'text-center',
      render: (item) => (
        <div className="flex items-center justify-center">
          <ToggleButton
            checked={item.isActive !== false}
            onChange={() => toggleActiveStatus && toggleActiveStatus(item)}
            size="sm"
            color="success"
            onLabel="LIVE"
            offLabel="DRAFT"
          />
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date Added',
      className: 'w-32 hidden xl:table-cell',
      cellClassName: 'text-text-muted hidden xl:table-cell',
      render: (item) => formatProductDate(item.date, formatDate),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      className: 'w-24 text-center',
      cellClassName: 'text-center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onEditClick && onEditClick(item)}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
            title="Edit Product"
          >
            <FaEdit size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteClick && onDeleteClick(item)}
            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
            title="Delete Product"
          >
            <FaTrash size={12} />
          </button>
        </div>
      ),
    },
  ];
}

export default getProductTableColumns;
