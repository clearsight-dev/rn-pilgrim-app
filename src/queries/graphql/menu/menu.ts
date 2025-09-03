import { gql } from "@apollo/client";

// [Apptile Connectors]
import { cheaplyGetShopifyQueryRunner } from "../../../../extractedQueries/selectors";

export const GET_MENU = gql`
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      id
      title
      handle
      itemsCount
      items {
        id
        title
        type
        url
        tags
        resourceId
        resource {
          ... on Collection {
            id
            handle
          }
          ... on Product {
            id
            handle
          }
        }
        items {
          id
          title
          type
          url
          tags
          resourceId
          resource {
            ... on Collection {
              id
              handle
            }
            ... on Product {
              id
              handle
            }
          }
          items {
            id
            title
            type
            url
            tags
            resourceId
            resource {
              ... on Collection {
                id
                handle
              }
              ... on Product {
                id
                handle
              }
              ... on Page {
                id
                handle
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchMenu({
  handle,
  revalidateCaches = false,
}: {
  handle: string;
  revalidateCaches?: boolean;
}) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();

  if (!queryRunner) {
    throw new Error("Query runner not available");
  }

  const variables = { handle };

  const response = await queryRunner.runQuery("query", GET_MENU, variables, {
    cachePolicy: revalidateCaches ? "network-only" : "network-only",
  });

  const menu = response?.data?.menu || null;

  return {
    data: menu,
  };
}
