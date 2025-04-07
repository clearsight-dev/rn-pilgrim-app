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
    key
    namespace
    value
  }
  productLabel1: metafield(key: "product_label_1", namespace: "custom") {
    key
    namespace
    value
  }
  productLabel2: metafield(key: "product_label_2", namespace: "custom") {
    key
    namespace
    value
  }
  subtitle: metafield(key: "subtitle", namespace: "descriptors") {
    key
    namespace
    value
  }
  reviews: metafield(key: "rating_count", namespace: "reviews") {
    key
    namespace
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

