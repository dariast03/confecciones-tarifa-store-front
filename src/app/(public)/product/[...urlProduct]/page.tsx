import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ProductDetailSkeleton,
  RelatedProductSkeleton,
} from "@/components/common/skeleton/ProductSkeleton";
import {
  BASE_SCHEMA_URL,
  PRODUCT_TYPE,
  PRODUCT_OFFER_TYPE,
} from "@/utils/constants";
import { GET_PRODUCT_BY_URL_KEY, graphqlRequest } from "@/graphql";
import { ProductNode } from "@/components/catalog/type";
import { RelatedProductsSection } from "@components/catalog/product/RelatedProductsSection";
import ProductInfo from "@components/catalog/product/ProductInfo";
import { LRUCache } from "@/utils/LRUCache";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";
import { ProductImages } from "@/components/catalog/product/ProductImages";
import { Metadata } from "next";
import { generateMetadataForPage } from "@/utils/helper";

const SITE_URL = process.env.NEXT_PUBLIC_NEXT_AUTH_URL || 'https://api.confecciones-tarifa.shop';

const productCache = new LRUCache<ProductNode>(100, 10);
export const dynamic = "force-static";

export interface SingleProductResponse {
  product: ProductNode;
}

async function getSingleProduct(urlKey: string) {
  const cachedProduct = productCache.get(urlKey);
  if (cachedProduct) {
    return cachedProduct;
  }

  try {
    const dataById = await graphqlRequest<SingleProductResponse>(
      GET_PRODUCT_BY_URL_KEY,
      {
        urlKey: urlKey,
      },
      {
        tags: ["products", `product-${urlKey}`],
        life: "hours",
      }
    );

    const product = dataById?.product || null;
    if (product) {
      productCache.set(urlKey, product);
    }
    return product;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product:", {
        message: error.message,
        urlKey,
        graphQLErrors: (error as unknown as Record<string, unknown>)
          .graphQLErrors,
      });
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ urlProduct: string[] }>;
}): Promise<Metadata> {
  const { urlProduct } = await params;
  const fullPath = urlProduct.join("/");
  const product = await getSingleProduct(fullPath) as any;

  if (!product) return notFound();

  // Limpiar descripciones HTML
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]*>/g, '').trim().substring(0, 160)
    : product.shortDescription
      ? product.shortDescription.replace(/<[^>]*>/g, '').trim()
      : `${product.name} - Ropa artesanal para carnaval chapaco en Confecciones Tarifa.`;

  // Construir título SEO optimizado
  const title = `${product.name} | Confecciones Tarifa - Ropa Artesanal Chapaca`;

  // Usar la imagen principal del producto
  const productImage = product.baseImageUrl || '/Logo.webp';

  // Generar keywords dinámicos
  const keywords = `${product.name}, ${product.name} Tarija, ropa artesanal ${product.name}, ${product.name} carnaval chapaco, ${product.name} hecho a mano, comprar ${product.name} Bolivia, ${product.sku}`;

  const metadata = await generateMetadataForPage(`product/${fullPath}`, {
    title,
    description: cleanDescription,
    image: productImage,
    canonical: `/product/${fullPath}`,
  });

  return {
    ...metadata,
    keywords,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ urlProduct: string[] }>;
  searchParams: Promise<{ type: string }>;
}) {
  const { urlProduct } = await params;
  const fullPath = urlProduct.join("/");
  const product = await getSingleProduct(fullPath) as any;
  if (!product) return notFound();

  // Limpiar descripción para JSON-LD
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]*>/g, '').trim()
    : product.shortDescription
      ? product.shortDescription.replace(/<[^>]*>/g, '').trim()
      : '';

  // Calcular rating promedio si hay reviews
  const reviews = Array.isArray(product?.reviews?.edges)
    ? product?.reviews.edges.map((e: any) => e.node)
    : [];

  const totalRating = reviews.reduce((acc: number, review: any) => {
    const rating = review?.rating ? parseFloat(String(review.rating)) : 0;
    return acc + rating;
  }, 0);
  const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : null;

  // Extraer opciones de atributos (colores, tallas)
  const superAttributes = product.superAttributeOptions
    ? JSON.parse(product.superAttributeOptions as string)
    : [];

  // JSON-LD completo para el producto
  const productJsonLd = {
    "@context": BASE_SCHEMA_URL,
    "@type": PRODUCT_TYPE,
    name: product.name,
    description: cleanDescription,
    sku: product.sku,
    image: product.baseImageUrl || `${SITE_URL}/Logo.webp`,
    brand: {
      "@type": "Brand",
      name: "Confecciones Tarifa",
    },
    offers: {
      "@type": PRODUCT_OFFER_TYPE,
      url: `${SITE_URL}/product/${fullPath}`,
      priceCurrency: "BOB",
      price: product.minimumPrice || product.price || "0",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: product.isSaleable === '1'
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Confecciones Tarifa",
      },
    },
    ...(averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating,
        reviewCount: reviews.length,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(superAttributes.length > 0 && {
      additionalProperty: superAttributes.map((attr: { code: string; label: string; options: { id: number; label: string }[] }) => ({
        "@type": "PropertyValue",
        name: attr.label,
        value: attr.options.map((opt: { label: string }) => opt.label).join(", "),
      })),
    }),
  };

  return (
    <>
      <MobileSearchBar />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="flex flex-col gap-y-4 rounded-lg pb-0 pt-4 sm:gap-y-6 md:py-7.5 lg:flex-row w-full max-w-screen-2xl mx-auto px-4 xss:px-7.5 lg:gap-8">
        <div className="h-full w-full max-w-[885px] max-1366:max-w-[650px] max-lg:max-w-full">
          <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductImages product={product} />
          </Suspense>
        </div>
        <div className="basis-full lg:basis-4/6">
          <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductInfo
              product={product}
              slug={fullPath}
              reviews={reviews}
              totalReview={reviews.length}
            />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<RelatedProductSkeleton />}>
        <RelatedProductsSection fullPath={fullPath} />
      </Suspense>
    </>
  );
}
