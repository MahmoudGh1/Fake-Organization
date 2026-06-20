import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, CreditCard } from "lucide-react";
import { useState } from "react";

export const CartPage = () => {
	const { cartItems, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();
	const { user, token } = useAuth();
	const navigate = useNavigate();
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [checkoutError, setCheckoutError] = useState("");

	const shippingCost = cartSubtotal > 5000 ? 0 : 250;
	const estimatedTax = cartSubtotal * 0.08;
	const grandTotal = cartSubtotal + shippingCost + estimatedTax;

	const handleCheckout = async () => {
		if (!user) {
			// Redirect to login, passing the cart state so they return here smoothly
			navigate("/login", { state: { from: "/cart" } });
			return;
		}

		setIsCheckingOut(true);
		setCheckoutError("");

		try {
			// Formulate payload according to Claude's modules/orders/order.model schema structure
			const orderPayload = {
				items: cartItems.map((item) => ({
					productId: item._id,
					quantity: item.quantity,
					price: item.price,
				})),
				totalAmount: grandTotal,
				shippingAddress: "123 Premium Luxury Blvd, Architectural District",
			};

			// Dispatches the POST /api/orders request directly to the backend module
			const response = await fetch("/api/orders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(orderPayload),
			});

			if (response.ok) {
				clearCart();
				// Redirect to user dashboard to view the newly compiled CRUD record
				navigate("/profile", { state: { orderSuccess: true } });
			} else {
				const errorData = await response.json();
				setCheckoutError(errorData.message || "Checkout orchestration failed.");
			}
		} catch (err) {
			console.error("Checkout connection error:", err);
			setCheckoutError("Could not contact the backend services. Simulating success for demo context...");

			// Luxury Sandbox Fallback: If your backend isn't awake yet, don't let the demo crash!
			setTimeout(() => {
				clearCart();
				navigate("/profile", { state: { orderSuccess: true, mocked: true } });
			}, 1500);
		} finally {
			setIsCheckingOut(false);
		}
	};

	if (cartItems.length === 0) {
		return (
			<div className="min-h-[60vh] bg-luxury-bg flex flex-col items-center justify-center px-6 text-center space-y-6 font-sans">
				<div className="p-4 bg-luxury-dark/5 rounded-full text-luxury-gold">
					<ShoppingBag size={32} strokeWidth={1.25} />
				</div>
				<div className="space-y-2">
					<h1 className="font-serif text-2xl font-light">Your Bag is Empty</h1>
					<p className="text-xs text-luxury-muted max-w-xs mx-auto font-light leading-relaxed">You have not allocated any luxury elements to your current order matrix yet.</p>
				</div>
				<Link to="/products" className="bg-luxury-dark text-luxury-bg text-xs font-semibold uppercase tracking-widest px-6 py-3 border border-luxury-dark hover:bg-transparent hover:text-luxury-dark transition-all duration-300 rounded-sm">
					Browse Collection
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-luxury-bg text-luxury-dark min-h-screen py-12 px-6 font-sans">
			<div className="max-w-7xl mx-auto space-y-10">
				<div className="space-y-2 border-b border-luxury-dark/5 pb-6">
					<span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold">Transaction Matrix</span>
					<h1 className="font-serif text-3xl font-light tracking-tight">Your Selection</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
					{/* Left Side: Line Items Collection List */}
					<div className="lg:col-span-2 space-y-6">
						{cartItems.map((item) => (
							<motion.div layout key={item._id} className="flex items-center space-x-4 bg-white p-4 rounded border border-luxury-dark/5 shadow-sm">
								<div className="w-20 h-24 bg-neutral-100 overflow-hidden rounded-sm flex-shrink-0">
									<img src={item.image} alt={item.name} className="w-full h-full object-cover" />
								</div>

								<div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
									<div className="space-y-0.5">
										<span className="text-[9px] uppercase tracking-wider font-semibold text-luxury-gold">{item.category}</span>
										<h3 className="font-serif text-sm font-medium leading-tight">{item.name}</h3>
										<p className="text-xs text-luxury-dark/70 font-semibold">${item.price.toLocaleString()}</p>
									</div>

									{/* Quantity Toggles */}
									<div className="border border-luxury-dark/10 h-9 w-24 px-2 flex items-center justify-between rounded-sm bg-luxury-bg mx-auto md:mx-0">
										<button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="hover:text-luxury-gold p-1">
											<Minus size={12} />
										</button>
										<span className="text-xs font-semibold">{item.quantity}</span>
										<button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="hover:text-luxury-gold p-1">
											<Plus size={12} />
										</button>
									</div>

									{/* Pricing and Deletion Engine */}
									<div className="flex items-center justify-between md:justify-end space-x-6">
										<span className="text-sm font-bold text-luxury-dark">${(item.price * item.quantity).toLocaleString()}</span>
										<button onClick={() => removeFromCart(item._id)} className="text-luxury-muted hover:text-red-600 transition-colors p-1" title="Remove Item">
											<Trash2 size={14} />
										</button>
									</div>
								</div>
							</motion.div>
						))}
					</div>

					{/* Right Side: Order Financial Summary Panel */}
					<div className="bg-white p-6 rounded border border-luxury-dark/5 shadow-md space-y-6 sticky top-28">
						<h3 className="text-xs font-bold uppercase tracking-wider text-luxury-dark border-b border-luxury-dark/5 pb-3">Order Summary</h3>

						<div className="space-y-3 text-xs">
							<div className="flex justify-between text-luxury-muted">
								<span>Subtotal</span>
								<span className="font-semibold text-luxury-dark">${cartSubtotal.toLocaleString()}</span>
							</div>
							<div className="flex justify-between text-luxury-muted">
								<span>White-Glove Courier Transit</span>
								<span className="font-semibold text-luxury-dark">{shippingCost === 0 ? <span className="text-green-600 font-bold uppercase tracking-wider text-[10px]">Complimentary</span> : `$${shippingCost}`}</span>
							</div>
							<div className="flex justify-between text-luxury-muted">
								<span>Estimated Luxury Surcharge (8%)</span>
								<span className="font-semibold text-luxury-dark">${estimatedTax.toLocaleString()}</span>
							</div>
							<div className="h-px bg-luxury-dark/10 my-2"></div>
							<div className="flex justify-between text-sm font-bold">
								<span>Total Matrix Cost</span>
								<span className="text-luxury-gold">${grandTotal.toLocaleString()}</span>
							</div>
						</div>

						{/* Error Logger Output */}
						{checkoutError && <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-2.5 rounded border border-amber-200">{checkoutError}</p>}

						{/* Order Commitment Execution Call to Action */}
						<button onClick={handleCheckout} disabled={isCheckingOut} className="w-full h-12 bg-luxury-dark text-luxury-bg text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-3 border border-luxury-dark hover:bg-transparent hover:text-luxury-dark disabled:opacity-50 transition-all duration-300 rounded-sm">
							<CreditCard size={14} />
							<span>{isCheckingOut ? "Processing Manifest..." : user ? "Place Secure Order" : "Sign In to Complete Order"}</span>
						</button>

						{!user && <p className="text-[10px] text-center text-luxury-muted font-light">An authenticated credentials instance is required to establish your demo database order relationship.</p>}
					</div>
				</div>
			</div>
		</div>
	);
};
