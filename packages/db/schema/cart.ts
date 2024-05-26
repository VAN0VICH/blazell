import {
	index,
	integer,
	pgTable,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./user";
import { addresses } from "./address";
import { relations } from "drizzle-orm";
import { lineItems } from "./line-item";

export const carts = pgTable(
	"carts",
	{
		id: varchar("id").notNull().primaryKey(),
		replicachePK: varchar("replicache_pk").notNull(),
		countryCode: varchar("country_code", { length: 2 }).notNull(),
		currencyCode: varchar("currency_code", { length: 3 })
			.notNull()
			.default("USD"),
		userID: varchar("user_id").references(() => users.id),
		subtotal: integer("subtotal"),
		total: integer("total"),
		shippingAddressID: varchar("shipping_address_id").references(
			() => addresses.id,
		),
		billingAddressID: varchar("billing_address_id").references(
			() => addresses.id,
		),
		fullName: varchar("full_name"),
		email: varchar("email"),
		phone: varchar("phone"),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull().default(0),
	},
	(carts) => ({
		userIDIndex: index("user_id_index_1").on(carts.userID),
		shippingAddressIndex: index("shipping_address_id").on(
			carts.shippingAddressID,
		),
		email: index("email_index_1").on(carts.email),
		billingAddressIndex: index("billing_address_id").on(carts.billingAddressID),
	}),
);
export const cartsRelations = relations(carts, ({ one, many }) => ({
	user: one(users, {
		fields: [carts.userID],
		references: [users.id],
	}),
	items: many(lineItems),
	shippingAddress: one(addresses, {
		fields: [carts.shippingAddressID],
		references: [addresses.id],
	}),
	billingAddress: one(addresses, {
		fields: [carts.billingAddressID],
		references: [addresses.id],
	}),
}));