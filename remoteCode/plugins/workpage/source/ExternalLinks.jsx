import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Image
} from 'react-native';
import GradientBackground from '../../../../extractedQueries/GradientBackground';

// Link Item component
const LinkItem = ({ title }) => {
  return (
    <TouchableOpacity style={styles.linkItem}>
      <Text style={styles.linkText}>{title}</Text>
    </TouchableOpacity>
  );
};

// External Links Component
export function ExternalLinks({girlImages}) {
  // Information links data
  const informationLinks = [
    "Track your order",
    "About Us",
    "Contact Us",
    "FAQ",
    "Careers",
    "Affiliate Program",
    "Corporate Gifting",
    "Store Locator"
  ];

  // Important links data
  const importantLinks = [
    "Shipping & Returns",
    "Terms & Conditions",
    "Privacy Policy",
    "Refund Policy",
    "28-Days Money-Back Guarantee",
    "Blogs",
    "Pilgrim T-shirt"
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {girlImages && girlImages[0] && (<Image 
          style={{
            width: 100, 
            aspectRatio: 1,
            position: 'absolute',
            bottom: 32,
            left: 0,
            zIndex: 1
          }}
          source={{uri: girlImages[0]}}
        >
        </Image>)}
        <GradientBackground 
          style={styles.header}
          gradientColors={[
            { offset: "0%", color: "#007F89" },
            { offset: "100%", color: "#00AEBD" }
          ]}
          gradientDirection="vertical"
          borderRadius={4}
        >
          <Text style={styles.headerText}>THE SECRET IS IN THE MIX</Text>
        </GradientBackground>
      </View>
      
      <View style={styles.linksContainer}>
        {/* Information Links Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Information</Text>
          {informationLinks.map((link, index) => (
            <LinkItem key={`info-${index}`} title={link} />
          ))}
        </View>
        
        {/* Important Links Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Important Links</Text>
          {importantLinks.map((link, index) => (
            <LinkItem key={`imp-${index}`} title={link} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    height: 130,
  },
  header: {
    width: '120%',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
    transform: [
      {
        rotateZ: '-5deg'
      },
      {
        translateY: 35 
      }
    ]
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linksContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  linkItem: {
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  }
});

export default ExternalLinks;
