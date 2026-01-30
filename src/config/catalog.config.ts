export interface CatalogConfig {
  showPrice: boolean;
  businessName: string;
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  logo: string;
  brandColor: string;
  secondaryColor: string;
}

export const defaultCatalogConfig: CatalogConfig = {
  showPrice: false,
  businessName: "Confecciones Tarifa",
  contactNumber: "68686060",
  whatsappNumber: "68686060",
  email: "confeccionestarifa@gmail.com",
  website: "confecciones-tarifa.shop",
  instagram: "@confecciones_tarifa",
  facebook: "ConfeccionesTarifa",
  logo: "/image/Logo.webp",
  brandColor: "#DC2626", // red-600
  secondaryColor: "#1F2937", // gray-800
};

export function getCatalogConfig(params?: URLSearchParams): CatalogConfig {
  if (!params) return defaultCatalogConfig;

  return {
    showPrice: params.get("showPrice") !== "false",
    businessName: params.get("businessName") || defaultCatalogConfig.businessName,
    contactNumber: params.get("contactNumber") || defaultCatalogConfig.contactNumber,
    whatsappNumber: params.get("whatsappNumber") || defaultCatalogConfig.whatsappNumber,
    email: params.get("email") || defaultCatalogConfig.email,
    website: params.get("website") || defaultCatalogConfig.website,
    instagram: params.get("instagram") || defaultCatalogConfig.instagram,
    facebook: params.get("facebook") || defaultCatalogConfig.facebook,
    logo: params.get("logo") || defaultCatalogConfig.logo,
    brandColor: params.get("brandColor") || defaultCatalogConfig.brandColor,
    secondaryColor: params.get("secondaryColor") || defaultCatalogConfig.secondaryColor,
  };
}
