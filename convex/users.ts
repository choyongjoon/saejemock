import { mutation, query } from "./_generated/server";

/**
 * Get or create user from Clerk authentication
 */
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		return user;
	},
});

/**
 * Sync user from Clerk to Convex database
 */
export const syncUser = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// Check if user already exists
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		if (existingUser) {
			// Update user info if needed
			await ctx.db.patch(existingUser._id, {
				email: identity.email,
				name: identity.name,
			});
			return existingUser._id;
		}

		// Create new user
		const userId = await ctx.db.insert("users", {
			clerkId: identity.subject,
			email: identity.email,
			name: identity.name,
			createdAt: Date.now(),
		});

		return userId;
	},
});

/**
 * Check if current user is authenticated
 */
export const isAuthenticated = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		return identity !== null;
	},
});
