import Link from "next/link";
import { FC, useMemo } from "react";
import Grid from "@/components/theme/ui/grid/Grid";
import AddToCartButton from "@/components/theme/ui/AddToCartButton";
import { NextImage } from "@/components/common/NextImage";
import { Price } from "@/components/theme/ui/Price";
import { getColorHex } from "@/utils/colorMap";
import { safeParse } from "@/utils/helper";

export const ProductCard: FC<{
  currency: string;
  price: string;
  specialPrice?: string;
  imageUrl: string;
  product: {
    urlKey: string;
    name: string;
    id: string;
    type: string;
    isSaleable?: string;
    superAttributeOptions?: string;
  };
}> = ({ currency, price, specialPrice, imageUrl, product }) => {

  // Extract color options from product
  const colorOptions = useMemo(() => {
    if (product.type !== "configurable" || !product.superAttributeOptions) return [];

    const superAttributeOptions = safeParse(product.superAttributeOptions);
    if (!superAttributeOptions || !Array.isArray(superAttributeOptions)) return [];

    const colorAttribute = superAttributeOptions.find(
      (attr: any) => attr.code === "color"
    );

    if (!colorAttribute?.options || colorAttribute.options.length <= 1) return [];

    return colorAttribute.options.map((option: any) => ({
      label: option.label,
      hex: getColorHex(option.label || ""),
    }));
  }, [product]);

  return (
    <Grid.Item
      key={product.id}
      className="animate-fadeIn gap-y-4.5 flex flex-col"
    >
      <div className="group relative overflow-hidden rounded-lg">
        <Link href={`/product/${product.urlKey}`} aria-label={`View ${product.name}`}>
          <div className="h-auto truncate rounded-lg"
            style={{
              aspectRatio: "4/5",
            }}
          >
            <NextImage
              alt={product?.name || "Product image"}
              src={imageUrl}
              width={353}
              height={283}
              className={`rounded-lg bg-neutral-100 object-cover transition duration-300 ease-in-out group-hover:scale-105`}
            />
          </div>
        </Link>
        <div
          className={`hidden lg:block absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-x-4 rounded-full border-[1.5px] border-white bg-white/70 px-4 py-1.5 text-xs font-semibold text-black opacity-0 shadow-2xl backdrop-blur-md duration-300 group-hover:opacity-100 dark:text-white`}
        >
          <AddToCartButton productType={product.type} productId={product.id} productUrlKey={product.urlKey} isSaleable={product?.isSaleable} />
        </div>
        <div
          className={`block lg:hidden absolute bottom-[10px] left-1/2 flex -translate-x-1/2 items-center gap-x-4 rounded-full border-[1.5px] border-white bg-white/70 px-4 py-1.5 text-xs font-semibold text-black opacity-100 shadow-2xl backdrop-blur-md duration-300 group-hover:opacity-100 dark:text-white`}
        >
          <AddToCartButton productType={product.type} productId={product.id} productUrlKey={product.urlKey} isSaleable={product?.isSaleable} />
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-sm font-medium md:text-lg">
          {product?.name}
        </h3>


        <div className="flex items-center gap-2">
          {product?.type === "configurable" && (
            <span className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">
              Desde los
            </span>
          )}


          {product?.type === "simple" && specialPrice ? (
            <>
              <div className="flex items-center gap-2">
                <Price
                  amount={specialPrice}
                  className="text-xs font-semibold md:text-sm"
                  currencyCode={currency}
                />
              </div>
            </>
          ) : (
            <Price
              amount={price}
              className="text-xs font-semibold md:text-sm"
              currencyCode={currency}
            />
          )}
        </div>


        {/* Color swatches if multiple colors available */}
        {colorOptions.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            {colorOptions.map((color: { label: string; hex: string }, index: number) => (
              <div
                key={index}
                className="h-5 w-5 rounded-full border-2 border-black/20 dark:border-white/20"
                style={{ backgroundColor: color.hex }}
                title={color.label}
              />
            ))}
          </div>
        )}
      </div>
    </Grid.Item>
  );
};
