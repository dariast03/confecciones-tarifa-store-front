import { NextResponse } from "next/server";
import { graphqlRequest, GET_PRODUCTS } from "@/graphql";
import { ProductsResponse } from "@/components/catalog/type";

export async function GET() {
  try {
    // Fetch up to 100 products
    const data = await graphqlRequest<ProductsResponse>(GET_PRODUCTS, {
      first: 100,
      sortKey: "CREATED_AT",
      reverse: true,
    });

    const products = data?.products?.edges?.map((e) => e.node) || [];

    return NextResponse.json({
      products,
      total: data?.products?.totalCount || 0,
    });
  } catch (error) {
    console.error("Error fetching products for catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
