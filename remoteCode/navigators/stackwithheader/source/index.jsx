import React, {useRef, useContext, useEffect, forwardRef, useImperativeHandle} from 'react';
import {
  Platform, 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  TextInput, 
  Animated, 
} from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector, shallowEqual} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image} from '../../../../extractedQueries/ImageComponent';
import {PilgrimContext} from '../../../../PilgrimContext';
import {useCartIconData} from '../../../../extractedQueries/selectors';
import {
  createScreenFromConfig, 
  createNavigatorsFromConfig, 
  Icon, 
  datasourceTypeModelSel,
} from 'apptile-core';
import { TouchableOpacity } from 'react-native-gesture-handler';

const StackNavigator = createStackNavigator();

function isOnHome(state) {
  try {
    const currentRoute = state.routes?.[state?.index ?? 0] ?? null;
    if (currentRoute?.name === "Nav1") {
      const nav1State = currentRoute.state;

      if (nav1State && nav1State.index) {
        const activeRoute = nav1State.routes[nav1State.index];
        return activeRoute.name === "Home";
      } else if (!currentRoute.index) {
        // console.log('[AGENT] returning onHomeRoute because it looks like tab navigator state is not initialized');
        return true;
      } else {
        console.error("I have no idea what is going on now");
        return false;
      }
    } else {
      return false;
    }
  } catch(err) {
    console.error("error: ", err)
  }
  return false;
};

const CustomHeader = forwardRef(({navigation, topInset, numCartItems, showBackbutton}, ref) => {
  const locals = useRef({
    isSearchbarVisible: true,
    searchbarAnimation: null
  });
  const searchBarTranslation = useRef(new Animated.Value(0));
  const textInputRef = useRef(null); 

  useImperativeHandle(ref, () => {
    return {
      showSearchbarAnimated: () => {
        if (!locals.current.isSearchbarVisible) {
          locals.current.isSearchbarVisible = true;
          console.log("Show animation");
          if (locals.current.searchbarAnimation) {
            locals.current.searchbarAnimation.stop();
          }

          searchBarTranslation.current.setValue(-50);
          locals.current.isSearchbarVisible = Animated.timing(searchBarTranslation.current, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }).start((finished) => {
            if (finished) {
              console.log("show animation finished for searchbar");
              locals.current.searchbarAnimation = null;
            }
          });
        } else {
          console.log("searchbar is alredy visible");
        }
      },
      hideSearchbarAnimated: () => {
        if (locals.current.isSearchbarVisible) {
          locals.current.isSearchbarVisible = false;
          console.log("Hide animation");
          if (locals.current.searchbarAnimation) {
            locals.current.searchbarAnimation.stop();
          }

          searchBarTranslation.current.setValue(0);
          locals.current.isSearchbarVisible = Animated.timing(searchBarTranslation.current, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true
          }).start((finished) => {
            if (finished) {
              console.log("hide animation finished for searchbar");
              locals.current.searchbarAnimation = null;
            }
          });
        } else {
          console.log("searchbar is already hidden");
        }
      },
      showSearchbar: () => {
        if (!locals.current.isSearchbarVisible) {
          locals.current.isSearchbarVisible = true;
          searchBarTranslation.current.setValue(0);
        } else {
          console.warn("Searchbar is already visible!");
        }
      },
      hideSearchbar: () => {
        if (locals.current.isSearchbarVisible) {
          locals.current.isSearchbarVisible = false;
          searchBarTranslation.current.setValue(-50);
        } else {
          console.warn("Searchbar is already hidden!");
        }
      },
      isSearchbarVisible: () => {
        return locals.current.isSearchbarVisible;
      }
    }
  }, [searchBarTranslation, locals.current]);

  const FIRST_ROW_HEIGHT = 40;

  const handleHeaderLeft = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.warn("Triggered back navigation on a screen that cannot go back");
    }
  }

  return (
    <View
      style={[
        {
          position: "relative",
          left: 0,
          top: topInset,
          height: (FIRST_ROW_HEIGHT + 10),
          flexDirection: "column",
          backgroundColor: "white",
          // borderWidth: 1, 
          // borderColor: 'red' 
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
        <TouchableOpacity 
          style={styles.iconContainer}
          onPress={handleHeaderLeft}
        >
          <Icon iconType="MaterialIcons" name={showBackbutton ? "keyboard-backspace" : "menu"} size={24} color="#333" />
        </TouchableOpacity>
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
            {numCartItems ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {numCartItems}
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
})

function CustomHeaderSmart({route, navigation}) {
  const insets = useSafeAreaInsets();
  // const {numCurrentCartItems} = useCartIconData();
  const {pilgrimGlobals} = useContext(PilgrimContext);
  const headerComponent = useRef(null);

  useEffect(() => {
    const onHome = isOnHome(navigation.getState());
    const isSearchbarVisible = headerComponent?.current?.isSearchbarVisible();
    if (isSearchbarVisible && pilgrimGlobals.homePageScrolledDown === true && onHome) {
      headerComponent?.current?.hideSearchbarAnimated();
    } else if (!isSearchbarVisible && pilgrimGlobals.homePageScrolledDown === false && onHome) {
      headerComponent?.current?.showSearchbarAnimated();
    }
  }, [pilgrimGlobals, headerComponent, navigation]);

  useNavigationState((state) => {
    const isHomeRoute = isOnHome(state);
    const isSearchbarVisible = headerComponent?.current?.isSearchbarVisible();
    if (!isSearchbarVisible && isHomeRoute) {
      headerComponent?.current?.showSearchbar();
    } else if (isSearchbarVisible && !isHomeRoute) {
      headerComponent?.current?.hideSearchbar();
    }
  })

  return (
    <CustomHeader
      navigation={navigation}
      topInset={insets?.top ?? 0}
      numCartItems={0}
      showBackbutton={route.name !== "Nav1"}
      ref={headerComponent}
    />
  );
}

export default function createCustomStackNavWithHeader(
  navigatorConfig,
  navigatorModel,
  props = {},
  pages,
) {
  let navigatorOptions = {
    screenOptions: {
      detachPreviousScreen: false,
    }, 
  };
  if (Platform.OS !== 'web') navigatorOptions = {...navigatorOptions, detachInactiveScreens: false};

  let NavScreenOptions = {
    detachPreviousScreen: false,
    headerShown: true,
    header: ({route, navigation, navConfig}) => (
      <CustomHeaderSmart 
        route={route}
        navigation={navigation}
      />
    ),
  };

  return (
    <StackNavigator.Navigator 
      id={navigatorConfig.name} 
      {...navigatorOptions} 
      {...props}
    >
      {navigatorConfig.screens.size === 0 ? (
        <StackNavigator.Screen
          name="EmptyScreen"
          options={{headerShown: false}}
          component={() => <Text>Add One or More Screens!</Text>}
        />
      ) : (
        navigatorConfig.screens
          .map(config => {
            const screenModal = navigatorModel?.screens[config.name];
            return config.type === 'navigator' ? (
              <StackNavigator.Screen
                name={config.name}
                key={config.name}
                navigationKey={config.name}
                options={NavScreenOptions}
              >
                {screenProps => createNavigatorsFromConfig(config, screenModal, screenProps, pages)}
              </StackNavigator.Screen>
            ) : (
              createScreenFromConfig(StackNavigator, config, screenModal, pages, NavScreenOptions)
            );
          })
          .toList()
          .toJS()
      )}
    </StackNavigator.Navigator>
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