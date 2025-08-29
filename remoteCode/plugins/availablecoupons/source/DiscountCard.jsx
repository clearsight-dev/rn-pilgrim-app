/* eslint-disable react-native/no-inline-styles */
import React, {useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import LoadingSVG from './icons/LoadingSVG';

export default function DiscountCard({
  rule,
  onApply,
  syncingCartStatus,
  currentCart,
}) {
  const handleApplyClick = () => {
    onApply(rule.discount_code);
  };

  const {ruleTitle} = useMemo(() => {
    if (rule.isApplied) {
      const saved = currentCart?.checkoutChargeAmount
        ? currentCart.checkoutChargeAmount - currentCart?.totalAmount
        : 0;
      if (saved > 0) {
        return {
          ruleTitle: (
            <Text style={styles.titleText}>
              Saved ₹{' '}
              <Text style={styles.titleTextBold}>{saved.toFixed(0)}</Text> with{' '}
              <Text style={styles.titleTextBold}>{rule.rule_name}</Text>
            </Text>
          ),
        };
      }
      return {
        ruleTitle: (
          <Text style={[styles.titleText, styles.titleTextBold]}>
            {rule.rule_name}
          </Text>
        ),
      };
    }

    return {
      ruleTitle: (
        <Text style={[styles.titleText, styles.titleTextBold]}>
          {rule.rule_name}
        </Text>
      ),
    };
  }, [
    currentCart.checkoutChargeAmount,
    currentCart?.totalAmount,
    rule.isApplied,
    rule.rule_name,
  ]);

  return (
    <View
      style={[
        styles.container,
        {borderColor: rule.isApplied ? '#00726C' : '#eee'},
      ]}>
      <View style={styles.ruleContentContainer}>
        <View style={styles.ruleTitleContainer}>
          <Image
            source={{
              uri: rule.isApplied
                ? 'https://cdn.shopify.com/s/files/1/0620/1629/1045/files/check_1.png?v=1737022832'
                : 'https://cdn.shopify.com/s/files/1/0620/1629/1045/files/discount_1ac760aa-3984-44ee-9912-fa7f6288d51f.png?v=1736157698',
            }}
            style={styles.ruleImage}
          />
          {ruleTitle}
        </View>
        <View style={styles.ruleDescriptionContainer}>
          <Text style={styles.descriptionText}>
            {rule.discount_description}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleApplyClick}
        disabled={!rule.isAcheived}
        style={[
          styles.applyButton,
          {
            borderWidth: rule.isApplied ? 0 : 1,
            borderColor: rule.isAcheived ? '#00726C' : '#a2a2a2ff',
          },
        ]}>
        {syncingCartStatus ? (
          <View style={styles.loading}>
            <LoadingSVG />
          </View>
        ) : rule.isApplied ? (
          <Text style={[styles.applyText, {color: '#00726C'}]}>Remove</Text>
        ) : (
          <View style={styles.applyContainer}>
            <Image
              source={{
                uri: 'https://cdn.shopify.com/s/files/1/0620/1629/1045/files/image_205.png?v=1738135199',
              }}
              style={[
                styles.ruleImage,
                {display: rule.isAcheived ? 'none' : 'flex'},
              ]}
            />
            <Text
              style={[
                styles.applyText,
                {color: rule.isAcheived ? '#00726C' : '#666'},
              ]}>
              Apply
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderWidth: 1,
    marginLeft: 10,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ruleContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  ruleTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleImage: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  titleText: {
    fontSize: 13,
    color: '#000',
    flexWrap: 'wrap',
    maxWidth: 130,
  },
  titleTextBold: {
    fontWeight: '700',
  },
  ruleDescriptionContainer: {
    marginTop: 4,
    maxWidth: 180,
  },
  descriptionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 22,
  },
  applyButton: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginLeft: 12,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loading: {
    height: 16,
    width: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
