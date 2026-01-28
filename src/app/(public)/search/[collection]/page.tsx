import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isArray } from "@/utils/type-guards";
import Grid from "@components/theme/ui/grid/Grid";
import FilterList from "@components/theme/filters/FilterList";
import SortOrder from "@components/theme/filters/SortOrder";
import MobileFilter from "@components/theme/filters/MobileFilter";
import ProductGridItems from "@components/catalog/product/ProductGridItems";
import Pagination from "@components/catalog/Pagination";
import {
  ProductFilterAttributeResponse,
  ProductsResponse,
} from "@components/catalog/type";
import {
  GET_FILTER_OPTIONS,
  GET_FILTER_PRODUCTS,
  GET_TREE_CATEGORIES,
  graphqlRequest,
} from "@/graphql";
import { SortByFields } from "@utils/constants";
import { CategoryDetail } from "@components/theme/search/CategoryDetail";
import { Suspense } from "react";
import FilterListSkeleton from "@components/common/skeleton/FilterSkeleton";
import { TreeCategoriesResponse } from "@/types/theme/category-tree";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";
import { extractNumericId, findCategoryBySlug, generateMetadataForPage } from "@utils/helper";

const BAGISTO_ENDPOINT = process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT;
const SITE_URL = process.env.NEXT_PUBLIC_NEXT_AUTH_URL || 'https://api.confecciones-tarifa.shop';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: categorySlug } = await params;

  const treeData = await graphqlRequest<TreeCategoriesResponse>(
    GET_TREE_CATEGORIES,
    { parentId: 1 },
    { tags: ["categories"], life: "days" }
  );

  const categories = treeData?.treeCategories || [];
  const categoryItem = findCategoryBySlug(categories, categorySlug);

  if (!categoryItem) return notFound();

  const translation = categoryItem.translation;

  // Preparar imagen de la categoría
  let categoryImage = "/Logo.webp";
  if (categoryItem.logoPath) {
    categoryImage = `${BAGISTO_ENDPOINT}/storage/${categoryItem.logoPath}`;
  }

  // Limpiar descripción HTML para meta description
  const cleanDescription = translation?.description
    ? translation.description.replace(/<[^>]*>/g, '').trim()
    : `Explora nuestra colección de ${translation?.name} en Confecciones Tarifa. Ropa artesanal para carnaval chapaco hecha a mano en Tarija, Bolivia.`;

  const title = translation?.metaTitle
    ? `${translation.metaTitle} | Confecciones Tarifa`
    : `${translation?.name} | Confecciones Tarifa - Ropa Artesanal Chapaca`;

  const metadata = await generateMetadataForPage(`search/${categorySlug}`, {
    title,
    description: cleanDescription,
    image: categoryImage,
    canonical: `/search/${categorySlug}`,
  });

  // Agregar keywords específicos de la categoría
  const categoryKeywords = `${translation?.name}, ropa ${translation?.name?.toLowerCase()}, confecciones ${translation?.name?.toLowerCase()} Tarija, ${translation?.name?.toLowerCase()} carnaval chapaco, ${translation?.name?.toLowerCase()} artesanal Bolivia`;

  return {
    ...metadata,
    keywords: categoryKeywords,
  };
}

