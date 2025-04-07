import _ from 'lodash';
import {queryDetails} from '../source/widget';
import * as CartGqls from '../queries';
import * as CartTransformer from '../transformers';
import {getAppConstants} from 'apptile-core';

const apptileCheckoutAttribute = getAppConstants()
  .APPTILE_CHECKOUT_CUSTOM_ATTRIBUTE as string;
export const CartQueryRecords: Record<string, queryDetails> = {
  GetCart: {
    queryType: 'query',
    gqlTag: CartGqls.GET_CART,
    transformer: CartTransformer.TransformCartPayload,
    editableInputParams: {
      cartId: '',
    },
    checkInputVariabes: (inputVariables: Record<string, any>) => {
      const {cartId} = inputVariables;
      return !!cartId;
    },
  },
  CreateCart: {
    queryType: 'mutation',
    gqlTag: CartGqls.CREATE_CART,
    editableInputParams: {
      attributes: '{{[]}}',
      buyerIdentity: '{{{}}}',
      discountCodes: '{{[]}}',
      lines: '{{[]}}',
      metafields: '{{[]}}',
      note: '<your-note>',
      customerAccessToken: '',
    },
    transformer: CartTransformer.TransformCartMutations, //! Need to refactor this
    inputResolver: inputVariables => {
      const {attributes, buyerIdentity, customerAccessToken, ...restOfInput} =
        inputVariables;

      return {
        input: {
          ...restOfInput,
          attributes: [
            ...(attributes ?? []),
            {
              key: 'source_name',
              value: apptileCheckoutAttribute,
            },
          ],
          buyerIdentity: {
            ...(buyerIdentity ?? {}),
            customerAccessToken,
          },
        },
      };
    },
  },
  CartLinesAdd: {
    queryType: 'mutation',
    gqlTag: CartGqls.CART_LINES_ADD,
    transformer: CartTransformer.TransformCartMutations,
    editableInputParams: {
      cartId: '',
      lines: '{{[]}}',
    },
    inputResolver: inputVariables => {
      const {cartId, lines} = inputVariables;
      return {
        cartId,
        lines: lines.map(line => {
          return {
            attributes: line.attributes,
            quantity: line.quantity,
            merchandiseId: line.merchandiseId,
            sellingPlanId: line.sellingPlanId,
          };
        }),
      };
    },
  },
  CartLinesUpdate: {
    queryType: 'mutation',
    gqlTag: CartGqls.CART_LINES_UPDATE,
    transformer: CartTransformer.TransformCartMutations,
    editableInputParams: {
      cartId: '',
      lines: '{{[]}}',
    },
    inputResolver: inputVariables => {
      const {cartId, lines} = inputVariables;
      return {
        cartId,
        lines: lines.map(line => {
          return {
            id: line.id,
            attributes: line.attributes,
            quantity: line.quantity,
            merchandiseId: line.merchandiseId,
            sellingPlanId: line.sellingPlanId,
          };
        }),
      };
    },
  },
  CartLinesRemove: {
    queryType: 'mutation',
    gqlTag: CartGqls.CART_LINES_REMOVE,
    transformer: CartTransformer.TransformCartMutations,
    editableInputParams: {
      cartId: '',
      lineIds: '{{[]}}',
    },
    inputResolver: inputVariables => {
      const {cartId, lineIds} = inputVariables;
      return {
        cartId,
        lineIds,
      };
    },
  },
  CartDiscountUpdate: {
    queryType: 'mutation',
    gqlTag: CartGqls.CART_DISCOUNT_CODE_UPDATE,
    editableInputParams: {
      cartId: '',
      discountCodes: '{{[]}}',
    },
    transformer: CartTransformer.TransformCartMutations,
    inputResolver: inputVariables => {
      const {cartId, discountCodes} = inputVariables;
      return {
        cartId,
        discountCodes,
      };
    },
  },
  CartGiftCartUpdate: {
    queryType: 'mutation',
    gqlTag: CartGqls.CART_GIFT_CARD_CODES_UPDATE,
    editableInputParams: {
      cartId: '',
      giftCardCodes: '{{[]}}',
    },
    transformer: CartTransformer.TransformCartMutations,
    inputResolver: inputVariables => {
      const {cartId, giftCardCodes} = inputVariables;
      return {
        cartId,
        giftCardCodes,
      };
    },
  },
  CartNoteUpdate: {
    queryType: 'mutation',
    gqlTag: CartGqls.CART_NOTE_UPDATE,
    transformer: CartTransformer.TransformCartMutations,
    editableInputParams: {
      cartId: '',
      note: '',
    },
  },
  CartBuyerIdentityUpdate: {
    queryType: 'mutation',
    gqlTag: CartGqls.CART_BUYER_IDENTITY_UPDATE,
    editableInputParams: {
      cartId: '',
      customerAccessToken: '',
      buyerIdentity: '{{{}}}',
    },
    inputResolver: ({cartId, customerAccessToken, buyerIdentity = {}}: any) => {
      if (customerAccessToken) {
        buyerIdentity.customerAccessToken = customerAccessToken;
      }
      return {cartId, buyerIdentity: buyerIdentity};
    },
    transformer: CartTransformer.TransformCartMutations,
  },
  CartAttributesUpdate: {
    queryType: 'mutation',
    gqlTag: CartGqls.CART_ATTRIBUTES_UPDATE,
    editableInputParams: {
      cartId: '',
      attributes: '',
    },
    inputResolver: (inputVariables: any) => {
      const {cartId, attributes} = inputVariables;
      return {
        cartId,
        attributes: _.isPlainObject(attributes)
          ? Object.entries(attributes).map(([key, value]) => ({key, value}))
          : [],
      };
    },
    transformer: CartTransformer.TransformCartMutations,
  },
};
