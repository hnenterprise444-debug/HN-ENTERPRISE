import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import { configureService } from "../../services/configure/configureService";
import { useSiteConfig } from "../../context/SiteConfigContext";
import { FaPrint, FaArrowLeft } from "react-icons/fa";
import { normalizeInvoiceData, InvoiceRenderer, invoiceRenderUtils } from "../../invoice/index";

/**
 * OrderInvoice Component
 * Admin Printable Tax Invoice consuming top-level global InvoiceRenderer.
 */
const OrderInvoice = ({ orderData: propOrder }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const { config: contextConfig } = useSiteConfig();
  const [order, setOrder] = useState(propOrder || null);
  const [siteConfig, setSiteConfig] = useState(contextConfig || null);
  const [loading, setLoading] = useState(!propOrder && Boolean(id));
  const [error, setError] = useState(null);

  // Sync siteConfig with context or fetch from DB
  useEffect(() => {
    if (contextConfig) setSiteConfig(contextConfig);
  }, [contextConfig]);

  // Fetch Order and Site Config
  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        setLoading(true);

        // Fetch site config from db if context empty
        if (!contextConfig) {
          try {
            const cfg = await configureService.getSiteConfig();
            if (cfg) setSiteConfig(cfg);
          } catch (cfgErr) {
            console.error("Error fetching site config for invoice:", cfgErr);
          }
        }

        // Fetch order from DB if not passed as prop
        if (!propOrder && id) {
          const docRef = doc(fireDB, "orders", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOrder({ id: docSnap.id, ...docSnap.data() });
          } else {
            setError("Order details not found in database.");
          }
        }
      } catch (err) {
        console.error("Error loading invoice data:", err);
        setError("Failed to load order for invoice.");
      } finally {
        setLoading(false);
      }
    };

    loadInvoiceData();
  }, [id, propOrder, contextConfig]);

  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    invoiceRenderUtils.printInvoice();
  };

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      await invoiceRenderUtils.generateClientInvoicePdf(order, siteConfig, "printable-invoice", invoiceRef);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-text-muted mt-3">Generating Tax Invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-text-base">{error || "Invoice Not Found"}</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-primary text-compli text-xs font-bold shadow-xs hover:bg-primary-hover transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const invoiceData = normalizeInvoiceData(order, siteConfig);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Non-printable Action Bar */}
      <div className="print:hidden flex items-center justify-between bg-card p-4 rounded-xl border border-border-subtle shadow-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3.5 py-1.5 rounded-lg border border-border-subtle bg-bg-base hover:bg-card-hover text-text-base text-xs font-bold flex items-center gap-2 transition cursor-pointer"
        >
          <FaArrowLeft size={12} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span>{downloading ? "Generating PDF..." : "Download PDF"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-primary text-compli hover:bg-primary-hover text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <FaPrint size={14} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Centralized Invoice Renderer */}
      <InvoiceRenderer ref={invoiceRef} invoiceData={invoiceData} />
    </div>
  );
};

export default OrderInvoice;
