import {connectWidget} from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component';

const pluginListing = {
  labelPrefix: 'availablecoupons',
  type: 'widget',
  name: 'AvailableCoupons',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'availablecoupons',
  },
};

export default connectWidget(
  'availablecoupons',
  ReactComponent,
  WidgetConfig,
  null,
  WidgetEditors,
  {
    propertySettings: {},
    widgetStyleConfig: [],
    pluginListing,
    docs: {},
  },
);
