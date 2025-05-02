import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "./ImageComponent";
import Accordion from "./Accordion";
import { colors, FONT_FAMILY, typography } from "./theme";
import GradientText from "./GradientText";

export function PilgrimCode({ enableCodeText = false }) {
  const content = [
    {
      blurb: "Natural World Ingredients",
      urls: [
        "https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/125799f6-b29d-49a2-bb8e-9c4156675e5f/original-480x480.png",
      ],
    },
    {
      blurb: "Derma-Tested for saftey",
      urls: [
        "https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/4c8a7874-de81-40fb-8e2d-c60ee8d76135/original-480x480.png",
      ],
    },
    {
      blurb: "India FDA Approved",
      urls: [
        "https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/cc33e08a-4b00-44dd-95ac-c97aa0b95131/original-480x480.png",
      ],
    },
    {
      blurb: "Vegan & No Animal Testing",
      urls: [
        "https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/04c720e4-059f-49d0-a018-d4cc4586b345/original-480x480.png",
      ],
    },
    {
      blurb: "No Toxic Chemicals",
      urls: [
        "https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/1daebc23-0b32-461b-a75c-1efcb2bf0e74/original-480x480.png",
      ],
    },
    {
      blurb: "Plastic Positive",
      urls: [
        "https://cdn.apptile.io/2299b5c8-77d8-4500-9723-c0ccfe91694d/367b4bdb-03ac-4dff-8e68-6a6527084597/original-480x480.png",
      ],
    },
  ];
  const firstRow = [];
  const secondRow = [];
  const createLabelledItem = (i) => {
    const item = content[i];
    return (
      <View
        key={i + ":" + item.urls[0]}
        style={{
          width: 90,
          paddingVertical: 30,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Image
          style={{
            height: 59,
            aspectRatio: 1,
            marginBottom: 10,
          }}
          resizeMode="contain"
          source={{ uri: item.urls[0] }}
        ></Image>
        <Text
          style={{
            fontFamily: FONT_FAMILY.medium,
            textAlign: "center",
            fontSize: 11,
            fontWeight: "500",
            color: colors.dark100,
          }}
        >
          {item.blurb}
        </Text>
      </View>
    );
  };

  for (let i = 0; i < content.length / 2; i++) {
    firstRow.push(createLabelledItem(i));
  }

  for (let i = Math.ceil(content.length / 2); i < content.length; i++) {
    secondRow.push(createLabelledItem(i));
  }

  return (
    <View
      style={{
        flexDirection: "column",
        paddingVertical: enableCodeText ? 0 :24,
      }}
    >
      {enableCodeText ? (
        <Text style={styles.codeText}>
          Pilgrim is "Clean Compatible". Not just free of harmful and toxic
          chemicals but uses only those ingredients that either enhance the
          health of our hair & skin or support the effectiveness of
          formulations.
        </Text>
      ) : (
        <GradientText
          text="The Pilgrim Code"
          fontSize={22}
          width="100%"
          height={32}
          gradientColors={[
            { offset: "0%", color: "#009FAD" },
            { offset: "33%", color: "#00707A" },
            { offset: "66%", color: "#009FAD" },
            { offset: "100%", color: "#00707A" },
          ]}
        />
      )}

      <View style={styles.imageRow}>{firstRow}</View>
      <View style={styles.imageRow}>{secondRow}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  codeText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "#313131",
  },
});

export default PilgrimCode;
