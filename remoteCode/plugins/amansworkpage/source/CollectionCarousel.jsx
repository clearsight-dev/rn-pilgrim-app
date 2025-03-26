import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Underline from '../../../../extractedQueries/Underline';
import {useState} from 'react';

const CollectionCarousel = ({carouselData}) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <View style={styles.container}>
      {/* Collection Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{carouselData.title}</Text>
        <View
          style={{
            alignSelf: 'flex-start',
          }}>
          <Text style={[styles.subtitle]}>{carouselData.subtitle}</Text>
          <Underline
            style={{
              width: 70,
              height: 10,
              resizeMode: 'stretch',
              alignSelf: 'flex-end',
              transform: [{translateY: -15}],
            }}
          />
        </View>
        <Image
          source={{uri: carouselData.coverImage}}
          style={{
            width: 160,
            height: 160,
            position: 'absolute',
            right: -30,
            bottom: -60,
          }}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {carouselData.tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabButton,
              activeTab === index && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(index)}>
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardsContainer}>
        {carouselData.categories.map(category => (
          <TouchableOpacity key={category.id} style={styles.card}>
            <View style={[styles.cardImageContainer, {position: 'relative'}]}>
              <Image
                source={{uri: category.image}}
                style={{
                  position: 'absolute',
                  width: 150,
                  height: 150,
                  // transform: [{scale: 1.75}],
                }}
                resizeMode="cover"
              />
              <View style={styles.cardOverlay} />
              <Text style={styles.cardTitle}>{category.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 15,
  },
  headerContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 174, 189, 0.04)',
    borderColor: '#00909E',
  },
  tabText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  activeTabText: {
    color: '#00909E',
    fontWeight: '500',
  },
  cardsContainer: {
    flexDirection: 'row',
  },
  card: {
    width: 150,
    height: 150,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ccc',
  },
  cardImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
  },
  debugContainer: {
    marginTop: 20,
    opacity: 0.3,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
  },
  debugData: {
    fontSize: 8,
    color: '#999',
  },
});

export default CollectionCarousel;
