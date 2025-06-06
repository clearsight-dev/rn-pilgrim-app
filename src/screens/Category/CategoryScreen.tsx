import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { FONT_FAMILY } from "../../../extractedQueries/theme";
import { useNavigation } from "@react-navigation/native";
import { fetchMenu } from "../../queries/graphql/menu/menu";
import SkeletonBase from "../../../components/skeleton/skeletonBase";

// [Apptile Connectors]
import { Icon } from "apptile-core";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const stickHeightAnim = useRef(new Animated.Value(56)).current;
  const itemRefs = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchMenu({ handle: "main-menu" });
        if (data?.items?.length > 0) {
          setMenu(data);
          setActiveMenu(data.items[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const targetY = itemRefs.current[activeMenu] ?? 0;

    // Move background highlight
    Animated.timing(indicatorAnim, {
      toValue: targetY,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animate stick height from 0 to 56
    stickHeightAnim.setValue(0);
    Animated.timing(stickHeightAnim, {
      toValue: 56,
      duration: 500,
      useNativeDriver: false, // height requires useNativeDriver: false
    }).start();

    // Animate content transition
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setExpandedGroups({});
  }, [activeMenu]);

  const toggleGroup = (groupId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.filler]}>
        <View style={styles.sidebar}>
          {[...Array(12)].map((_, i) => (
            <SkeletonBase
              key={i}
              style={{ height: 56, marginBottom: 8, borderRadius: 4 }}
            />
          ))}
        </View>
        <ScrollView style={styles.submenu}>
          {[...Array(12)].map((_, i) => (
            <View key={i} style={{ marginBottom: 24 }}>
              <SkeletonBase
                style={{
                  height: 20,
                  width: "60%",
                  marginBottom: 12,
                  borderRadius: 4,
                }}
              />
              {[...Array(2)].map((_, j) => (
                <SkeletonBase
                  key={j}
                  style={{
                    height: 20,
                    width: "100%",
                    marginBottom: 8,
                    borderRadius: 4,
                  }}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!menu) {
    return (
      <View
        style={[
          styles.container,
          styles.filler,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.failedToLoadText}>Failed to load menu.</Text>
      </View>
    );
  }

  const selectedMainItem = menu.items.find(
    (item: any) => item.id === activeMenu
  );

  return (
    <View style={[styles.container, styles.filler]}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              transform: [{ translateY: indicatorAnim }],
            },
          ]}
        >
          {/* Animated stick */}
          <Animated.View
            style={[
              styles.activeIndicatorStick,
              {
                height: stickHeightAnim,
              },
            ]}
          />
        </Animated.View>

        {menu.items.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            onLayout={(event) => {
              const y = event.nativeEvent.layout.y;
              itemRefs.current[item.id] = y;
              if (item.id === activeMenu && indicatorAnim._value === 0) {
                indicatorAnim.setValue(y);
              }
            }}
            style={styles.sidebarItem}
            onPress={() => setActiveMenu(item.id)}
          >
            <Text
              style={[
                styles.sidebarItemText,
                activeMenu === item.id && styles.activeSidebarItemText,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submenu content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          styles.submenu,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {selectedMainItem?.items?.map((subItem: any) => {
          const isExpanded = expandedGroups[subItem.id] ?? true;
          return (
            <View key={subItem.id} style={styles.group}>
              <TouchableOpacity
                style={{ alignItems: "center", flexDirection: "row" }}
                onPress={() => toggleGroup(subItem.id)}
              >
                <Text style={styles.groupTitle}>{subItem.title}</Text>
                {isExpanded ? (
                  <Icon
                    iconType="MaterialCommunityIcons"
                    size={20}
                    color="#00796b"
                    name="minus"
                  />
                ) : (
                  <Icon
                    iconType="MaterialCommunityIcons"
                    size={20}
                    color="#00796b"
                    name="plus"
                  />
                )}
              </TouchableOpacity>

              {isExpanded &&
                subItem.items?.map((grandItem: any) => {
                  const resourceId = grandItem.resourceId || "";
                  const handle = grandItem.resource?.handle;

                  return (
                    <TouchableOpacity
                      key={grandItem.id}
                      style={styles.linkItem}
                      onPress={() => {
                        if (!handle) return;

                        if (resourceId.startsWith("gid://shopify/Product")) {
                          navigation.navigate("Product", {
                            productHandle: handle,
                          });
                        } else if (
                          resourceId.startsWith("gid://shopify/Collection")
                        ) {
                          navigation.navigate("Collection", {
                            collectionHandle: handle,
                          });
                        }
                      }}
                    >
                      <Text style={styles.linkText}>{grandItem.title}</Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filler: { marginTop: 70 },
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#fff",
  },
  sidebar: {
    width: 148,
    borderRightWidth: 1,
    borderRightColor: "#66666610",
    position: "relative",
  },
  sidebarItem: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  sidebarItemText: {
    fontSize: 16,
    color: "#313131",
    fontFamily: FONT_FAMILY?.regular,
  },
  failedToLoadText: {
    fontFamily: FONT_FAMILY?.regular,
  },
  activeSidebarItemText: {
    fontFamily: FONT_FAMILY?.bold,
    color: "#00726C",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 140,
    height: 56,
    backgroundColor: "#e6f2f0",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: -1,
    overflow: "hidden",
  },
  activeIndicatorStick: {
    width: 4,
    backgroundColor: "#00796b",
    borderTopRightRadius: 240,
    borderBottomRightRadius: 240,
    alignSelf: "flex-start",
  },
  submenu: {
    flex: 1,
    padding: 16,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    color: "#00726C",
    marginBottom: 8,
    flexGrow: 2,
    fontFamily: FONT_FAMILY?.bold,
  },
  linkItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#66666610",
  },
  linkText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: FONT_FAMILY?.regular,
  },
});

export default CategoryScreen;
