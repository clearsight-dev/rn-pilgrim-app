import gql from 'graphql-tag';

export const GET_METAOBJECT = gql`
  fragment referenceSCObj on MetafieldReference {
    ... on Collection {
      description
      descriptionHtml
      handle
      id
      onlineStoreUrl
      title
      trackingParameters
      updatedAt
    }
    ... on GenericFile {
      alt
      id
      mimeType
      originalFileSize
      url
    }
    ... on MediaImage {
      alt
      id
      mediaContentType
    }
    ... on Page {
      body
      bodySummary
      createdAt
      handle
      id
      onlineStoreUrl
      title
      trackingParameters
      updatedAt
    }
    ... on Product {
      availableForSale
      createdAt
      description
      descriptionHtml
      handle
      id
      isGiftCard
      onlineStoreUrl
      productType
      publishedAt
      requiresSellingPlan
      tags
      title
      totalInventory
      trackingParameters
      updatedAt
      vendor
    }
    ... on ProductVariant {
      availableForSale
      barcode
      currentlyNotInStock
      id
      quantityAvailable
      requiresShipping
      sku
      taxable
      title
      weight
      weightUnit
      product {
        id
        handle
        title
      }
      price {
        amount
        currencyCode
      }
    }
    ... on Video {
      alt
      id
      mediaContentType
    }
  }

  fragment referenceSCWithMetaobject on MetafieldReference {
    ...referenceSCObj
    ... on Metaobject {
      id
      type
      fields {
        key
        type
        value
        reference {
          ...referenceSCObj
          __typename
        }
        references(first: 250) {
          nodes {
            ...referenceSCObj
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }

  query fetchMetaobject($id: ID!) {
    metaobject(id: $id) {
      ... on Metaobject {
        id
        type
        fields {
          key
          type
          value
          references(first: 250) {
            nodes {
              ...referenceSCWithMetaobject
              __typename
            }
            __typename
          }
          reference {
            ...referenceSCWithMetaobject
            __typename
          }
          __typename
        }
        __typename
      }
    }
  }
`;
