/* eslint-disable curly */
import React, {useMemo} from 'react';
import {StyleSheet, FlatList, View, Text} from 'react-native';
import {calculateItemTotalPrice} from '../../cartupsell/source/utils/calculatePrice';
import {checkValidCollection} from '../../cartupsell/source/utils/checkValidCollection';
import {
  datasourceTypeModelSel,
  selectAppConfig,
  selectAppModel,
  globalPluginsSelector,
  store,
} from 'apptile-core';
import DiscountCard from './DiscountCard';

const AvailableCoupons = ({rules, currentCart, syncingCartStatus}) => {
  const {finalProcessedRules} = useMemo(() => {
    if (!rules?.length) {
      return {
        finalProcessedRules: [],
      };
    }

    const {lines, discountCodes} = currentCart;
    const appliedDiscounts =
      discountCodes?.filter(code => code.applicable)?.map(code => code.code) ||
      [];

    const totalCartValue =
      lines?.reduce((total, item) => {
        return total + calculateItemTotalPrice(item);
      }, 0) || 0;

    const processedRules = rules.map(r => {
      switch (r.rule_type) {
        case 'Quantity Based':
          const validCartLineItems =
            lines?.filter(item => {
              const productCollectionIds = item.variant.product.collections.map(
                c => c.id,
              );
              const validCartItem = checkValidCollection(
                productCollectionIds,
                r.collections.map(c => c.id),
              );
              return validCartItem;
            }) || [];
          const totalQuantity = validCartLineItems.reduce((total, item) => {
            return total + item.quantity;
          }, 0);
          return {
            ...r,
            isAcheived: totalQuantity >= r.discount_milestone,
            isApplied: appliedDiscounts.includes(r.discount_code),
          };
        case 'Value Based':
          return {
            ...r,
            isAcheived: totalCartValue >= r.discount_milestone,
            isApplied: appliedDiscounts.includes(r.discount_code),
          };
      }
      return {
        ...r,
        isAcheived: false,
        isApplied: false,
      };
    });

    processedRules.sort((a, b) => {
      if (a.isAcheived && !b.isAcheived) return -1;
      if (!a.isAcheived && b.isAcheived) return 1;
      return 0;
    });

    return {
      finalProcessedRules: processedRules,
    };
  }, [rules, currentCart]);

  function applyCoupon(couponCode) {
    const state = store.getState();
    const shopifyCartDSModel = datasourceTypeModelSel(state, 'shopifyCart');
    const updateCartDiscounts = shopifyCartDSModel?.get('updateCartDiscounts');
    const globalPluginConfigs = globalPluginsSelector(state);
    const appConfig = selectAppConfig(state);
    const appModel = selectAppModel(state);
    let discountCodes =
      currentCart?.discountCodes?.map(code => code.code) || [];
    const discountCodeIndex = discountCodes.indexOf(couponCode);
    if (discountCodeIndex !== -1) {
      discountCodes.splice(discountCodeIndex, 1);
    } else {
      discountCodes.push(couponCode);
    }

    if (updateCartDiscounts) {
      return updateCartDiscounts(
        store.dispatch,
        globalPluginConfigs.get('shopifyCart'),
        shopifyCartDSModel,
        ['shopifyCart'],
        {
          discountCodes,
        },
        appConfig,
        appModel,
      );
    } else {
      console.error(
        'Could not apply discount because model did not return updateDiscounts function',
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Coupons</Text>
      <FlatList
        data={finalProcessedRules}
        horizontal={true}
        renderItem={({item}) => (
          <DiscountCard
            key={item.id}
            rule={item}
            currentCart={currentCart}
            onApply={applyCoupon}
            syncingCartStatus={syncingCartStatus}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    display: 'none',
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 12,
    color: '#000',
  },
});

export default AvailableCoupons;
