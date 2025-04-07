import React from 'react';
import {View} from 'react-native';
import _ from 'lodash';
import {OtpInput} from 'react-native-otp-entry';

import {
  PluginEditorsConfig,
  getPlatformStyles,
  WidgetRefContext,
  isJSBinding,
  PluginListingSettings,
  PluginPropertySettings,
  defaultEditors,
  connectWidget,
  WidgetProps,
  EventTriggerIdentifier,
} from 'apptile-core';

import docs from './docs';
import {removeOTPFetchListener, startOTPFetchListener} from './otpListener';
import {styleConfig} from './editorOptions';

const WidgetConfig = {
  value: '0000',
  onFocus: '',
  onBlur: '',
  onFilled: '',
  numOfDigits: 4,
  autofocus: true,
  focusColor: '#000',
  blurOnFilled: false,
  hideStick: false,
  focusStickBlinkingDuration: 500,
  disabled: false,
  type: 'numeric',
  secureTextEntry: false,
};

const pluginListing: PluginListingSettings = {
  labelPrefix: 'otpInputText',
  type: 'widget',
  name: 'OTP Input Text',
  description: 'Display OTP Text Input',
  layout: {
    flex: 1,
  },
  section: 'SDK',
  manifest: {
    directoryName: 'otpInputText',
  },
  icon: 'text',
};

const allowedStylesMap = {
  pinCode: 'pinCodeTextStyle',
  placeholder: 'placeholderTextStyle',
  container: 'containerStyle',
  pinCodeContainer: 'pinCodeContainerStyle',
  focusStick: 'focusStickStyle',
  focusedPinCodeContainer: 'focusedPinCodeContainerStyle',
  filledPinCodeContainer: 'filledPinCodeContainerStyle',
  disabledPinCodeContainer: 'disabledPinCodeContainerStyle',
};

const getOTPInputStyles = styles => {
  const constructedStyles = {};

  _.forEach(styles, (value, key) => {
    if (!_.includes(key, '_')) {
      return;
    }
    const splitedValues = _.split(key, '_');
    const stylePrefix = _.head(splitedValues);
    const styleKey = _.last(splitedValues);

    if (stylePrefix && _.has(allowedStylesMap, stylePrefix) && styleKey) {
      const styleKeyHolder = _.get(
        allowedStylesMap,
        stylePrefix,
        stylePrefix,
      ) as string;
      if (styleKey !== 'typography') {
        _.set(constructedStyles, [styleKeyHolder, styleKey], value);
      } else {
        const prevObj = _.get(constructedStyles, [styleKeyHolder], {});
        _.set(constructedStyles, [styleKeyHolder], _.merge(prevObj, value));
      }
    }
  });

  return constructedStyles;
};

