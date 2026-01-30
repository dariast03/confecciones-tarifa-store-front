import { baseUrl, getImageUrl, NOT_IMAGE } from "@/utils/constants";
import { GalleryProductCard } from "./GalleryProductCard";
import { safeParse } from "@/utils/helper";

export default function GalleryGridItems({
    products,
    appliedFilters,
}: {
    products: any;
    appliedFilters?: {
        colorIds: string[];
        sizeIds: string[];
        brandIds: string[];
    };
}) {
    // Flatten all variants from all products into a single array
    const allVariants: any[] = [];

    products.forEach((product: any) => {
        if (product?.variants?.edges && product.variants.edges.length > 0) {
            product.variants.edges.forEach((variantEdge: any) => {
                const variant = variantEdge.node;

                // If filters are applied, check if this variant matches
                if (appliedFilters && (appliedFilters.colorIds.length > 0 || appliedFilters.sizeIds.length > 0 || appliedFilters.brandIds.length > 0)) {
                    // Parse the variant's superAttributeOptions to get its attributes
                    const variantAttributes = safeParse(variant.superAttributeOptions);

                    if (!variantAttributes || !Array.isArray(variantAttributes)) {
                        // If we can't parse attributes, try to match via combinations
                        const combinations = safeParse(product.combinations);
                        if (combinations && typeof combinations === 'object') {
                            let matchesFilter = true;

                            // Find this variant in combinations
                            for (const [key, attributes] of Object.entries(combinations)) {
                                if (variant.id.includes(key) || variant.sku === (attributes as any).sku || key === variant.id) {
                                    const attrs = attributes as Record<string, number>;

                                    // Check color filter
                                    if (appliedFilters.colorIds.length > 0 && attrs.color) {
                                        matchesFilter = matchesFilter && appliedFilters.colorIds.includes(String(attrs.color));
                                    }

                                    // Check size filter
                                    if (appliedFilters.sizeIds.length > 0 && attrs.size) {
                                        matchesFilter = matchesFilter && appliedFilters.sizeIds.includes(String(attrs.size));
                                    }

                                    break;
                                }
                            }

                            if (!matchesFilter) {
                                return; // Skip this variant
                            }
                        } else {
                            return; // Can't determine, skip this variant
                        }
                    } else {
                        // Check if variant matches the filters
                        let matchesFilter = true;

                        variantAttributes.forEach((attr: any) => {
                            if (attr.code === 'color' && appliedFilters.colorIds.length > 0) {
                                // Get the selected option ID for this variant
                                const selectedOption = attr.options?.[0];
                                if (selectedOption?.id) {
                                    matchesFilter = matchesFilter && appliedFilters.colorIds.includes(String(selectedOption.id));
                                }
                            }

                            if (attr.code === 'size' && appliedFilters.sizeIds.length > 0) {
                                const selectedOption = attr.options?.[0];
                                if (selectedOption?.id) {
                                    matchesFilter = matchesFilter && appliedFilters.sizeIds.includes(String(selectedOption.id));
                                }
                            }
                        });

                        if (!matchesFilter) {
                            return; // Skip this variant if it doesn't match the filter
                        }
                    }
                }

                allVariants.push({
                    ...variant,
                    parentProduct: {
                        id: product.id,
                        urlKey: product.urlKey,
                        name: product.name,
                        combinations: product.combinations,
                        superAttributeOptions: product.superAttributeOptions,
                    },
                });
            });
        }
    });

    return allVariants.map((variant: any, index: number) => {
        const imageUrl = getImageUrl(variant?.baseImageUrl, baseUrl, NOT_IMAGE);
        const price = variant?.price ?? "0";
        const currency = "BOB";

        return (
            <GalleryProductCard
                key={`${variant.id}-${index}`}
                currency={"BOB"}
                imageUrl={imageUrl || ""}
                price={price}
                variant={variant}
            />
        );
    });
}
