import { gql } from "@apollo/client";
import { ProductFields } from "../product/product";

// Apptile Connector
import { cheaplyGetShopifyQueryRunner } from "../../../../extractedQueries/selectors";
import { PRODUCT_QUERY } from '../../../../extractedQueries/pdpquery';


export const SEARCH_PRODUCTS_QUERY = gql`
  ${ProductFields}
  query searchProducts(
    $query: String!
    $first: Int
    $after: String
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $types: [SearchType!]
    $unavailableProducts: SearchUnavailableProductsType
  ) {
    search(
      query: $query
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
      types: $types
      unavailableProducts: $unavailableProducts
    ) {
      nodes {
        ... on Product {
          ...ProductFields
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      productFilters {
        id
        label
        type
        values {
          count
          id
          input
          label
        }
      }
      totalCount
    }
  }
`;

export async function fetchSearchProducts({
  query,
  first = 20,
  after = null,
  sortKey = 'RELEVANCE',
  reverse = false,
  types = ['PRODUCT'],
  unavailableProducts = 'SHOW',
  revalidateCaches = false,
}) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }

  const variables = {
    query,
    first,
    after,
    sortKey,
    reverse,
    types,
    unavailableProducts,
  };

  const response = await queryRunner.runQuery(
    'query',
    SEARCH_PRODUCTS_QUERY,
    variables,
    {
      cachePolicy: revalidateCaches ? 'network-only' : 'cache-first',
    }
  );

  const searchResult = response?.data?.search || {};
  const products = searchResult.nodes || [];
  const pageInfo = searchResult.pageInfo || {};

  for (const product of products) {
    if (product?.handle) {
      queryRunner.writeQuery({
        query: PRODUCT_QUERY,
        variables: { productHandle: product.handle },
        data: { product },
      });
    }
  }

  return {
    data: {
      products,
      pagination: {
        startCursor: pageInfo.startCursor,
        endCursor: pageInfo.endCursor,
        hasNextPage: pageInfo.hasNextPage,
        hasPreviousPage: pageInfo.hasPreviousPage,
      },
      filters: searchResult.productFilters || [],
      totalCount: searchResult.totalCount || 0,
    },
  };
}
