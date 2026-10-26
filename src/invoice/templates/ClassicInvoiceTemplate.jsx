import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * ClassicInvoiceTemplate Component
 * Classic GST Tax Invoice template layout with multi-column sold-by/billing/shipping blocks,
 * detailed product breakdown table, authorized signatory, and clean print styles.
 */
const ClassicInvoiceTemplate = forwardRef(({ invoiceData }, ref) => {
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

  // Determine dynamic columns based on data presence
  const hasDiscount = items.some((item) => Number(item.discount || 0) > 0);
  const hasGst = items.some((item) => Number(item.gst || 0) > 0) || Number(pricing.tax || 0) > 0;
  const hasCess = items.some((item) => Number(item.cess || 0) > 0);
  const hasMrpDiscount = Number(pricing.mrpDiscount || 0) > 0;

  return (
    <div ref={ref} className="p-2 bg-gray-100 min-h-screen">
      <div
        id="printable-invoice"
        className="
          max-w-4xl mx-auto
          p-8
          bg-white
          shadow-xl
          font-sans
          text-gray-900
          print:shadow-none
          print:p-0
          print:m-0
        "
        style={{ color: "#111827" }}
      >
        {/* HEADER */}
        <header className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-3 border-b-2 border-black inline-block uppercase tracking-wider">
                INVOICE
              </h1>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-bold font-mono">{invoiceNumber}</p>
                  <p className="text-xs mt-1">
                    Invoice Date:
                    <span className="font-medium ml-1">{date}</span>
                  </p>
                </div>

                <div>
                  <p className="text-lg font-bold font-mono">#{orderId}</p>
                  <p className="text-xs mt-1">
                    Order Date:
                    <span className="font-medium ml-1">{date}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* QR CODE */}
            <div className="ml-4 flex-shrink-0">
              <div className="border border-gray-300 p-1.5 bg-white text-center">
                <QRCodeSVG value={invoiceData.qrUrl || (typeof window !== "undefined" ? `${window.location.origin}/profile?tab=orders` : "/profile?tab=orders")} size={80} />
              </div>
            </div>
          </div>

          {/* ADDRESS BLOCK */}
          <div className="border border-gray-300 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 min-w-0 pr-4 sm:border-r border-gray-200 w-full sm:w-auto">
              <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-gray-700">
                Sold By
              </h3>
              <p className="text-xs font-bold">{company.name}</p>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{company.address}</p>
              {company.phone && <p className="text-xs text-gray-600">Phone: {company.phone}</p>}
              {company.gstin && <p className="text-xs font-mono font-bold text-gray-800">GSTIN: {company.gstin}</p>}
            </div>

            <div className="flex-1 min-w-0 pr-4 sm:border-r border-gray-200 w-full sm:w-auto">
              <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-gray-700">
                Billing Address
              </h3>
              <p className="text-xs font-bold">{customer.name}</p>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{customer.address}</p>
              {customer.phone && <p className="text-xs text-gray-600">Phone: {customer.phone}</p>}
              {customer.email && <p className="text-xs text-gray-600 truncate">{customer.email}</p>}
            </div>

            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-gray-700">
                Shipping Address
              </h3>
              <p className="text-xs font-bold">{customer.name}</p>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{customer.address}</p>
              {customer.phone && <p className="text-xs text-gray-600">Phone: {customer.phone}</p>}
            </div>
          </div>
        </header>

        {/* PRODUCTS */}
        <h2 className="text-lg font-semibold mb-3 mt-6">
          Products Details
        </h2>

        <div className="border border-gray-300 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="p-2 font-medium border-r border-gray-300">Product</th>
                <th className="p-2 font-medium border-r border-gray-300 text-center">Qty</th>
                <th className="p-2 font-medium border-r border-gray-300 text-right">
                  {hasDiscount ? "MRP" : "Unit Price"}
                </th>
                {hasDiscount && (
                  <th className="p-2 font-medium border-r border-gray-300 text-right">Discount</th>
                )}
                {hasGst && (
                  <th className="p-2 font-medium border-r border-gray-300 text-right">GST</th>
                )}
                {hasCess && (
                  <th className="p-2 font-medium border-r border-gray-300 text-center">CESS</th>
                )}
                <th className="p-2 font-medium text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="h-10 border-t border-gray-300">
                  <td className="p-2 text-xs border-r border-gray-300">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    {Array.isArray(item.variants) && item.variants.length > 0 && (
                      <p className="text-[10px] text-gray-500">
                        {item.variants.map((v) => `${v.label}: ${v.value}`).join(" | ")}
                      </p>
                    )}
                  </td>
                  <td className="p-2 text-xs border-r border-gray-300 text-center font-bold">
                    {item.qty}
                  </td>
                  <td className="p-2 text-xs border-r border-gray-300 text-right font-medium">
                    ₹{Number((hasDiscount ? item.mrp : item.unitPrice) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  {hasDiscount && (
                    <td className="p-2 text-xs border-r border-gray-300 text-right text-green-600 font-medium">
                      {item.discount > 0 ? `-₹${Number(item.discount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                  )}
                  {hasGst && (
                    <td className="p-2 text-xs border-r border-gray-300 text-right text-gray-600">
                      {item.gst > 0 ? `₹${Number(item.gst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                  )}
                  {hasCess && (
                    <td className="p-2 text-xs border-r border-gray-300 text-center text-gray-600">
                      {item.cess > 0 ? `₹${Number(item.cess).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                  )}
                  <td className="p-2 text-xs text-right font-bold text-gray-900">
                    ₹{Number(item.totalPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS & SIGNATURE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-4 gap-6">
          <div className="text-xs font-semibold self-start mt-2">
            <p>
              All Price are in <span className="underline font-bold">INR</span>
            </p>

            <p className="mt-2 text-gray-500 italic text-[10px] w-64 leading-relaxed">
              Thank you for your purchase. Electronic invoice created under IT Act, 2000.
            </p>
          </div>

          <div className="text-right w-full sm:w-auto">
            <div className="flex flex-col gap-1.5 mb-3 text-xs text-gray-600 items-end">
              <div className="flex justify-between w-56 border-b border-gray-100 pb-1">
                <span>Subtotal {hasMrpDiscount ? "(MRP)" : ""}:</span>
                <span className="font-semibold text-gray-900">
                  ₹{Number(pricing.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {hasMrpDiscount && (
                <div className="flex justify-between w-56 text-green-600">
                  <span>Product Discount:</span>
                  <span className="font-bold">
                    -₹{Number(pricing.mrpDiscount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {pricing.couponDiscount > 0 && (
                <div className="flex justify-between w-56 text-green-600">
                  <span>Coupon Discount:</span>
                  <span className="font-bold">
                    -₹{Number(pricing.couponDiscount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {pricing.shippingCharge > 0 && (
                <div className="flex justify-between w-56 text-gray-600">
                  <span>Shipping:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{Number(pricing.shippingCharge).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {pricing.tax > 0 && (
                <div className="flex justify-between w-56 text-gray-600">
                  <span>GST / Tax:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{Number(pricing.tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div
              className="
                flex items-center justify-between
                text-sm font-bold
                bg-gray-100
                p-2.5
                border border-gray-300
                w-full sm:w-60
                ml-auto
              "
            >
              <span className="mr-4 tracking-wider">TOTAL PRICE:</span>
              <span className="text-base text-gray-900">
                ₹{Number(pricing.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* SIGNATURE */}
            <div className="mt-12 text-center sm:text-right">
              <div className="h-14 w-44 mx-auto sm:ml-auto border-b border-black mb-1 flex items-end justify-center pb-1">
                <p className="text-[11px] text-gray-500 font-medium">
                  Authorized Signatory
                </p>
              </div>

              <p className="text-sm font-semibold mt-1">
                {company.name}
              </p>
            </div>
          </div>
        </div>

    
      </div>
    </div>
  );
});

ClassicInvoiceTemplate.displayName = "ClassicInvoiceTemplate";

export default ClassicInvoiceTemplate;
