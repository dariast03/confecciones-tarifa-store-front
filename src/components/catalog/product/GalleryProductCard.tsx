"use client";

import Link from "next/link";
import { FC, useMemo } from "react";
import Grid from "@/components/theme/ui/grid/Grid";
import { NextImage } from "@/components/common/NextImage";
import { Price } from "@/components/theme/ui/Price";
import { safeParse } from "@/utils/helper";

export const GalleryProductCard: FC<{
    currency: string;
    price: string;
    imageUrl: string;
    variant: {
        id: string;
        sku: string;
        type: string;
        name?: string;
        isSaleable?: string;
        superAttributeOptions?: string;
        parentProduct: {
            id: string;
            urlKey: string;
            name: string;
            combinations: string;
            superAttributeOptions: string;
        };
    };
}> = ({ currency, price, imageUrl, variant }) => {

    // Build URL with pre-selected variant parameters
    const variantUrl = useMemo(() => {
        const baseUrl = `/product/${variant.parentProduct.urlKey}`;

        // Parse combinations to match this variant
        const combinations = safeParse(variant.parentProduct.combinations);
        if (!combinations || typeof combinations !== 'object') {
            return baseUrl;
        }

        // Find the combination that matches this variant's ID or SKU
        // combinations is an object like: { "123": { color: 23, size: 45 }, "456": { color: 24, size: 46 } }
        let variantAttributes: Record<string, number> | null = null;

        // Try to find by variant ID first
        for (const [key, attributes] of Object.entries(combinations)) {
            // Check if the key matches the variant ID or SKU
            if (variant.id.includes(key) || variant.sku === (attributes as any).sku || key === variant.id) {
                variantAttributes = attributes as Record<string, number>;
                break;
            }
        }

        // If not found by ID, try to match by SKU in the combination
        if (!variantAttributes) {
            for (const [, attributes] of Object.entries(combinations)) {
                if ((attributes as any).sku === variant.sku) {
                    variantAttributes = attributes as Record<string, number>;
                    break;
                }
            }
        }

        if (!variantAttributes) {
            console.warn('Could not find variant attributes for SKU:', variant.sku);
            return baseUrl;
        }

        // Build query params from variant attributes
        const params = new URLSearchParams();

        // Add each attribute (color, size, etc.) to the URL params
        for (const [attrCode, attrValue] of Object.entries(variantAttributes)) {
            // Skip 'sku' property if it exists in the combination
            if (attrCode !== 'sku' && typeof attrValue === 'number') {
                params.append(attrCode, String(attrValue));
            }
        }

        return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    }, [variant]);

    // Extract variant display name (e.g., "Pollera - Rojo / M")
    const displayName = useMemo(() => {
        const baseName = variant.name || variant.parentProduct.name;
        const superAttributeOptions = safeParse(variant.superAttributeOptions);

        if (!superAttributeOptions || !Array.isArray(superAttributeOptions)) {
            return baseName;
        }

        const attributeLabels: string[] = [];
        superAttributeOptions.forEach((attr: any) => {
            if (attr.options && attr.options.length > 0) {
                // Get the selected option label
                const selectedOption = attr.options[0];
                if (selectedOption?.label) {
                    attributeLabels.push(selectedOption.label);
                }
            }
        });

        if (attributeLabels.length > 0) {
            return `${baseName} - ${attributeLabels.join(" / ")}`;
        }

        return baseName;
    }, [variant]);

    return (
        <Grid.Item
            key={variant.id}
            className="animate-fadeIn gap-y-4.5 flex flex-col"
        >
            <div className="group relative overflow-hidden rounded-lg">
                <Link href={variantUrl} aria-label={`View ${displayName}`}>
                    <div className="h-auto truncate rounded-lg"
                        style={{
                            aspectRatio: "4/5",
                        }}
                    >
                        <NextImage
                            alt={displayName || "Product variant image"}
                            src={imageUrl}
                            width={353}
                            height={283}
                            className={`rounded-lg bg-neutral-100 object-cover transition duration-300 ease-in-out group-hover:scale-105`}
                        />
                    </div>
                </Link>


            </div>

            <div>
                <h3 className="mb-2.5 text-sm font-medium md:text-lg line-clamp-2">
                    {displayName}
                </h3>

                <div className="flex items-center gap-2">
                    <Price
                        amount={price}
                        className="text-xs font-semibold md:text-sm"
                        currencyCode={currency}
                    />
                </div>
            </div>
        </Grid.Item>
    );
};
