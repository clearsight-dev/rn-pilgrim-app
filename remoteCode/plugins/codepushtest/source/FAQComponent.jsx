import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet
} from 'react-native';
import {Icon} from 'apptile-core';
import Accordion from '../../../../extractedQueries/Accordion';

// FAQ Item component with accordion functionality
const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.faqItemContainer}>
      <TouchableOpacity 
        style={styles.questionContainer} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.questionText}>{question}</Text>
        {
          expanded ? 
            (<Icon 
              iconType={'Material Icon'} 
              name={'chevron-up'} 
              style={{
                marginRight: 8,
                fontSize: 18,
                color: '#1A1A1A'
              }}
            />):
            (<Icon 
              iconType={'Material Icon'} 
              name={'chevron-down'} 
              style={{
                marginRight: 8,
                fontSize: 18,
                color: '#1A1A1A'
              }}
            />)
        }
      </TouchableOpacity>
      
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
  if (product?.questions?.length > 0) {
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
    borderColor: '#E0E0E0',
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
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    marginLeft: 8,
  },
  answerContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  }
});

export default FAQComponent;
