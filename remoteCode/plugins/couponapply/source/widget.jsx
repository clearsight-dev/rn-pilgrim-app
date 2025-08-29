import {connectWidget} from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component';

const pluginListing = {
  labelPrefix: 'couponapply',
  type: 'widget',
  name: 'couponapply',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'couponapply',
  },
};

export default connectWidget(
  'couponapply',
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
