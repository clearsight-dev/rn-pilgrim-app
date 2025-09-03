import {connectWidget} from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component';

const pluginListing = {
  labelPrefix: 'cartupsell',
  type: 'widget',
  name: 'cartUpsell',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'cartupsell',
  },
};

export default connectWidget(
  'cartupsell',
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
