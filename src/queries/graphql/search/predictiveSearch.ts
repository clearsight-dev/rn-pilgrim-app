import { gql } from "@apollo/client";
import { cheaplyGetShopifyQueryRunner } from "../../../../extractedQueries/selectors";

export const GET_SEARCH_SUGGESTIONS = gql`
  query getSearchSuggestions(
    $query: String!
    $limit: Int
    $limitScope: PredictiveSearchLimitScope
    $searchableFields: [SearchableField!]
    $types: [PredictiveSearchType!]
    $unavailableProducts: SearchUnavailableProductsType
  ) {
    predictiveSearch(
      query: $query
      limit: $limit
      limitScope: $limitScope
      searchableFields: $searchableFields
      unavailableProducts: $unavailableProducts
      types: $types
    ) {
      queries {
        text
      }
      products {
        id
        handle
        title
        featuredImage {
          id
          height
          width
          altText
          url
        }
      }
    }
  }
`;

export async function fetchSearchSuggestions({
  query,
  limit = 10,
  limitScope = "ALL",
  searchableFields = [],
  types = ["QUERY"],
  unavailableProducts = "SHOW",
  revalidateCaches = false,
}) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }

  const variables = {
    query,
    limit,
    limitScope,
    searchableFields,
    types,
    unavailableProducts,
  };

  const response = await queryRunner.runQuery(
    "query",
    GET_SEARCH_SUGGESTIONS,
    variables,
    {
      cachePolicy: revalidateCaches ? "network-only" : "cache-first",
    }
  );

  const predictiveSearch = response?.data?.predictiveSearch || {};
  const queries = predictiveSearch.queries || [];
  const products = predictiveSearch.products || [];

  return {
    data: {
      suggestions: queries,
      products,
    },
  };
}
