import React from 'react';
import {View, StyleSheet} from 'react-native';
import Progress from './Progress';
import Milestone from './Milestone';

function Rule(props) {
  const {rules, index, currentMilestone} = props;
  const rule = rules[index]; // Current rule/milestone being processed

  /**
   * Calculate total segments for this rule's progress bar
   * - For first rule (index 0): segments = milestone value (e.g., if milestone is 3, show 3 segments)
   * - For subsequent rules: segments = current milestone - previous milestone
   *   Example: if milestones are [2, 5, 8], then:
   *   - Rule 0: totalSegments = 2 (from 0 to 2)
   *   - Rule 1: totalSegments = 3 (from 2 to 5, so 5-2=3)
   *   - Rule 2: totalSegments = 3 (from 5 to 8, so 8-5=3)
   */
  const totalSegments =
    index === 0
      ? rule.discount_milestone
      : rule.discount_milestone - rules[index - 1].discount_milestone;
  console.log(`Total segments for rule ${index}: ${totalSegments}`);

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
      : currentMilestone -
        (index > 0 ? rules[index - 1].discount_milestone : 0); // Partial progress
  console.log(`Filled segments for rule ${index}: ${filledSegments}`);

  /**
   * Check if this milestone has been achieved
   * - True if current progress >= this rule's milestone threshold
   */
  const isAchieved = currentMilestone >= rule.discount_milestone;
  console.log(`Is achieved for rule ${index}: ${isAchieved}`);

  /**
   * Determine if this is the "next" milestone to be achieved
   * - Only ONE rule should be marked as "next" at any time
   * - Find the very first unachieved milestone in the entire rules array
   * - Mark current rule as "next" only if it matches that immediate next milestone
   *
   * Example: rules=[{milestone:2}, {milestone:5}, {milestone:8}], currentMilestone=3
   * - Rule 0 (milestone 2): isAchieved=true, isNext=false (already achieved)
   * - Rule 1 (milestone 5): isAchieved=false, isNext=true (this is the immediate next)
   * - Rule 2 (milestone 8): isAchieved=false, isNext=false (not the immediate next)
   */
  const nextUnachievedRule = rules.find(
    r => currentMilestone < r.discount_milestone,
  );
  const isNext =
    !isAchieved &&
    rule.discount_milestone === nextUnachievedRule?.discount_milestone;
  console.log(`Is next for rule ${index}: ${isNext}`);
  return (
    <View style={styles.container}>
      <Progress totalSegments={totalSegments} filledSegments={filledSegments} />
      <Milestone rule={rule} isAchieved={isAchieved} isNext={isNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Rule;
