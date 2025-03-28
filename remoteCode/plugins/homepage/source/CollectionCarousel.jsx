import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Underline from '../../../../extractedQueries/Underline';
import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {navigateToScreen} from 'apptile-core';

// Subtitles for each collection
const COLLECTION_SUBTITLES = {
  'pore-care': 'Glow Every Day!',
  'hair-care': 'Shine Every Day!',
  'makeup': 'Look Your Best!',
};

// Cover images for each collection
const COLLECTION_COVER_IMAGES = {
  'pore-care': 'https://s3-alpha-sig.figma.com/img/9bfb/5a5a/0e5496159d8f7ee3eed1dfaee6578a4f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=HhcipHKNL63XQwL7JeUKjU6Cv3lZaAvwEo0H2yVuxTwr8jk-~wCdv2rZ6CB42o6lNg0RUivmkbK9jo90CMq048KJQ2EzVMwKI~f2~4vCcfqwmPEU8b58PlC2xbvKd-ncTUSOcDIuqpqSRzeh~Bs9cfFOE57Yh0vN3qzzb3BLxurr3V9oqJSQmpyp3TSAY4Stjzq-qLmJaCLEY~s8Q75Ekzg7QJuQ22Xmao9qhVP-r-ePbeXtRSiBHpikbCAkmhBhdzM4y00O27jXfFnQEntCLWQ37bBVGp6~ZmY35RPpvPrIa5wXseKhqQEKbdSU4F7IMazfefG84-j5l1nxdqS29w__',
  'hair-care': 'https://s3-alpha-sig.figma.com/img/2f05/72c9/70a04491bffa2a2bde621f85b4c2a29f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=QM28qb8wuaXmvPl0-xfG58mGqNrlHHiZoddsTUZiFSvFBzGVSLg4zFD6LfFQXKibGYN2Bp~YgTaVb-WiGCEDlsd4K7GFhOgqx9S9yw8c~AF9JiC1e1Au7~6eKZHFJswZGFjjtMkb0XCmV0APKRdu-S2ciOD4YkiV8U0e0NjLqiZWu62VsZ50O1ZPZpbtsz0xJAPky9w5dn48UI~uu-U-lzZZjzp21Kyy43norFPKd9rZsV-0AVTYq6N1NVEUkoyn6gvtoHms3x6ABJWrwrbQThD4pdeZizF2~9mA9kDVR8cT~2ANUaKFMuL0Q~K50ClmxCZovXW2NmOj89zprgH-nA__',
  'makeup': 'https://s3-alpha-sig.figma.com/img/9bfb/5a5a/0e5496159d8f7ee3eed1dfaee6578a4f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=HhcipHKNL63XQwL7JeUKjU6Cv3lZaAvwEo0H2yVuxTwr8jk-~wCdv2rZ6CB42o6lNg0RUivmkbK9jo90CMq048KJQ2EzVMwKI~f2~4vCcfqwmPEU8b58PlC2xbvKd-ncTUSOcDIuqpqSRzeh~Bs9cfFOE57Yh0vN3qzzb3BLxurr3V9oqJSQmpyp3TSAY4Stjzq-qLmJaCLEY~s8Q75Ekzg7QJuQ22Xmao9qhVP-r-ePbeXtRSiBHpikbCAkmhBhdzM4y00O27jXfFnQEntCLWQ37bBVGp6~ZmY35RPpvPrIa5wXseKhqQEKbdSU4F7IMazfefG84-j5l1nxdqS29w__',
};

export default function CollectionCarousel({collectionHandle, carouselData: rawData, loading, error}) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  
  console.log("[AGENT] rendering collection carousel");
  
  // Format the data received from parent component
  const carouselData = rawData ? {
    title: rawData.collection?.title?.toUpperCase() || '',
    subtitle: COLLECTION_SUBTITLES[collectionHandle] || 'Shop Now!',
    tabs: rawData.tabs || ['All Products'],
    coverImage: COLLECTION_COVER_IMAGES[collectionHandle] || rawData.collection?.image?.url || '',
    categories: rawData.categories || []
  } : null;
  
  // Function to navigate to the NewCollection page with parameters
  const navigateToCollection = (category) => {
    // Get the subcategory from the active tab if available
    const subcategory = carouselData.tabs[activeTab] !== 'All Products' 
      ? carouselData.tabs[activeTab] 
      : null;
    
    console.log(`[AGENT] Navigating to NewCollection with handle: ${collectionHandle}, category: ${category.title}, subcategory: ${subcategory}`);
    
    // Navigate to the NewCollection page with parameters
    dispatch(navigateToScreen('NewCollection', {
      collectionHandle: collectionHandle,
      category: category.title,
      subcategory: subcategory
    }))
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00909E" />
        <Text style={styles.loadingText}>Loading collection...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!carouselData) {
    return null;
  }
  
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
      {carouselData.tabs.length > 0 && (
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
      )}

      {/* Category Cards */}
      {carouselData.categories.length > 0 ? (
        <FlatList
          data={carouselData.categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardsContainer}
          initialNumToRender={3}
          maxToRenderPerBatch={4}
          keyExtractor={(item) => item.id}
          renderItem={({item: category}) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigateToCollection(category)}>
              <View style={[styles.cardImageContainer, {position: 'relative'}]}>
                <Image
                  source={{uri: category.image}}
                  style={{
                    position: 'absolute',
                    width: 150,
                    height: 150,
                  }}
                  resizeMode="cover"
                />
                <View style={styles.cardOverlay} />
                <Text style={styles.cardTitle}>{category.title}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noDataText}>No categories available</Text>
      )}
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
  // Loading state styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  // Error state styles
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
  },
  // No data state styles
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
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
