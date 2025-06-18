import React from "react";
import { View, Text } from "react-native";
import SearchResultsScreen from "../../../../src/screens/Search/SearchResultsScreen";

export function ReactComponent({ model }) {
  return <SearchResultsScreen />;
}

export const WidgetConfig = {};

export const WidgetEditors = {
  basic: [],
};

export const WrapperTileConfig = {
  name: "Rating Summary Card",
  defaultProps: {},
};
