import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet
} from 'react-native';
import {Icon} from 'apptile-core';
import Accordion from '../../../../extractedQueries/Accordion';
import { colors, FONT_FAMILY, typography } from '../../../../extractedQueries/theme';

// FAQ Item component with accordion functionality
const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.faqItemContainer}>
      <Pressable 
        style={({pressed}) => [
          styles.questionContainer,
          pressed && {opacity: 0.5} 
        ]} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={[typography.subHeading14, styles.questionText]}>{question}</Text>
        {
          expanded ? 
            (<Icon 
              iconType={'Material Icon'} 
              name={'chevron-up'} 
              style={{
                marginRight: 8,
                fontSize: 18,
                color: colors.dark100
              }}
            />):
            (<Icon 
              iconType={'Material Icon'} 
              name={'chevron-down'} 
              style={{
                marginRight: 8,
                fontSize: 18,
                color: colors.dark100
              }}
            />)
        }
      </Pressable>
      
      {expanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

// Main FAQ Component
export function FAQComponent({product}) {
  let numQuestions = (product?.questions ?? []).findIndex(question => !question?.value);
  if (product?.questions?.length === 0) {
    return null;
  }


  return (
    <Accordion title="FAQs">
      <View style={styles.faqList}>
        {product.questions.slice(0, numQuestions).map((question, index) => (
          <FAQItem 
            key={index} 
            question={question?.value} 
            answer={product.answers[index]?.value} 
          />
        ))}
      </View>
    </Accordion>
  );
}

const styles = StyleSheet.create({
  faqList: {
    width: '100%',
  },
  faqItemContainer: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.dark10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    marginLeft: 8,
  },
  answerContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.dark100,
  }
});

export default FAQComponent;