const Widget = React.forwardRef<any, WidgetProps>((props, ref) => {
  const {
    model,
    modelUpdate,
    triggerEvent,
    config,
    instance,
    pageKey,
    id,
    modelStyles,
  } = props as any;

  const otpInputRef = React.useRef();
  const latestText = React.useRef('');
  const shouldTriggerOTPFilled = React.useRef(false);
  const refContext = React.useContext(WidgetRefContext);

  const modelValue = model.get('value');
  const placeholder = model.get('placeholder');

  const numOfDigits = _.isNaN(_.toNumber(model.get('numOfDigits')))
    ? 4
    : _.toNumber(model.get('numOfDigits'));
  const focusStickBlinkingDuration = _.isNaN(
    _.toNumber(model.get('focusStickBlinkingDuration')),
  )
    ? 500
    : _.toNumber(model.get('focusStickBlinkingDuration'));

  const autofocus = model.get('autofocus');
  const focusColor = model.get('focusColor');
  const blurOnFilled = model.get('blurOnFilled');
  const hideStick = model.get('hideStick');
  const disabled = model.get('disabled');
  const secureTextEntry = model.get('secureTextEntry');
  const type = model.get('type');

  const otpInputProps = {
    numberOfDigits: numOfDigits,
    focusStickBlinkingDuration,
    autofocus,
    focusColor,
    blurOnFilled,
    hideStick,
    disabled,
    secureTextEntry,
    type,
  };

  const value = isJSBinding(modelValue) ? '' : modelValue;
  const modelPlatformStyles = getPlatformStyles(modelStyles);

  const layout = config.get('layout');
  const layoutStyles = getPlatformStyles(
    layout ? layout.getFlexProperties() : {flex: 1},
  );

  const OTPInputStyles = getOTPInputStyles(modelPlatformStyles);

  React.useEffect(() => {
    if (otpInputRef?.current) {
      refContext.registerWidgetRef(otpInputRef, pageKey, id, instance);
    }
    return () => {
      refContext.unRegisterWidgetRef(pageKey, id, instance);
    };
  }, [id, instance, pageKey, otpInputRef, refContext]);

  // The placeholder update is a hack. After the user has finished typing
  // and the appModel has the updated text value if they hit submit, then
  // the modelUpdate will be ignored if there is no change at all in the model.
  // So we just update the placeholder to trick the system into doing a render
  // cycle.
  const setInputValueWithModalUpdate = shouldUpdatePlaceholder => {
    // console.log("Setting latest text: ", latestText.current);
    // setInputValue(v);
    // debouncedHandleChange(v);
    const updates = [{selector: ['value'], newValue: latestText.current}];
    if (shouldUpdatePlaceholder) {
      updates.push({
        selector: ['placeholder'],
        newValue: model.get('placeholder') + ' ',
      });
    }
    modelUpdate(updates);
  };

  function onChangeText(text: string | null) {
    if (text !== null) {
      latestText.current = text;
    }
    setInputValueWithModalUpdate(false);
  }

  function handleSubmit() {
    setInputValueWithModalUpdate(latestText.current === value);
    shouldTriggerOTPFilled.current = true;
  }

  function handleOnFocus() {
    triggerEvent('onFocus');
  }

  function handleOnBlur() {
    triggerEvent('onBlur');
  }

  React.useEffect(() => {
    if (shouldTriggerOTPFilled.current) {
      triggerEvent('onFilled');
      shouldTriggerOTPFilled.current = false;
    }
  }, [value, placeholder, triggerEvent]);

  React.useEffect(() => {
    const otpHandler = (message: string) => {
      if (otpInputRef.current) {
        let otpRegex = new RegExp(`(\\d{${numOfDigits}})`, 'g');
        const otp = _.head(otpRegex.exec(message));
        otpInputRef.current?.setValue(otp);
      }
    };

    startOTPFetchListener(otpHandler);
    return () => {
      removeOTPFetchListener();
    };
  }, [numOfDigits]);

  return (
    <View ref={ref} style={[layoutStyles]}>
      <OtpInput
        ref={otpInputRef}
        {...otpInputProps}
        theme={OTPInputStyles}
        textInputProps={{
          textContentType: 'oneTimeCode',
        }}
        onTextChange={onChangeText}
        onFilled={handleSubmit}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
      />
    </View>
  );
});

const widgetEditors: PluginEditorsConfig<any> = {
  basic: defaultEditors.basic,
  advanced: [
    {
      type: 'numericInput',
      name: 'numOfDigits',
      props: {
        label: 'Number of Digits',
      },
    },
    {
      type: 'checkbox',
      name: 'autofocus',
      props: {
        label: 'Auto focus',
      },
    },
    {
      type: 'colorInput',
      name: 'focusColor',
      props: {
        label: 'Focus Color',
      },
    },
    {
      type: 'checkbox',
      name: 'blurOnFilled',
      props: {
        label: 'Blur On Filled',
      },
    },
    {
      type: 'checkbox',
      name: 'hideStick',
      props: {
        label: 'Hide Stick',
      },
    },
    {
      type: 'numericInput',
      name: 'focusStickBlinkingDuration',
      props: {
        label: 'Stick Blink Duration',
      },
    },
    {
      type: 'checkbox',
      name: 'disabled',
      props: {
        label: 'Disabled',
      },
    },
    {
      type: 'dropDown',
      name: 'type',
      defaultValue: 'numeric',
      props: {
        label: 'Type',
        options: ['alpha', 'numeric', 'alphanumeric'],
      },
    },
    {
      type: 'checkbox',
      name: 'secureTextEntry',
      props: {
        label: 'Secure Text Entry',
      },
    },
  ],
  layout: defaultEditors.layout,
  animations: defaultEditors.animations,
};

const propertySettings: PluginPropertySettings = {
  onFocus: {
    type: EventTriggerIdentifier,
  },
  onBlur: {
    type: EventTriggerIdentifier,
  },
  onFilled: {
    type: EventTriggerIdentifier,
  },
};
const emptyOnupdate = null;

export default connectWidget(
  'OTPInputTextWidget',
  Widget,
  WidgetConfig,
  emptyOnupdate,
  widgetEditors,
  {
    propertySettings,
    widgetStyleConfig: styleConfig,
    pluginListing,
    docs
  },
);
