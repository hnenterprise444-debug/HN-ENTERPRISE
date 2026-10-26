import React, { useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext';
import OrderSummary from './sections/OrderSummery';
import CrossSellSection from './sections/CrossSellSection';
import CartItem from './sections/cartItem';
import { useDispatch, useSelector } from 'react-redux';
import { deleteFromCart, updateCartQuantity, addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useProducts from '../../hooks/product/useProducts';
import useAuth from '../../hooks/auth/useAuth';
import { productService } from '../../services/product/productService';
import CartSkeleton from '../../components/loader/SkeletonLoader/CartSkeleton';

function Cart() {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const { products, loading: productsLoading } = useProducts();
  const { user, setIsLoginOpen } = useAuth();

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  // Quantity updates handler
  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item);
    } else {
      dispatch(updateCartQuantity({
        id: item.id,
        selectedVariant: item.selectedVariant,
        quantity: newQuantity
      }));
    }
  };

  // Remove item handler
  const handleRemoveItem = (item) => {
    dispatch(deleteFromCart(item));
    toast.success('Removed from cart!');
  };

  // Add suggested item directly to cart
  const handleAddToCart = (product) => {
    const hasVariants = product.variantTypes && product.variantTypes.length > 0;
    if (hasVariants) {
      navigate(`/productdetails/${product.id}`);
      toast.info('Please select variant options first.');
    } else {
      dispatch(addToCart({
        ...product,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        selectedVariant: null,
        quantity: 1
      }));
      toast.success('Added to cart!');
    }
  };

  // Derived calculations
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const grandTotal = subtotal + (subtotal * 0.05);

  const handleInitiateCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your shopping cart is empty!');
      return;
    }

    // Live stock verification for all cart items before proceeding
    for (const item of cart) {
      try {
        const prod = await productService.getProductById(item.id);
        if (!prod || prod.isActive === false) {
          toast.error(`"${item.title || 'An item'}" is currently unavailable.`);
          return;
        }

        let availableStock = 0;
        if (item.selectedVariant && Array.isArray(prod.variants) && prod.variants.length > 0) {
          const matchedVariant = prod.variants.find(v => {
            const vAttrs = v.attributes || v.selectedVariant || v;
            return item.selectedVariant && Object.keys(item.selectedVariant).every(k => vAttrs[k] === item.selectedVariant[k]);
          });
          availableStock = matchedVariant ? Number(matchedVariant.inStock ?? matchedVariant.stock ?? 0) : 0;
        } else {
          availableStock = Number(prod.inStock ?? prod.stock ?? 0);
        }

        if (availableStock <= 0) {
          toast.error(`"${item.title || 'Product'}" is currently out of stock. Please remove it from your cart.`);
          return;
        }
        if (Number(item.quantity || 1) > availableStock) {
          toast.error(`Only ${availableStock} units of "${item.title || 'Product'}" are available in stock.`);
          return;
        }
      } catch (e) {
        console.warn("Stock verification warning:", e);
      }
    }

    if (!user) {
      setIsLoginOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  // Check stock information for each item in the cart
  const getItemStockInfo = (item) => {
    const product = products.find(p => p.id === item.id);
    if (!product) return { inStock: true, availableStock: 999 };

    if (product.isActive === false) {
      return { inStock: false, availableStock: 0, reason: "Product inactive" };
    }

    if (item.selectedVariant && Array.isArray(product.variants) && product.variants.length > 0) {
      const matchedVariant = product.variants.find(v => {
        const vAttrs = v.attributes || v.selectedVariant || v;
        return item.selectedVariant && Object.keys(item.selectedVariant).every(k => vAttrs[k] === item.selectedVariant[k]);
      });
      if (!matchedVariant || matchedVariant.isActive === false || matchedVariant.isAvailable === false) {
        return { inStock: false, availableStock: 0, reason: "Variant unavailable" };
      }
      const stock = Number(matchedVariant.inStock ?? matchedVariant.stock ?? 0);
      return { inStock: stock > 0, availableStock: stock };
    }

    const stock = Number(product.inStock ?? product.stock ?? 0);
    return { inStock: stock > 0, availableStock: stock };
  };

  // Filter suggested cross-sell items (products in DB not already in cart)
  const SUGGESTED_ITEMS = products
    .filter(p => !cart.some(cItem => cItem.id === p.id))
    .slice(0, 2);

  if (productsLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="bg-bg-base text-text-base flex flex-col transition-colors duration-300">  
      <div className="flex-grow md:px-6 max-w-8xl w-full mx-auto">
        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-32 lg:pb-12">
            
            {/* Shopping Cart Stack */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <h1 className="md:text-2xl text-xl font-extrabold text-text-base font-h1">
                  Your Cart
                </h1>
                <span className="text-xs sm:text-sm font-semibold text-text-muted bg-bg-surface px-3 py-1 rounded-full border border-border-subtle">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <CartItem 
                    key={`${item.id}-${index}`} 
                    item={item} 
                    stockInfo={getItemStockInfo(item)}
                    onUpdateQuantity={handleUpdateQuantity} 
                    onRemove={handleRemoveItem} 
                  />
                ))}
              </div>

              <CrossSellSection 
                items={SUGGESTED_ITEMS} 
                onAddToCart={handleAddToCart} 
                title="Frequently Bought Together"
              />
            </div>

            {/* Pricing Calculations Summary Sidebar */}
            <OrderSummary 
              subtotal={subtotal} 
              shippingFee="Free" 
              taxRate={0.05} 
              cartItems={cart}
              onCheckout={handleInitiateCheckout}
            />
            
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full py-8 sm:py-12 space-y-10">
            <div className="text-center py-16 px-6 bg-bg-surface text-text-muted rounded-3xl border border-dashed border-border-subtle shadow-sm flex flex-col items-center justify-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <span className="material-symbols-outlined text-4xl">shopping_cart</span>
              </div>
              <div className="space-y-2 max-w-sm">
                <h2 className="text-xl sm:text-2xl font-black text-text-base tracking-tight">Your shopping cart is empty</h2>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Looks like you haven't added anything to your cart yet. Explore our collection to find premium tiles and sanitaryware.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/allproducts')}
                className="mt-2 px-8 py-3 rounded-xl bg-primary text-compli text-sm font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">storefront</span>
                Explore Products
              </button>
            </div>

            {SUGGESTED_ITEMS.length > 0 && (
              <CrossSellSection 
                items={SUGGESTED_ITEMS} 
                onAddToCart={handleAddToCart} 
                title="Recommended Products"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart