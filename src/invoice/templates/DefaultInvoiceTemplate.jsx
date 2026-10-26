import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * DefaultInvoiceTemplate Component
 * Standard professional Tax Invoice layout.
 */
const DefaultInvoiceTemplate = forwardRef(({ invoiceData }, ref) => {
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

  const hasDiscount = items.some((item) => Number(item.discount || 0) > 0);
  const hasMrpDiscount = Number(pricing.mrpDiscount || 0) > 0;

  return (
    <div
      ref={ref}
      id="printable-invoice"
      className="w-full max-w-4xl mx-auto bg-white text-slate-800 p-8 sm:p-10 font-sans border border-slate-200 shadow-xs rounded-xl space-y-8"
      style={{ minWidth: "320px", color: "#1e293b" }}
    >
      {/* Header: Company Info & Invoice Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
        {/* Company Identity */}
        <div className="flex items-center gap-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="h-14 w-auto object-contain rounded-md"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xs">
              {company.name ? company.name.charAt(0).toUpperCase() : "S"}
            </div>
          )}

          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {company.name}
            </h1>
            {company.tagline && (
              <p className="text-xs text-slate-500 font-medium">
                {company.tagline}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              {company.address}
            </p>
            {company.gstin && (
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                GSTIN: <span className="font-mono">{company.gstin}</span>
              </p>
            )}
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div className="text-left sm:text-right space-y-1">
          <span className="px-3 py-1 bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-md inline-block shadow-2xs">
            Tax Invoice
          </span>
          <p className="text-xs text-slate-500 font-bold mt-2">
            Invoice No: <span className="text-slate-900 font-mono">{invoiceNumber}</span>
          </p>
          <p className="text-xs text-slate-500">
            Date: <span className="font-semibold text-slate-700">{date}</span>
          </p>
          <p className="text-xs text-slate-500">
            Order ID: <span className="font-semibold text-slate-700">#{orderId}</span>
          </p>
        </div>
      </div>

      {/* Customer Details & Payment Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 text-xs">
        {/* Billed & Shipped To */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Billed To
          </span>
          <p className="font-extrabold text-sm text-slate-900">{customer.name}</p>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
            {customer.address}
          </p>
          <p className="text-slate-600 font-medium mt-1">Phone: {customer.phone}</p>
          {customer.email && <p className="text-slate-600">Email: {customer.email}</p>}
        </div>

        {/* Payment Summary */}
        <div className="space-y-1 text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Payment Info
          </span>
          <p className="text-slate-700">
            Method: <strong className="text-slate-900">{payment.mode}</strong>
          </p>
          <p className="text-slate-700">
            Transaction ID: <span className="font-mono text-slate-800">{payment.paymentId}</span>
          </p>
          <p className="text-slate-700 flex sm:justify-end items-center gap-1.5 mt-1">
            Status:{" "}
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              {payment.status}
            </span>
          </p>
        </div>
      </div>

      {/* Purchased Items Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Item Details</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">{hasDiscount ? "MRP" : "Unit Price"}</th>
              {hasDiscount && (
                <th className="py-3 px-4 text-right">Discount</th>
              )}
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {items.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4">
                  <p className="font-extrabold text-slate-900 text-sm">{item.name}</p>
                  {/* Generic Variant Chips */}
                  {Array.isArray(item.variants) && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.variants.map((v, vIdx) => (
                        <span
                          key={vIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600"
                        >
                          {v.label}: <strong className="text-slate-800">{v.value}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                  {item.qty}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                  ₹{Number((hasDiscount ? item.mrp : item.unitPrice) || 0).toLocaleString("en-IN")}
                </td>
                {hasDiscount && (
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">
                    {item.discount > 0 ? `-₹${Number(item.discount).toLocaleString("en-IN")}` : "-"}
                  </td>
                )}
                <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                  ₹{Number(item.totalPrice || 0).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pricing Calculation Breakdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2">
        {/* QR Code & Verification */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
          <QRCodeSVG value={`INVOICE:${invoiceNumber}|ORDER:${orderId}|TOTAL:${pricing.grandTotal}`} size={56} />
          <div className="text-[10px] text-slate-500 space-y-0.5">
            <p className="font-bold text-slate-700">Scan to Verify</p>
            <p>Authentic Digital Tax Invoice</p>
            <p className="font-mono text-[9px] text-slate-400">{invoiceNumber}</p>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="w-full sm:w-72 space-y-2 text-xs border-t sm:border-t-0 pt-4 sm:pt-0">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal {hasMrpDiscount ? "(MRP)" : ""}</span>
            <span className="font-semibold text-slate-800">
              ₹{Number(pricing.subtotal || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {hasMrpDiscount && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Product Discount</span>
              <span className="font-bold">
                -₹{Number(pricing.mrpDiscount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {pricing.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Coupon Discount</span>
              <span className="font-bold">
                -₹{Number(pricing.couponDiscount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 font-medium">
            <span>Shipping & Handling</span>
            <span className="font-semibold text-slate-800">
              {pricing.shippingCharge ? `₹${Number(pricing.shippingCharge).toLocaleString("en-IN")}` : "FREE"}
            </span>
          </div>

          {pricing.tax > 0 && (
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Estimated Tax</span>
              <span className="font-semibold text-slate-800">
                ₹{Number(pricing.tax).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2.5 border-t-2 border-slate-900 text-sm font-black text-slate-900">
            <span>Grand Total</span>
            <span className="text-base text-indigo-600">
              ₹{Number(pricing.grandTotal || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
});

DefaultInvoiceTemplate.displayName = "DefaultInvoiceTemplate";

export default DefaultInvoiceTemplate;
