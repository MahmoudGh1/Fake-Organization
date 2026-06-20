import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Import the new plugin!

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(), // Drop the plugin directly here!
	],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:5000", // Points to your Express server
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
