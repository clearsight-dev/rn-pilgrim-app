import gql from 'graphql-tag';
import {PRODUCT_CARD_INFO} from './commonGraphqlInfo';
import { cheaplyGetShopifyQueryRunner } from './selectors';
import {VARIANT_INFO} from './commonGraphqlInfo';
import { PRODUCT_QUERY } from './pdpquery';
// Function to fetch collection data for the carousel component
export async function fetchCollectionCarouselData(collectionHandle) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  // Query to fetch collection data with filters
  const COLLECTION_FILTERS_QUERY = gql`
    query CollectionFilters($handle: String) {
      collection(handle: $handle) {
        id
        handle
        title
        image {
          id
          url
        }
        products(first: 1) {
          filters {
            id
            label
            type
            values {
              id
              label
            }
            presentation
          }
        }
      }
    }
  `;
  
  try {
    // First, fetch the collection data with filters
    const collectionData = await queryRunner.runQuery(
      'query',
      COLLECTION_FILTERS_QUERY,
      {
        handle: collectionHandle
      },
      {
        cachePolicy: 'cache-first'
      }
    );
    
    // Extract the filters from the response
    const filters = collectionData.data.collection?.products?.filters || [];
    
    // Find the category filter (for tabs)
    const categoryFilter = filters.find(filter => 
      filter.label && filter.label.toLowerCase().includes('category') && 
      !filter.label.toLowerCase().includes('subcategory')
    );
    
    // Find the subcategory filter (for category cards)
    const subcategoryFilter = filters.find(filter => 
      filter.label && filter.label.toLowerCase().includes('subcategory')
    );
    
    // If no subcategory filter found, return basic collection data
    if (!subcategoryFilter) {
      return {
        collection: collectionData.data.collection,
        tabs: categoryFilter ? categoryFilter.values.map(v => v.label) : [],
        categories: []
      };
    }
    
    // For each subcategory, fetch the first product's image
    const subcategoryProducts = await Promise.all(
      subcategoryFilter.values.map(async (subcategory) => {
        // Query to fetch the first product in this subcategory
        const SUBCATEGORY_PRODUCT_QUERY = gql`
          query SubcategoryProduct($handle: String, $filters: [ProductFilter!]) {
            collection(handle: $handle) {
              id
              products(first: 1, filters: $filters) {
                nodes {
                  id
                  handle
                  featuredImage {
                    id
                    url
                  }
                  title
                }
              }
            }
          }
        `;
        
        // Create filter for this subcategory
        const filters = [
          {
            productMetafield: {
              key: "l2_subcategory",
              namespace: "custom",
              value: subcategory.label
            }
          }
        ];
        
        // Fetch the first product in this subcategory
        const productData = await queryRunner.runQuery(
          'query',
          SUBCATEGORY_PRODUCT_QUERY,
          {
            handle: collectionHandle,
            filters: filters
          },
          {
            cachePolicy: 'cache-first'
          }
        );
        
        // Get the product image URL
        const product = productData.data.collection?.products?.nodes?.[0];
        const imageUrl = product?.featuredImage?.url || '';
        
        // Return the subcategory with its image
        return {
          id: subcategory.id,
          title: subcategory.label,
          image: imageUrl
        };
      })
    );
    
    // Return the formatted collection data
    return {
      collection: collectionData.data.collection,
      tabs: categoryFilter ? categoryFilter.values.map(v => v.label) : [],
      categories: subcategoryProducts
    };
  } catch (error) {
    console.error('Error fetching collection carousel data:', error);
    throw error;
  }
};

export const COLLECTION_PRODUCTS_QUERY = gql`
query CollectionProducts($handle: String, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
  collection(handle: $handle) {
    id
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
            id
            image {
              id
              url
            }
          }
        }
      }
      edges {
        node ${PRODUCT_CARD_INFO}
        cursor
      }
    }
  }
}
`;

// Function to fetch collection data using the GraphQL query with pagination support
export async function fetchCollectionData(collectionHandle, first = 50, afterCursor = null, sortKey = 'BEST_SELLING', reverse = false, filters = []) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  const data = await queryRunner.runQuery(
    'query',
    COLLECTION_PRODUCTS_QUERY,
    {
      handle: collectionHandle,
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

  for (let i = 0; i < products.length; ++i) {
    const product = products[i].node;
    queryRunner.writeQuery({
      query: PRODUCT_QUERY,
      variables: { productHandle: product.handle },
      data: {
        product
      }
    })
  }
  
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

export const OPTIONS_QUERY = gql`
query GetOptionsForProduct($handle: String, $numVariants: Int!) {
  product(handle: $handle) {
    id
    handle
    options {
      id
      name
      optionValues {
        id
        name
        swatch {
          color
        }
      }
    }
    variants(first: $numVariants) {
      edges {
        node {
          id
          title
          image {
            id
            url
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          weight
          weightUnit
          selectedOptions {
            name
            value
          }
          variantSubtitle: metafield(key: "variant_subtitle", namespace: "custom") {
            id
            key
            value
            namespace
          }
        }
      }
    }
  }
}
`;

export async function fetchProductOptions(handle, numVariants) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }

  const res = await queryRunner.runQuery(
    'query',
    OPTIONS_QUERY,
    {
      handle,
      numVariants
    },
    {
      cachePolicy: 'cache-first'
    }
  );
  
  return {
    options: res.data.product?.options,
    variants: res.data.product?.variants?.edges ?? []
  };
}

// Function to fetch product variant by selected options
export const fetchVariantBySelectedOptions = async (productHandle, selectedOptions) => {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  const VARIANT_BY_SELECTED_OPTIONS_QUERY = gql`
    query VariantBySelectedOptions($handle: String, $selectedOptions: [SelectedOptionInput!]!) {
      product(handle: $handle) {
        id
        variantBySelectedOptions(selectedOptions: $selectedOptions) ${VARIANT_INFO}
      }
    }
  `;
  
  try {
    const res = await queryRunner.runQuery(
      'query',
      VARIANT_BY_SELECTED_OPTIONS_QUERY,
      {
        handle: productHandle,
        selectedOptions: selectedOptions
      },
      {
        cachePolicy: 'cache-first'
      }
    );
    
    return {
      data: {
        variant: res.data.product?.variantBySelectedOptions
      }
    };
  } catch (error) {
    console.error('Error fetching variant by selected options:', error);
    throw error;
  }
};

// Function to fetch only the count of products matching specific filters
export async function fetchFilteredProductsCount(collectionHandle, filters = []) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  // Query to fetch only handles for counting
  const FILTERED_PRODUCTS_COUNT_QUERY = gql`
    query FilteredProductsCount($handle: String, $filters: [ProductFilter!], $first: Int!) {
      collection(handle: $handle) {
        id
        products(filters: $filters, first: $first) {
          edges {
            node {
              id
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
