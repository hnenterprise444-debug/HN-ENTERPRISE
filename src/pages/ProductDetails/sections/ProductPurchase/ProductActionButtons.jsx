import React from 'react';
import { useSiteConfig } from '../../../../context/SiteConfigContext';

export default function ProductActionButtons({ product, quantity, addProductToCart }) {
  const { config } = useSiteConfig();
  const isCustom = product?.category === 'Custom';

  const handleAddToCart = () => {
    if (!product) return;
    // Pass product with quantity for cart
    addProductToCart({ ...product, quantity });
  };

  const phone = config?.whatsappModal?.phoneNumber || config?.phones?.[0]?.number || "";
  const cleanPhone = phone.replace(/\D/g, "");
  const targetNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const msg = encodeURIComponent(`Hi, I would like to enquire about ${product?.title || "this product"}.`);
  const waUrl = targetNumber ? `https://wa.me/${targetNumber}?text=${msg}` : `https://wa.me/?text=${msg}`;

  if (isCustom) {
    return (
      <div className="flex flex-col gap-3">
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="h-[56px] w-full bg-[#22C55E] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1eb355] transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">chat</span>
          ENQUIRE ON WHATSAPP
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAddToCart}
        className="h-[56px] w-full bg-[#1e40af] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98]"
      >
        ADD TO CART
      </button>
      <button
        onClick={handleAddToCart}
        className="h-[56px] w-full bg-[#00288e] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98]"
      >
        BUY NOW
      </button>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        className="h-[56px] w-full bg-[#22C55E] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1eb355] transition-all active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">chat</span>
        WHATSAPP
      </a>
    </div>
  );
}
