import dynamicImport from "next/dynamic";
import Grid from "@/components/theme/ui/grid/Grid";
import NotFound from "@/components/theme/search/not-found";
import { isArray } from "@/utils/type-guards";
import {
    GET_FILTER_OPTIONS,
    GET_FILTER_GALLERY_PRODUCTS,
    graphqlRequest,
} from "@/graphql";
import { GET_GALLERY_PRODUCTS, GET_PRODUCTS_PAGINATION } from "@/graphql";
import { generateMetadataForPage } from "@/utils/helper";
import SortOrder from "@/components/theme/filters/SortOrder";
import { SortByFields } from "@/utils/constants";
import MobileFilter from "@/components/theme/filters/MobileFilter";
import FilterList from "@/components/theme/filters/FilterList";
import {
    ProductFilterAttributeResponse,
    ProductsResponse,
} from "@/components/catalog/type";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";
import { Metadata } from "next";

const Pagination = dynamicImport(
    () => import("@/components/catalog/Pagination")
);
const GalleryGridItems = dynamicImport(
    () => import("@/components/catalog/product/GalleryGridItems")
);

export const dynamicParams = true;

export async function generateMetadata(): Promise<Metadata> {
    const title = "Todos los Productos | Confecciones Tarifa";
    const description = "Explora todas las variantes de nuestros productos artesanales para carnaval chapaco. Cada color, talla y estilo disponible en un solo lugar.";

    return generateMetadataForPage("gallery", {
        title,
        description,
        image: "https://api.confecciones-tarifa.shop/storage/category/1/jgW0olTwFiotffFxW5ktpp6TY8JgVBZs92PYPcrD.webp",
        canonical: "/gallery",
    });
}

