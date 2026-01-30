"use client";

import { FC, useMemo } from "react";
import { getColorHex } from "@/utils/colorMap";
import { safeParse } from "@/utils/helper";
import { CatalogConfig } from "@/config/catalog.config";
import { NOT_IMAGE } from "@/utils/constants";

interface CatalogProductCardProps {
  product: any;
  config: CatalogConfig;
  imageUrl: string;
}

export const CatalogProductCard: FC<CatalogProductCardProps> = ({
  product,
  config,
  imageUrl,
}) => {
  // Extract color options
  const colorOptions = useMemo(() => {
    if (!product.superAttributeOptions) return [];

    const superAttributeOptions = safeParse(product.superAttributeOptions);
    if (!superAttributeOptions || !Array.isArray(superAttributeOptions))
      return [];

    const colorAttribute = superAttributeOptions.find(
      (attr: any) => attr.code === "color"
    );

    if (!colorAttribute?.options) return [];

    return colorAttribute.options.map((option: any) => ({
      label: option.label,
      hex: getColorHex(option.label || ""),
    }));
  }, [product]);

  // Extract size options
  const sizeOptions = useMemo(() => {
    if (!product.superAttributeOptions) return [];

    const superAttributeOptions = safeParse(product.superAttributeOptions);
    if (!superAttributeOptions || !Array.isArray(superAttributeOptions))
      return [];

    const sizeAttribute = superAttributeOptions.find(
      (attr: any) => attr.code === "size"
    );

    if (!sizeAttribute?.options) return [];

    return sizeAttribute.options.map((option: any) => option.label);
  }, [product]);

  const price =
    product?.type === "configurable"
      ? product?.minimumPrice ?? "0"
      : product?.price ?? "0";

  // Proxy external images to avoid CORS issues
  const proxiedImageUrl = useMemo(() => {
    if (!imageUrl || imageUrl === NOT_IMAGE) return NOT_IMAGE;

    // If it's an external URL (from API), proxy it
    if (imageUrl.startsWith("http")) {
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    }

    return imageUrl;
  }, [imageUrl]);

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: "1080px",
        height: "1080px",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Brand Header with gradient */}
      <div
        className="relative px-8 flex items-center justify-between py-4"
        style={{
          height: "96px",
          background: `linear-gradient(135deg, ${config.brandColor} 0%, ${config.secondaryColor} 100%)`,
        }}
      >
        <div className="flex items-center gap-4">

          <img
            src={config.logo}
            alt={config.businessName}
            width={48}
            height={48}
            className="object-contain w-16 h-16  rounded-full shadow-lg"
            onError={(e) => (e.currentTarget.src = NOT_IMAGE)}
            crossOrigin="anonymous"
          />

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {config.businessName}
            </h1>
            <p className="text-white/90 text-sm">Ropa Artesanal Chapaca</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            WhatsApp
          </p>
          <p className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
            {config.whatsappNumber}
          </p>
        </div>
      </div>

      {/* Product Image - Large and centered */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          padding: "32px",
          background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
        }}
      >
        <div
          className="relative h-full bg-red-500 w-136"
          style={{
            //  width: "650px",
            //height: "650px",
            borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <img
            src={proxiedImageUrl}
            alt={product.name}

            className="object-contain w-full h-full"
            onError={(e) => (e.currentTarget.src = NOT_IMAGE)}
            crossOrigin="anonymous"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Overlay gradient at bottom for better text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0, 0, 0, 0.2) 0%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Product Info Section */}
      <div
        className="flex flex-col"
        style={{
          height: "330px",
          backgroundColor: "#FFFFFF",
          borderTop: "4px solid #E5E7EB",
          padding: "24px 32px",
        }}
      >
        {/* Product Name */}
        <h2
          className="text-4xl font-bold mb-4 line-clamp-2"
          style={{ color: config.secondaryColor }}
        >
          {product.name}
        </h2>

        {/* Colors and Sizes Row */}
        <div className="flex gap-8 mb-6">
          {/* Colors */}
          {colorOptions.length > 0 && (
            <div className="flex-1">
              <p
                className="text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{ color: "#4B5563" }}
              >
                Colores Disponibles
              </p>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map(
                  (
                    color: { label: string; hex: string },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-1 rounded-full"
                      style={{
                        backgroundColor: "#F9FAFB",
                        border: "2px solid #E5E7EB",
                      }}
                    >
                      <div
                        className="rounded-full"
                        style={{
                          width: "28px",
                          height: "28px",
                          backgroundColor: color.hex,
                          border: "2px solid #FFFFFF",
                          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        {color.label}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizeOptions.length > 0 && (
            <div className="flex-1">
              <p
                className="text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{ color: "#4B5563" }}
              >
                Tallas Disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size: string, index: number) => (
                  <div
                    key={index}
                    className="px-5 py-2 font-bold text-sm rounded-lg"
                    style={{
                      backgroundColor: "#1F2937",
                      color: "#FFFFFF",
                      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price and Contact Footer */}
        <div
          className="flex items-end justify-between mt-auto"
          style={{
            paddingTop: "16px",
            borderTop: "2px solid #E5E7EB",
          }}
        >
          {config.showPrice ? (
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "#4B5563" }}
              >
                {product?.type === "configurable" ? "Desde" : "Precio"}
              </p>
              <p
                className="text-5xl font-black"
                style={{ color: config.brandColor }}
              >
                Bs {parseFloat(price).toFixed(2)}
              </p>
            </div>
          ) : <div></div>}

          {/* Contact Info */}
          <div className="text-right space-y-1">
            <div
              className="flex items-center justify-end gap-2"
              style={{ color: "#374151" }}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.188 8.188 0 01-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.76-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.46-.01z" />
              </svg>
              <span className="font-semibold text-lg">
                {config.whatsappNumber}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#4B5563" }}>
              {config.website}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
