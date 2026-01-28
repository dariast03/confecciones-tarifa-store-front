import { GET_THEME_CUSTOMIZATION } from "@/graphql";
import { graphqlRequest } from "../../lib/graphql-fetch";
import RenderThemeCustomization from "@components/home/RenderThemeCustomization";
import { ThemeCustomizationResponse } from "@/types/theme/theme-customization";
import { generateMetadataForPage } from "@utils/helper";
import { staticSeo } from "@utils/metadata";
import { Metadata } from "next";

const BAGISTO_ENDPOINT = process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT;
const SITE_URL = process.env.NEXT_PUBLIC_NEXT_AUTH_URL || 'https://api.confecciones-tarifa.shop';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await graphqlRequest<ThemeCustomizationResponse>(
      GET_THEME_CUSTOMIZATION,
      { first: 20 },
      { tags: ["theme-customization"], life: "days" }
    );

    // Obtener la primera imagen del carrusel si existe
    let firstImage = "/Logo.webp";
    const imageCarousel = data?.themeCustomizations?.edges?.find(
      (edge) => edge.node.type === "image_carousel"
    );

    if (imageCarousel?.node?.translations?.edges?.[0]?.node?.options) {
      try {
        const options = JSON.parse(imageCarousel.node.translations.edges[0].node.options);
        if (options?.images?.[0]?.image) {
          // Usar el endpoint de Bagisto (Laravel) para las imágenes
          firstImage = `${BAGISTO_ENDPOINT}/${options.images[0].image}`;
        }
      } catch (e) {
        console.error("Error parsing carousel options:", e);
      }
    }

    const seoData = {
      ...staticSeo.default,
      image: firstImage,
    };

    const metadata = await generateMetadataForPage("", seoData);

    // Agregar datos estructurados JSON-LD para mejor SEO
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: "Confecciones Tarifa",
      description:
        "Tienda de ropa artesanal para carnaval chapaco. Tradición tarijeña hecha a mano con amor y dedicación.",
      url: SITE_URL,
      image: firstImage,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tarija",
        addressCountry: "BO",
      },
      priceRange: "$$",
      areaServed: {
        "@type": "Country",
        name: "Bolivia",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };

    return {
      ...metadata,
      keywords: staticSeo.default.keywords,
      other: {
        ...metadata.other,
        "application-name": "Confecciones Tarifa",
        "apple-mobile-web-app-title": "Confecciones Tarifa",
      },
      // Agregar el script JSON-LD
      ...({
        additionalMetaTags: [
          {
            tagName: "script",
            innerHTML: JSON.stringify(jsonLd),
            type: "application/ld+json",
          },
        ],
      } as any),
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return generateMetadataForPage("", staticSeo.default);
  }
}

export default async function Home() {
  const data = await graphqlRequest<ThemeCustomizationResponse>(GET_THEME_CUSTOMIZATION, { first: 20 }, {
    tags: ["theme-customization"],
    life: "days"
  });

  // Generar JSON-LD para datos estructurados
  let firstImage = "/Logo.webp";
  const imageCarousel = data?.themeCustomizations?.edges?.find(
    (edge) => edge.node.type === "image_carousel"
  );

  if (imageCarousel?.node?.translations?.edges?.[0]?.node?.options) {
    try {
      const options = JSON.parse(imageCarousel.node.translations.edges[0].node.options);
      if (options?.images?.[0]?.image) {
        // Usar el endpoint de Bagisto (Laravel) para las imágenes
        firstImage = `${BAGISTO_ENDPOINT}/${options.images[0].image}`;
      }
    } catch (e) {
      console.error("Error parsing carousel options:", e);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Confecciones Tarifa",
    description:
      "Tienda de ropa artesanal para carnaval chapaco. Tradición tarijeña hecha a mano con amor y dedicación.",
    url: SITE_URL,
    image: firstImage,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tarija",
      addressCountry: "BO",
    },
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Bolivia",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RenderThemeCustomization themeCustomizations={data?.themeCustomizations} />
    </>
  );
}
