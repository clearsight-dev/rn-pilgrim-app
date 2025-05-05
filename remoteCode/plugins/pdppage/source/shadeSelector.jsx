
import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
} from "react-native";
import { typography, colors, FONT_FAMILY } from "../../../../extractedQueries/theme";
import _ from "lodash-es";
import { InlineVariantSelector } from "./ProductInfo"
import { Image } from "../../../../extractedQueries/ImageComponent";


const SelectShade = ({
    productData, selectedVariant, setSelectedVariant, variants
}) => {
    const isMakeUpPage = useMemo(() => {
        return _.startsWith(_.get(productData, 'productType'), 'Makeup');
    }, [productData]);

    const [selectedSkinTone, setSelectedSkinTone] = React.useState('');
    const skinToneImageMap = useMemo(() => {
        return {
            'Light skintone': _.get(selectedVariant, 'light_skin_tone_image_url.value', ''),
            'Medium skintone': _.get(selectedVariant, 'medium_skin_tone_image_url.value', ''),
            'Deep skintone': _.get(selectedVariant, 'deep_skin_tone_image_url.value', ''),
            'No skintone': _.get(selectedVariant, 'no_skin_tone_image_url.value', ''),
        };
    }, [selectedVariant]);

    useEffect(() => {
        const defaultSkinTone = _.findKey(skinToneImageMap, val => {
            return !_.isEmpty(val);
        });

        if (!Object.keys(skinToneImageMap).includes(selectedSkinTone)) {
            setSelectedSkinTone(defaultSkinTone ?? '');
        }
    }, [skinToneImageMap]);

    if (!isMakeUpPage) {
        return null;
    }

    return (
        <ShadeFilter
            skinToneImageMap={skinToneImageMap}
            selectedSkinTone={selectedSkinTone}
            setSelectedSkinTone={setSelectedSkinTone}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            variants={variants}
            showVariantSelector={productData?.variantsCount > 1}
        />
    );
};



const ShadeFilter = ({
    skinToneImageMap,
    selectedSkinTone,
    setSelectedSkinTone,
    setSelectedVariant,
    selectedVariant,
    variants
}) => {
    const hasValidSkinTones = !_.every(Object.values(skinToneImageMap), o => _.isEmpty(o));
    const hasSelectedSkinTone = !_.isEmpty(selectedSkinTone);
    const hasValidSelectedSkinTone = !_.isEmpty(skinToneImageMap[selectedSkinTone]);

    if (!hasValidSkinTones || !hasSelectedSkinTone || !hasValidSelectedSkinTone) {
        return null;
    }

    return <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <View>
            <Text style={[typography.heading20, { color: colors.dark100 }]}>
                Try our shade filter
            </Text>

            {_.isEmpty(skinToneImageMap['No skintone']) && !_.isEqual(selectedSkinTone, 'No skintone') && (
                <ScrollView
                    style={fixedStyles.skinToneSelectorContainer}
                    horizontal
                    showsHorizontalScrollIndicator={false}>
                    {Object.keys(_.omit(skinToneImageMap, ['No skintone'])).map((entry, idx) => (
                        <Pressable
                            key={idx}
                            onPress={() => {
                                setSelectedSkinTone(entry);
                            }}
                            style={[
                                fixedStyles.skinToneShadeSelectorContainer,
                                selectedSkinTone === entry
                                    ? fixedStyles.selectedSkinToneShadeSelectorContainer
                                    : fixedStyles.unSelectedSkinToneShadeSelectorContainer,
                            ]}>
                            <Text
                                style={[
                                    { fontFamily: FONT_FAMILY.medium },
                                    fixedStyles.skinToneHeadingText,
                                    selectedSkinTone === entry
                                        ? fixedStyles.selectedSkinTone
                                        : fixedStyles.unSelectedSkinTone,
                                ]}>
                                {entry}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
        </View>
        <View style={fixedStyles.skinToneContainer}>
            <View style={fixedStyles.skinToneImgContainer}>
                <Image
                    source={{ uri: skinToneImageMap[selectedSkinTone] }}
                    style={[{ width: '100%', height: '100%' }]}
                    resizeMode={'cover'}
                />
            </View>
            <View style={{ padding: 16, backgroundColor: '#33333301' }}>
                <InlineVariantSelector
                    variants={variants}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />
            </View>
        </View>
    </View>
}


const fixedStyles = StyleSheet.create({
    skinToneSelectorContainer: {
        flexDirection: 'row',
        marginTop: 12,
        marginBottom: 16,
    },
    skinToneShadeSelectorContainer: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 50,
        overflow: 'hidden',
        marginRight: 5,
    },
    selectedSkinToneShadeSelectorContainer: {
        backgroundColor: '#00AEBD',
        borderColor: '#00AEBD',
    },
    unSelectedSkinToneShadeSelectorContainer: {
        backgroundColor: '#fff',
    },
    skinToneHeadingText: {
        fontSize: 13,
        marginHorizontal: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        textTransform: 'capitalize',
    },
    selectedSkinTone: {
        color: '#fff',
    },
    unSelectedSkinTone: {
        color: '#000',
    },
    skinToneContainer: {
        backgroundColor: '#F2F2F2',
        borderRadius: 24,
        overflow: 'hidden',
    },
    skinToneImgContainer: {
        width: '100%',
        height: 350,
    },
    colorOptionContainer: {
        height: 40,
        width: 40,
        borderWidth: 2,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    colorOption: {
        height: 32,
        width: 32,
        borderRadius: 16,
        overflow: 'hidden',
    },
});


export default SelectShade;