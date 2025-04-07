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
export function FAQComponent() {
  // Sample FAQ data
  const faqData = [
    {
      question: "How to use Pilgrim Hair growth Serum?",
      answer: "To use Pilgrim Hair Growth Serum, ensure your scalp is clean and dry. Massage a few drops close to the hair roots. Let it remain overnight while you sleep. For visible results, needs to be applied for 28 days consecutively."
    },
    {
      question: "Can this product be used by both men and women?",
      answer: "Yes, Pilgrim products are formulated to be effective for all genders. Our Hair Growth Serum is designed to address hair concerns that affect both men and women."
    },
    {
      question: "Is this product suitable for all hair types?",
      answer: "Yes, our Hair Growth Serum is suitable for all hair types including straight, wavy, curly, and coily hair. The formula is designed to work effectively regardless of hair texture."
    },
    {
      question: "Are Pilgrim products cruelty-free?",
      answer: "Yes, all Pilgrim products are 100% cruelty-free. We never test on animals and are proud to be certified by PETA as a cruelty-free brand."
    },
    {
      question: "What ingredients are in Pilgrim Hair Growth Serum?",
      answer: "Our Hair Growth Serum contains natural ingredients like Redensyl, Procapil, Anagain, and Baicapil that work together to promote hair growth, reduce hair fall, and improve overall scalp health."
    }
  ];

  return (
    <Accordion title="FAQs">
      <View style={styles.faqList}>
        {faqData.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question} 
            answer={faq.answer} 
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
