import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { FilterProvider } from "./context/FilterContext.jsx";
import { SiteConfigProvider } from "./context/SiteConfigContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <SiteConfigProvider>
          <ThemeProvider>
            <FilterProvider>
              <AppRoutes />
              <ToastContainer />
            </FilterProvider>
          </ThemeProvider>
        </SiteConfigProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
