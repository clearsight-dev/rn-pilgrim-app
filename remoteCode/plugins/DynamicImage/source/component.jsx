import React, {useCallback, useEffect, useState} from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  View,
  PixelRatio,
  Platform,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import {Portal} from '@gorhom/portal';

import {MaterialCommunityIcons} from 'apptile-core';
import {getPlatformStyles} from 'apptile-core';
import {CustomModal} from 'apptile-core';

import {defaultEditors, defaultStyleEditors} from 'apptile-core';
import {ImageComponent} from 'apptile-core';

import {CurrentScreenContext} from 'apptile-core';
import {makeBoolean} from 'apptile-core';
import {Placeholder} from 'apptile-core';

import {ImageZoom} from './ImageZoom';

const ImagePreviewGestureHandlers = ({imgSource}) => {
  return (
    <ImageZoom
      cropWidth={Dimensions.get('window').width}
      cropHeight={Dimensions.get('window').height}
      imageHeight={400}
      imageWidth={Dimensions.get('window').width}
      useNativeDriver={true}
      panToMove={true}>
      <ImageBackground
        source={{uri: imgSource}}
        resizeMode="contain"
        style={styles.image}
      />
    </ImageZoom>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'absolute',
    zIndex: 9,
    top: 0,
    right: 8,
    height: 28,
    width: 28,
    borderRadius: 28,
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: 'black',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
});

export const ReactComponent = React.forwardRef((props, ref) => {
  const {model, modelStyles, config, getDeviceImage, isAnimated, animations} =
    props;
  const isLoading = !!model.get('isLoading');
  const {value, resizeMode, sourceType, assetId} = model.toJS();
  const layout = config.get('layout');
  const layoutStyles = layout ? layout.getFlexProperties() : {flex: 1};

  const {
    borderRadius,
    margin,
    padding,
    elevation: elevationStr,
    ...genericStyles
  } = modelStyles ?? {};
  const modelPlatformStyles = getPlatformStyles({
    borderRadius,
    margin,
    padding,
  });
  const BACKDROP_COLOR = genericStyles?.backdropColor || 'rgba(0,0,0,0.8)';

  const allowPreview = model.get('allowPreview');
  const dynamicWidth = model.get('dynamicWidth');
  const width = model.get('width');
  const {imageRecord} = getDeviceImage(assetId);
  const [imageSource, setImageSource] = useState(value);
  // To get Optimized Image from asset gallery
  const [layoutSize, setLayoutSize] = useState('');

  const imageStyles = {
    borderRadius,
    ...genericStyles,
  };

  function isDifferentImage(url1, url2) {
    // For when source changes from null to ""
    if (!url1 && !url2) {
      return false;
    } else {
      return url1 !== url2;
    }
  }

  useEffect(() => {
    if (sourceType && sourceType?.toLowerCase() !== 'url' && assetId) {
      const assetSource = imageRecord;
      const assetSourceValue = assetSource?.fileUrl ?? null;
      if (isDifferentImage(imageSource, assetSourceValue)) {
        setImageSource(assetSourceValue);
      }
    } else {
      if (isDifferentImage(imageSource, value)) {
        setImageSource(value);
      }
    }
  }, [imageRecord, assetId, sourceType, value, layoutSize]);

  const onLayout = event => {
    const {height, width} = event.nativeEvent.layout;
    const newWidth = PixelRatio.getPixelSizeForLayoutSize(width);
    const newHeight = PixelRatio.getPixelSizeForLayoutSize(height);
    const newLayoutSize = `${newWidth}x${newHeight}`;
    if (newLayoutSize !== '0x0' && newLayoutSize != layoutSize) {
      setLayoutSize(newLayoutSize);
    }
  };

  const [showModal, setShowModal] = useState(false);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (showModal) {
        closeModal();
        return true;
      }
      return false;
    };

    if (Platform.OS !== 'web') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }
  }, [showModal, closeModal]);

  return imageSource && !isLoading ? (
    <Animated.View
      style={[layoutStyles, modelPlatformStyles]}
      onLayout={onLayout}>
      {allowPreview ? (
        <>
          <Pressable onPress={() => setShowModal(true)}>
            <ImageComponent
              ref={ref}
              style={[
                layoutStyles,
                imageStyles,
                dynamicWidth && {
                  width: isNaN(Number(width)) ? 30 : Number(width),
                },
              ]}
              source={{uri: imageSource}}
              resizeMode={
                ['contain', 'cover', 'stretch'].includes(resizeMode)
                  ? resizeMode
                  : ImageWidgetConfig.resizeMode
              }
            />
          </Pressable>
          <CurrentScreenContext.Consumer>
            {screen => (
              <Portal hostName={screen.isModal ? model.get('pageKey') : 'root'}>
                {showModal && (
                  <CustomModal
                    position="center"
                    onClose={closeModal}
                    outerComponents={
                      <View
                        style={[
                          styles.iconWrapper,
                          {
                            top:
                              (Platform.OS === 'ios' && !screen.isModal
                                ? 54
                                : 0) + 4,
                          },
                        ]}>
                        <MaterialCommunityIcons
                          name="close"
                          style={[styles.closeIcon]}
                          onPress={closeModal}
                        />
                      </View>
                    }
                    backdropColor={BACKDROP_COLOR}>
                    <ImagePreviewGestureHandlers imgSource={imageSource} />
                  </CustomModal>
                )}
              </Portal>
            )}
          </CurrentScreenContext.Consumer>
        </>
      ) : (
        <ImageComponent
          ref={ref}
          style={[
            layoutStyles,
            imageStyles,
            dynamicWidth && {width: isNaN(Number(width)) ? 30 : Number(width)},
          ]}
          source={{uri: imageSource}}
          resizeMode={
            ['contain', 'cover', 'stretch'].includes(resizeMode)
              ? resizeMode
              : ImageWidgetConfig.resizeMode
          }
        />
      )}
    </Animated.View>
  ) : (
    <Placeholder layoutStyles={{...layoutStyles}} />
  );
});

