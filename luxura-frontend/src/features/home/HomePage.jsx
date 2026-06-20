import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, ShieldCheck, Award } from "lucide-react";

// Premium Mock Data to display beautiful content immediately
const FEATURED_PRODUCTS = [
	{
		_id: "1",
		name: "Aurelia Velvet Lounge Chair",
		price: 1850,
		category: "Living Room",
		image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800",
	},
	{
		_id: "2",
		name: "Monolith Walnut Dining Table",
		price: 4200,
		category: "Dining Room",
		image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=800",
	},
	{
		_id: "3",
		name: "Morpheus Alabaster Bed Frame",
		price: 3400,
		category: "Bedroom Haven",
		image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800",
	},
];

export const HomePage = () => {
	// Framer-motion layout presets
	const fadeInUp = {
		hidden: { opacity: 0, y: 30 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
	};

	const staggerContainer = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
	};

	return (
		<div className="bg-luxury-bg text-luxury-dark overflow-hidden font-sans">
			{/* 1. HERO SECTION */}
			<section className="relative h-[85vh] flex items-center justify-center px-6 border-b border-luxury-dark/5 bg-gradient-to-b from-luxury-champagne/10 to-transparent">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<motion.p initial={{ opacity: 0, letterSpacing: "0.1em" }} animate={{ opacity: 1, letterSpacing: "0.25em" }} transition={{ duration: 1 }} className="text-xs uppercase font-semibold text-luxury-gold tracking-[0.25em]">
						Aesthetics Meet Absolute Architecture
					</motion.p>

					<motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="font-serif text-5xl md:text-7xl font-light tracking-tight leading-[1.1] text-white mix-blend-difference">
						Crafting Spaces of <br />
						<span className="font-serif italic text-luxury-gold font-normal">Pure Distinction</span>
					</motion.h1>

					<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-sm md:text-base text-luxury-muted max-w-xl mx-auto font-light leading-relaxed">
						Immersive residential furniture tailored specifically for luxury environments. Engineered with timeless material palettes and master geometric precision.
					</motion.p>

					<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="pt-4">
						<Link to="/products" className="inline-flex items-center space-x-3 bg-luxury-dark text-luxury-bg text-xs font-semibold uppercase tracking-widest px-8 py-4 border border-luxury-dark hover:bg-transparent hover:text-luxury-dark transition-all duration-300 shadow-xl shadow-luxury-dark/10">
							<span>Explore Collection</span>
							<ArrowRight size={14} />
						</Link>
					</motion.div>
				</div>
			</section>

			{/* 2. VALUE PROPOSITIONS / TRUST SIGNALS */}
			<section className="max-w-7xl mx-auto px-6 py-20 border-b border-luxury-dark/5">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
					<div className="space-y-3 flex flex-col items-center">
						<div className="p-3 bg-luxury-dark/5 rounded-full text-luxury-gold">
							<Award size={24} strokeWidth={1.25} />
						</div>
						<h3 className="font-serif text-lg font-medium">Italian Materials</h3>
						<p className="text-xs text-luxury-muted leading-relaxed max-w-xs">Sourced directly from Tuscan quarries and hand-selected walnut reserves.</p>
					</div>
					<div className="space-y-3 flex flex-col items-center">
						<div className="p-3 bg-luxury-dark/5 rounded-full text-luxury-gold">
							<ShieldCheck size={24} strokeWidth={1.25} />
						</div>
						<h3 className="font-serif text-lg font-medium">Bespoke Production</h3>
						<p className="text-xs text-luxury-muted leading-relaxed max-w-xs">Every design is serial-tracked and optimized for seamless architectural layouts.</p>
					</div>
					<div className="space-y-3 flex flex-col items-center">
						<div className="p-3 bg-luxury-dark/5 rounded-full text-luxury-gold">
							<Star size={24} strokeWidth={1.25} />
						</div>
						<h3 className="font-serif text-lg font-medium">White-Glove Delivery</h3>
						<p className="text-xs text-luxury-muted leading-relaxed max-w-xs">Fully managed on-site installation tailored directly to your building coordinates.</p>
					</div>
				</div>
			</section>

			{/* 3. CURATED SHOWCASE GRID */}
			<section className="max-w-7xl mx-auto px-6 py-24">
				<div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 space-y-4 sm:space-y-0">
					<div className="space-y-2">
						<span className="text-[11px] uppercase font-bold tracking-widest text-luxury-gold">The Lookbook</span>
						<h2 className="font-serif text-3xl md:text-4xl font-light">Curated Masterworks</h2>
					</div>
					<Link to="/products" className="group text-xs font-semibold uppercase tracking-widest text-luxury-dark flex items-center space-x-2 border-b border-luxury-dark pb-1">
						<span>View Catalog</span>
						<ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
					</Link>
				</div>

				<motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{FEATURED_PRODUCTS.map((product) => (
						<motion.div key={product._id} variants={fadeInUp} className="group relative bg-luxury-card border border-luxury-dark/5 overflow-hidden">
							<div className="aspect-[4/5] bg-neutral-100 overflow-hidden relative">
								<img src={product.image} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />
								<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-luxury-dark rounded-sm">{product.category}</div>
							</div>
							<div className="p-6 space-y-2 bg-white">
								<h3 className="font-serif text-lg font-normal tracking-wide text-luxury-dark group-hover:text-luxury-gold transition-colors">
									<Link to={`/products/${product._id}`}>{product.name}</Link>
								</h3>
								<p className="text-sm font-semibold text-luxury-dark/80">${product.price.toLocaleString()}</p>
							</div>
						</motion.div>
					))}
				</motion.div>
			</section>
		</div>
	);
};
