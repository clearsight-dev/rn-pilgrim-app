import gql from 'graphql-tag';

const COLLECTION_PRODUCTS_QUERY = gql`
  query CollectionProducts($handle: String, $identifiers: [HasMetafieldsIdentifier!]!) {
    collection(handle: $handle) {
      handle
      title
      products(first: 50) {
        edges {
          node {
            handle
            featuredImage {
              url
            }
            description
            title
            priceRange {
              maxVariantPrice {
                amount
              }
              minVariantPrice {
                amount
              }
            }
            metafields(identifiers: $identifiers) {
              key
              value
            }
            compareAtPriceRange {
              maxVariantPrice {
                amount
              }
              minVariantPrice {
                amount
              }
            }
            availableForSale
          }
          cursor
        }
      }
    }
  }
`;

// Function to fetch collection data using the GraphQL query with pagination support
export const fetchCollectionData = async (queryRunner, collectionHandle, first = 50, afterCursor = null) => {
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  // Modify the query to include pagination parameters
  const paginationQuery = gql`
    query CollectionProducts($handle: String, $identifiers: [HasMetafieldsIdentifier!]!, $first: Int!, $after: String) {
      collection(handle: $handle) {
        handle
        title
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            node {
              handle
              featuredImage {
                url
              }
              description
              title
              priceRange {
                maxVariantPrice {
                  amount
                }
                minVariantPrice {
                  amount
                }
              }
              metafields(identifiers: $identifiers) {
                key
                value
              }
              compareAtPriceRange {
                maxVariantPrice {
                  amount
                }
                minVariantPrice {
                  amount
                }
              }
              availableForSale
            }
            cursor
          }
        }
      }
    }
  `;
  
  const data = await queryRunner.runQuery(
    'query',
    paginationQuery,
    {
      handle: collectionHandle,
      identifiers: [
        {
          key: "rating",
          namespace: "reviews"
        },
        {
          key: "product_label_1",
          namespace: "custom"
        },
        {
          key: "product_label_2",
          namespace: "custom"
        }
      ],
      first: first,
      after: afterCursor
    },
    {
      cachePolicy: 'cache-first'
    }
  );
  
  // Extract pagination information
  const products = data.data.collection?.products?.edges || [];
  const pageInfo = data.data.collection?.products?.pageInfo || {};
  
  // Get first and last cursor for pagination
  const firstCursor = products.length > 0 ? products[0].cursor : null;
  const lastCursor = products.length > 0 ? products[products.length - 1].cursor : null;
  
  return {
    data: {
      collection: data.data.collection,
      pagination: {
        hasNextPage: pageInfo.hasNextPage,
        hasPreviousPage: pageInfo.hasPreviousPage,
        firstCursor,
        lastCursor
      }
    }
  };
}
