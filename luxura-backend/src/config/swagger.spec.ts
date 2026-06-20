import { OpenAPIV3 } from "openapi-types";

export const swaggerSpec: OpenAPIV3.Document = {
	openapi: "3.0.3",

	// ─────────────────────────────────────────────────────────────────────────
	// INFO
	// ─────────────────────────────────────────────────────────────────────────
	info: {
		title: "Luxura API",
		version: "1.0.0",
		description: `
## Luxura — Luxury Furniture E-Commerce API

A production-ready REST API built with **Node.js / Express / TypeScript / MongoDB**.

### Authentication
Two methods are supported on all protected routes:

| Method | How to send |
|---|---|
| **Session JWT** | \`Authorization: Bearer <token>\` header **or** \`token\` cookie |
| **API Key** | \`x-api-key: lxr_<key>\` header |

### API Key Notes
- Keys are generated via \`POST /api/auth/api-keys\`
- Minimum lifetime: **30 days** (default: 90 days, max: 365 days)
- The raw key is shown **once** at creation — store it securely
- Keys are identified by their prefix (\`lxr_xxxxxxxx\`) for management
    `,
		contact: {
			name: "Luxura Engineering",
			email: "dev@luxura.com",
		},
		license: {
			name: "MIT",
		},
	},

	// ─────────────────────────────────────────────────────────────────────────
	// SERVERS
	// ─────────────────────────────────────────────────────────────────────────
	servers: [
		{
			url: "http://localhost:5000",
			description: "Local Development",
		},
		{
			url: "https://api.luxura.com",
			description: "Production",
		},
	],

	// ─────────────────────────────────────────────────────────────────────────
	// SECURITY SCHEMES
	// ─────────────────────────────────────────────────────────────────────────
	components: {
		securitySchemes: {
			BearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				description: "Short-lived JWT issued on login/register. Expires in 7 days.",
			},
			ApiKeyAuth: {
				type: "apiKey",
				in: "header",
				name: "x-api-key",
				description: "Long-lived developer API key (30–365 days). Format: `lxr_<hex>`",
			},
			CookieAuth: {
				type: "apiKey",
				in: "cookie",
				name: "token",
				description: "HttpOnly cookie set automatically on login/register.",
			},
		},

		// ───────────────────────────────────────────────────────────────────────
		// REUSABLE SCHEMAS
		// ───────────────────────────────────────────────────────────────────────
		schemas: {
			// ── Generic Responses ───────────────────────────────────────────────
			SuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Operation completed successfully" },
				},
			},

			ErrorResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: false },
					message: { type: "string", example: "Something went wrong" },
					errors: {
						type: "array",
						items: {
							type: "object",
							properties: {
								field: { type: "string", example: "email" },
								message: { type: "string", example: "Invalid email address" },
							},
						},
					},
				},
			},

			Pagination: {
				type: "object",
				properties: {
					total: { type: "integer", example: 48 },
					page: { type: "integer", example: 1 },
					limit: { type: "integer", example: 12 },
					totalPages: { type: "integer", example: 4 },
					hasNextPage: { type: "boolean", example: true },
					hasPrevPage: { type: "boolean", example: false },
				},
			},

			// ── User ─────────────────────────────────────────────────────────────
			User: {
				type: "object",
				properties: {
					id: { type: "string", example: "664f1b2c3d4e5f6a7b8c9d0e" },
					name: { type: "string", example: "Amira Hassan" },
					email: { type: "string", format: "email", example: "amira@luxura.com" },
					role: { type: "string", enum: ["customer", "admin"], example: "customer" },
					createdAt: { type: "string", format: "date-time" },
				},
			},

			RegisterRequest: {
				type: "object",
				required: ["name", "email", "password"],
				properties: {
					name: {
						type: "string",
						minLength: 2,
						maxLength: 80,
						example: "Amira Hassan",
					},
					email: {
						type: "string",
						format: "email",
						example: "amira@luxura.com",
					},
					password: {
						type: "string",
						minLength: 8,
						example: "Secure@123",
						description: "Must contain uppercase, lowercase, and a number",
					},
					role: {
						type: "string",
						enum: ["customer", "admin"],
						default: "customer",
					},
				},
			},

			LoginRequest: {
				type: "object",
				required: ["email", "password"],
				properties: {
					email: { type: "string", format: "email", example: "amira@luxura.com" },
					password: { type: "string", example: "Secure@123" },
				},
			},

			AuthResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Logged in successfully" },
					data: {
						type: "object",
						properties: {
							user: { $ref: "#/components/schemas/User" },
							token: {
								type: "string",
								example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
							},
						},
					},
				},
			},

			// ── API Keys ──────────────────────────────────────────────────────────
			ApiKeyRequest: {
				type: "object",
				required: ["label"],
				properties: {
					label: {
						type: "string",
						minLength: 2,
						maxLength: 60,
						example: "Production Integration",
					},
					expiresInDays: {
						type: "integer",
						minimum: 30,
						maximum: 365,
						default: 90,
						example: 90,
					},
				},
			},

			ApiKeyResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: {
						type: "string",
						example: "API key generated successfully. Copy it now — it will not be shown again.",
					},
					data: {
						type: "object",
						properties: {
							apiKey: {
								type: "string",
								example: "lxr_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
								description: "Raw key — shown once only. Store it securely.",
							},
							prefix: {
								type: "string",
								example: "lxr_a1b2c3d4",
								description: "Use this prefix to identify/revoke the key later.",
							},
							label: { type: "string", example: "Production Integration" },
							expiresAt: { type: "string", format: "date-time" },
							createdAt: { type: "string", format: "date-time" },
							lastUsedAt: { type: "string", format: "date-time", nullable: true },
						},
					},
				},
			},

			ApiKeyInfo: {
				type: "object",
				properties: {
					prefix: { type: "string", example: "lxr_a1b2c3d4" },
					label: { type: "string", example: "Production Integration" },
					expiresAt: { type: "string", format: "date-time" },
					createdAt: { type: "string", format: "date-time" },
					lastUsedAt: { type: "string", format: "date-time", nullable: true },
				},
			},

			// ── Product ───────────────────────────────────────────────────────────
			Dimensions: {
				type: "object",
				required: ["width", "height", "depth"],
				properties: {
					width: { type: "number", example: 220, description: "cm" },
					height: { type: "number", example: 85, description: "cm" },
					depth: { type: "number", example: 95, description: "cm" },
					weight: { type: "number", example: 45.5, description: "kg" },
				},
			},

			Product: {
				type: "object",
				properties: {
					_id: { type: "string", example: "664f1b2c3d4e5f6a7b8c9d0e" },
					name: { type: "string", example: "Montecarlo Velvet Sofa" },
					description: { type: "string", example: "Hand-crafted Italian velvet sofa..." },
					price: { type: "number", example: 4299.99 },
					luxuryCategory: {
						type: "string",
						enum: ["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"],
						example: "Living Room",
					},
					images: { type: "array", items: { type: "string", format: "uri" } },
					stock: { type: "integer", example: 12 },
					sku: { type: "string", example: "LXR-LIV-A3F9K2" },
					isActive: { type: "boolean", example: true },
					dimensions: { $ref: "#/components/schemas/Dimensions" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},

			CreateProductRequest: {
				type: "object",
				required: ["name", "description", "price", "luxuryCategory", "stock", "dimensions"],
				properties: {
					name: {
						type: "string",
						minLength: 2,
						maxLength: 120,
						example: "Montecarlo Velvet Sofa",
					},
					description: {
						type: "string",
						minLength: 10,
						maxLength: 2000,
						example: "Hand-crafted Italian velvet sofa with gold-tipped legs.",
					},
					price: { type: "number", minimum: 0, example: 4299.99 },
					luxuryCategory: {
						type: "string",
						enum: ["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"],
						example: "Living Room",
					},
					images: {
						type: "array",
						maxItems: 10,
						items: { type: "string", format: "uri" },
						example: ["https://cdn.luxura.com/products/sofa-1.jpg"],
					},
					stock: { type: "integer", minimum: 0, example: 12 },
					dimensions: { $ref: "#/components/schemas/Dimensions" },
					sku: {
						type: "string",
						example: "LXR-LIV-A3F9K2",
						description: "Optional. Auto-generated if omitted.",
					},
				},
			},

			UpdateProductRequest: {
				type: "object",
				description: "All fields are optional. Only provided fields are updated.",
				properties: {
					name: { type: "string", example: "Montecarlo Velvet Sofa Pro" },
					description: { type: "string", example: "Updated description..." },
					price: { type: "number", minimum: 0, example: 4599.99 },
					luxuryCategory: {
						type: "string",
						enum: ["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"],
					},
					images: { type: "array", items: { type: "string", format: "uri" } },
					stock: { type: "integer", minimum: 0, example: 8 },
					isActive: { type: "boolean", example: true },
					dimensions: {
						type: "object",
						description: "Partial update — only provided dimension fields are changed.",
						properties: {
							width: { type: "number", example: 230 },
							height: { type: "number", example: 90 },
							depth: { type: "number", example: 100 },
							weight: { type: "number", example: 48 },
						},
					},
				},
			},

			ProductListResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					data: {
						type: "object",
						properties: {
							products: { type: "array", items: { $ref: "#/components/schemas/Product" } },
							pagination: { $ref: "#/components/schemas/Pagination" },
						},
					},
				},
			},

			// ── Order ─────────────────────────────────────────────────────────────
			ShippingAddress: {
				type: "object",
				required: ["fullName", "addressLine1", "city", "state", "postalCode", "country", "phone"],
				properties: {
					fullName: { type: "string", example: "Amira Hassan" },
					addressLine1: { type: "string", example: "15 Nile Corniche" },
					addressLine2: { type: "string", example: "Apt 4B", nullable: true },
					city: { type: "string", example: "Cairo" },
					state: { type: "string", example: "Cairo Governorate" },
					postalCode: { type: "string", example: "11511" },
					country: { type: "string", example: "Egypt" },
					phone: { type: "string", example: "+201234567890" },
				},
			},

			OrderItem: {
				type: "object",
				properties: {
					productId: { type: "string", example: "664f1b2c3d4e5f6a7b8c9d0e" },
					name: { type: "string", example: "Montecarlo Velvet Sofa" },
					price: { type: "number", example: 4299.99 },
					quantity: { type: "integer", example: 1 },
					subtotal: { type: "number", example: 4299.99 },
				},
			},

			Order: {
				type: "object",
				properties: {
					_id: { type: "string", example: "664f1b2c3d4e5f6a7b8c9d0e" },
					userId: { type: "string", example: "664f1b2c3d4e5f6a7b8c9d0a" },
					items: {
						type: "array",
						items: { $ref: "#/components/schemas/OrderItem" },
					},
					totalAmount: { type: "number", example: 8749.98 },
					status: {
						type: "string",
						enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
						example: "Pending",
					},
					shippingAddress: { $ref: "#/components/schemas/ShippingAddress" },
					notes: { type: "string", nullable: true, example: "Please leave at door" },
					cancelledAt: { type: "string", format: "date-time", nullable: true },
					cancelledBy: { type: "string", nullable: true },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},

			PlaceOrderRequest: {
				type: "object",
				required: ["items", "shippingAddress"],
				properties: {
					items: {
						type: "array",
						minItems: 1,
						items: {
							type: "object",
							required: ["productId", "quantity"],
							properties: {
								productId: {
									type: "string",
									example: "664f1b2c3d4e5f6a7b8c9d0e",
								},
								quantity: {
									type: "integer",
									minimum: 1,
									example: 2,
								},
							},
						},
					},
					shippingAddress: { $ref: "#/components/schemas/ShippingAddress" },
					notes: {
						type: "string",
						maxLength: 500,
						example: "Please leave at door",
					},
				},
			},

			UpdateOrderStatusRequest: {
				type: "object",
				required: ["status"],
				properties: {
					status: {
						type: "string",
						enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
						example: "Shipped",
						description: `
Valid transitions:
- Pending → Processing, Cancelled
- Processing → Shipped, Cancelled
- Shipped → Delivered
- Delivered → (terminal)
- Cancelled → (terminal)
            `,
					},
					notes: {
						type: "string",
						maxLength: 500,
						example: "Dispatched via DHL, tracking: 1Z999AA10123456784",
					},
				},
			},

			OrderListResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					data: {
						type: "object",
						properties: {
							orders: { type: "array", items: { $ref: "#/components/schemas/Order" } },
							pagination: { $ref: "#/components/schemas/Pagination" },
						},
					},
				},
			},
		},

		// ─────────────────────────────────────────────────────────────────────
		// REUSABLE RESPONSES
		// ─────────────────────────────────────────────────────────────────────
		responses: {
			Unauthorized: {
				description: "Authentication required or credentials are invalid",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ErrorResponse" },
						example: {
							success: false,
							message: "Authentication required. Provide a Bearer token, session cookie, or x-api-key header",
						},
					},
				},
			},
			Forbidden: {
				description: "Authenticated but insufficient permissions",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ErrorResponse" },
						example: {
							success: false,
							message: "Access denied. This action requires administrator privileges",
						},
					},
				},
			},
			NotFound: {
				description: "Resource not found",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ErrorResponse" },
						example: { success: false, message: "Resource not found" },
					},
				},
			},
			ValidationError: {
				description: "Request body or query parameters failed validation",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ErrorResponse" },
						example: {
							success: false,
							message: "Validation failed",
							errors: [{ field: "email", message: "Invalid email address" }],
						},
					},
				},
			},
			InternalError: {
				description: "Unexpected server error",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ErrorResponse" },
						example: { success: false, message: "Internal Server Error" },
					},
				},
			},
		},

		// ─────────────────────────────────────────────────────────────────────
		// REUSABLE PARAMETERS
		// ─────────────────────────────────────────────────────────────────────
		parameters: {
			PageParam: {
				name: "page",
				in: "query",
				schema: { type: "integer", minimum: 1, default: 1 },
				description: "Page number for pagination",
			},
			LimitParam: {
				name: "limit",
				in: "query",
				schema: { type: "integer", minimum: 1, maximum: 100, default: 12 },
				description: "Number of results per page",
			},
			MongoIdParam: {
				name: "id",
				in: "path",
				required: true,
				schema: { type: "string", example: "664f1b2c3d4e5f6a7b8c9d0e" },
				description: "MongoDB ObjectId",
			},
		},
	},

	// ─────────────────────────────────────────────────────────────────────────
	// GLOBAL SECURITY  (can be overridden per-operation)
	// ─────────────────────────────────────────────────────────────────────────
	security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],

	// ─────────────────────────────────────────────────────────────────────────
	// TAGS
	// ─────────────────────────────────────────────────────────────────────────
	tags: [
		{
			name: "Auth",
			description: "Registration, login, session management, and API key lifecycle",
		},
		{
			name: "Products",
			description: "Public catalogue browsing and admin product management",
		},
		{
			name: "Orders",
			description: "Order placement, tracking, and fulfilment management",
		},
	],

	// ─────────────────────────────────────────────────────────────────────────
	// PATHS
	// ─────────────────────────────────────────────────────────────────────────
	paths: {
		// ══════════════════════════════════════════════════════════════════════
		// AUTH
		// ══════════════════════════════════════════════════════════════════════

		"/api/auth/register": {
			post: {
				tags: ["Auth"],
				summary: "Register a new user",
				description: "Creates a new user account and returns a session JWT (also set as cookie).",
				security: [],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/RegisterRequest" },
						},
					},
				},
				responses: {
					"201": {
						description: "Account created successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/AuthResponse" },
							},
						},
					},
					"409": {
						description: "Email already registered",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
								example: {
									success: false,
									message: "An account with this email already exists",
								},
							},
						},
					},
					"422": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/auth/login": {
			post: {
				tags: ["Auth"],
				summary: "Login",
				description: "Authenticates a user and returns a session JWT (also set as cookie).",
				security: [],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/LoginRequest" },
						},
					},
				},
				responses: {
					"200": {
						description: "Logged in successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/AuthResponse" },
							},
						},
					},
					"401": {
						description: "Invalid credentials",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
								example: { success: false, message: "Invalid email or password" },
							},
						},
					},
					"422": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/auth/logout": {
			post: {
				tags: ["Auth"],
				summary: "Logout",
				description: "Clears the session cookie. No body required.",
				security: [],
				responses: {
					"200": {
						description: "Logged out successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/SuccessResponse" },
							},
						},
					},
				},
			},
		},

		"/api/auth/me": {
			get: {
				tags: ["Auth"],
				summary: "Get current user",
				description: "Returns the profile of the currently authenticated user.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				responses: {
					"200": {
						description: "Current user profile",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										data: {
											type: "object",
											properties: {
												user: { $ref: "#/components/schemas/User" },
											},
										},
									},
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/auth/api-keys": {
			post: {
				tags: ["Auth"],
				summary: "Generate a developer API key",
				description: `
Generates a long-lived API key for external service integration.

**⚠ The raw key is returned once and never stored. Copy it immediately.**

The key can then be used in the \`x-api-key\` header on all \`/api/products\` and \`/api/orders\` endpoints.
        `,
				security: [{ BearerAuth: [] }, { CookieAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/ApiKeyRequest" },
						},
					},
				},
				responses: {
					"201": {
						description: "API key generated",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ApiKeyResponse" },
							},
						},
					},
					"400": {
						description: "Maximum key limit reached",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
								example: {
									success: false,
									message: "Maximum of 10 API keys allowed per account.",
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"409": {
						description: "Label already in use",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"422": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},

			get: {
				tags: ["Auth"],
				summary: "List all API keys",
				description: "Returns metadata for all API keys on the account. Raw keys are never returned.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				responses: {
					"200": {
						description: "List of API key metadata",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										data: {
											type: "object",
											properties: {
												keys: {
													type: "array",
													items: { $ref: "#/components/schemas/ApiKeyInfo" },
												},
											},
										},
									},
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/auth/api-keys/{prefix}": {
			delete: {
				tags: ["Auth"],
				summary: "Revoke an API key",
				description: "Permanently revokes the API key identified by its prefix.",
				security: [{ BearerAuth: [] }, { CookieAuth: [] }],
				parameters: [
					{
						name: "prefix",
						in: "path",
						required: true,
						schema: { type: "string", example: "lxr_a1b2c3d4" },
						description: "The prefix of the API key to revoke (returned at creation time)",
					},
				],
				responses: {
					"200": {
						description: "API key revoked",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/SuccessResponse" },
								example: { success: true, message: "API key revoked successfully" },
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		// ══════════════════════════════════════════════════════════════════════
		// PRODUCTS
		// ══════════════════════════════════════════════════════════════════════

		"/api/products": {
			get: {
				tags: ["Products"],
				summary: "List products",
				description: `
Public endpoint. Supports filtering, sorting, pagination, and full-text search.

**Auth optional** — no credentials required. If authenticated, no behavioural difference on this endpoint.
        `,
				security: [],
				parameters: [
					{ $ref: "#/components/parameters/PageParam" },
					{ $ref: "#/components/parameters/LimitParam" },
					{
						name: "category",
						in: "query",
						schema: {
							type: "string",
							enum: ["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"],
						},
						description: "Filter by luxury category",
					},
					{
						name: "minPrice",
						in: "query",
						schema: { type: "number", minimum: 0 },
						description: "Minimum price filter",
					},
					{
						name: "maxPrice",
						in: "query",
						schema: { type: "number", minimum: 0 },
						description: "Maximum price filter",
					},
					{
						name: "sortBy",
						in: "query",
						schema: {
							type: "string",
							enum: ["price", "-price", "name", "-name", "createdAt", "-createdAt"],
						},
						description: "Sort field. Prefix with `-` for descending order.",
					},
					{
						name: "search",
						in: "query",
						schema: { type: "string", maxLength: 100 },
						description: "Full-text search across product name and description",
					},
					{
						name: "inStock",
						in: "query",
						schema: { type: "boolean" },
						description: "Filter to only show in-stock products",
					},
				],
				responses: {
					"200": {
						description: "Paginated product list",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ProductListResponse" },
							},
						},
					},
					"422": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},

			post: {
				tags: ["Products"],
				summary: "Create a product",
				description: "**Admin only.** Creates a new product listing.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateProductRequest" },
						},
					},
				},
				responses: {
					"201": {
						description: "Product created",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										message: { type: "string", example: "Product created successfully" },
										data: {
											type: "object",
											properties: {
												product: { $ref: "#/components/schemas/Product" },
											},
										},
									},
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"409": {
						description: "SKU already exists",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"422": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/products/stats": {
			get: {
				tags: ["Products"],
				summary: "Get product statistics",
				description: "**Admin only.** Returns aggregated stats grouped by category.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				responses: {
					"200": {
						description: "Product stats by category",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										data: {
											type: "object",
											properties: {
												stats: {
													type: "array",
													items: {
														type: "object",
														properties: {
															_id: { type: "string", example: "Living Room" },
															count: { type: "integer", example: 14 },
															avgPrice: { type: "number", example: 3200.5 },
															minPrice: { type: "number", example: 899.0 },
															maxPrice: { type: "number", example: 12000.0 },
															totalStock: { type: "integer", example: 48 },
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/products/{id}": {
			get: {
				tags: ["Products"],
				summary: "Get a single product",
				description: "Public endpoint. Returns full product detail by ID.",
				security: [],
				parameters: [{ $ref: "#/components/parameters/MongoIdParam" }],
				responses: {
					"200": {
						description: "Product detail",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										data: {
											type: "object",
											properties: {
												product: { $ref: "#/components/schemas/Product" },
											},
										},
									},
								},
							},
						},
					},
					"400": {
						description: "Invalid product ID format",
						content: {
							"application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
						},
					},
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},

			put: {
				tags: ["Products"],
				summary: "Update a product",
				description: "**Admin only.** Partial update — only supplied fields are changed.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				parameters: [{ $ref: "#/components/parameters/MongoIdParam" }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/UpdateProductRequest" },
						},
					},
				},
				responses: {
					"200": {
						description: "Product updated",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										message: { type: "string", example: "Product updated successfully" },
										data: {
											type: "object",
											properties: {
												product: { $ref: "#/components/schemas/Product" },
											},
										},
									},
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"404": { $ref: "#/components/responses/NotFound" },
					"422": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},

			delete: {
				tags: ["Products"],
				summary: "Delete (or deactivate) a product",
				description: `
**Admin only.**

- Default: **soft delete** — sets \`isActive: false\`. Preserves order history.
- With \`?permanent=true\`: **hard delete** — permanently removes the document.
        `,
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				parameters: [
					{ $ref: "#/components/parameters/MongoIdParam" },
					{
						name: "permanent",
						in: "query",
						schema: { type: "boolean", default: false },
						description: "Set to `true` to permanently delete the product.",
					},
				],
				responses: {
					"200": {
						description: "Product deleted or deactivated",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/SuccessResponse" },
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		// ══════════════════════════════════════════════════════════════════════
		// ORDERS
		// ══════════════════════════════════════════════════════════════════════

		"/api/orders": {
			post: {
				tags: ["Orders"],
				summary: "Place an order",
				description: `
Places a new order for the authenticated user.

Stock is decremented atomically in a MongoDB transaction — if any item is out of stock, the entire order is rejected and no stock is modified.
        `,
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/PlaceOrderRequest" },
							example: {
								items: [
									{ productId: "664f1b2c3d4e5f6a7b8c9d0e", quantity: 1 },
									{ productId: "664f1b2c3d4e5f6a7b8c9d0f", quantity: 2 },
								],
								shippingAddress: {
									fullName: "Amira Hassan",
									addressLine1: "15 Nile Corniche",
									city: "Cairo",
									state: "Cairo Governorate",
									postalCode: "11511",
									country: "Egypt",
									phone: "+201234567890",
								},
								notes: "Please call before delivery",
							},
						},
					},
				},
				responses: {
					"201": {
						description: "Order placed successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										message: { type: "string", example: "Order placed successfully" },
										data: {
											type: "object",
											properties: {
												order: { $ref: "#/components/schemas/Order" },
											},
										},
									},
								},
							},
						},
					},
					"400": {
						description: "Insufficient stock or invalid product",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
								example: {
									success: false,
									message: 'Insufficient stock for: "Montecarlo Velvet Sofa" — requested 3, available 1',
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"404": { $ref: "#/components/responses/NotFound" },
					"422": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/orders/user": {
			get: {
				tags: ["Orders"],
				summary: "Get my orders",
				description: "Returns all orders belonging to the currently authenticated user.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				parameters: [{ $ref: "#/components/parameters/PageParam" }, { $ref: "#/components/parameters/LimitParam" }],
				responses: {
					"200": {
						description: "User's order history",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/OrderListResponse" },
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/orders/admin": {
			get: {
				tags: ["Orders"],
				summary: "Get all orders",
				description: "**Admin only.** Returns all orders across all users with optional status filter.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				parameters: [
					{ $ref: "#/components/parameters/PageParam" },
					{
						name: "limit",
						in: "query",
						schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
					},
					{
						name: "status",
						in: "query",
						schema: {
							type: "string",
							enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
						},
						description: "Filter by order status",
					},
				],
				responses: {
					"200": {
						description: "All orders (paginated)",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/OrderListResponse" },
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/orders/stats": {
			get: {
				tags: ["Orders"],
				summary: "Get order statistics",
				description: "**Admin only.** Returns revenue totals, status breakdown, and 30-day daily order trend.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				responses: {
					"200": {
						description: "Order statistics",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										data: {
											type: "object",
											properties: {
												stats: {
													type: "object",
													properties: {
														totalRevenue: { type: "number", example: 128450.75 },
														byStatus: {
															type: "array",
															items: {
																type: "object",
																properties: {
																	_id: { type: "string", example: "Delivered" },
																	count: { type: "integer", example: 42 },
																},
															},
														},
														dailyOrders: {
															type: "array",
															items: {
																type: "object",
																properties: {
																	_id: { type: "string", example: "2025-06-01" },
																	count: { type: "integer", example: 5 },
																	revenue: { type: "number", example: 21499.95 },
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/orders/{id}": {
			get: {
				tags: ["Orders"],
				summary: "Get a single order",
				description: "Returns a single order by ID. Customers can only access their own orders.",
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				parameters: [{ $ref: "#/components/parameters/MongoIdParam" }],
				responses: {
					"200": {
						description: "Order detail",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										data: {
											type: "object",
											properties: {
												order: { $ref: "#/components/schemas/Order" },
											},
										},
									},
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},

			put: {
				tags: ["Orders"],
				summary: "Update order status",
				description: `
**Admin only.**

Enforces a strict status transition graph:
\`\`\`
Pending → Processing → Shipped → Delivered
   ↓            ↓
Cancelled   Cancelled
\`\`\`
Cancelling an order automatically restores product stock (unless already Shipped).
        `,
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				parameters: [{ $ref: "#/components/parameters/MongoIdParam" }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" },
						},
					},
				},
				responses: {
					"200": {
						description: "Order status updated",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										message: { type: "string", example: 'Order status updated to "Shipped"' },
										data: {
											type: "object",
											properties: {
												order: { $ref: "#/components/schemas/Order" },
											},
										},
									},
								},
							},
						},
					},
					"400": {
						description: "Invalid status transition",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
								example: {
									success: false,
									message: 'Cannot transition order from "Delivered" to "Pending". Allowed transitions: none (terminal state)',
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"404": { $ref: "#/components/responses/NotFound" },
					"422": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},

			delete: {
				tags: ["Orders"],
				summary: "Cancel an order",
				description: `
Cancels an order and restores stock atomically.

- **Customers** can only cancel their own orders while in \`Pending\` status.
- **Admins** can cancel any order that hasn't reached a terminal state (\`Delivered\` / \`Cancelled\`).
        `,
				security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }, { CookieAuth: [] }],
				parameters: [{ $ref: "#/components/parameters/MongoIdParam" }],
				responses: {
					"200": {
						description: "Order cancelled and stock restored",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										message: { type: "string", example: "Order cancelled successfully" },
										data: {
											type: "object",
											properties: {
												order: { $ref: "#/components/schemas/Order" },
											},
										},
									},
								},
							},
						},
					},
					"400": {
						description: "Order cannot be cancelled in its current state",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
								example: {
									success: false,
									message: 'Orders can only be cancelled while in "Pending" status.',
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"403": { $ref: "#/components/responses/Forbidden" },
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},
	},
};
