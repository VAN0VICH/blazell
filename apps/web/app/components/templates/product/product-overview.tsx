import { Separator } from "@blazell/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import type {
	Product,
	ProductOption,
	Variant,
} from "@blazell/validators/client";
import { useCallback, useEffect, useState } from "react";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { toImageURL } from "~/utils/helpers";
import { AddToCart } from "./add-to-cart";
import { Gallery } from "./gallery";
import { ProductContainer } from "./product-container";
import { GeneralInfo } from "./product-info";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { generateReplicachePK } from "@blazell/utils";

interface ProductOverviewProps {
	product: Product | null | undefined;
	isDashboard?: boolean;
	variants: Variant[];
	selectedVariantIDOrHandle: string | undefined;
	selectedVariant: Variant | null;
	setVariantIDOrHandle: (prop: string | undefined) => void;
	cartID?: string | undefined;
	defaultVariant?: Variant | null | undefined;
}

const ProductOverview = ({
	product,
	isDashboard = false,
	variants,
	setVariantIDOrHandle,
	selectedVariantIDOrHandle,
	selectedVariant,
	cartID,
	defaultVariant,
}: ProductOverviewProps) => {
	return (
		<main className="relative lg:grid grid-cols-4 lg:grid-cols-7 w-full max-w-[1300px] mt-12  px-2">
			<Gallery
				images={selectedVariant?.images ?? defaultVariant?.images ?? []}
			/>
			<ProductContainer>
				<div className="min-h-[60vh] ">
					<GeneralInfo product={product} defaultVariant={defaultVariant} />
					<Separator className="my-4" />
					<ProductVariants
						variants={variants}
						{...(isDashboard && { isDashboard })}
						setVariantIDOrHandle={setVariantIDOrHandle}
						selectedVariantIDOrHandle={selectedVariantIDOrHandle}
						isDashboard={isDashboard}
					/>
					<ProductOptions
						options={product?.options ?? []}
						selectedVariant={selectedVariant}
						variants={variants}
						setVariantIDOrHandle={setVariantIDOrHandle}
						isDashboard={isDashboard}
					/>
				</div>

				<AddToCart
					{...(cartID && { cartID })}
					product={product}
					variant={selectedVariant ?? defaultVariant}
					{...(isDashboard && { isDashboard })}
				/>
			</ProductContainer>
		</main>
	);
};
export { ProductOverview };

const ProductVariants = ({
	isDashboard = false,
	variants,
	selectedVariantIDOrHandle,
	setVariantIDOrHandle,
}: {
	isDashboard?: boolean;
	variants: Variant[];
	selectedVariantIDOrHandle: string | undefined;
	setVariantIDOrHandle: (prop: string | undefined) => void;
}) => {
	return (
		<section>
			<h2 className="py-2">Variant</h2>
			<ToggleGroup
				className="flex justify-start "
				type="single"
				value={selectedVariantIDOrHandle ?? ""}
				variant="outline"
				onValueChange={(value) => {
					setVariantIDOrHandle(value);
				}}
			>
				{variants?.map((v) => (
					<ToggleGroupItem
						key={v.id}
						value={isDashboard ? v.id : v.handle ?? ""}
						className="relative min-w-[6rem] min-h-[6rem] p-0 "
					>
						<div className="relative">
							{!v.images?.[0] ? (
								<ImagePlaceholder />
							) : v.images?.[0].uploaded ? (
								<Image
									src={v.images?.[0].url}
									alt={v.images?.[0].name ?? "Product image"}
									className="rounded-xl"
									fit="contain"
									width={100}
								/>
							) : (
								<img
									src={toImageURL(v.images?.[0].base64, v.images?.[0].fileType)}
									alt={v.images?.[0].name ?? "Product image"}
									className="rounded-xl"
								/>
							)}
						</div>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</section>
	);
};

const ProductOptions = ({
	options,
	selectedVariant,
	variants,
	setVariantIDOrHandle,
	isDashboard,
}: {
	options: ProductOption[];
	selectedVariant: Variant | null;

	setVariantIDOrHandle: (prop: string | undefined) => void;
	variants: Variant[];
	isDashboard?: boolean;
}) => {
	const [variantOptions, setVariantOptions] = useState<Record<string, string>>(
		{},
	);

	useEffect(() => {
		if (selectedVariant) {
			const variantOptions = (selectedVariant?.optionValues ?? []).reduce(
				(acc, curr) => {
					acc[curr.optionValue.optionID] = curr.optionValue.value;
					return acc;
				},
				{} as Record<string, string>,
			);
			setVariantOptions(variantOptions);
		} else {
			setVariantOptions({});
		}
	}, [selectedVariant]);

	const setVariant = useCallback(
		(options: Record<string, string>) => {
			if (Object.keys(options).length > 0) {
				let variantFound = false;
				for (const variant of variants) {
					let optionValuesEqual = true;
					for (const value of variant.optionValues ?? []) {
						if (
							options[value.optionValue.optionID] !== value.optionValue.value
						) {
							optionValuesEqual = false;
						}
					}
					if (optionValuesEqual) {
						variantFound = true;
						setVariantIDOrHandle(
							isDashboard ? variant.id : variant.handle ?? undefined,
						);
						break;
					}
				}
				//variant not found
				if (!variantFound) setVariantIDOrHandle(undefined);
			}
		},
		[variants, setVariantIDOrHandle, isDashboard],
	);
	return (
		<section>
			{options.map((option) => {
				return (
					<div className="flex flex-col" key={option.id}>
						<span className="flex min-w-[4rem] py-2 items-center font-semibold text-base ">
							{option.name}
						</span>
						<ToggleGroup
							className="flex justify-start"
							type="single"
							value={variantOptions[option.id] ?? ""}
							variant="outline"
							onValueChange={async (value) => {
								const newVariantOptions = {
									...variantOptions,
									[option.id]: value,
								};
								setVariantOptions(newVariantOptions);
								setVariant(newVariantOptions);
							}}
						>
							{option.optionValues?.map((v) => (
								<ToggleGroupItem key={v.id} value={v.value}>
									{v.value}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>
				);
			})}
		</section>
	);
};