import gql from 'graphql-tag';
import { cheaplyGetShopifyQueryRunner } from './selectors';
import {PRODUCT_CARD_INFO} from './commonGraphqlInfo';

export const PRODUCT_RECOMMENDATIONS = gql`
  query GetProductRecommendations(
    $productHandle: String!
  ) {
    relatedRecommendations: productRecommendations(productHandle: $productHandle, intent: RELATED) ${PRODUCT_CARD_INFO}
    complementaryRecommendations: productRecommendations(productHandle: $productHandle, intent: COMPLEMENTARY) ${PRODUCT_CARD_INFO}
  }
`;

export const PRODUCT_QUERY = gql`
  query GetProduct(
    $productHandle: String!
  ) {
    product(handle: $productHandle) ${PRODUCT_CARD_INFO}
  }
`;

export async function fetchProductDescriptionHtml(productHandle) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }

  const PRODUCT_HTML_QUERY = gql`
  query GetProductDescriptionHtml(
    $productHandle: String!
  ) {
    product(handle: $productHandle) {
      id
      descriptionHtml
      description
    }
  }
`;

  const data = await queryRunner.runQuery(
    'query',
    PRODUCT_HTML_QUERY,
    {
      productHandle
    },
    {
      cachePolicy: 'cache-first'
    }
  )

  return {
    valueHtml: data.data?.product?.descriptionHtml,
    valueText: data.data?.product?.description,
  };
}

// Function to fetch product data using the GraphQL query
export async function fetchProductData(productHandle) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  const data = await queryRunner.runQuery(
    'query',
    PRODUCT_QUERY,
    {
      productHandle: productHandle,
    },
    {
      cachePolicy: 'cache-first'
    }
  );
  
  return {
    productByHandle: data.data.product,
    // complementaryRecommendations: data.data.complementaryRecommendations,
    // relatedRecommendations: data.data.relatedRecommendations
  };
}

export async function fetchProductRecommendations(productHandle) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }

  const data = await queryRunner.runQuery(
    'query',
    PRODUCT_RECOMMENDATIONS,
    {
      productHandle: productHandle,
    },
    {
      cachePolicy: 'cache-first'
    }
  );

  for (let i = 0; i < data.data.complementaryRecommendations.length; ++i) {
    const product = data.data.complementaryRecommendations[i];
    queryRunner.writeQuery({
      query: PRODUCT_QUERY,
      variables: { productHandle: product.handle },
      data: {
        product
      }
    })
  }

  for (let i = 0; i < data.data.relatedRecommendations.length; ++i) {
    const product = data.data.relatedRecommendations[i];
    queryRunner.writeQuery({
      query: PRODUCT_QUERY,
      variables: { productHandle: product.handle },
      data: {
        product
      }
    })
  }

  return {
    complementaryRecommendations: data.data.complementaryRecommendations,
    relatedRecommendations: data.data.relatedRecommendations
  }
}