import { createContext, useContext, useEffect, useState } from "react";
import { configureService, DEFAULT_CONFIG } from "../services/configure/configureService";

const SiteConfigContext = createContext(DEFAULT_CONFIG);

/**
 * SiteConfigProvider
 * Fetches the Firestore configure/site document once on app boot and
 * makes it available to the entire component tree via context.
 * Also dynamically updates <title> and <link rel="icon"> in real-time.
 */
export function SiteConfigProvider({ children }) {
    const [config, setConfig] = useState(() => {
        try {
            const cached = localStorage.getItem("cached_site_config") || sessionStorage.getItem("cached_site_config");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed?.brands)) {
                    parsed.brands = parsed.brands.filter(
                        (b) => !b?.id?.startsWith("brand-") && !b?.name?.toLowerCase().includes("brand partner")
                    );
                }
                return parsed;
            }
        } catch (e) {}
        return DEFAULT_CONFIG;
    });

    const [banners, setBanners] = useState(() => {
        try {
            const cached = localStorage.getItem("cached_site_banners") || sessionStorage.getItem("cached_site_banners");
            if (cached) return JSON.parse(cached);
        } catch (e) {}
        return [];
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            configureService.getSiteConfig(),
            configureService.getBanners()
        ])
            .then(([data, bannerData]) => {
                setConfig(data);
                try {
                    localStorage.setItem("cached_site_config", JSON.stringify(data));
                    sessionStorage.setItem("cached_site_config", JSON.stringify(data));
                } catch (e) {}

                const activeBanners = bannerData.filter((b) => b.isActive !== false);
                setBanners(activeBanners);
                try {
                    localStorage.setItem("cached_site_banners", JSON.stringify(activeBanners));
                    sessionStorage.setItem("cached_site_banners", JSON.stringify(activeBanners));
                } catch (e) {}
            })
            .catch((err) => console.error("SiteConfig fetch error:", err))
            .finally(() => setLoading(false));
    }, []);

    // Dynamically update page title and favicon whenever site configuration changes
    useEffect(() => {
        const pageTitle = config.seo?.metaTitle || config.companyName;
        if (pageTitle) {
            document.title = pageTitle;
        }

        const favicon = config.faviconUrl || config.companyLogo;
        if (favicon) {
            let link = document.getElementById("app-favicon") || document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement("link");
                link.id = "app-favicon";
                link.rel = "icon";
                document.head.appendChild(link);
            }
            link.href = favicon;
        }

        // Cache update
        if (config && Object.keys(config).length > 0) {
            try {
                localStorage.setItem("cached_site_config", JSON.stringify(config));
                sessionStorage.setItem("cached_site_config", JSON.stringify(config));
            } catch (e) {}
        }
    }, [config]);

    return (
        <SiteConfigContext.Provider value={{ config, setConfig, banners, setBanners, loading }}>
            {children}
        </SiteConfigContext.Provider>
    );
}

export function useSiteConfig() {
    return useContext(SiteConfigContext);
}
