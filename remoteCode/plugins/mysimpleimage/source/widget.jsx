import { connectWidget } from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component'

const pluginListing = {
  labelPrefix: 'mysimpleimage',
  type: 'widget',
  name: 'My Simple Image',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'mysimpleimage',
  }
};

export default connectWidget('mysimpleimage', 
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
