"use client";
import { Price } from "@/components/theme/ui/Price";
import { Rating } from "@/components/common/Rating";
import { AddToCart } from "@/components/cart/AddToCart";
import { VariantSelector } from "./VariantSelector";
import { ProductMoreDetails } from "./ProductMoreDetail";
import { useState, useEffect } from "react";
import { getVariantInfo } from "@utils/hooks/useVariantInfo";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Prose from "@components/theme/search/Prose";
import { ProductData, ProductReviewNode } from "../type";
import { safeCurrencyCode, safePriceValue, safeParse } from "@utils/helper";
import Link from "next/link";

const createUrl = (pathname: string, params: URLSearchParams) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;
  return `${pathname}${queryString}`;
};

export function ProductDescription({
  product,
  reviews,
  totalReview,
  productSwatchReview,
}: {
  product: ProductData;
  slug: string;
  reviews: ProductReviewNode[];
  totalReview: number;
  productSwatchReview: any;
}) {
  const priceValue = safePriceValue(product);
  const currencyCode = safeCurrencyCode(product);
  const configurableProductIndexData = (safeParse(
    productSwatchReview?.combinations
  ) || []) as never[];
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [userInteracted, setUserInteracted] = useState(false);

  const superAttributes = productSwatchReview?.superAttributeOptions
    ? safeParse(productSwatchReview.superAttributeOptions)
    : productSwatchReview?.superAttributes?.edges?.map(
      (e: { node: any }) => e.node
    ) || [];

  // Auto-select attributes that have only one option (only for configurable products)
  useEffect(() => {
    if (product?.type !== "configurable" || !superAttributes || superAttributes.length === 0) {
      return;
    }

    const currentParams = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    superAttributes.forEach((attr: any) => {
      // Skip if this attribute is already selected
      if (currentParams.has(attr.code)) {
        return;
      }

      // Get the options for this attribute
      const rawOptions = Array.isArray(attr.options)
        ? attr.options
        : attr.options?.edges?.map((edge: any) => edge.node) || [];

      // If there's only one option, auto-select it
      if (rawOptions.length === 1 && rawOptions[0]?.id) {
        currentParams.set(attr.code, String(rawOptions[0].id));
        hasChanges = true;
      }
    });

    // Only update the URL if there were changes
    if (hasChanges) {
      const newUrl = createUrl(pathname, currentParams);
      router.replace(newUrl, { scroll: false });
    }
  }, [product?.type, superAttributes, searchParams, pathname, router]);

  const variantInfo = getVariantInfo(
    product?.type === "configurable",
    searchParams.toString(),
    superAttributes,
    productSwatchReview?.combinations
  );

  // Calculate the actual price to display based on variant selection
  const displayPrice = (() => {
    if (product?.type !== "configurable") {
      return String(product?.minimumPrice || priceValue);
    }

    // If all variants are selected and we have a specific variant ID
    if (variantInfo?.productid && variantInfo?.Instock) {
      // Try to find the variant price from the variants data
      const variants = product?.variants?.edges || [];
      const selectedVariant = variants.find((edge: any) =>
        edge.node.id === variantInfo.productid ||
        edge.node.id.includes(variantInfo.productid)
      );

      if (selectedVariant?.node?.price) {
        return String(selectedVariant.node.price);
      }

      // Fallback: try to get price from combinations if available
      const combinations = safeParse(productSwatchReview?.combinations);
      if (combinations && typeof combinations === 'object') {
        const variantData = combinations[variantInfo.productid];
        if (variantData?.price) {
          return String(variantData.price);
        }
      }
    }

    // Default to minimum price if variant not fully selected
    return String(priceValue);
  })();

  const showMinimumPriceLabel = product?.type === "configurable" && !variantInfo?.productid;

  const additionalData =
    productSwatchReview?.attributeValues?.edges?.map(
      (e: { node: any }) => e.node
    ) || [];
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const handleReviewClick = () => {
    setExpandedKeys(new Set(["2"]));
  };

  return (
    <>
      <div className="mb-2 flex flex-col pb-6">
        {/* Breadcrumb */}
        <div className="hidden lg:flex flex-col gap-3 shrink-0 mb-2">
          <Link
            href="/"
            className="w-fit text-sm font-medium text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            Inicio /
          </Link>
        </div>
        <h1 className="font-outfit text-2xl md:text-3xl lg:text-4xl font-semibold">
          {product?.name || ""}
        </h1>

        <div className="flex w-auto justify-between items-baseline gap-y-2 py-4 xs:flex-row xs:gap-y-0 sm:py-6 flex-wrap">
          <div className="flex gap-4 items-baseline">
            {showMinimumPriceLabel && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                Desde los
              </p>
            )}
            <Price
              amount={displayPrice}
              currencyCode={currencyCode}
              className="font-outfit text-xl md:text-2xl font-semibold"
            />
          </div>

          <Rating
            length={5}
            star={reviews[0]?.rating ?? 0}
            reviewCount={totalReview}
            className="mt-2"
            onReviewClick={handleReviewClick}
          />
        </div>
      </div>

      <VariantSelector
        variants={variantInfo?.variantAttributes}
        setUserInteracted={setUserInteracted}
        possibleOptions={variantInfo.possibleOptions}
      />

      {product?.shortDescription ? (
        <Prose className="mb-6 text-base text-selected-black dark:text-white font-light" html={product.shortDescription} />
      ) : null}

      <AddToCart
        index={configurableProductIndexData}
        productId={product?.id || ""}
        productSwatchReview={productSwatchReview}
        userInteracted={userInteracted}
      />

      <ProductMoreDetails
        additionalData={additionalData}
        description={product?.description ?? ""}
        reviews={Array.isArray(reviews) ? reviews : []}
        totalReview={totalReview}
        productId={product?.id ?? ""}
        expandedKeys={expandedKeys}
        setExpandedKeys={setExpandedKeys}
      />
    </>
  );
}
