import {
  ReactComponent,
  imageWidgetStyleEditorsConfig,
  propertySettings,
  widgetEditors,
} from './component';
import docs from './docs';
import {connectWidget} from 'apptile-core';

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

const pluginListing = {
  labelPrefix: 'image',
  type: 'widget',
  name: 'Dynamic Image',
  description: 'Display an Image on screen',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'image',
  manifest: {
    directoryName: 'DynamicImage',
  },
};

const emptyOnupdate = null;

export default connectWidget(
  'DynamicImageWidget',
  ReactComponent,
  ImageWidgetConfig,
  emptyOnupdate,
  widgetEditors,
  {
    propertySettings,
    widgetStyleConfig: imageWidgetStyleEditorsConfig,
    pluginListing,
    docs,
  },
);
