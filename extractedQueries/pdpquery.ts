import gql from 'graphql-tag';

const PRODUCT_QUERY = gql`
  query GetProduct(
    $productHandle: String!, 
    $productMetafields: [HasMetafieldsIdentifier!]!, 
    $variantMetafields: [HasMetafieldsIdentifier!]!, 
    $countryCode: CountryCode, 
    $languageCode: LanguageCode
  ) @inContext(country: $countryCode, language: $languageCode) {
    productByHandle(handle: $productHandle) {
      id
      handle
      title
      description
      descriptionHtml
      availableForSale
      totalInventory
      productType
      tags
      vendor
      options {
        id
        name
        values
      }
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            sku
            metafields(identifiers: $variantMetafields) {
              id
              key
              value
              namespace
            }
          }
        }
      }
      metafields(identifiers: $productMetafields) {
        id
        key
        value
        namespace
        description
        type
        reference {
          ... on Metaobject {
            id
            type
            fields {
              key
              type
              value
            }
          }
        }
        references(first: 250) {
          nodes {
            ... on Metaobject {
              id
              type
              fields {
                key
                type
                value
              }
            }
          }
        }
      }
    }
  }
`;

// Function to fetch product data using the GraphQL query
export const fetchProductData = async (queryRunner, productHandle) => {
  if (!queryRunner) {
    throw new Error("Query runner not available");
  }
  
  const data = await queryRunner.runQuery(
    'query',
    PRODUCT_QUERY,
    {
      productHandle: productHandle,
      productMetafields: [
        {key:'rating', namespace:'reviews'},
        {key:'rating_count', namespace:'reviews'},
        {key: 'key_benefits', namespace: 'custom'},
        {key: 'ingredients1_url', namespace: 'my_fields'},
        {key: 'ingredients2_url', namespace: 'my_fields'},
        {key: 'ingredients3_url', namespace: 'my_fields'},
        {key: 'how_to_use', namespace: 'my_fields'},
        {key: 'question1', namespace: 'my_fields'},
        {key: 'question2', namespace: 'my_fields'},
        {key: 'question3', namespace: 'my_fields'},
        {key: 'answer1', namespace: 'my_fields'},
        {key: 'answer2', namespace: 'my_fields'},
        {key: 'answer3', namespace: 'my_fields'},
        {key: 'test_benefit_url', namespace: 'my_fields'},
        {key: 'after_atc_benefit2_url', namespace: 'my_fields'},
        {key: 'after_atc_benefit3_url', namespace: 'my_fields'},
        {key: 'consumer_study_results_1', namespace: 'custom'},
        {key: 'consumer_study_results_2', namespace: 'custom'},
        {key: 'consumer_study_results_3', namespace: 'custom'},
        {key: 'consumer_study_results_foot_note', namespace: 'custom'}, 
        {key: 'product_label_1', namespace: 'custom'},
        {key: 'product_label_2', namespace: 'custom'},
        {key: 'pd_page_offer_1', namespace: 'custom'}, 
        {key: 'pd_page_offer_2', namespace: 'custom'},
        {key: 'pd_page_offer_3', namespace: 'custom'},
        {key:'featured_product_concern_based_kit_1_',namespace:'custom'}, 
        {key: "after_atc_single_line_text", namespace: "my_fields"}, 
        {key: 'subtitle', namespace: 'descriptors'},
        {key: 'key_benefits_heading', namespace: 'custom'},
        {key:'after_atc_benefit_heading', namespace:'custom'},
        {key:'ingredients_heading', namespace:'custom'},
        {key: 'product_label_3', namespace: 'custom'},
        {key: 'product_maximum_quantity', namespace: 'custom'},
        {key: 'hidden', namespace: 'seo'}
      ],
      variantMetafields: [
        { key: "variant_subtitle", namespace: "custom" },
        { key: "light_skin_tone_image_url", namespace: "custom" }
      ],
      countryCode: "US"
    },
    {
      cachePolicy: 'cache-first'
    }
  );
  return data;
}