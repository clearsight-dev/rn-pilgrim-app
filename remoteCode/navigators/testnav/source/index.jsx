import React, {useEffect, useRef, useContext, useState } from 'react';
import {
  Platform, 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  TextInput, 
  Animated, 
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  createScreenFromConfig, 
  createNavigatorsFromConfig, 
  Icon, 
  datasourceTypeModelSel,
} from 'apptile-core';
import {useSelector, shallowEqual} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image} from '../../../../extractedQueries/ImageComponent';
import {PilgrimContext} from '../../../../PilgrimContext';

const BottomTabNavigator = createBottomTabNavigator();

const numCartLineItems = (state) => {
  const shopifyDS = datasourceTypeModelSel(state, "shopifyV_22_10");
  const currentCart = shopifyDS?.get('currentCart');
  return currentCart?.lines?.length ?? 0;
}

function CustomTabHeader({navigation, route, options}) {
  const insets = useSafeAreaInsets();
  const currentCartLineItemsLength = useSelector(numCartLineItems, shallowEqual);
  const searchBarTranslation = useRef(new Animated.Value(0));
  const textInputRef = useRef(null); 
  const {pilgrimGlobals} = useContext(PilgrimContext);

  const FIRST_ROW_HEIGHT = 40;
  let SECOND_ROW_HEIGHT = 40;

  const isHomeRoute = route.name === "Home";

  if (!isHomeRoute) {
    SECOND_ROW_HEIGHT = 0
  }

  useEffect(() => {
    let animation = null;
    if (pilgrimGlobals.homePageScrolledDown === true && route.name === "Home") {
      console.log("Hide animation")
      searchBarTranslation.current.setValue(0);
      animation = Animated.timing(searchBarTranslation.current, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true
      }).start((finished) => {
        if (finished) {
          console.log("hide animation finished for searchbar");
          animation = null;
        }
      });
    } else if (pilgrimGlobals.homePageScrolledDown === false && route.name === "Home") {
      console.log("show animation")
      searchBarTranslation.current.setValue(-50);
      setTimeout(() => {
        animation = Animated.timing(searchBarTranslation.current, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start((finished) => {
          if (finished) {
            console.log("show animation finished for searchbar")
            animation = null;
          }
        });
      }, 100);
    }

    return () => {
      if (animation) {
        console.log("Cancelling animation")
        animation.stop();
      }
    }
  }, [pilgrimGlobals]);

  useEffect(() => {
    const toggleVisibility = ({target, data}) => {
      console.log("Target: ", target, route.name)
      const isHomeRoute = route.name === "Home";
      if (!isHomeRoute) {
        searchBarTranslation.current.setValue(-50);
      } 
    }

    const removeListener = navigation.addListener('focus', toggleVisibility);
    return () => {
      removeListener();
    }
  }, [route.name]);

  return (
    <View
      style={[
        {
          position: "relative",
          left: 0,
          top: insets.top,
          height: (FIRST_ROW_HEIGHT + 10),
          flexDirection: "column",
          backgroundColor: "white",
        },
        // {
        //   shadowColor: '#000',
        //   shadowOffset: { width: 0, height: 2 },
        //   shadowOpacity: 0.1,
        //   shadowRadius: 3,
        //   elevation: 5,
        // }
      ]}
    >
      <View style={{
        height: 40, 
        flexDirection: "row", 
        alignItems: "center",
        paddingHorizontal: 8,
        zIndex: 2,
        backgroundColor: "white"
      }}>
        <Pressable style={styles.iconContainer}>
          <Icon iconType="MaterialIcons" name="menu" size={24} color="#333" />
        </Pressable>
        <View style={styles.logoContainer}>
          <Image 
            source={{
              uri: 'https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/c3ab033c-7e9a-419c-b882-eb4fdf5b3ad0/original-480x480.png'
            }} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.rightIcons}>
          <Pressable style={styles.iconContainer}>
            <Icon iconType="MaterialIcons" name="local-shipping" size={24} color="#333" />
          </Pressable>
          
          <Pressable style={styles.iconContainer}>
            <Icon iconType="MaterialIcons" name="shopping-cart" size={24} color="#333" />
            {currentCartLineItemsLength ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {currentCartLineItemsLength}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
      <Animated.View 
        style={{
          paddingHorizontal: 16,
          backgroundColor: "#fff",
          paddingBottom: 10,
          zIndex: 1,
          opacity: searchBarTranslation.current.interpolate({
            inputRange: [-50, -40, 0],
            outputRange: [0, 0.8, 1]
          }),
          transform: [
            {
              translateY: searchBarTranslation.current
            }
          ]
        }}
      >
        <View style={styles.searchContainer}>
          <Icon iconType="MaterialIcons" name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            ref={textInputRef}
            style={[styles.searchInput, {height: 40}]}
            placeholder="Search products..."
            returnKeyType="search"
            onSubmitEditing={() => {}}
          />
          {(textInputRef.current?.value?.length ?? 0)> 0 && (
            <Pressable>
              <Icon iconType="MaterialIcons" name="close" size={20} color="#999" />
            </Pressable>
          )} 
        </View>
      </Animated.View>
    </View>
  );
}

export default function createBottomTabNavigatorFromConfig(
  navigatorConfig,
  navigatorModel,
  props = {},
  pages,
){
  let navigatorOptions = {
    screenOptions: {
      tabBarLabelPosition: 'below-icon',
      // header: ({route, navigation, navConfig}) => (
      //   <CustomTabHeader 
      //     route={route}
      //     navigation={navigation}
      //     navConfig={navConfig}
      //   />
      // ),
    },
  };

  if (Platform.OS !== 'web') navigatorOptions = {...navigatorOptions, detachInactiveScreens: false};

  return (
    <BottomTabNavigator.Navigator 
      id={navigatorConfig.name} 
      {...navigatorOptions} 
      {...props}
    >
      {navigatorConfig.screens
        .map(config => {
          const screenModel = navigatorModel?.screens[config.name];
          return config.type === 'navigator' ? (
            <BottomTabNavigator.Screen
              name={config.name}
              key={config.name}
              navigationKey={config.name}
              options={{headerShown: false}}>
              {screenProps => createNavigatorsFromConfig(config, screenModel, screenProps, pages)}
            </BottomTabNavigator.Screen>
          ) : (
            createScreenFromConfig(BottomTabNavigator, config, screenModel, pages)
          );
        })
        .toList()
        .toJS()}
    </BottomTabNavigator.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    padding: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    height: 30,
    width: 120,
  },
  rightIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  }
});