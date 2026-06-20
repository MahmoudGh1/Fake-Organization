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
				target: "https://backend-production-5033.up.railway.app", // Points to your Express server
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
