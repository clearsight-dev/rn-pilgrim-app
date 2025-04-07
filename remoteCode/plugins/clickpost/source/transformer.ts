import {
  JSONMapperSchema,
  formatQueryReturn,
  jsonArrayMapper,
  jsonObjectMapper,
} from 'apptile-core';
import {
  IClickpostGetRewardPointResponse,
  IClickpostGetUnusedDiscountResponse,
} from './types';

export const transformGetRewardPointsResponse = (
  data: IClickpostGetRewardPointResponse,
  context: any,
) => {
  if (!data) {
    return;
  }

  const rewardSchema: JSONMapperSchema = [
    {
      field: 'lifetimePoints',
      path: 'lifetime_points',
    },
    {
      field: 'availablePoints',
      path: 'available_points',
    },
    {
      field: 'pointEarningRatio',
      path: 'point_earning_ratio',
    },
    {
      field: 'pointEarningRatio',
      path: 'point_earning_ratio',
    },
  ];

  const discountCodeSchema = [
    {
      field: 'discountDode',
      path: 'discount_code',
    },
    {
      field: 'discountType',
      path: 'discount_type',
    },
  ];

  return {
    ...jsonObjectMapper(rewardSchema, data),
    discountCodes: data?.discount_code
      ? jsonArrayMapper(discountCodeSchema, data?.discount_code)
      : [],
  };
};

export const TransformGetRewardPoints = (response: any, context: any) => {
  const {data} = response;
  if (!data) {
    return;
  }
  const result = transformGetRewardPointsResponse(data, context);
  return formatQueryReturn(result, data);
};

export const TransformGetUnusedDiscounts = (
  response: IClickpostGetUnusedDiscountResponse,
  context: any,
) => {
  const {data} = response;
  if (!data) {
    return;
  }

  const discountCodeSchema = [
    {
      field: 'discountCode',
      path: 'discount_code',
    },
    {
      field: 'discountType',
      path: 'discount_type',
    },
    {
      field: 'discountValue',
      path: 'discount_value',
    },
    {
      field: 'productId',
      path: 'product_id',
    },
    {
      field: 'rewardDescription',
      path: 'reward_description',
    },
    {
      field: 'customerId',
      path: 'customer_id',
    },
    {
      field: 'createdAt',
      path: 'date_created',
    },
  ];

  const tData = data ? jsonArrayMapper(discountCodeSchema, data) : [];
  return formatQueryReturn(tData, data);
};

export const TransformGetDiscountDetails = (
  response: IClickpostGetUnusedDiscountResponse,
  context: any,
) => {
  const {data} = response;
  if (!data) {
    return;
  }

  const discountCodeSchema = [
    {
      field: 'discountCode',
      path: 'discount_code',
    },
    {
      field: 'discountType',
      path: 'discount_type',
    },
    {
      field: 'discountValue',
      path: 'discount_value',
    },
    {
      field: 'productId',
      path: 'product_id',
    },
    {
      field: 'rewardDescription',
      path: 'reward_description',
    },
    {
      field: 'customerId',
      path: 'customer_id',
    },
    {
      field: 'createdAt',
      path: 'date_created',
    },
  ];

  const tData = data ? jsonObjectMapper(discountCodeSchema, data) : [];
  return formatQueryReturn(tData, data);
};
