/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import LoadingSVG from './icons/LoadingSVG';

export default function DiscountCard({rule, onApply, syncingCartStatus}) {
  const handleApplyClick = () => {
    onApply(rule.discount_code);
  };

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
          <Text style={styles.titleText}>{rule.rule_name}</Text>
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
    fontWeight: '600',
    color: '#000',
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
