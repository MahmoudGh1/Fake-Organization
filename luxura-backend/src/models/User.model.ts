import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

// ─── API Key Sub-document Interface ────────────────────────────────────────
export interface IApiKey {
	key: string; // hashed key stored in DB
	prefix: string; // first 8 chars shown to user (lxr_XXXXXXXX...)
	label: string; // human-readable name e.g. "Staging Integration"
	createdAt: Date;
	expiresAt: Date;
	lastUsedAt?: Date;
}

// ─── User Document Interface ────────────────────────────────────────────────
export interface IUser extends Document {
	_id: mongoose.Types.ObjectId;
	name: string;
	email: string;
	password: string;
	role: "customer" | "admin";
	apiKeys: IApiKey[];
	createdAt: Date;
	updatedAt: Date;

	// Instance methods
	comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── User Model Interface (for statics) ────────────────────────────────────
export interface IUserModel extends Model<IUser> {}

// ─── API Key Sub-schema ─────────────────────────────────────────────────────
const ApiKeySchema = new Schema<IApiKey>(
	{
		key: {
			type: String,
			required: true,
		},
		prefix: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
			trim: true,
			maxlength: 60,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		lastUsedAt: {
			type: Date,
			default: null,
		},
	},
	{ _id: true, timestamps: { createdAt: true, updatedAt: false } },
);

// ─── User Schema ────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser, IUserModel>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters"],
			maxlength: [80, "Name cannot exceed 80 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Password must be at least 8 characters"],
			select: false, // never returned in queries by default
		},
		role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},
		apiKeys: {
			type: [ApiKeySchema],
			default: [],
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Pre-save Hook: Hash Password ───────────────────────────────────────────
UserSchema.pre("save", async function () {
	if (!this.isModified("password")) return;

	this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance Method: Compare Password ─────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

// ─── Indexes ────────────────────────────────────────────────────────────────
UserSchema.index({ "apiKeys.prefix": 1 });

// ─── Model Export ───────────────────────────────────────────────────────────
const User = mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;
