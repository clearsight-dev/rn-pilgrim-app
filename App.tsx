import _ from 'lodash';
import queryString from 'query-string';
import React, {useState, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';

import {
  apptileNavigationRef,
  ApptileWrapper,
  ApptileAppRoot,
  useStartApptile,
  triggerCustomEventListener,
} from 'apptile-core';
import {Linking, NativeModules} from 'react-native';

import UpdateModal from './components/UpdateModal';
import AdminPage from './components/AdminPage';
import {PilgrimContext} from './PilgrimContext';
import { fillCaches } from './extractedQueries/homepageQueries';

export type ScreenParams = {
  NocodeRoot: undefined;
  NativeUtils: { appId: string };
  AdminPage: { appId: string };
};

const {RNApptile} = NativeModules;

// Import the generated code. The folder analytics is generated when you run the app.
import { init as initAnalytics } from './analytics';

const Stack = createNativeStackNavigator<ScreenParams>();

const getAppFlyerDeepLink = (uri: string) => {
  try {
    const decodedUriParams = decodeURIComponent(uri)?.split('?')[1];
    if (_.isEmpty(decodedUriParams)) {
      return;
    }

    const parsedUriParams = queryString.parse(decodedUriParams);
    console.log('[DEEPLINK] Appsflyer decoded URI:', parsedUriParams);

    let dpURL = _.get(parsedUriParams, 'af_dp');
    if (_.isEmpty(dpURL)) {
      return;
    }

    const dpValue = _.get(parsedUriParams, 'deep_link_value');
    if (!_.isEmpty(dpValue)) {
      dpURL = dpURL + dpValue;
    }

    console.log('[DEEPLINK] Parsed AppFlyer InitialDeep Link: ', dpURL);
    return dpURL;
  } catch (error) {
    console.error('[DEEPLINK] Error parsing AppFlyer deep link:', error);
  }
};
function App(): React.JSX.Element {
  const [pilgrimGlobals, setPilgrimGlobals] = useState({homePageScrolledDown: false});
  const status = useStartApptile(initAnalytics);
  
  React.useEffect(() => {
    (async () => {
      if (status.modelReady) {
        let url = await Linking.getInitialURL();

        try {
          fillCaches();
        } catch (error) {
          console.error("Failed to revalidate caches");
        }

        if (_.isEmpty(url)) {
          return;
        }

        if (!_.isEmpty(url) && url?.includes('af')) {
          const appFlyerDp = getAppFlyerDeepLink(url);
          if (!_.isEmpty(appFlyerDp)) {
            url = appFlyerDp;
          }
        }

        setTimeout(async () => {
          if (url) {
            triggerCustomEventListener('deeplink_request', url);
            // For pages other than homepage we dismiss here 
            // Home dismisses the splash when first component is rendered
            RNApptile.notifyJSReady();
          } else {
            console.error("url was not defined for deeplink");
          }
 
        }, 100);
      }
    })();
  }, [status.modelReady]);

  let body = (
    <NavigationContainer
      ref={apptileNavigationRef}
      theme={{
        ...DefaultTheme,
        colors: status.theme
      }}
      linking={status.linking}
      onReady={() => {
        console.log("Navigators are ready")
        // RNApptile.notifyJSReady();
      }}
    >
      <Stack.Navigator
        screenOptions={{
          animation: 'none'
        }}
      >
        <Stack.Screen name="NocodeRoot" component={ApptileAppRoot} options={{ headerShown: false }} />
        <Stack.Screen
          name="NativeUtils"
          component={UpdateModal}
          options={{ headerShown: true }}
          initialParams={{ appId: status.appId }}
        />
        <Stack.Screen
          name="AdminPage"
          component={AdminPage}
          options={{ headerShown: true }}
          initialParams={{ appId: status.appId }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

  // The nocode layer will not do navigation to these screens so you can handle those navigations in the onNavigationEvent
  return (
    <PilgrimContext.Provider value={{pilgrimGlobals, setPilgrimGlobals}}>
      <ApptileWrapper
        noNavigatePaths={["NativeUtils", "AdminPage"]}
        onNavigationEvent={(ev) => {
          console.log("handle navigation event", ev)
          apptileNavigationRef.current.navigate(ev.screenName, { appId: status.appId });
        }}
      >
        {body}
        {/* {(!status.modelReady) && <JSSplash/>} */}
      </ApptileWrapper>
    </PilgrimContext.Provider>
  );
}

export default App;
