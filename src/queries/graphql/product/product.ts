import { gql } from "@apollo/client";

export const ProductFields = gql`
  fragment ProductFields on Product {
    id
    handle
    title
    productType
    availableForSale
    featuredImage {
      id
      url
    }
    images(first: 250) {
      edges {
        node {
          id
          url
          altText
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
            currencyCode
          }
          availableForSale
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            id
            url
            altText
          }
          weight
          weightUnit
          selectedOptions {
            name
            value
          }
          variantSubtitle: metafield(
            key: "variant_subtitle"
            namespace: "custom"
          ) {
            id
            key
            value
            namespace
          }
          no_skin_tone_image_url: metafield(
            key: "no_skin_tone_image_url"
            namespace: "custom"
          ) {
            id
            value
          }
          deep_skin_tone_image_url: metafield(
            key: "deep_skin_tone_image_url"
            namespace: "custom"
          ) {
            id
            value
          }
          medium_skin_tone_image_url: metafield(
            key: "medium_skin_tone_image_url"
            namespace: "custom"
          ) {
            id
            value
          }
          light_skin_tone_image_url: metafield(
            key: "light_skin_tone_image_url"
            namespace: "custom"
          ) {
            id
            value
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
    product_size: metafield(key: "product_size", namespace: "custom") {
      id
      value
    }
    product_short_title: metafield(
      key: "product_short_title"
      namespace: "custom"
    ) {
      id
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
    productLabel3: metafield(key: "product_label_3", namespace: "custom") {
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
    text_benefits_title: metafield(
      key: "key_benefits_heading"
      namespace: "custom"
    ) {
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
    benefits_url_2: metafield(
      key: "after_atc_benefit2_url"
      namespace: "my_fields"
    ) {
      id
      value
    }
    benefits_url_3: metafield(
      key: "after_atc_benefit3_url"
      namespace: "my_fields"
    ) {
      id
      value
    }
    ingredients_url_1: metafield(
      key: "ingredients1_url"
      namespace: "my_fields"
    ) {
      id
      value
    }
    ingredients_url_2: metafield(
      key: "ingredients2_url"
      namespace: "my_fields"
    ) {
      id
      value
    }
    ingredients_url_3: metafield(
      key: "ingredients3_url"
      namespace: "my_fields"
    ) {
      id
      value
    }
    how_to_use: metafield(key: "how_to_use", namespace: "my_fields") {
      id
      value
    }
    consumer_study_results_1: metafield(
      key: "consumer_study_results_1"
      namespace: "custom"
    ) {
      id
      value
    }
    consumer_study_results_2: metafield(
      key: "consumer_study_results_2"
      namespace: "custom"
    ) {
      id
      value
    }
    consumer_study_results_3: metafield(
      key: "consumer_study_results_3"
      namespace: "custom"
    ) {
      id
      value
    }
    questions: metafields(
      identifiers: [
        { key: "question1", namespace: "my_fields" }
        { key: "question2", namespace: "my_fields" }
        { key: "question3", namespace: "my_fields" }
        { key: "question4", namespace: "my_fields" }
        { key: "question5", namespace: "my_fields" }
        { key: "question6", namespace: "my_fields" }
        { key: "question7", namespace: "my_fields" }
        { key: "question8", namespace: "my_fields" }
        { key: "question9", namespace: "my_fields" }
        { key: "question10", namespace: "my_fields" }
      ]
    ) {
      id
      value
    }
    answers: metafields(
      identifiers: [
        { key: "answer1", namespace: "my_fields" }
        { key: "answer2", namespace: "my_fields" }
        { key: "answer3", namespace: "my_fields" }
        { key: "answer4", namespace: "my_fields" }
        { key: "answer5", namespace: "my_fields" }
        { key: "answer6", namespace: "my_fields" }
        { key: "answer7", namespace: "my_fields" }
        { key: "answer8", namespace: "my_fields" }
        { key: "answer9", namespace: "my_fields" }
        { key: "answer10", namespace: "my_fields" }
      ]
    ) {
      id
      value
    }
  }
`;
