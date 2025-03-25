import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import GradientBackground from '../../../../extractedQueries/GradientBackground';
import GradientText from '../../../../extractedQueries/GradientText';
// import everyDayUnderline from '../../../../assets/every-day-underline.png';

const CelebPicks = ({celebs = []}) => {
  // Empty onPress handler to be implemented later
  const handleCelebPress = celeb => {
    console.log(`Celeb pressed: ${celeb.title}`);
    // Will be implemented later
  };

  return (
    <GradientBackground
      gradientColors={[
        {offset: '0%', color: '#C5FAFF'},
        {offset: '100%', color: '#fff'},
      ]}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <GradientText
            text="Celeb Picks"
            fontSize={22}
            width="100%"
            height={32}
            gradientColors={[
              {offset: '0%', color: '#009FAD'},
              {offset: '33%', color: '#00707A'},
              {offset: '66%', color: '#009FAD'},
              {offset: '100%', color: '#00707A'},
            ]}
          />
          <View
            style={{
              alignSelf: 'center',
              display: 'flex',
              flexDirection: 'column',
            }}>
            <Text style={styles.subtitle}>Essentials You Can't Miss!</Text>
            <Image
              source={{uri: ""}}
              style={{
                width: 65,
                height: 10,
                resizeMode: 'stretch',
                alignSelf: 'flex-end',
              }}
            />
          </View>
        </View>
        <View style={styles.celebsContainer}>
          {celebs.map((celeb, index) => (
            <TouchableOpacity
              key={index}
              style={styles.celebItem}
              onPress={() => handleCelebPress(celeb)}>
              <View style={styles.imageContainer}>
                <Image
                  source={{uri: celeb.image}}
                  style={styles.celebImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.celebTitle}>{celeb.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </GradientBackground>
  );
};

const {width} = Dimensions.get('window');
const itemWidth = width / 3.5;

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  celebsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  celebItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: itemWidth,
  },
  imageContainer: {
    width: itemWidth,
    height: itemWidth,
    borderRadius: itemWidth / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E6F7FA',
    marginBottom: 12,
  },
  celebImage: {
    width: '100%',
    height: '100%',
  },
  celebTitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default CelebPicks;
