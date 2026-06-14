import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
	const { user, logout } = useAuth();
	const { cartCount } = useCart();
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	return (
		<nav className="sticky top-0 z-50 bg-luxury-bg/80 backdrop-blur-md border-b border-luxury-dark/5 tracking-wide">
			<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
				{/* Brand Logo */}
				<Link to="/" className="font-serif text-2xl font-bold tracking-widest text-luxury-dark hover:opacity-80 transition-opacity">
					Gunuo
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center space-x-10 text-sm font-medium uppercase text-luxury-dark/70">
					<Link to="/" className="hover:text-luxury-gold transition-colors">
						Home
					</Link>
					<Link to="/products" className="hover:text-luxury-gold transition-colors">
						Collection
					</Link>
					<Link to="/about" className="hover:text-luxury-gold transition-colors">
						Our Story
					</Link>
				</div>

				{/* Action Utilities */}
				<div className="hidden md:flex items-center space-x-6 text-luxury-dark">
					<Link to="/cart" className="relative p-2 hover:text-luxury-gold transition-colors">
						<ShoppingBag size={20} strokeWidth={1.5} />
						{cartCount > 0 && (
							<motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-luxury-dark text-luxury-bg text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-luxury-bg">
								{cartCount}
							</motion.span>
						)}
					</Link>

					{user ? (
						<div className="flex items-center space-x-4">
							<Link to="/profile" className="flex items-center space-x-2 text-sm font-medium border-b border-transparent hover:border-luxury-gold transition-all pb-0.5">
								<User size={18} strokeWidth={1.5} />
								<span>Dashboard</span>
							</Link>
							<button onClick={handleLogout} className="p-2 hover:text-red-600 transition-colors" title="Sign Out">
								<LogOut size={18} strokeWidth={1.5} />
							</button>
						</div>
					) : (
						<Link to="/login" className="text-sm font-medium uppercase tracking-wider border-b border-luxury-dark pb-0.5 hover:text-luxury-gold hover:border-luxury-gold transition-all">
							Sign In
						</Link>
					)}
				</div>

				{/* Mobile Toggle Button */}
				<button className="md:hidden p-2 text-luxury-dark" onClick={() => setIsOpen(!isOpen)}>
					{isOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* Mobile Drawer Slide-in Animation */}
			<AnimatePresence>
				{isOpen && (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="md:hidden border-t border-luxury-dark/5 bg-luxury-bg w-full px-6 py-6 absolute left-0 shadow-lg flex flex-col space-y-4 font-medium uppercase text-sm">
						<Link to="/" onClick={() => setIsOpen(false)} className="py-2 text-luxury-dark/80">
							Home
						</Link>
						<Link to="/products" onClick={() => setIsOpen(false)} className="py-2 text-luxury-dark/80">
							Collection
						</Link>
						<Link to="/about" onClick={() => setIsOpen(false)} className="py-2 text-luxury-dark/80">
							Our Story
						</Link>
						<div className="h-px bg-luxury-dark/5 my-2"></div>
						<Link to="/cart" onClick={() => setIsOpen(false)} className="py-2 flex items-center justify-between text-luxury-dark/80">
							<span>Your Bag ({cartCount})</span>
							<ShoppingBag size={18} />
						</Link>
						{user ? (
							<>
								<Link to="/profile" onClick={() => setIsOpen(false)} className="py-2 flex items-center justify-between text-luxury-dark/80">
									<span>Dashboard</span>
									<User size={18} />
								</Link>
								<button
									onClick={() => {
										handleLogout();
										setIsOpen(false);
									}}
									className="py-2 text-left text-red-600 flex items-center justify-between"
								>
									<span>Sign Out</span>
									<LogOut size={18} />
								</button>
							</>
						) : (
							<Link to="/login" onClick={() => setIsOpen(false)} className="py-2 text-luxury-gold">
								Sign In
							</Link>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
};
