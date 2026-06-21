import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

const API_BASE = "https://backend-production-5033.up.railway.app";

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);
      setQuantity(1);
      try {
        const response = await fetch(`${API_BASE}/api/products/${id}`);
        if (response.status === 404) {
          setNotFound(true);
          setProduct(null);
          return;
        }
        if (!response.ok) throw new Error("Failed to load product");
        const data = await response.json();
        // Handles either a raw object or { product: {...} } shape
        setProduct(data.product || data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setNotFound(true);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-luxury-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-6 h-6 border border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-luxury-muted">Querying Product Vector...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] bg-luxury-bg flex flex-col items-center justify-center space-y-4 text-center px-6">
        <p className="text-sm text-luxury-muted font-light">We couldn't find that piece.</p>
        <Link to="/products" className="text-xs uppercase tracking-widest font-semibold text-luxury-gold hover:text-luxury-dark transition-colors">
          Back to Collection
        </Link>
      </div>
    );
  }

  const { width, height, depth, weight } = product.dimensions || {};
  const dimensionsLabel = width && height && depth
    ? `W: ${width}cm x D: ${depth}cm x H: ${height}cm${weight ? ` · ${weight}kg` : ""}`
    : "Dimensions unavailable";

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        image: product.images?.[0],
        category: product.luxuryCategory,
      },
      quantity,
    );
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const outOfStock = product.stock <= 0;

  return (
    <div className="bg-luxury-bg text-luxury-dark min-h-screen py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        <Link to="/products" className="inline-flex items-center space-x-2 text-xs uppercase font-semibold tracking-widest text-luxury-muted hover:text-luxury-dark transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Collection</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          <div className="bg-luxury-card border border-luxury-dark/5 aspect-[4/5] overflow-hidden relative">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="space-y-8 lg:pt-4">
            <div className="space-y-3">
              <span className="text-[10px] text-luxury-gold uppercase tracking-[0.2em] font-bold">{product.luxuryCategory}</span>
              <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight leading-tight">{product.name}</h1>
              <p className="text-xs text-luxury-muted font-mono">{product.sku}</p>
              <p className="text-xl font-medium pt-2 text-luxury-dark">${product.price.toLocaleString()}</p>
            </div>

            <div className="h-px bg-luxury-dark/10"></div>

            <div className="space-y-2 text-xs md:text-sm font-light text-luxury-muted leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="bg-white p-4 rounded border border-luxury-dark/5 space-y-2 text-xs">
              <div>
                <span className="font-semibold uppercase tracking-wider text-luxury-dark block mb-0.5">Dimensions</span>
                <span className="text-luxury-muted font-light">{dimensionsLabel}</span>
              </div>
              <div className="pt-2 border-t border-luxury-dark/5">
                <span className="font-semibold uppercase tracking-wider text-luxury-dark block mb-0.5">Availability</span>
                <span className={`font-light ${outOfStock ? "text-red-600" : "text-luxury-muted"}`}>
                  {outOfStock ? "Currently out of stock" : `${product.stock} in stock`}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

                <div className="border border-luxury-dark/20 h-12 px-3 flex items-center justify-between bg-white w-full sm:w-32 rounded-sm">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-1 hover:text-luxury-gold transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-semibold px-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.stock || 1, prev + 1))}
                    className="p-1 hover:text-luxury-gold transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="flex-grow h-12 bg-luxury-dark text-luxury-bg text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-3 border border-luxury-dark hover:bg-transparent hover:text-luxury-dark disabled:opacity-50 disabled:hover:bg-luxury-dark disabled:hover:text-luxury-bg transition-all duration-300 rounded-sm shadow-md"
                >
                  <ShoppingBag size={14} />
                  <span>{outOfStock ? "Out of Stock" : "Add to Order Bag"}</span>
                </button>
              </div>

              {addedNotice && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-green-600 font-medium flex items-center space-x-1"
                >
                  <span>✓ Allocated successfully inside your temporary global bag.</span>
                </motion.p>
              )}
            </div>

            <div className="h-px bg-luxury-dark/10"></div>

            <div className="grid grid-cols-2 gap-4 text-[11px] text-luxury-muted">
              <div className="flex items-center space-x-2">
                <Truck size={16} className="text-luxury-gold" />
                <span>Managed White-Glove Transit</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-luxury-gold" />
                <span>5-Year Structural Framework Guard</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};