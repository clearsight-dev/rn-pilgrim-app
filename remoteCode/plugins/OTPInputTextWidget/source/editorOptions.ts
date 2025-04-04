import {WidgetStyleEditorOptions} from 'apptile-core';

export const styleConfig: WidgetStyleEditorOptions = [
  // !pinCodeTextStyle
  {
    type: 'colorInput',
    name: 'pinCode_color',
    props: {
      label: 'Pincode color',
    },
  },
  {
    type: 'typographyInput',
    name: 'pinCode_typography',
    props: {
      label: 'Pincode typography',
    },
  },
  // !placeholderTextStyle
  {
    type: 'colorInput',
    name: 'placeholder_color',
    props: {
      label: 'Placeholder color',
    },
  },
  {
    type: 'typographyInput',
    name: 'placeholder_typography',
    props: {
      label: 'Placeholder typography',
    },
  },
  // !containerStyle
  {
    type: 'colorInput',
    name: 'container_backgroundColor',
    props: {
      label: 'Container Background',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'container_borderWidth',
    props: {
      label: 'Container Border',
      options: [
        'container_borderTopWidth',
        'container_borderRightWidth',
        'container_borderBottomWidth',
        'container_borderLeftWidth',
      ],
    },
  },
  {
    type: 'colorInput',
    name: 'container_borderColor',
    props: {
      label: 'Container Border Color',
    },
  },
  {
    type: 'borderRadiusEditor',
    name: 'container_borderRadius',
    props: {
      label: 'Container Border Radius',
      options: [
        'container_borderTopLeftRadius',
        'container_borderTopRightRadius',
        'container_borderBottomRightRadius',
        'container_borderBottomLeftRadius',
      ],
      layout: 'square',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'container_padding',
    props: {
      label: 'Container Padding',
      options: ['container_paddingTop', 'container_paddingRight', 'container_paddingBottom', 'container_paddingLeft'],
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'container_margin',
    props: {
      label: 'Container Margin',
      options: ['container_marginTop', 'container_marginRight', 'container_marginBottom', 'container_marginLeft'],
    },
  },
  // !pinCodeContainerStyle
  {
    type: 'colorInput',
    name: 'pinCodeContainer_backgroundColor',
    props: {
      label: 'Pincode Container Background',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'pinCodeContainer_borderWidth',
    props: {
      label: 'Pincode Container Border',
      options: [
        'pinCodeContainer_borderTopWidth',
        'pinCodeContainer_borderRightWidth',
        'pinCodeContainer_borderBottomWidth',
        'pinCodeContainer_borderLeftWidth',
      ],
    },
  },
  {
    type: 'colorInput',
    name: 'pinCodeContainer_borderColor',
    props: {
      label: 'Pincode Container Border Color',
    },
  },
  {
    type: 'borderRadiusEditor',
    name: 'pinCodeContainer_borderRadius',
    props: {
      label: 'Pincode Container Border Radius',
      options: [
        'pinCodeContainer_borderTopLeftRadius',
        'pinCodeContainer_borderTopRightRadius',
        'pinCodeContainer_borderBottomRightRadius',
        'pinCodeContainer_borderBottomLeftRadius',
      ],
      layout: 'square',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'pinCodeContainer_padding',
    props: {
      label: 'Pincode Container Padding',
      options: [
        'pinCodeContainer_paddingTop',
        'pinCodeContainer_paddingRight',
        'pinCodeContainer_paddingBottom',
        'pinCodeContainer_paddingLeft',
      ],
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'pinCodeContainer_margin',
    props: {
      label: 'Pincode Container Margin',
      options: [
        'pinCodeContainer_marginTop',
        'pinCodeContainer_marginRight',
        'pinCodeContainer_marginBottom',
        'pinCodeContainer_marginLeft',
      ],
    },
  },
  // !focusStickStyle
  {
    type: 'colorInput',
    name: 'focusStick_backgroundColor',
    props: {
      label: 'Focus Stick Background',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'focusStick_borderWidth',
    props: {
      label: 'Focus Stick Border',
      options: [
        'focusStick_borderTopWidth',
        'focusStick_borderRightWidth',
        'focusStick_borderBottomWidth',
        'focusStick_borderLeftWidth',
      ],
    },
  },
  {
    type: 'colorInput',
    name: 'focusStick_borderColor',
    props: {
      label: 'Focus Stick Border Color',
    },
  },
  {
    type: 'borderRadiusEditor',
    name: 'focusStick_borderRadius',
    props: {
      label: 'Focus Stick Border Radius',
      options: [
        'focusStick_borderTopLeftRadius',
        'focusStick_borderTopRightRadius',
        'focusStick_borderBottomRightRadius',
        'focusStick_borderBottomLeftRadius',
      ],
      layout: 'square',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'focusStick_padding',
    props: {
      label: 'Focus Stick Padding',
      options: [
        'focusStick_paddingTop',
        'focusStick_paddingRight',
        'focusStick_paddingBottom',
        'focusStick_paddingLeft',
      ],
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'focusStick_margin',
    props: {
      label: 'Focus Stick Margin',
      options: ['focusStick_marginTop', 'focusStick_marginRight', 'focusStick_marginBottom', 'focusStick_marginLeft'],
    },
  },
  // !focusedPinCodeContainerStyle
  {
    type: 'colorInput',
    name: 'focusedPinCodeContainer_backgroundColor',
    props: {
      label: 'Focused Pincode Container Background',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'focusedPinCodeContainer_borderWidth',
    props: {
      label: 'Focused Pincode Container Border',
      options: [
        'focusedPinCodeContainer_borderTopWidth',
        'focusedPinCodeContainer_borderRightWidth',
        'focusedPinCodeContainer_borderBottomWidth',
        'focusedPinCodeContainer_borderLeftWidth',
      ],
    },
  },
  {
    type: 'colorInput',
    name: 'focusedPinCodeContainer_borderColor',
    props: {
      label: 'Focused Pincode Container Border Color',
    },
  },
  {
    type: 'borderRadiusEditor',
    name: 'focusedPinCodeContainer_borderRadius',
    props: {
      label: 'Focused Pincode Container Border Radius',
      options: [
        'focusedPinCodeContainer_borderTopLeftRadius',
        'focusedPinCodeContainer_borderTopRightRadius',
        'focusedPinCodeContainer_borderBottomRightRadius',
        'focusedPinCodeContainer_borderBottomLeftRadius',
      ],
      layout: 'square',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'focusedPinCodeContainer_padding',
    props: {
      label: 'Focused Pincode Container Padding',
      options: [
        'focusedPinCodeContainer_paddingTop',
        'focusedPinCodeContainer_paddingRight',
        'focusedPinCodeContainer_paddingBottom',
        'focusedPinCodeContainer_paddingLeft',
      ],
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'focusedPinCodeContainer_margin',
    props: {
      label: 'Focused Pincode Container Margin',
      options: [
        'focusedPinCodeContainer_marginTop',
        'focusedPinCodeContainer_marginRight',
        'focusedPinCodeContainer_marginBottom',
        'focusedPinCodeContainer_marginLeft',
      ],
    },
  },
  // !filledPinCodeContainerStyle
  {
    type: 'colorInput',
    name: 'filledPinCodeContainer_backgroundColor',
    props: {
      label: 'Filled Pincode Container Background',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'filledPinCodeContainer_borderWidth',
    props: {
      label: 'Filled Pincode Container Border',
      options: [
        'filledPinCodeContainer_borderTopWidth',
        'filledPinCodeContainer_borderRightWidth',
        'filledPinCodeContainer_borderBottomWidth',
        'filledPinCodeContainer_borderLeftWidth',
      ],
    },
  },
  {
    type: 'colorInput',
    name: 'filledPinCodeContainer_borderColor',
    props: {
      label: 'Filled Pincode Container Border Color',
    },
  },
  {
    type: 'borderRadiusEditor',
    name: 'filledPinCodeContainer_borderRadius',
    props: {
      label: 'Filled Pincode Container Border Radius',
      options: [
        'filledPinCodeContainer_borderTopLeftRadius',
        'filledPinCodeContainer_borderTopRightRadius',
        'filledPinCodeContainer_borderBottomRightRadius',
        'filledPinCodeContainer_borderBottomLeftRadius',
      ],
      layout: 'square',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'filledPinCodeContainer_padding',
    props: {
      label: 'Filled Pincode Container Padding',
      options: [
        'filledPinCodeContainer_paddingTop',
        'filledPinCodeContainer_paddingRight',
        'filledPinCodeContainer_paddingBottom',
        'filledPinCodeContainer_paddingLeft',
      ],
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'filledPinCodeContainer_margin',
    props: {
      label: 'Filled Pincode Container Margin',
      options: [
        'filledPinCodeContainer_marginTop',
        'filledPinCodeContainer_marginRight',
        'filledPinCodeContainer_marginBottom',
        'filledPinCodeContainer_marginLeft',
      ],
    },
  },
  // !disabledPinCodeContainerStyle
  {
    type: 'colorInput',
    name: 'disabledPinCodeContainer_backgroundColor',
    props: {
      label: 'Disabled Pincode Container Background',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'disabledPinCodeContainer_borderWidth',
    props: {
      label: 'Disabled Pincode Container Border',
      options: [
        'disabledPinCodeContainer_borderTopWidth',
        'disabledPinCodeContainer_borderRightWidth',
        'disabledPinCodeContainer_borderBottomWidth',
        'disabledPinCodeContainer_borderLeftWidth',
      ],
    },
  },
  {
    type: 'colorInput',
    name: 'disabledPinCodeContainer_borderColor',
    props: {
      label: 'Disabled Pincode Container Border Color',
    },
  },
  {
    type: 'borderRadiusEditor',
    name: 'disabledPinCodeContainer_borderRadius',
    props: {
      label: 'Disabled Pincode Container Border Radius',
      options: [
        'disabledPinCodeContainer_borderTopLeftRadius',
        'disabledPinCodeContainer_borderTopRightRadius',
        'disabledPinCodeContainer_borderBottomRightRadius',
        'disabledPinCodeContainer_borderBottomLeftRadius',
      ],
      layout: 'square',
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'disabledPinCodeContainer_padding',
    props: {
      label: 'Disabled Pincode Container Padding',
      options: [
        'disabledPinCodeContainer_paddingTop',
        'disabledPinCodeContainer_paddingRight',
        'disabledPinCodeContainer_paddingBottom',
        'disabledPinCodeContainer_paddingLeft',
      ],
    },
  },
  {
    type: 'trblValuesEditor',
    name: 'disabledPinCodeContainer_margin',
    props: {
      label: 'Disabled Pincode Container Margin',
      options: [
        'disabledPinCodeContainer_marginTop',
        'disabledPinCodeContainer_marginRight',
        'disabledPinCodeContainer_marginBottom',
        'disabledPinCodeContainer_marginLeft',
      ],
    },
  },
];
