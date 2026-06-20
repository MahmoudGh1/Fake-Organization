import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

// Locally scoped product catalog array for mock querying matches
const CATALOG_DATABASE = [
  {
    _id: "1",
    name: "Aurelia Velvet Lounge Chair",
    price: 1850,
    category: "Living Room",
    sku: "LUX-AUR-01",
    description: "Plush Italian velvet upholstery resting on a reinforced solid brass geometric foundation. Engineered specifically for architectural environments demanding subtle luxury and uncompromised lumbar comfort.",
    specs: "W: 85cm x D: 80cm x H: 75cm",
    materials: "Tuscan Cotton Velvet, Brushed Structural Brass, High-Density Resilient Core Foam.",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800"
  },
  {
    _id: "2",
    name: "Monolith Walnut Dining Table",
    price: 4200,
    category: "Dining Room",
    sku: "LUX-MON-02",
    description: "A solid single-slab piece of smoked American walnut paired with premium raw steel supports. Features organic hand-finished edges calibrated to expose natural grain structures beautifully.",
    specs: "W: 220cm x D: 100cm x H: 76cm",
    materials: "Solid Smoked American Walnut, Industrial Powder-Coated structural iron steel.",
    image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=800"
  },
  {
    _id: "3",
    name: "Morpheus Alabaster Bed Frame",
    price: 3400,
    category: "Bedroom Haven",
    sku: "LUX-MOR-03",
    description: "Flawless low-profile platform floating bed upholstered in structured linen weaves. Designed for minimalist master bedrooms focusing on low geometric profiles and seamless horizontal line flows.",
    specs: "W: 200cm x D: 220cm x H: 40cm (Frame height)",
    materials: "Belgian Flax Linen, Internal Kiln-Dried Hardwood Construction Framework.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800"
  },
  {
    _id: "4",
    name: "Travertine Minimalist Coffee Table",
    price: 2100,
    category: "Living Room",
    sku: "LUX-TRA-04",
    description: "Honor-cut cream Italian travertine stone emphasizing clean architectural lines and brutalist geometry. Every surface remains unique, preserving prehistoric geological porous elements safely.",
    specs: "W: 110cm x D: 110cm x H: 35cm",
    materials: "Unfilled Matte Cream Italian Travertine Stone Blocks.",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800"
  },
  {
    _id: "5",
    name: "Helios Brushed Brass Pendant",
    price: 950,
    category: "Lighting",
    sku: "LUX-HEL-05",
    description: "Architectural tiered lighting fixture engineered with hand-spun warm brass finishes. Emits custom calibrated ambient reflection waves perfect for multi-tier dining spatial distributions.",
    specs: "Diameter: 60cm x Drop Cord: Up to 150cm (Adjustable)",
    materials: "Heavy-Gauge Spun Brass, Integrated Warm Dimmable LED Modules.",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800"
  },
  {
    _id: "6",
    name: "Elysian Silk Lounge Sofa",
    price: 6800,
    category: "Living Room",
    sku: "LUX-ELY-06",
    description: "Generous deep-seated structural sofa wrapped in tailored raw slub silk fabrics. Incorporates down-feather cushioning wraps for deep tactile reception and exceptional structural support.",
    specs: "W: 280cm x D: 105cm x H: 68cm",
    materials: "Pure Mulberry Raw Slub Silk, Goose-Down Feather Overlays, Matte Oak Feet.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"
  }
];

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    // Dynamic array match lookup matching target router parameters
    const foundProduct = CATALOG_DATABASE.find(item => item._id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-luxury-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-6 h-6 border border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-luxury-muted">Querying Product Vector...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="bg-luxury-bg text-luxury-dark min-h-screen py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Back navigation line */}
        <Link to="/products" className="inline-flex items-center space-x-2 text-xs uppercase font-semibold tracking-widest text-luxury-muted hover:text-luxury-dark transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Collection</span>
        </Link>

        {/* Core Product Presentation Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* High-Res Left Image Stage */}
          <div className="bg-luxury-card border border-luxury-dark/5 aspect-[4/5] overflow-hidden relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Right Product Attributes Panel */}
          <div className="space-y-8 lg:pt-4">
            <div className="space-y-3">
              <span className="text-[10px] text-luxury-gold uppercase tracking-[0.2em] font-bold">{product.category}</span>
              <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight leading-tight">{product.name}</h1>
              <p className="text-xs text-luxury-muted font-mono">{product.sku}</p>
              <p className="text-xl font-medium pt-2 text-luxury-dark">${product.price.toLocaleString()}</p>
            </div>

            <div className="h-px bg-luxury-dark/10"></div>

            {/* Editorial Description Text */}
            <div className="space-y-2 text-xs md:text-sm font-light text-luxury-muted leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Technical Specifications Callouts */}
            <div className="bg-white p-4 rounded border border-luxury-dark/5 space-y-2 text-xs">
              <div>
                <span className="font-semibold uppercase tracking-wider text-luxury-dark block mb-0.5">Dimensions</span>
                <span className="text-luxury-muted font-light">{product.specs}</span>
              </div>
              <div className="pt-2 border-t border-luxury-dark/5">
                <span className="font-semibold uppercase tracking-wider text-luxury-dark block mb-0.5">Material Composition</span>
                <span className="text-luxury-muted font-light">{product.materials}</span>
              </div>
            </div>

            {/* Quantity Selector Counter Matrix & Cart Trigger */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                
                {/* Counter Engine */}
                <div className="border border-luxury-dark/20 h-12 px-3 flex items-center justify-between bg-white w-full sm:w-32 rounded-sm">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-1 hover:text-luxury-gold transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-semibold px-2">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="p-1 hover:text-luxury-gold transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Primary Core Commitment Call to Action Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow h-12 bg-luxury-dark text-luxury-bg text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-3 border border-luxury-dark hover:bg-transparent hover:text-luxury-dark transition-all duration-300 rounded-sm shadow-md"
                >
                  <ShoppingBag size={14} />
                  <span>Add to Order Bag</span>
                </button>
              </div>

              {/* Toast confirmation notice layout */}
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

            {/* Quality Logistics Assurances */}
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