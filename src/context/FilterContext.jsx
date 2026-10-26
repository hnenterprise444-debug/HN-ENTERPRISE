import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [searchkey, setSearchkeyState] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPrice, setFilterPrice] = useState('');

  const location = useLocation();
  const isSearchingRef = useRef(false);

  const setSearchkey = useCallback((val) => {
    if (val && typeof val === 'string' && val.trim() !== '') {
      isSearchingRef.current = true;
    }
    setSearchkeyState(val);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchkeyState('');
    setFilterType('');
    setFilterPrice('');
  }, []);

  // Clear search field whenever navigating to ANY page other than /allproducts,
  // or when navigating to /allproducts via a menu link (not typing in search).
  useEffect(() => {
    if (location.pathname !== '/allproducts') {
      isSearchingRef.current = false;
      setSearchkeyState('');
      setFilterType('');
      setFilterPrice('');
      return;
    }

    if (isSearchingRef.current) {
      isSearchingRef.current = false;
    } else {
      setSearchkeyState('');
      setFilterType('');
      setFilterPrice('');
    }
  }, [location.pathname]);

  return (
    <FilterContext.Provider value={{ 
      searchkey, setSearchkey, 
      filterType, setFilterType, 
      filterPrice, setFilterPrice,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
