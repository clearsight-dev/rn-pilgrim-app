import { connectWidget } from 'apptile-core';
import {ReactComponent, WidgetConfig, WidgetEditors} from './component'

const pluginListing = {
  labelPrefix: 'cartfootermilestone',
  type: 'widget',
  name: 'cartfootermilestone',
  description: 'Basic plugin created from template',
  layout: {
    width: 50,
    height: 30,
  },
  section: 'SDK',
  icon: 'badge',
  manifest: {
    directoryName: 'cartfootermilestone',
  }
};

export default connectWidget('cartfootermilestone', 
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
