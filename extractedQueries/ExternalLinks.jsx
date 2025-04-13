import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
} from 'react-native';
import {Image} from './ImageComponent';
import GradientBackground from './GradientBackground';
import RadialGradientBackground from './RadialGradientBackground';
import { colors, FONT_FAMILY, gradients } from './theme';

// Link Item component
const LinkItem = ({ title }) => {
  return (
    <TouchableOpacity style={styles.linkItem}>
      <Text style={styles.linkText}>{title}</Text>
    </TouchableOpacity>
  );
};

// External Links Component
export function ExternalLinks() {
  const staticImages = {
    girl: ["https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/14ece980-9a1d-4e30-8b19-6a267508bd36/original-480x480.png"],
    pilgrim: ["https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/c3ab033c-7e9a-419c-b882-eb4fdf5b3ad0/original-480x480.png"],
    fb: ["https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/17d8fb0d-6391-4660-beb6-9cc691b8e129/original-480x480.png"],
    insta: ["https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/7aa2d4d8-fbdb-48a1-b9c9-c2329e7555d9/original-480x480.png"],
    youtube: ["https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/b0826a0a-9185-44fc-9cba-548dd00072c4/original-480x480.png"],
    linkedin: ["https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/7aa2d4d8-fbdb-48a1-b9c9-c2329e7555d9/original-480x480.png"]
  };
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
        {staticImages?.girl?.[0] && (<Image 
          style={{
            width: 100, 
            aspectRatio: 1,
            position: 'absolute',
            bottom: 18,
            left: 0,
            zIndex: 1
          }}
          source={{uri: staticImages?.girl?.[0]}}
        >
        </Image>)}
        <GradientBackground 
          style={styles.header}
          gradientColors={[
            { offset: "0%", color: colors.secondaryMain },
            { offset: "100%", color: gradients.alphaPrimary10.end.color }
          ]}
          gradientDirection="vertical"
          borderRadius={4}
        >
          <Text style={styles.headerText}>THE SECRET IS IN THE MIX</Text>
        </GradientBackground>
      </View>
      
      <RadialGradientBackground 
        gradientColors={[
          { offset: "0%", color: colors.primaryMain, opacity: 0.3 },
          { offset: "100%", color: colors.white, opacity: 0.2 }
        ]}
        gradientCenter={{ x: '50%', y: '50%' }}
        gradientRadius="70%"
        containerStyles={styles.linksContainerContent}
        style={styles.linksContainer}
      >
        {/* Information Links Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Information</Text>
          {informationLinks.map((link, index) => (
            <LinkItem key={`info-${index}`} title={link} />
          ))}
          <Image
            source={{uri: staticImages?.pilgrim?.[0]}}
            style={{
              marginTop: 30,
              height: 30,
              width: 120,
            }}
          ></Image>
        </View>
        
        {/* Important Links Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Important Links</Text>
          {importantLinks.map((link, index) => (
            <LinkItem key={`imp-${index}`} title={link} />
          ))}
          <View>
            <Text style={styles.socialMediaHeader}>You'll love us here</Text>
            <View style={{flexDirection: 'row'}}>
              <Image
                source={{uri: staticImages?.fb?.[0]}}
                style={styles.socialMediaImage}
              ></Image>
              <Image
                source={{uri: staticImages?.insta?.[0]}}
                style={styles.socialMediaImage}
              ></Image>
              <Image
                source={{uri: staticImages?.youtube?.[0]}}
                style={styles.socialMediaImage}
              ></Image>
              <Image
                source={{uri: staticImages?.linkedin?.[0]}}
                style={styles.socialMediaImage}
              ></Image>
            </View>
          </View>
        </View>
      </RadialGradientBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    height: 130,
    zIndex: 2
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
    ],
    height: 60,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontFamily: FONT_FAMILY.bold,
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    position: 'relative',
    right: -20,
    top: 4
  },
  linksContainer: {
    position: 'relative', 
    paddingTop: 60,
    bottom: 60, 
  },
  linksContainerContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1
  },
  column: {
    marginHorizontal: 8,
    maxWidth: 180
  },
  columnTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.dark90,
  },
  linkItem: {
    marginBottom: 8,
  },
  linkText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: colors.dark90,
    lineHeight: 22,
  },
  socialMediaImage: {
    height: 30,
    aspectRatio: 1,
    marginTop: 11,
    marginRight: 11
  },
  socialMediaHeader: {
    fontFamily: FONT_FAMILY.bold,
    paddingTop: 30,
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryMain
  }
});

export default ExternalLinks;
