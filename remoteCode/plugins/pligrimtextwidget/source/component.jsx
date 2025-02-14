import React from 'react';
import {Animated} from 'react-native';
import {
  defaultEditors, 
  getPlatformStyles, 
  isJSBinding,
  usePlaceHolder
} from 'apptile-core';
import _ from 'lodash';

export const TextWidget = React.forwardRef((props, ref) => {
  const {model, modelStyles, config, animations} = props;
  const Placeholder = usePlaceHolder();
  const modelValue = model.get('value')?.toString();
  const value = isJSBinding(modelValue) ? '' : modelValue;

  const layout = config.get('layout');
  const isLoading = !!model.get('isLoading');
  const layoutStyles = getPlatformStyles(layout ? layout.getFlexProperties() : {flex: 1});

  const {shadowColor, shadowOffset, shadowRadius, ...modelPlatformStyles} = modelStyles
    ? getPlatformStyles(modelStyles)
    : {};

  const {typography, ...restModelPlatformStyles} = modelPlatformStyles;
  const horizontalAlign = _.isEmpty(model.get('horizontalAlign', 'auto'))
    ? 'auto'
    : model.get('horizontalAlign', 'auto');
  const verticalAlign = _.isEmpty(model.get('verticalAlign', 'auto')) ? 'auto' : model.get('verticalAlign', 'auto');

  const overflowType = model.get('overflowType') ? model.get('overflowType') : 'hidden';
  const adjustsFontSizeToFit = model.get('adjustsFontSizeToFit', false);
  const sizeAdjustProps = adjustsFontSizeToFit
    ? {
        adjustsFontSizeToFit,
        minimumFontScale: _.clamp(_.toNumber(model.get('minFontScale', 1)), 0, 1),
      }
    : {};

  /**
   * [Vadi] Reference
   * After upgrading React Native, a new prop called ellipsizeMode was introduced to display '...' when text is truncated.
   * However, the ellipsizeMode does not work when combined with adjustsFontSizeToFit and minimumFontScale (ios) so separated numberOfLines from sizeAdjustProps (change is backward compatible with affecting existing func)
   */

  const isTextTruncateEnabled = !!model.get('numLines', undefined);
  const truncateTextProps = isTextTruncateEnabled
    ? {
        numberOfLines: _.clamp(_.toNumber(model.get('numLines', 1)), 1, Number.MAX_SAFE_INTEGER),
        ellipsizeMode: model.get('ellipsizeMode', 'tail'),
      }
    : {};

  // const animationProps = isAnimated
  //   ? {
  //       entering: animations?.transitions?.entering,
  //       exiting: animations?.transitions?.exiting,
  //       layout: animations?.transitions?.layout,
  //     }
  //   : {};
  const animationProps = {};

  return isLoading ? (
    <Placeholder
      layoutStyles={{...layoutStyles, ...restModelPlatformStyles, height: typography?.fontSize, minWidth: '75%'}}
    />
  ) : (
    <Animated.Text
      ref={ref}
      {...sizeAdjustProps}
      {...truncateTextProps}
      style={[
        layoutStyles,
        restModelPlatformStyles,
        typography,
        {
          textAlign: ['auto', 'left', 'center', 'right'].includes(horizontalAlign) ? horizontalAlign : 'auto',
          textAlignVertical: ['auto', 'top', 'center', 'bottom'].includes(verticalAlign) ? verticalAlign : 'auto',
          overflow: overflowType,
        },
        {
          textShadowColor: shadowColor,
          textShadowOffset: shadowOffset,
          textShadowRadius: shadowRadius,
        },
      ]}>
      {value ? value : ''}
    </Animated.Text>
  );
})
export const WidgetConfig = {
  value: 'Text',
  adjustsFontSizeToFit: false,
  minFontScale: 1,
  numLines: 1,
  useAnimamtedValue: false,
  isLoading: false,
};


export const WidgetEditors = {
  basic: [...defaultEditors.basic],
  advanced: [
    {
      type: 'checkbox',
      name: 'adjustsFontSizeToFit',
      props: {
        label: 'Adjust font size to fit',
      },
    },
    {
      type: 'codeInput',
      name: 'minFontScale',
      props: {
        label: 'Minimum font scale',
      },
      hidden: model => !model.get('adjustsFontSizeToFit'),
    },
    {
      type: 'codeInput',
      name: 'numLines',
      props: {
        label: 'Number of lines',
      },
    },
    {
      type: 'radioGroup',
      name: 'ellipsizeMode',
      props: {
        label: 'Ellipsize Mode',
        options: ['head', 'middle', 'tail', 'clip'],
      },
    },
    {
      type: 'codeInput',
      name: 'isLoading',
      defaultValue: false,
      props: {
        label: 'Loading State',
      },
    },
  ],
  layout: [
    {
      type: 'radioGroup',
      name: 'horizontalAlign',
      props: {
        label: 'Horizontal Alignment',
        options: [
          {icon: 'alpha-a', value: 'auto'},
          {icon: 'format-align-left', value: 'left'},
          {icon: 'format-align-center', value: 'center'},
          {icon: 'format-align-right', value: 'right'},
          {icon: 'format-align-justify', value: 'justify'},
        ],
      },
    },
    {
      type: 'radioGroup',
      name: 'verticalAlign',
      props: {
        label: 'Vertical Alignment',
        options: [
          {icon: 'alpha-a', value: 'auto'},
          {icon: 'format-vertical-align-top', value: 'top'},
          {icon: 'format-vertical-align-center', value: 'center'},
          {icon: 'format-vertical-align-bottom', value: 'bottom'},
        ],
      },
    },
    {
      type: 'radioGroup',
      name: 'overflowType',
      props: {
        label: 'Overflow',
        options: ['scroll', 'hidden'],
      },
    },
    ...defaultEditors.layout,
  ],
  animations: defaultEditors.animations,
};


export const WrapperTileConfig = {
  name: 'Text tile',
  defaultProps: {
  },
};

