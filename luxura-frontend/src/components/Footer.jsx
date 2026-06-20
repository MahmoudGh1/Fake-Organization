import { Link } from "react-router-dom";

export const Footer = () => {
	return (
		<footer className="bg-luxury-dark text-luxury-bg/90 pt-16 pb-8 tracking-wide font-sans">
			<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-luxury-bg/10 pb-12">
				{/* Brand Summary */}
				<div className="space-y-4">
					<h3 className="font-serif text-xl font-bold tracking-widest text-white">LUXURA</h3>
					<p className="text-xs text-luxury-bg/60 leading-relaxed max-w-xs">Architecting high-end luxury interiors with absolute geometric precision and master craftsmanship.</p>
				</div>

				{/* Shop Navigation */}
				<div className="space-y-3">
					<h4 className="text-xs font-bold uppercase tracking-wider text-luxury-gold">Collections</h4>
					<ul className="text-xs space-y-2 text-luxury-bg/60">
						<li>
							<Link to="/products" className="hover:text-white transition-colors">
								Living Room
							</Link>
						</li>
						<li>
							<Link to="/products" className="hover:text-white transition-colors">
								Bedroom Haven
							</Link>
						</li>
						<li>
							<Link to="/products" className="hover:text-white transition-colors">
								Executive Dining
							</Link>
						</li>
					</ul>
				</div>

				{/* Corporate Meta */}
				<div className="space-y-3">
					<h4 className="text-xs font-bold uppercase tracking-wider text-luxury-gold">Company</h4>
					<ul className="text-xs space-y-2 text-luxury-bg/60">
						<li>
							<Link to="/about" className="hover:text-white transition-colors">
								Our Heritage
							</Link>
						</li>
						<li>
							<span className="cursor-not-allowed">Press & Sustainability</span>
						</li>
						<li>
							<span className="cursor-not-allowed">Terms of Service</span>
						</li>
					</ul>
				</div>

				{/* Mock Context Warning */}
				<div className="space-y-3 bg-white/5 p-4 rounded border border-white/10">
					<h4 className="text-xs font-bold uppercase tracking-wider text-luxury-gold">Sandbox Environment</h4>
					<p className="text-[11px] text-luxury-bg/50 leading-relaxed">This platform is a dummy frontend created solely for API orchestration validation and product showcase presentations.</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-luxury-bg/40 space-y-2 sm:space-y-0">
				<span>&copy; {new Date().getFullYear()} LUXURA Inc. All Rights Reserved.</span>
				<span className="font-mono tracking-tighter">API Context Node Verified</span>
			</div>
		</footer>
	);
};
