import { connectWidget } from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component'

const pluginListing = {
  labelPrefix: 'searchscreen',
  type: 'widget',
  name: 'searchScreen',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'searchscreen',
  }
};

export default connectWidget('searchscreen', 
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