export default async function CategoryPage({
  searchParams,
  params,
}: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { collection: categorySlug } = await params;
  const resolvedParams = await searchParams;

  const [treeData, colorFilterData, sizeFilterData, brandFilterData] = await Promise.all([
    graphqlRequest<TreeCategoriesResponse>(
      GET_TREE_CATEGORIES,
      { parentId: 1 },
      { tags: ["categories"], life: "days" }
    ),
    graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, { id: "/api/admin/attributes/23", locale: "en" }),
    graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, { id: "/api/admin/attributes/24", locale: "en" }),
    graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, { id: "/api/admin/attributes/25", locale: "en" }),
  ]);

  const categories = treeData?.treeCategories || [];
  const categoryItem = findCategoryBySlug(categories, categorySlug);

  if (!categoryItem) return notFound();

  const numericId = extractNumericId(categoryItem.id);

  const {
    q: searchValue,
    page,
    cursor,
    before,
  } = (resolvedParams || {}) as {
    [key: string]: string;
  };

  const itemsPerPage = 12;
  const currentPage = page ? parseInt(page) - 1 : 0;
  const sortValue = resolvedParams?.sort || "name-asc";
  const selectedSort =
    SortByFields.find((s) => s.key === sortValue) || SortByFields[0];

  const rawColor = resolvedParams?.color;
  const rawSize = resolvedParams?.size;
  const rawBrand = resolvedParams?.brand;

  const colorFilter = typeof rawColor === "string" ? rawColor.split(",") : [];
  const sizeFilter = typeof rawSize === "string" ? rawSize.split(",") : [];
  const brandFilter = typeof rawBrand === "string" ? rawBrand.split(",") : [];

  const colorIds = colorFilter.map((iri) => extractNumericId(iri)).filter(Boolean);
  const sizeIds = sizeFilter.map((iri) => extractNumericId(iri)).filter(Boolean);
  const brandIds = brandFilter.map((iri) => extractNumericId(iri)).filter(Boolean);

  const filterObject: Record<string, string> = {};

  if (numericId) {
    filterObject.category_id = numericId;
  }

  if (colorIds.length > 0) filterObject.color = colorIds.join(",");
  if (sizeIds.length > 0) filterObject.size = sizeIds.join(",");
  if (brandIds.length > 0) filterObject.brand = brandIds.join(",");

  const filterInput = JSON.stringify(filterObject)
  const [data] = await Promise.all([
    graphqlRequest<ProductsResponse>(GET_FILTER_PRODUCTS, {
      query: searchValue || "",
      filter: filterInput,
      ...(before
        ? { last: itemsPerPage, before: before }
        : { first: itemsPerPage, after: cursor }),
      sortKey: selectedSort.sortKey,
      reverse: selectedSort.reverse,
    }),
  ]);

  const filterAttributes = [
    colorFilterData?.attribute,
    sizeFilterData?.attribute,
    brandFilterData?.attribute,
  ]
    .filter(Boolean)
    .map((attr) => ({
      id: attr.id,
      code: attr.code,
      adminName: attr.code.toUpperCase(),
      options: attr.options.edges.map((o) => ({
        id: o.node.id,
        adminName: o.node.adminName,
      })),
    }));

  const products = data?.products?.edges?.map((e) => e.node) || [];
  const pageInfo = data?.products?.pageInfo;
  const totalCount = data?.products?.totalCount;
  const translation = categoryItem.translation;

  // Generar JSON-LD para la categoría
  const categoryImage = categoryItem.logoPath
    ? `${BAGISTO_ENDPOINT}/storage/${categoryItem.logoPath}`
    : `${SITE_URL}/Logo.webp`;

  const cleanDescription = translation?.description
    ? translation.description.replace(/<[^>]*>/g, '').trim()
    : `Colección de ${translation?.name} en Confecciones Tarifa`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: translation?.name,
    description: cleanDescription,
    url: `${SITE_URL}/search/${categorySlug}`,
    image: categoryImage,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: translation?.name,
          item: `${SITE_URL}/search/${categorySlug}`,
        },
      ],
    },
    ...(products.length > 0 && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: totalCount,
        itemListElement: products.slice(0, 5).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            url: `${SITE_URL}/product/${product.urlKey}`,
          },
        })),
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MobileSearchBar />
      <section>
        <Suspense fallback={<FilterListSkeleton />}>
          <CategoryDetail
            categoryItem={{ description: translation?.description ?? "", name: translation?.name ?? "" }}

          />
        </Suspense>
        <div className="my-10 hidden gap-4 md:flex md:items-baseline md:justify-between w-full max-w-screen-2xl mx-auto px-4">
          <FilterList filterAttributes={filterAttributes} />
          <SortOrder sortOrders={SortByFields} title="Ordenar por" />
        </div>
        <div className="flex items-center justify-between gap-4 py-8 md:hidden w-full max-w-screen-2xl mx-auto px-4">
          <MobileFilter filterAttributes={filterAttributes} />
          <SortOrder sortOrders={SortByFields} title="Ordenar por" />
        </div>

        {isArray(products) && products.length > 0 ? (
          <Grid className="grid-cols-2 lg:grid-cols-4 gap-5 md:gap-11.5 w-full max-w-screen-2xl mx-auto px-4"
          >
            <ProductGridItems products={products} />
          </Grid>
        ) : (
          <div className="px-4">
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-neutral-300">
              <p className="text-neutral-500">No se encontraron productos en esta categoría.</p>
            </div>
          </div>
        )}

        {isArray(products) && (totalCount > itemsPerPage || pageInfo?.hasNextPage) && (
          <nav
            aria-label="Paginación de colección"
            className="my-10 block items-center sm:flex"
          >
            <Pagination
              itemsPerPage={itemsPerPage}
              itemsTotal={totalCount || 0}
              currentPage={currentPage}
              nextCursor={pageInfo?.endCursor}
              prevCursor={pageInfo?.startCursor}
            />
          </nav>
        )}
      </section>
    </>
  );
}
