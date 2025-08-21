import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import GradientBackground from '../../../../extractedQueries/GradientBackground';
import HeadingText from './HeadingText';
import Rule from './Rule';
import {checkValidCollection} from './utils/checkValidCollection';
import {calculateItemTotalPrice} from './utils/calculatePrice';
import _ from 'lodash';

const CartUpsellProgress = ({rules, cartLineItems}) => {
  const {finalProcessedRules, pointsToNextRule} = useMemo(() => {
    if (!rules?.length) {
      return {
        pointsToNextRule: 0,
        finalProcessedRules: [],
      };
    }
    let currentMilestone = 0;
    const ruleType = rules[0]?.rule_type;
    let applicableCollectionIds = [];
    rules.forEach(r =>
      r?.collections?.forEach(c => applicableCollectionIds.push(c.id)),
    );

    applicableCollectionIds = _.uniq(applicableCollectionIds);

    switch (ruleType) {
      case 'Quantity Based':
        cartLineItems.map(item => {
          const productCollectionIds = item.variant.product.collections.map(
            c => c.id,
          );
          const validCartItem = checkValidCollection(
            productCollectionIds,
            applicableCollectionIds,
          );
          if (validCartItem) {
            currentMilestone += item.quantity;
          }
        });
        break;
      case 'Value Based':
        cartLineItems.map(item => {
          const productCollectionIds = item.variant.product.collections.map(
            c => c.id,
          );
          const validCartItem = checkValidCollection(
            productCollectionIds,
            applicableCollectionIds,
          );
          if (validCartItem) {
            currentMilestone += calculateItemTotalPrice(item);
          }
        });
        break;
      default:
        break;
    }

    /**
     * Process all rules with mathematical calculations
     * This function calculates all the required fields for each rule:
     * - totalSegments: Number of segments for the progress bar
     * - filledSegments: Number of filled segments based on current progress
     * - isAchieved: Whether this milestone has been reached
     * - isNext: Whether this is the immediate next milestone to be achieved
     */
    const processedRules = rules.map((rule, index) => {
      /**
       * Calculate total segments for this rule's progress bar
       * - For first rule (index 0): segments = milestone value (e.g., if milestone is 2, show 2 segments)
       * - For subsequent rules: segments = current milestone - previous milestone
       *   Example: if milestones are [2, 3, 4], then:
       *   - Rule 0: totalSegments = 2 (from 0 to 2)
       *   - Rule 1: totalSegments = 1 (from 2 to 3, so 3-2=1)
       *   - Rule 2: totalSegments = 1 (from 3 to 4, so 4-3=1)
       */
      const totalSegments =
        index === 0
          ? rule.discount_milestone
          : rule.discount_milestone - rules[index - 1].discount_milestone;

      /**
       * Calculate filled segments (progress) for this rule's progress bar
       * - If milestone is achieved: fill all segments completely
       * - If milestone is not achieved: fill partial segments based on current progress
       *
       * For partial progress calculation:
       * - Get progress since the previous milestone (or from 0 for first rule)
       * - Example: currentMilestone=4, previous milestone=2, current milestone=6
       *   - filledSegments = 4 - 2 = 2 (out of totalSegments which would be 6-2=4)
       */
      const filledSegments =
        currentMilestone >= rule.discount_milestone
          ? totalSegments // Fully filled if milestone achieved
          : Math.max(
              0,
              currentMilestone -
                (index > 0 ? rules[index - 1].discount_milestone : 0),
            ); // Partial progress, ensure non-negative

      /**
       * Check if this milestone has been achieved
       * - True if current progress >= this rule's milestone threshold
       */
      const isAchieved = currentMilestone >= rule.discount_milestone;

      return {
        ...rule,
        totalSegments,
        filledSegments,
        isAchieved,
      };
    });

    /**
     * Find the immediate next milestone to be achieved
     * - Only ONE rule should be marked as "next" at any time
     * - Find the very first unachieved milestone in the entire rules array
     */
    const nextUnachievedRule = processedRules.find(rule => !rule.isAchieved);

    /**
     * Update processed rules to mark the next milestone
     * - Mark current rule as "next" only if it matches the immediate next milestone
     */
    const updatedRules = processedRules.map(rule => ({
      ...rule,
      isNext:
        !rule.isAchieved &&
        rule.discount_milestone === nextUnachievedRule?.discount_milestone,
    }));

    const points = nextUnachievedRule?.discount_milestone - currentMilestone;

    return {
      finalProcessedRules: updatedRules,
      pointsToNextRule: points,
    };
  }, [rules, cartLineItems]);

  if (!Object.keys(rules)?.length) {
    return <View />;
  }

  return (
    <GradientBackground
      gradientColors={[
        {offset: '0%', color: '#fff'},
        {offset: '65%', color: '#E7F2F3'},
      ]}
      style={styles.gradient}>
      <View>
        <HeadingText
          pointsToNextRule={pointsToNextRule}
          nextRuleName={
            finalProcessedRules.find(rule => rule.isNext)?.rule_name ||
            finalProcessedRules[finalProcessedRules.length - 1]?.rule_name
          }
          ruleType={
            finalProcessedRules.find(rule => rule.isNext)?.rule_type ||
            finalProcessedRules[finalProcessedRules.length - 1]?.rule_type
          }
        />
        <View style={styles.ruleContainer}>
          {finalProcessedRules.map((rule, index) => (
            <Rule key={index} rule={rule} rules={finalProcessedRules} />
          ))}
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 18,
    paddingLeft: 18,
    borderRadius: 8,
  },
  ruleContainer: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default CartUpsellProgress;
