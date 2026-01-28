"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import HeroCarousel from "@/components/common/slider/HeroCarousel";
import { ProductNode } from "@/components/catalog/type";
import { baseUrl, getImageUrl, NOT_IMAGE } from "@/utils/constants";
import { safeParse, createUrl } from "@/utils/helper";
import { getColorHex } from "@/utils/colorMap";
import { AttributeOptionNode } from "@/types/types";

interface ProductImagesProps {
    product: ProductNode;
}

export function ProductImages({ product }: ProductImagesProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Get the selected color from URL params
    const selectedColor = searchParams.get("color");

    // Get color options from product
    const colorOptions = useMemo(() => {
        if (product.type !== "configurable") return [];

        const superAttributeOptions = product.superAttributeOptions
            ? safeParse(product.superAttributeOptions)
            : null;

        if (!superAttributeOptions || !Array.isArray(superAttributeOptions)) return [];

        const colorAttribute = superAttributeOptions.find(
            (attr: any) => attr.code === "color"
        );

        if (!colorAttribute?.options) return [];

        // Map color options with hex values
        return colorAttribute.options.map((option: any) => ({
            ...option,
            swatchValue: getColorHex(option.label || option.adminName || ""),
        })) as AttributeOptionNode[];
    }, [product]);

    const handleColorChange = (colorId: string) => {
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set("color", colorId);
        const optionUrl = createUrl(pathname, nextParams);
        router.replace(optionUrl, { scroll: false });
    };

    // Memoize the images to avoid recalculation on every render
    const images = useMemo(() => {
        // If product is configurable and a color is selected, find the matching variant
        if (product.type === "configurable" && selectedColor && product.variants?.edges) {
            // Parse combinations to find the variant that matches the selected color
            const combinations = product.combinations
                ? safeParse(product.combinations)
                : null;

            // Find the variant ID that matches the selected color
            let matchingVariantId: string | null = null;

            if (combinations && typeof combinations === 'object') {
                for (const [variantId, attributes] of Object.entries(combinations)) {
                    const attrs = attributes as { color?: number; size?: number };
                    if (attrs.color && String(attrs.color) === selectedColor) {
                        matchingVariantId = variantId;
                        break;
                    }
                }
            }

            // If we found a matching variant, use its images
            if (matchingVariantId) {
                const variant = product.variants.edges.find(
                    (edge) => edge.node.id.includes(matchingVariantId)
                );

                if (variant?.node?.images?.edges && variant.node.images.edges.length > 0) {
                    return variant.node.images.edges.map((imageEdge) => ({
                        src: getImageUrl(imageEdge.node.publicPath, baseUrl, NOT_IMAGE) || "",
                        altText: product.name || "Product image",
                    }));
                }
            }
        }

        // Default: use root product images
        if (product.images?.edges && product.images.edges.length > 0) {
            return product.images.edges.map((imageEdge) => ({
                src: getImageUrl(imageEdge.node.publicPath, baseUrl, NOT_IMAGE) || "",
                altText: product.name || "Product image",
            }));
        }

        // Fallback: use baseImageUrl
        const imageUrl = getImageUrl(product.baseImageUrl, baseUrl, NOT_IMAGE);
        return [
            {
                src: imageUrl || "",
                altText: product.name || "Product image",
            },
        ];
    }, [product, selectedColor]);

    return (
        <HeroCarousel
            images={images}
            colorOptions={colorOptions}
            onColorChange={handleColorChange}
        />
    );
}
