import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const API_BASE = "https://backend-production-5033.up.railway.app/";

export const CartProvider = ({ children }) => {
	const [cartItems, setCartItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const { user, token } = useAuth();

	// 1. Sync Cart from MongoDB whenever the user logs in
	useEffect(() => {
		const fetchCartFromBackend = async () => {
			if (!token) {
				setCartItems([]);
				return;
			}
			setLoading(true);
			try {
				const response = await fetch(`${API_BASE}/api/cart`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.ok) {
					const data = await response.json();
					// Assumes Claude's schema returns { items: [...] } or an array directly
					setCartItems(data.items || data);
				}
			} catch (err) {
				console.error("Error fetching backend cart documents:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchCartFromBackend();
	}, [token]);

	// 2. Add Item to Backend Mongoose Cart
	const addToCart = async (product) => {
		// Optimistic frontend update for instant visual feedback
		setCartItems((prev) => {
			const existing = prev.find((item) => item._id === product._id);
			if (existing) {
				return prev.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
			}
			return [...prev, { ...product, quantity: 1 }];
		});

		if (!token) return; // If guest, keeps local state until login

		try {
			await fetch("/api/cart/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ productId: product._id, quantity: 1 }),
			});
		} catch (err) {
			console.error("Failed to sync added item to MongoDB:", err);
		}
	};

	// 3. Update Quantity in Backend
	const updateQuantity = async (productId, newQuantity) => {
		if (newQuantity < 1) {
			removeFromCart(productId);
			return;
		}

		setCartItems((prev) => prev.map((item) => (item._id === productId ? { ...item, quantity: newQuantity } : item)));

		if (!token) return;

		try {
			await fetch(`/api/cart/update`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ productId, quantity: newQuantity }),
			});
		} catch (err) {
			console.error("Failed to update quantity in database:", err);
		}
	};

	// 4. Remove Item from Backend
	const removeFromCart = async (productId) => {
		setCartItems((prev) => prev.filter((item) => item._id !== productId));

		if (!token) return;

		try {
			await fetch(`/api/cart/remove/${productId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
		} catch (err) {
			console.error("Failed to remove item document from MongoDB:", err);
		}
	};

	// 5. Clear Cart (e.g., after successful checkout order instantiation)
	const clearCart = async () => {
		setCartItems([]);
		if (!token) return;

		try {
			await fetch("/api/cart/clear", {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
		} catch (err) {
			console.error("Failed to purge cart instance from backend:", err);
		}
	};

	const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<CartContext.Provider
			value={{
				cartItems,
				loading,
				addToCart,
				updateQuantity,
				removeFromCart,
				clearCart,
				cartSubtotal,
				cartCount,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => useContext(CartContext);
