import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {useApptileWindowDims} from 'apptile-core';

const BlogCarousel = ({carouselData}) => {
  const {width} = useApptileWindowDims();
  const cardWidth = width * 0.85;

  // Handle "See all" button press
  const handleSeeAllPress = () => {
    console.log(`Navigate to: ${carouselData.redirectPage}`);
    // Will be implemented later
  };

  // Handle blog card press
  const handleBlogPress = blog => {
    console.log(`Navigate to blog: ${blog.title}`);
    // Will be implemented later
  };

  return (
    <View style={styles.container}>
      {/* Header with title, subtitle, and "See all" button */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>{carouselData.title}</Text>
          <Text style={styles.subtitle}>{carouselData.subtitle}</Text>
        </View>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Blog carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {carouselData.blogs.map((blog, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.blogCard, {width: cardWidth}]}
            onPress={() => handleBlogPress(blog)}>
            <View style={styles.blogContent}>
              <Image
                source={{uri: blog.image}}
                style={styles.blogImage}
                resizeMode="contain"
              />
              {/* <View style={styles.textContainer}>
                <Text style={styles.blogTitle}>{blog.title}</Text>
                <Text style={styles.blogDescription}>{blog.description}</Text>
                <TouchableOpacity
                  style={styles.knowMoreButton}
                  onPress={() => handleBlogPress(blog)}>
                  <Text style={styles.knowMoreText}>Know More -&gt;</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3A8F9B',
    fontWeight: '500',
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  blogCard: {
    height: 220,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  blogContent: {
    flexDirection: 'row',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  blogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  blogDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  knowMoreButton: {
    backgroundColor: '#FFDA44',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  knowMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  blogImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});

export default BlogCarousel;
