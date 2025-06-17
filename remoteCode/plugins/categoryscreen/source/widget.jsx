import { connectWidget } from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component'

const pluginListing = {
  labelPrefix: 'categoryscreen',
  type: 'widget',
  name: 'categoryScreen',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'categoryscreen',
  }
};

export default connectWidget('categoryscreen', 
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
