import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * MinimalInvoiceTemplate Component
 * Alternative sleek, minimalist Tax Invoice template layout.
 */
const MinimalInvoiceTemplate = forwardRef(({ invoiceData }, ref) => {
  if (!invoiceData) return null;

  const {
    orderId,
    invoiceNumber,
    date,
    company = {},
    customer = {},
    items = [],
    pricing = {},
    payment = {}
  } = invoiceData;

  const hasMrpDiscount = Number(pricing.mrpDiscount || 0) > 0;

  return (
    <div
      ref={ref}
      id="printable-invoice"
      className="w-full max-w-4xl mx-auto bg-white text-gray-900 p-8 font-sans space-y-6"
      style={{ minWidth: "320px" }}
    >
      {/* Top Accent Line */}
      <div className="h-1.5 w-full bg-indigo-600 rounded-full" />

      {/* Header */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">{company.name || "STORE INVOICE"}</h1>
          <p className="text-xs text-gray-500 max-w-sm mt-0.5">{company.address}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice</p>
          <p className="text-base font-black font-mono text-gray-900">{invoiceNumber}</p>
          <p className="text-xs text-gray-500 mt-1">Date: {date}</p>
        </div>
      </div>

      {/* Grid: Bill To & Order Info */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Billed To</p>
          <p className="font-extrabold text-sm text-gray-900 mt-0.5">{customer.name}</p>
          <p className="text-gray-600 leading-normal">{customer.address}</p>
          <p className="text-gray-500 mt-1">Phone: {customer.phone}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order Reference</p>
          <p className="font-extrabold text-sm text-gray-900 font-mono">#{orderId}</p>
          <p className="text-gray-600">Payment: <strong className="text-gray-800">{payment.mode}</strong></p>
          <p className="text-gray-600">Status: <span className="font-bold text-emerald-600">{payment.status}</span></p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
              <th className="py-2">Description</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 pr-4">
                  <p className="font-extrabold text-gray-900">{item.name}</p>
                  {Array.isArray(item.variants) && item.variants.length > 0 && (
                    <p className="text-[10px] text-gray-500">
                      {item.variants.map((v) => `${v.label}: ${v.value}`).join(" | ")}
                    </p>
                  )}
                </td>
                <td className="py-3 text-center font-bold text-gray-700">{item.qty}</td>
                <td className="py-3 text-right font-medium text-gray-600">₹{Number(item.unitPrice || 0).toLocaleString("en-IN")}</td>
                <td className="py-3 text-right font-extrabold text-gray-900">₹{Number(item.totalPrice || 0).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer & Totals */}
      <div className="flex justify-between items-end pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <QRCodeSVG value={invoiceData.qrUrl || (typeof window !== "undefined" ? `${window.location.origin}/profile?tab=orders` : "/profile?tab=orders")} size={48} />
          <p className="text-[10px] text-gray-400 max-w-xs">Computer generated invoice. Thank you for your order!</p>
        </div>

        <div className="w-56 space-y-1.5 text-xs text-right">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal {hasMrpDiscount ? "(MRP)" : ""}</span>
            <span>₹{Number(pricing.subtotal || 0).toLocaleString("en-IN")}</span>
          </div>
          {hasMrpDiscount && (
            <div className="flex justify-between text-emerald-600">
              <span>Product Discount</span>
              <span>-₹{Number(pricing.mrpDiscount).toLocaleString("en-IN")}</span>
            </div>
          )}
          {pricing.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Coupon Discount</span>
              <span>-₹{Number(pricing.couponDiscount).toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{pricing.shippingCharge ? `₹${Number(pricing.shippingCharge).toLocaleString("en-IN")}` : "FREE"}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-900 text-sm font-black text-gray-900">
            <span>Total</span>
            <span className="text-indigo-600">₹{Number(pricing.grandTotal || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

MinimalInvoiceTemplate.displayName = "MinimalInvoiceTemplate";

export default MinimalInvoiceTemplate;
