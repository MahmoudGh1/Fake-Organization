import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";
import { SlidersHorizontal, ShoppingBag, Eye } from "lucide-react";

// Extensive seed data to populate a stunning luxury collection grid immediately
const MOCK_PRODUCTS = [
	{
		_id: "1",
		name: "Aurelia Velvet Lounge Chair",
		price: 1850,
		category: "Living Room",
		description: "Plush Italian velvet upholstery resting on a reinforced solid brass geometric foundation.",
		image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800",
	},
	{
		_id: "2",
		name: "Monolith Walnut Dining Table",
		price: 4200,
		category: "Dining Room",
		description: "A solid single-slab piece of smoked American walnut paired with premium raw steel supports.",
		image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=800",
	},
	{
		_id: "3",
		name: "Morpheus Alabaster Bed Frame",
		price: 3400,
		category: "Bedroom Haven",
		description: "Flawless low-profile platform floating bed upholstered in structured linen weaves.",
		image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800",
	},
	{
		_id: "4",
		name: "Travertine Minimalist Coffee Table",
		price: 2100,
		category: "Living Room",
		description: "Honor-cut cream Italian travertine stone emphasizing clean lines and brutalist geometry.",
		image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800",
	},
	{
		_id: "5",
		name: "Helios Brushed Brass Pendant",
		price: 950,
		category: "Lighting",
		description: "Architectural tiered lighting fixture engineered with hand-spun warm brass finishes.",
		image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800",
	},
	{
		_id: "6",
		name: "Elysian Silk Lounge Sofa",
		price: 6800,
		category: "Living Room",
		description: "Generous deep-seated structural sofa wrapped in tailored raw slub silk fabrics.",
		image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
	},
];

const CATEGORIES = ["All Collections", "Living Room", "Dining Room", "Bedroom Haven", "Lighting"];

export const ProductsPage = () => {
	const { addToCart } = useCart();
	const [selectedCategory, setSelectedCategory] = useState("All Collections");
	const [sortBy, setSortBy] = useState("default");

	// Filtering Logic
	const filteredProducts = MOCK_PRODUCTS.filter((product) => selectedCategory === "All Collections" || product.category === selectedCategory);

	// Sorting Logic
	const sortedProducts = [...filteredProducts].sort((a, b) => {
		if (sortBy === "price-low") return a.price - b.price;
		if (sortBy === "price-high") return b.price - a.price;
		return 0; // default order
	});

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
					{/* Category Tabs */}
					<div className="flex flex-wrap items-center justify-center gap-2">
						{CATEGORIES.map((cat) => (
							<button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all rounded-sm ${selectedCategory === cat ? "bg-luxury-dark text-luxury-bg" : "text-luxury-muted hover:text-luxury-dark hover:bg-luxury-dark/5"}`}>
								{cat}
							</button>
						))}
					</div>

					{/* Sort Controller */}
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
								<img src={product.image} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />

								{/* Action Hover Overlays */}
								<div className="absolute inset-0 bg-luxury-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
									<Link to={`/products/${product._id}`} className="p-3 bg-white text-luxury-dark hover:bg-luxury-dark hover:text-white transition-colors rounded-full shadow-lg" title="View Details">
										<Eye size={16} />
									</Link>
									<button onClick={() => addToCart(product, 1)} className="p-3 bg-white text-luxury-dark hover:bg-luxury-dark hover:text-white transition-colors rounded-full shadow-lg" title="Add to Bag">
										<ShoppingBag size={16} />
									</button>
								</div>
							</div>

							{/* Product Info Card */}
							<div className="p-6 space-y-3 bg-white flex-grow flex flex-col justify-between">
								<div className="space-y-1">
									<span className="text-[10px] text-luxury-gold uppercase tracking-widest font-semibold">{product.category}</span>
									<h3 className="font-serif text-lg font-normal tracking-wide text-luxury-dark">
										<Link to={`/products/${product._id}`} className="hover:text-luxury-gold transition-colors">
											{product.name}
										</Link>
									</h3>
									<p className="text-xs text-luxury-muted line-clamp-2 font-light leading-relaxed">{product.description}</p>
								</div>
								<div className="pt-2 border-t border-luxury-dark/5 flex items-center justify-between">
									<span className="text-sm font-semibold text-luxury-dark">${product.price.toLocaleString()}</span>
									<button onClick={() => addToCart(product, 1)} className="text-[11px] font-bold uppercase tracking-widest text-luxury-dark hover:text-luxury-gold transition-colors">
										+ Quick Add
									</button>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* Edge Case Empty Grid Handler */}
				{sortedProducts.length === 0 && <div className="text-center py-24 text-luxury-muted font-light text-sm">No luxurious items found in this configuration context.</div>}
			</div>
		</div>
	);
};
