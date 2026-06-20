import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.spec.js";

export const setupSwagger = (app: Application): void => {
	// ── Serve raw JSON spec (useful for external tooling / Postman import) ──
	app.get("/api/docs.json", (_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(swaggerSpec);
	});

	// ── Swagger UI ──
	app.use(
		"/api/docs",
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec, {
			customSiteTitle: "Luxura API Docs",
			customCss: `
        .swagger-ui .topbar { background-color: #1a1a2e; }
        .swagger-ui .topbar-wrapper img { content: url(''); }
        .swagger-ui .topbar-wrapper::after {
          content: '✦ LUXURA API';
          color: #c9a96e;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.15em;
        }
      `,
			swaggerOptions: {
				persistAuthorization: true, // keeps token between page refreshes
				displayRequestDuration: true,
				filter: true,
				tryItOutEnabled: true,
			},
		}),
	);

	console.log(`📚 Swagger UI  → http://localhost:${process.env.PORT || 5000}/api/docs`);
	console.log(`📄 OpenAPI JSON → http://localhost:${process.env.PORT || 5000}/api/docs.json`);
};
