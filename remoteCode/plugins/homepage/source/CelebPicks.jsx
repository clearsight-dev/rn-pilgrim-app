import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from '../../../../extractedQueries/ImageComponent';
import GradientBackground from '../../../../extractedQueries/GradientBackground';
import GradientText from '../../../../extractedQueries/GradientText';
import Underline from '../../../../extractedQueries/Underline';
import { useApptileWindowDims, navigateToScreen } from 'apptile-core';
import { typography } from '../../../../extractedQueries/theme';
import { useDispatch } from 'react-redux';
import { GridSkeletonLoader } from '../../../../components/skeleton/imageGrid';


const CelebPicks = ({ config = {}, loading = false }) => {
  const { title, subtitle, items = [] } = config;
  const { width } = useApptileWindowDims();
  const itemWidth = width / 3.5;
  const dispatch = useDispatch();

  const handleCelebPress = (collectionHandle) => {
    dispatch(navigateToScreen('Collection', { collectionHandle }));
  };

  if (loading) {
    return <GridSkeletonLoader width={width} />
  }

  return (
    <GradientBackground
      gradientColors={[
        { offset: '0%', color: '#C5FAFF' },
        { offset: '85%', color: '#fff' },
      ]}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {title && (
            <GradientText
              text={title}
              fontSize={22}
              width="100%"
              height={32}
              gradientColors={[
                { offset: '0%', color: '#009FAD' },
                { offset: '33%', color: '#00707A' },
                { offset: '66%', color: '#009FAD' },
                { offset: '100%', color: '#00707A' },
              ]}
            />
          )}
          {subtitle && (
            <View
              style={{
                alignSelf: 'center',
                display: 'flex',
                flexDirection: 'column',
              }}>
              <Text style={[typography.body14, styles.subtitle]}>{subtitle}</Text>
              <Underline style={{ height: 12, width: 90, alignSelf: 'flex-end' }} />
            </View>
          )}
        </View>

        <View style={styles.celebsContainer}>
          {items.map((celeb, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.celebItem, { width: itemWidth }]}
              onPress={() => handleCelebPress(celeb.collection)}>
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
                  source={{
                    uri:
                      celeb?.image?.value ||
                      celeb?.url ||
                      celeb?.urls?.[Math.floor(celeb?.urls.length / 2)],
                  }}
                  style={styles.celebImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[typography.subHeading14, styles.celebTitle]}>{celeb.title}</Text>
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
    color: '#1A1A1A',
    lineHeight: 16,
    textAlign: 'center',
  },
});

export default CelebPicks;
