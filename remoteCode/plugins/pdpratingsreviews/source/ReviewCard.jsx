import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Star from './Star';
import moment from 'moment';

const ReviewCard = ({ review }) => {
  const { title, body, rating, verified, created_at, name, pictures } = review;
  
  // Format the date as time ago
  const getTimeAgo = (date) => {
    if (!date) return '';
    
    const now = moment();
    const reviewDate = moment(date);
    const diffYears = now.diff(reviewDate, 'years');
    const diffMonths = now.diff(reviewDate, 'months');
    const diffDays = now.diff(reviewDate, 'days');
    const diffHours = now.diff(reviewDate, 'hours');
    
    if (diffYears > 0) {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return 'just now';
    }
  };
  
  const timeAgo = getTimeAgo(created_at);
  
  return (
    <View style={styles.container}>
      {/* Review Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.ratingPill}>
            <Star fillPercentage={1} size={16} color={'#FFFFFF'} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.date}>{timeAgo}</Text>
        </View>
      </View>
      
      {/* Review Title */}
      {title && <Text style={styles.title}>{title}</Text>}
      
      {/* Review Body */}
      {body && <Text style={styles.body}>{body}</Text>}
      
      {/* Verified Badge */}
      {verified === 'verified-purchase' && (
        <View style={styles.verifiedContainer}>
          <Text style={styles.verifiedText}>Verified Purchase</Text>
        </View>
      )}
      
      {/* Reviewer Name */}
      <Text style={styles.name}>{name || 'Anonymous'}</Text>
      
      {/* Review Images */}
      {pictures && pictures.length > 0 && (
        <View style={styles.imagesContainer}>
          {pictures.map((picture, index) => (
            <Image 
              key={`${picture.id}-${index}`}
              source={{ uri: picture.url }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3'
  },
  header: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingPill: {
    flexDirection: 'row',
    backgroundColor: '#00909E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: '#767676',
    marginLeft: 9,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  body: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 20,
  },
  verifiedContainer: {
    backgroundColor: '#E8F7F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#00909E',
    fontWeight: '500',
  },
  name: {
    fontSize: 14,
    color: '#767676',
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
});

export default ReviewCard;
