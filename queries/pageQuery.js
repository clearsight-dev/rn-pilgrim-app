import gql from 'graphql-tag';
import { cheaplyGetShopifyQueryRunner } from '../extractedQueries/selectors';

// GraphQL query without fragments - all selections inline
export const PAGE_QUERY = gql`
  query GetPage($handle: String, $pageMetafields: [HasMetafieldsIdentifier!]!) {
    page(handle: $handle) {
      id
      handle
      title
      metafields(identifiers: $pageMetafields) {
        id
        type
        value
        namespace
        key
        references(first: 250) {
          nodes {
            ... on Product {
              id
              handle
              featuredImage {
                url
                altText
                id
                width
                height
              }
            }
            ... on Collection {
              id
              handle
              image {
                url
                height
                width
                id
                altText
              }
            }
            ... on GenericFile {
              id
              previewImage {
                url
              }
              url
            }
            ... on MediaImage {
              id
              image {
                url
              }
              previewImage {
                url
              }
            }
            ... on Metaobject {
              id
              type
              fields {
                key
                type
                value
                reference {
                  ... on Product {
                    id
                    handle
                    featuredImage {
                      url
                      altText
                      id
                      width
                      height
                    }
                  }
                  ... on Collection {
                    id
                    handle
                    image {
                      url
                      height
                      width
                      id
                      altText
                    }
                  }
                  ... on GenericFile {
                    id
                    previewImage {
                      url
                    }
                    url
                  }
                  ... on MediaImage {
                    id
                    image {
                      url
                    }
                    previewImage {
                      url
                    }
                  }
                }
              }
            }
          }
        }
        reference {
          ... on Product {
            id
            handle
            featuredImage {
              url
              altText
              id
              width
              height
            }
          }
          ... on Collection {
            id
            handle
            image {
              url
              height
              width
              id
              altText
            }
          }
          ... on GenericFile {
            id
            previewImage {
              url
            }
            url
          }
          ... on MediaImage {
            id
            image {
              url
            }
            previewImage {
              url
            }
          }
          ... on Metaobject {
            id
            type
            fields {
              key
              type
              value
              reference {
                ... on Product {
                  id
                  handle
                  featuredImage {
                    url
                    altText
                    id
                    width
                    height
                  }
                }
                ... on Collection {
                  id
                  handle
                  image {
                    url
                    height
                    width
                    id
                    altText
                  }
                }
                ... on GenericFile {
                  id
                  previewImage {
                    url
                  }
                  url
                }
                ... on MediaImage {
                  id
                  image {
                    url
                  }
                  previewImage {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches page data using the provided handle and metafield identifiers
 * 
 * @param {string} pageHandle - The handle of the page to fetch
 * @param {Array<{key: string, namespace: string}>} pageMetafields - Array of metafield identifiers to fetch
 * @param {boolean} revalidateCaches - Whether to bypass the cache and fetch fresh data
 * @returns {Promise<Object>} - The page data with the requested metafields
 */
export async function fetchPageData(pageHandle, pageMetafields, revalidateCaches = false) {
  // Get the query runner
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  try {
    // Execute the query with the provided variables
    const result = await queryRunner.runQuery(
      'query',
      PAGE_QUERY,
      {
        handle: pageHandle,
        pageMetafields: pageMetafields
      },
      {
        cachePolicy: revalidateCaches ? 'network-only' : 'cache-first'
      }
    );
    
    // Return the page data
    return {
      data: {
        page: result.data.page
      }
    };
  } catch (error) {
    console.error(`Error fetching page data for handle "${pageHandle}":`, error);
    throw error;
  }
}