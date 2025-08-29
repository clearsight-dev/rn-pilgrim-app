import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
} from 'react-native';
import LoadingSVG from './icons/LoadingSVG';
import {
  datasourceTypeModelSel,
  selectAppConfig,
  selectAppModel,
  globalPluginsSelector,
  store,
} from 'apptile-core';

function CouponApply({currentCart}) {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function applyCoupon(cCode) {
    cCode = cCode?.toLowerCase();
    const state = store.getState();
    const shopifyCartDSModel = datasourceTypeModelSel(state, 'shopifyCart');
    const updateCartDiscounts = shopifyCartDSModel?.get('updateCartDiscounts');
    const globalPluginConfigs = globalPluginsSelector(state);
    const appConfig = selectAppConfig(state);
    const appModel = selectAppModel(state);
    let discountCodes =
      currentCart?.discountCodes?.map(code => code.code) || [];
    const discountCodeIndex = discountCodes.indexOf(cCode);
    if (discountCodeIndex !== -1) {
      discountCodes.splice(discountCodeIndex, 1);
    } else {
      discountCodes.push(cCode);
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

  const handleApplyCouponClicked = () => {
    if (couponCode?.trim()) {
      Keyboard.dismiss();
      setIsLoading(true);

      applyCoupon(couponCode);

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleInputChange = text => {
    setCouponCode(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={handleInputChange}
          value={couponCode}
          placeholder="Enter Coupon Code"
        />
        <Pressable
          style={styles.applyButton}
          onPress={handleApplyCouponClicked}
          disabled={isLoading}>
          {isLoading ? (
            <View style={styles.loading}>
              <LoadingSVG />
            </View>
          ) : (
            <Text
              style={[
                styles.applyButtonText,
                couponCode?.trim() && styles.applyButtonTextActive,
              ]}>
              APPLY
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: 320,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#a2a2a2ff',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: 220,
    color: '#3c3c3c',
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  applyButtonText: {
    color: '#a2a2a2ff',
    fontWeight: 'bold',
  },
  applyButtonTextActive: {
    color: '#00726C',
  },
  loading: {
    height: 16,
    width: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CouponApply;
