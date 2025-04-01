import gql from 'graphql-tag';

const COLLECTION_QUERY = gql`
  query NewQuery($handle: String) {
    collection(handle: $handle) {
      id
      image {
        id
        url
      }
      handle
      products(first: 3) {
        edges {
          node {
            id
            images(first: 3) {
              nodes {
                id
                url
              }
            }
            tags
          }
        }
      }
    }
  }
`;

// Function to fetch collection data using the GraphQL query
export const fetchCollectionData = async (queryRunner, collectionHandle) => {
  if (!queryRunner) {
    throw new Error('Query runner not available');
  }

  const data = await queryRunner.runQuery(
    'query',
    COLLECTION_QUERY,
    {
      handle: collectionHandle,
    },
    {
      cachePolicy: 'cache-first',
    },
  );

  return {
    data: {
      collectionByHandle: data.data.collection,
    },
  };
};
