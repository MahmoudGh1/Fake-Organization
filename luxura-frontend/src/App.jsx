import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from './features/home/HomePage.jsx';
import { ProductsPage } from './features/products/ProductsPage';
import { ProductDetailsPage } from './features/products/ProductDetailsPage';
import { CartPage } from './features/Cart/CartPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { AboutPage } from "./features/about/AboutPage"


function App() {
	return (
		<AuthProvider>
			<CartProvider>
				<Router>
					<div className="min-h-screen flex flex-col bg-luxury-bg">
						<Navbar />
						<main className="flex-grow">
							<Routes>
								{/* Public Luxury Elements */}
								<Route path="/" element={<HomePage />} />
								<Route path="/about" element={<AboutPage />} />
								<Route path="/products" element={<ProductsPage />} />
								<Route path="/products/:id" element={<ProductDetailsPage />} />
								<Route path="/cart" element={<CartPage />} />
								<Route path="/login" element={<LoginPage />} />
								<Route path="/register" element={<RegisterPage />} />

								{/* Secure Integration Modules */}
								<Route
									path="/profile"
									element={
										<ProtectedRoute>
											<ProfilePage />
										</ProtectedRoute>
									}
								/>
							</Routes>
						</main>
						<Footer />
					</div>
				</Router>
			</CartProvider>
		</AuthProvider>
	);
}

export default App;
