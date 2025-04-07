export const PRODUCT_CARD_INFO = 
`
{
  id
  handle
  title
  productType
  featuredImage {
    id
    url
  }
  images(first: 5) {
    edges {
      node {
        id
        url
      }
    }
  }
  variantsCount {
    count
  }
  variants(first: 1) {
    edges {
      node {
        id
        title
        price {
          amount
        }
        compareAtPrice {
          amount
        }
        image {
          id
          url
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
  rating: metafield(key: "rating", namespace: "reviews") {
    id
    key
    namespace
    value
  }
  productLabel1: metafield(key: "product_label_1", namespace: "custom") {
    id
    key
    namespace
    value
  }
  productLabel2: metafield(key: "product_label_2", namespace: "custom") {
    id
    key
    namespace
    value
  }
  subtitle: metafield(key: "subtitle", namespace: "descriptors") {
    id
    key
    namespace
    value
  }
  reviews: metafield(key: "rating_count", namespace: "reviews") {
    id
    key
    namespace
    value
  }
  offers1: metafield(key: "pd_page_offer_1", namespace: "custom") {
    id
    references(first: 10) {
      nodes {
        ... on Metaobject {
          fields {
            key
            value
          }
        }
      }
    }
  }
  offers2: metafield(key: "pd_page_offer_2", namespace: "custom") {
    id
    references(first: 10) {
      nodes {
        ... on Metaobject {
          fields {
            key
            value
          }
        }
      }
    }
  }
  offers3: metafield(key: "pd_page_offer_3", namespace: "custom") {
    id
    references(first: 10) {
      nodes {
        ... on Metaobject {
          fields {
            key
            value
          }
        }
      }
    }
  }
  text_benefits_title: metafield(key: "key_benefits_heading", namespace: "custom") {
    id
    value
  }
  text_benefits_body: metafield(key: "key_benefits", namespace: "custom") {
    id
    value
  }
  benefits_url_1: metafield(key: "test_benefit_url", namespace: "my_fields") {
    id
    value
  } 
  benefits_url_2: metafield(key: "after_atc_benefit2_url", namespace: "my_fields") {
    id
    value
  }
  benefits_url_3: metafield(key: "after_atc_benefit3_url", namespace: "my_fields") {
    id
    value
  }
  ingredients_url_1: metafield(key: "ingredients1_url", namespace: "my_fields") {
    id
    value
  }
  ingredients_url_2: metafield(key: "ingredients2_url", namespace: "my_fields") {
    id
    value
  }
  ingredients_url_3: metafield(key: "ingredients3_url", namespace: "my_fields") {
    id
    value
  }
}
`;

export const VARIANT_INFO = `
{
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
      }
      compareAtPrice {
        amount
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
`;

