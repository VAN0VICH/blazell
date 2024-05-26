import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { schema } from "@blazell/db";
import { ProductSchema } from "./product";
import { VariantSchema } from "./variant";

const LineItemSchema = createInsertSchema(schema.lineItems);
export const CreateLineItemSchema = z.object({
	lineItem: LineItemSchema.extend({
		variant: VariantSchema.optional(),
		product: ProductSchema.optional(),
	}),
});
export const UpdateLineItemSchema = LineItemSchema.pick({
	quantity: true,
	id: true,
});

export type CreateLineItem = z.infer<typeof CreateLineItemSchema>;
export type UpdateLineItem = z.infer<typeof UpdateLineItemSchema>;