export const widgetEditors = {
  // basic: defaultEditors.basic,
  basic: [
    {
      type: 'assetEditor',
      name: 'value',
      props: {
        label: 'Image',
        urlProperty: 'value',
        assetProperty: 'assetId',
        sourceTypeProperty: 'sourceType',
      },
    },
    {
      type: 'checkbox',
      name: 'allowPreview',
      props: {
        label: 'Allow preview',
      },
    },
    {
      type: 'checkbox',
      name: 'dynamicWidth',
      props: {
        label: 'Dynamic Width',
      },
    },
    {
      type: 'codeInput',
      name: 'width',
      hidden: config => !config.get('dynamicWidth') ?? false,
      props: {
        label: 'Width',
      },
    },
    {
      type: 'codeInput',
      name: 'isLoading',
      props: {
        label: 'Loading State',
      },
    },
  ],
  layout: [
    {
      type: 'radioGroup',
      name: 'resizeMode',
      props: {
        label: 'Image Sizing',
        options: ['contain', 'cover', 'stretch'],
      },
    },
    ...defaultEditors.layout,
  ],
  animations: defaultEditors.animations,
};

export const ImageWidgetConfig = {
  value: '',
  resizeMode: 'contain',
  sourceType: 'url',
  assetId: '',
  dynamicWidth: false,
  width: '',
  allowPreview: false,
  isLoading: false,
};

export const imageWidgetStyleEditorsConfig = [
  {
    type: 'colorInput',
    name: 'backdropColor',
    props: {
      label: 'Backdrop Color',
      placeholder: '#HexCode',
    },
  },
  ...defaultStyleEditors,
];

export const propertySettings = {
  isLoading: {
    getValue: (model, val, _) => {
      return makeBoolean(val);
    },
  },
};
