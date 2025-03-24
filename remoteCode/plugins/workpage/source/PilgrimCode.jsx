import React from 'react';
import { 
  View, 
  Text,
  Image,
  StyleSheet
} from 'react-native';
import Accordion from './Accordion';

export function PilgrimCode({ content = [] }) {
  const firstRow = [];
  const secondRow = [];
  const createLabelledItem = (i) => {
    const item = content[i];
    return (
      <View 
        key={item.url}
        style={{
          width: 90,
          paddingVertical: 30,
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Image
          style={{
            height: 59,
            aspectRatio: 1,
            marginBottom: 10 
          }}
          resizeMode='contain'
          source={{uri: item.urls[0]}}
        ></Image>
        <Text style={{textAlign: 'center', fontSize: 11, fontWeight: '500'}}>{item.blurb}</Text>
      </View>
    );
  }

  for (let i = 0; i < content.length/2; i++) {
    firstRow.push(createLabelledItem(i));
  }

  for (let i = Math.ceil(content.length/2); i < content.length; i++) {
    secondRow.push(createLabelledItem(i));
  }

  return (
    <Accordion title="The Pilgrim code">
      <View style={{
        flexDirection: 'column',
      }}>
        <Text style={{fontSize: 14, fontWeight: '400', lineHeight: 20, marginBottom: 16}}>
          Pilgrim is "Clean Compatible". Not just free of harmful and toxic chemicals 
          but uses only those ingredients that either enhance the health of our hair 
          & skin or support the effectiveness of formulations.
        </Text>
        <View style={styles.imageRow}>
          {firstRow}
        </View>
        <View style={styles.imageRow}>
          {secondRow}
        </View>
      </View>
    </Accordion>
  );
}

const styles = StyleSheet.create({
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  }
})

export default PilgrimCode;
