import { 
  connectWidget, 
  mergeWithDefaultStyles, 
  makeBoolean 
} from 'apptile-core';
import {TextWidget, WidgetConfig, WidgetEditors} from './component'
import docs from './docs';

const pluginListing = {
  labelPrefix: 'text',
  type: 'widget',
  name: 'Pilgrim Text Widget',
  description: 'Replacement of TextWidget for pilgrim',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'text',
  manifest: {
    directoryName: 'pligrimtextwidget',
    repository: `https://meragi-api.apptile.io/plugin-server/plugins/1efc8fa1-a80f-48b6-bb8e-95d0ec6b9a4c/pligrimtextwidget/source`
  }
};

export const textWidgetStyleConfig = [
  {
    type: 'colorInput',
    name: 'backgroundColor',
    props: {
      label: 'Background',
    },
  },
  {
    type: 'colorInput',
    name: 'color',
    props: {
      label: 'Text Color',
    },
  },
  {
    type: 'typographyInput',
    name: 'typography',
    props: {
      label: 'Typography',
    },
  },
];

const propertySettings = {
  isLoading: {
    getValue: (model, val) => {
      return makeBoolean(val);
    },
  },
  minFontScale: {
    getValue: (model, val) => {
      return val;
    },
  },
  numLines: {
    getValue: (model, val) => {
      return val;
    },
  },
  useAnimamtedValue: {
    getValue: (model, val) => {
      return makeBoolean(val);
    },
  },
};

export default connectWidget('PilgrimTextWidget', 
  TextWidget, 
  WidgetConfig, 
  null, 
  WidgetEditors, 
  {
    propertySettings,
    widgetStyleConfig: mergeWithDefaultStyles(textWidgetStyleConfig),
    pluginListing,
    docs,
    themeProfileSel: ['tile', 'text']
  }
);
