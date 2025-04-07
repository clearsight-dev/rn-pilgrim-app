import gql from 'graphql-tag';

const CART_FRAGMENT = `#graphql
fragment Money on MoneyV2 {
    currencyCode
    amount
}
fragment CartLine on CartLine {
    id
    quantity
    attributes {
        key
        value
    }
    cost {
        subtotalAmount {
            ...Money
        }
        totalAmount {
            ...Money
        }
        amountPerQuantity {
            ...Money
        }
        compareAtAmountPerQuantity {
            ...Money
        }
    }
    discountAllocations {
        discountedAmount {
            ...Money
        }
    }
    sellingPlanAllocation {
        sellingPlan {
            id
            name
            recurringDeliveries
        }
        priceAdjustments {
            price {
                amount
                currencyCode
            }
            compareAtPrice {
                amount
                currencyCode
            }
            perDeliveryPrice {
                amount
                currencyCode
            }
        }
    }
    merchandise {
        ... on ProductVariant {
            id
            title
            currentlyNotInStock
            availableForSale
            compareAtPrice {
                ...Money
            }
            price {
                ...Money
            }
            unitPrice {
                ...Money
            }
            quantityAvailable
            weight
            weightUnit
            requiresShipping
            image {
                id
                url
                altText
                width
                height
            }
            product {
                id
                title
                handle
                vendor
                totalInventory
                collections(first: 100) {
                  nodes {
                    id
                    title
                    handle
                  }
                }
                compareAtPriceRange {
                    maxVariantPrice {
                        amount
                        currencyCode
                    }
                    minVariantPrice {
                        amount
                        currencyCode
                    }
                }
            }
            selectedOptions {
                name
                value
            }
        }
    }
}
fragment CartSchema on Cart {
    id
    createdAt
    updatedAt
    checkoutUrl
    note
    attributes {
        key
        value
    }
    discountCodes {
        code
        applicable
    }
    discountAllocations {
        discountedAmount {
            ...Money
        }
    }
    totalQuantity
    buyerIdentity {
        countryCode
        customer {
            id
            email
            firstName
            lastName
            displayName
        }
        email
        phone
    }
    lines(first: 250, reverse: true) {
        pageInfo {
            hasNextPage
            endCursor
            startCursor
            hasPreviousPage
        }
        edges {
            node {
                ...CartLine
            }
        }
    }
    cost {
        checkoutChargeAmount {
            ...Money
        }
        subtotalAmount {
            ...Money
        }
        subtotalAmountEstimated
        totalAmount {
            ...Money
        }
        totalAmountEstimated
        totalDutyAmount {
            ...Money
        }
        totalDutyAmountEstimated
        totalTaxAmount {
            ...Money
        }
        totalTaxAmountEstimated
    }
}
` as const;

export const GET_CART = gql`
  query GetShoppingCartDetails($cartId: ID!) {
    cart(id: $cartId) {
      ...CartSchema
    }
  }
  ${CART_FRAGMENT}
`;

export const CREATE_CART = gql`
  mutation cartCreate($input: CartInput, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD = gql`
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE = gql`
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE = gql`
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }

  ${CART_FRAGMENT}
`;

export const CART_DISCOUNT_CODE_UPDATE = gql`
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }

  ${CART_FRAGMENT}
`;

export const CART_GIFT_CARD_CODES_UPDATE = gql`
  mutation cartGiftCardCodesUpdate($cartId: ID!, $giftCardCodes: [String!]!) {
    cartGiftCardCodesUpdate(cartId: $cartId, giftCardCodes: $giftCardCodes) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }

  ${CART_FRAGMENT}
`;

export const CART_NOTE_UPDATE = gql`
  mutation cartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_BUYER_IDENTITY_UPDATE = gql`
  mutation cartBuyerIdentityUpdate($buyerIdentity: CartBuyerIdentityInput!, $cartId: ID!) {
    cartBuyerIdentityUpdate(buyerIdentity: $buyerIdentity, cartId: $cartId) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_ATTRIBUTES_UPDATE = gql`
  mutation cartAttributesUpdate($attributes: [AttributeInput!]!, $cartId: ID!) {
    cartAttributesUpdate(attributes: $attributes, cartId: $cartId) {
      cart {
        ...CartSchema
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
  ${CART_FRAGMENT}
`;

