import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, Button} from 'react-native';
import GradientBackground from '../../../../extractedQueries/GradientBackground';
import GradientText from '../../../../extractedQueries/GradientText';
import Underline from '../../../../extractedQueries/Underline';
import {useApptileWindowDims, navigateToScreen} from 'apptile-core';
import { useDispatch } from 'react-redux';

const CelebPicks = ({celebs = []}) => {
  const {width} = useApptileWindowDims();
  const itemWidth = width / 3.5;

  // Empty onPress handler to be implemented later
  const handleCelebPress = celeb => {
    console.log(`Celeb pressed: ${celeb.title}`);
    // Will be implemented later
  };

  const dispatch = useDispatch();

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
            <Button 
              title="Go"
              onPress={() => {
                dispatch(navigateToScreen('NewCollection', {productHandle: "3-redensyl-4-anagain-hair-growth-serum"}))             
              }}
            />
            <Underline style={{height: 12, alignSelf: 'flex-end'}} />
          </View>
        </View>
        <View style={styles.celebsContainer}>
          {celebs.map((celeb, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.celebItem, {width: itemWidth}]}
              onPress={() => handleCelebPress(celeb)}>
              <View
                style={[
                  styles.imageContainer,
                  {
                    width: itemWidth,
                    height: itemWidth,
                    borderRadius: itemWidth / 2,
                  },
                ]}>
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
  },
  imageContainer: {
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
