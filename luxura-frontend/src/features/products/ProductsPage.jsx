import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";
import { SlidersHorizontal, ShoppingBag, Eye } from "lucide-react";

const API_BASE = "https://backend-production-5033.up.railway.app";

const CATEGORIES = ["All Collections", "Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"];

export const ProductsPage = () => {
	const { addToCart } = useCart();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All Collections");
	const [sortBy, setSortBy] = useState("default");

	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true);
			setError("");
			try {
				const response = await fetch(`${API_BASE}/api/products?limit=100`);
				if (!response.ok) throw new Error("Failed to load products");
				const data = await response.json();
				setProducts(data.data?.products || []);
			} catch (err) {
				console.error("Error fetching products:", err);
				setError("Could not load the catalog right now.");
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, []);

	// Filtering Logic
	const filteredProducts = products.filter((product) => selectedCategory === "All Collections" || product.luxuryCategory === selectedCategory);

	// Sorting Logic
	const sortedProducts = [...filteredProducts].sort((a, b) => {
		if (sortBy === "price-low") return a.price - b.price;
		if (sortBy === "price-high") return b.price - a.price;
		return 0; // default order
	});

	// Normalizes a DB product into the shape CartContext/CartPage already expect
	const handleAddToCart = (product, qty = 1) => {
		addToCart(
			{
				...product,
				image: product.images?.[0],
				category: product.luxuryCategory,
			},
			qty,
		);
	};

	if (loading) {
		return (
			<div className="min-h-[60vh] bg-luxury-bg flex flex-col items-center justify-center space-y-4">
				<div className="w-6 h-6 border border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
				<p className="text-xs uppercase tracking-widest text-luxury-muted">Loading Collection...</p>
			</div>
		);
	}

	if (error) {
		return <div className="text-center py-24 text-luxury-muted font-light text-sm">{error}</div>;
	}

	return (
		<div className="bg-luxury-bg text-luxury-dark min-h-screen py-12 px-6 font-sans">
			<div className="max-w-7xl mx-auto space-y-12">
				{/* Header Metadata */}
				<div className="text-center space-y-3 max-w-xl mx-auto">
					<span className="text-[10px] uppercase font-bold tracking-[0.2em] text-luxury-gold">The Catalog</span>
					<h1 className="font-serif text-4xl font-light tracking-tight">Architectural Furniture</h1>
					<p className="text-xs text-luxury-muted leading-relaxed font-light">Filter through our highly curated catalog of masterfully engineered furniture variants built for modern environments.</p>
				</div>

				{/* Dynamic Toolbar Control Panel */}
				<div className="border-y border-luxury-dark/10 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex flex-wrap items-center justify-center gap-2">
						{CATEGORIES.map((cat) => (
							<button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all rounded-sm ${selectedCategory === cat ? "bg-luxury-dark text-luxury-bg" : "text-luxury-muted hover:text-luxury-dark hover:bg-luxury-dark/5"}`}>
								{cat}
							</button>
						))}
					</div>

					<div className="flex items-center space-x-3 text-xs text-luxury-muted self-end md:self-auto">
						<SlidersHorizontal size={14} className="text-luxury-dark" />
						<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border-b border-luxury-dark/20 text-luxury-dark focus:outline-none focus:border-luxury-gold py-1 cursor-pointer font-medium uppercase tracking-wider text-[11px]">
							<option value="default">Sort: Default</option>
							<option value="price-low">Price: Low to High</option>
							<option value="price-high">Price: High to Low</option>
						</select>
					</div>
				</div>

				{/* Core Products Grid View */}
				<motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{sortedProducts.map((product) => (
						<motion.div layout key={product._id} className="group bg-luxury-card border border-luxury-dark/5 overflow-hidden flex flex-col justify-between">
							<div className="aspect-[4/5] bg-neutral-100 overflow-hidden relative">
								<img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />

								<div className="absolute inset-0 bg-luxury-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
									<Link to={`/products/${product._id}`} className="p-3 bg-white text-luxury-dark hover:bg-luxury-dark hover:text-white transition-colors rounded-full shadow-lg" title="View Details">
										<Eye size={16} />
									</Link>
									<button onClick={() => handleAddToCart(product, 1)} className="p-3 bg-white text-luxury-dark hover:bg-luxury-dark hover:text-white transition-colors rounded-full shadow-lg" title="Add to Bag">
										<ShoppingBag size={16} />
									</button>
								</div>
							</div>

							<div className="p-6 space-y-3 bg-white flex-grow flex flex-col justify-between">
								<div className="space-y-1">
									<span className="text-[10px] text-luxury-gold uppercase tracking-widest font-semibold">{product.luxuryCategory}</span>
									<h3 className="font-serif text-lg font-normal tracking-wide text-luxury-dark">
										<Link to={`/products/${product._id}`} className="hover:text-luxury-gold transition-colors">
											{product.name}
										</Link>
									</h3>
									<p className="text-xs text-luxury-muted line-clamp-2 font-light leading-relaxed">{product.description}</p>
								</div>
								<div className="pt-2 border-t border-luxury-dark/5 flex items-center justify-between">
									<span className="text-sm font-semibold text-luxury-dark">${product.price.toLocaleString()}</span>
									<button onClick={() => handleAddToCart(product, 1)} className="text-[11px] font-bold uppercase tracking-widest text-luxury-dark hover:text-luxury-gold transition-colors">
										+ Quick Add
									</button>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>

				{sortedProducts.length === 0 && <div className="text-center py-24 text-luxury-muted font-light text-sm">No luxurious items found in this configuration context.</div>}
			</div>
		</div>
	);
};
