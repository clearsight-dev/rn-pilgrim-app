import {EventTriggerIdentifier, connectWidget} from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component';

const pluginListing = {
  labelPrefix: 'webviewshoplazza',
  type: 'widget',
  name: 'webview shoplazza',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'webviewshoplazza',
  },
};

export default connectWidget(
  'webviewshoplazza',
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
