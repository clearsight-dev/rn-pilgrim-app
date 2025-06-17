import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Text,
  Pressable,
} from "react-native";
import { typography, FONT_FAMILY } from "../../../extractedQueries/theme";

import { Icon } from "apptile-core";
import { fetchSearchSuggestions } from "../../queries/graphql/search/predictiveSearch";

interface SearchBarProps {
  isEditable?: boolean;
  setInputValue: (val: string) => void;
  inputValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isEditable = true,
  setInputValue,
  inputValue = "",
}) => {
  const navigation = useNavigation();

  if (!isEditable) {
    // Non-editable version
    return (
      <Pressable onPress={() => navigation.goBack()}>
        <View style={styles.headerContainer}>
          <View style={styles.backButton}>
            <Icon
              iconType="Ionicons"
              size={20}
              color="black"
              name="arrow-back"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.searchInput, { color: "#8C8C8C" }]}>
              {inputValue || "What are you looking for?"}
            </Text>
            <View style={styles.iconRight}>
              <Icon
                iconType="Ionicons"
                name={inputValue.length > 0 ? "close" : "search"}
                size={20}
                color={inputValue.length > 0 ? "#666" : "#aaa"}
              />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Editable version
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon iconType="Ionicons" size={20} color="black" name="arrow-back" />
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="What are you looking for?"
          value={inputValue}
          onChangeText={setInputValue}
          returnKeyType="search"
          placeholderTextColor={"#8C8C8C"}
          onSubmitEditing={() => {
            if (inputValue.trim().length > 0) {
              navigation.navigate("SearchResultsScreen", {
                query: inputValue,
              });
            }
          }}
          autoFocus={true}
          editable={true}
        />
        <TouchableOpacity
          onPress={() => setInputValue("")}
          style={styles.iconRight}
        >
          <Icon
            iconType="Ionicons"
            name={inputValue.length > 0 ? "close" : "search"}
            size={20}
            color={inputValue.length > 0 ? "#666" : "#aaa"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchScreen = () => {
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue) {
        setSuggestions([]);
        return;
      }

      try {
        console.log("Fetching suggestions for:", inputValue);
        const { data } = await fetchSearchSuggestions({ query: inputValue });
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error("Suggestion fetch failed:", error);
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300); // debounce

    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  return (
    <View style={styles.container}>
      <SearchBar
        isEditable={true}
        inputValue={inputValue}
        setInputValue={setInputValue}
      />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                navigation.navigate("SearchResultsScreen", {
                  query: item.text,
                });
              }}
            >
              <View style={styles.item}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexGrow: 2,
                  }}
                >
                  <Icon
                    iconType="Ionicons"
                    name="search"
                    size={20}
                    color="#8C8C8C"
                  />
                  <Text style={styles.itemText}>{item.text}</Text>
                </View>
                <Icon
                  iconType="Feather"
                  name="arrow-up-left"
                  size={20}
                  color="#8C8C8C"
                />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeAreaContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    lineHeight: 24,
    color: "#1A1A1A",
    fontSize: 16,
    paddingRight: 8,
    fontFamily: FONT_FAMILY?.medium,
  },
  iconRight: {
    paddingLeft: 8,
  },
  itemText: {
    fontFamily: FONT_FAMILY?.regular,
    fontSize: 16,
    lineHeight: 24,
    color: "#8C8C8C",
    marginLeft: 8,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#66666610",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SearchScreen;
