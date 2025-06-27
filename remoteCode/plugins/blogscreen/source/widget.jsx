import { connectWidget } from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component'

const pluginListing = {
  labelPrefix: 'blogscreen',
  type: 'widget',
  name: 'blogScreen',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'blogscreen',
  }
};

export default connectWidget('blogscreen', 
  ReactComponent, 
  WidgetConfig, 
  null, 
  WidgetEditors, 
  {
    propertySettings: {},
    widgetStyleConfig: [],
    pluginListing,
    docs: {},
  }
);
