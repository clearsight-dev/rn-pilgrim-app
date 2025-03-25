import gql from 'graphql-tag';

// Function to fetch collection data using the GraphQL query with pagination support
export const fetchCollectionData = async (queryRunner, collectionHandle, first = 50, afterCursor = null, sortKey = 'BEST_SELLING', reverse = false, filters = []) => {
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  // Modify the query to include pagination parameters, sorting and filters
  const COLLECTION_PRODUCTS_QUERY = gql`
    query CollectionProducts($handle: String, $identifiers: [HasMetafieldsIdentifier!]!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
      collection(handle: $handle) {
        handle
        title
        products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          filters {
            label
            id
            presentation
            type
            values {
              id
              label
              image {
                image {
                  url
                }
              }
            }
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
    COLLECTION_PRODUCTS_QUERY,
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
      after: afterCursor,
      sortKey: sortKey,
      reverse: reverse,
      filters: filters
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

// Function to fetch only the count of products matching specific filters
export const fetchFilteredProductsCount = async (queryRunner, collectionHandle, filters = []) => {
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  // Query to fetch only handles for counting
  const FILTERED_PRODUCTS_COUNT_QUERY = gql`
    query FilteredProductsCount($handle: String, $filters: [ProductFilter!], $first: Int!) {
      collection(handle: $handle) {
        products(filters: $filters, first: $first) {
          edges {
            node {
              handle
            }
          }
        }
      }
    }
  `;
  
  try {
    const data = await queryRunner.runQuery(
      'query',
      FILTERED_PRODUCTS_COUNT_QUERY,
      {
        handle: collectionHandle,
        filters: filters,
        first: 100 // Fetch up to 100 products to get an accurate count
      },
      {
        cachePolicy: 'cache-first'
      }
    );
    
    // Get the count of products
    const products = data.data.collection?.products?.edges || [];
    const count = products.length;
    
    return {
      count: count,
      isMaxCount: count === 100 // If we got 100 products, there might be more
    };
  } catch (error) {
    console.error('Error fetching filtered products count:', error);
    return {
      count: 0,
      isMaxCount: false
    };
  }
}