export default async function GalleryPage({
    searchParams,
}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const {
        q: searchValue,
        page,
        cursor,
        before,
    } = (params || {}) as {
        [key: string]: string;
    };

    const itemsPerPage = 12;
    const currentPage = page ? parseInt(page) - 1 : 0;
    const sortValue = params?.sort || "name-asc";
    const selectedSort =
        SortByFields.find((s) => s.key === sortValue) || SortByFields[0];
    const afterCursor: string | undefined = cursor;
    const beforeCursor: string | undefined = before;
    const rawColor = params?.color;
    const rawSize = params?.size;
    const rawBrand = params?.fabric_type;

    const colorFilter =
        typeof rawColor === "string"
            ? rawColor.split(",")
            : Array.isArray(rawColor)
                ? rawColor
                : [];
    const sizeFilter =
        typeof rawSize === "string"
            ? rawSize.split(",")
            : Array.isArray(rawSize)
                ? rawSize
                : [];

    const brandFilter =
        typeof rawBrand === "string"
            ? rawBrand.split(",")
            : Array.isArray(rawBrand)
                ? rawBrand
                : [];

    const extractId = (value: string) => {
        if (/^\d+$/.test(value)) return value;

        const match = value.match(/\/(\d+)$/);
        return match ? match[1] : null;
    };
    const colorIds = colorFilter
        .map(extractId)
        .filter((id): id is string => Boolean(id));

    const sizeIds = sizeFilter
        .map(extractId)
        .filter((id): id is string => Boolean(id));

    const brandIds = brandFilter
        .map(extractId)
        .filter((id): id is string => Boolean(id));

    const filterObject: Record<string, string> = {};

    if (colorIds.length > 0) filterObject.color = colorIds.join(",");
    if (sizeIds.length > 0) filterObject.size = sizeIds.join(",");
    if (brandIds.length > 0) filterObject.fabric_type = brandIds.join(",");
    const isFilterApplied = Object.keys(filterObject).length > 0;
    const filterInput = isFilterApplied
        ? JSON.stringify(filterObject)
        : undefined;

    let dataPromise;
    if (isFilterApplied) {
        dataPromise = graphqlRequest<ProductsResponse>(GET_FILTER_GALLERY_PRODUCTS, {
            query: searchValue,
            filter: filterInput,
            ...(beforeCursor
                ? { last: itemsPerPage, before: beforeCursor }
                : { first: itemsPerPage, after: afterCursor }),
            sortKey: selectedSort.sortKey,
            reverse: selectedSort.reverse,
        });
    } else {
        dataPromise = (async () => {
            let currentAfterCursor = afterCursor;
            if (currentPage > 0 && !afterCursor) {
                const cursorData = await graphqlRequest<ProductsResponse>(
                    GET_PRODUCTS_PAGINATION,
                    {
                        query: searchValue,
                        first: currentPage * itemsPerPage,
                        sortKey: selectedSort.sortKey,
                        reverse: selectedSort.reverse,
                    }
                );
                currentAfterCursor = cursorData?.products?.pageInfo?.endCursor;
            }

            return graphqlRequest<ProductsResponse>(GET_GALLERY_PRODUCTS, {
                query: searchValue,
                ...(beforeCursor
                    ? { last: itemsPerPage, before: beforeCursor }
                    : { first: itemsPerPage, after: currentAfterCursor }),
                sortKey: selectedSort.sortKey,
                reverse: selectedSort.reverse,
            });
        })();
    }

    const [data, colorFilterData, sizeFilterData, brandFilterData] = await Promise.all([
        dataPromise,
        graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, {
            id: "/api/admin/attributes/23",
            locale: "en",
        }),
        graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, {
            id: "/api/admin/attributes/24",
            locale: "en",
        }),
        graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, {
            id: "/api/admin/attributes/29",
            locale: "en",
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
            adminName: attr?.adminName?.toUpperCase() || attr.code.toUpperCase(),
            options: attr.options.edges.map((o) => ({
                id: o.node.id,
                adminName: o.node.adminName,
            })),
        }));

    const products = data?.products?.edges?.map((e) => e.node) || [];
    const pageInfo = data?.products?.pageInfo;
    const totalCount = data?.products?.totalCount;

    return (
        <>
            <MobileSearchBar />
            <h2 className="text-2xl sm:text-4xl font-semibold w-full max-w-screen-2xl mt-7.5 mb-3 mx-auto px-4 xss:px-7.5">
                Todos los productos
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 w-full max-w-screen-2xl mb-6 mx-auto px-4 xss:px-7.5">
                Explora cada uno de nuestros productos: todos los colores, tallas y estilos disponibles
            </p>

            <div className="my-10 hidden gap-4 md:flex md:items-baseline md:justify-between w-full mx-auto max-w-screen-2xl px-4 xss:px-7.5">
                <FilterList filterAttributes={filterAttributes} />

                <SortOrder sortOrders={SortByFields} title="Sort by" />
            </div>
            <div className="flex items-center justify-between gap-4 py-8 md:hidden  mx-auto w-full max-w-screen-2xl px-4 xss:px-7.5">
                <MobileFilter filterAttributes={filterAttributes} />

                <SortOrder sortOrders={SortByFields} title="Sort by" />
            </div>

            {!isArray(products) && (
                <NotFound
                    msg={`${searchValue
                        ? `No hay productos que coincidan con: ${searchValue}`
                        : "No hay productos disponibles"
                        } `}
                />
            )}
            {isArray(products) ? (
                <Grid
                    className="grid grid-flow-row grid-cols-2 gap-5 md:gap-11.5 w-full max-w-screen-2xl mx-auto md:grid-cols-3 lg:grid-cols-4 px-4 xss:px-7.5"
                >
                    <GalleryGridItems
                        products={products}
                        appliedFilters={{
                            colorIds,
                            sizeIds,
                            brandIds
                        }}
                    />
                </Grid>
            ) : null}

            {!isFilterApplied && isArray(products) && totalCount > itemsPerPage && (
                <nav
                    aria-label="Collection pagination"
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

            {isFilterApplied && isArray(products) && pageInfo?.hasNextPage && (
                <nav
                    aria-label="Filtered pagination"
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
        </>
    );
}
