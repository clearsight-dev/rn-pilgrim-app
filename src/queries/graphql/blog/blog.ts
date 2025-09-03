import {gql} from '@apollo/client';
import {cheaplyGetShopifyQueryRunner} from '../../../../extractedQueries/selectors';
import {ProductFields} from '../product/product';

export const GET_BLOG_ARTICLE = gql`
  ${ProductFields}

  query BlogByHandle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        handle
        title
        content
        contentHtml
        excerpt
        excerptHtml
        onlineStoreUrl
        publishedAt
        tags
        trackingParameters
        image {
          id
          altText
          height
          width
          url
        }
        metafield(
          key: "apptile_mobile_collection"
          namespace: "custom"
        ) {
          id
          key
          namespace
          type
          value
          reference {
            ... on Collection {
              id
              handle
              title
              image {
                id
                altText
                height
                width
                url
              }
              products(first: 10) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
                filters {
                  id
                  label
                  values {
                    id
                    input
                    label
                  }
                }
                nodes {
                  ...ProductFields
                }
              }
            }
          }
        }
      }
    }
  }
`;


export async function fetchBlogArticle({
  blogHandle,
  articleHandle,
  revalidateCaches = false,
}: {
  blogHandle: string;
  articleHandle: string;
  revalidateCaches?: boolean;
}) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();

  if (!queryRunner) {
    throw new Error('Query runner not available');
  }

  const variables = {blogHandle, articleHandle};

  const response = await queryRunner.runQuery(
    'query',
    GET_BLOG_ARTICLE,
    variables,
    {
      cachePolicy: revalidateCaches ? 'network-only' : 'network-only',
    },
  );

  const article = response?.data?.blog?.articleByHandle || null;

  return {
    data: article,
  };
}
