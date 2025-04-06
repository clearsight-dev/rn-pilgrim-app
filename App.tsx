import _ from 'lodash';
import queryString from 'query-string';
import React from 'react';
import {Linking, NativeModules} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {
  apptileNavigationRef,
  ApptileWrapper,
  ApptileAppRoot,
  useStartApptile,
} from 'apptile-core';

import UpdateModal from './components/UpdateModal';
import AdminPage from './components/AdminPage';
import FloatingUpdateModal from './components/FloatingUpdateModal';

export type ScreenParams = {
  NocodeRoot: undefined;
  NativeUtils: {appId: string};
  AdminPage: {appId: string};
};

// Import the generated code. The folder analytics is generated when you run the app.
import {init as initAnalytics} from './analytics';

const Stack = createNativeStackNavigator<ScreenParams>();
const {RNApptile} = NativeModules;

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
  const status = useStartApptile(initAnalytics);

  React.useEffect(() => {
    (async () => {
      if (status.modelReady) {
        RNApptile.notifyJSReady();
        let url = await Linking.getInitialURL();

        if (_.isEmpty(url)) {
          return;
        }

        if (!_.isEmpty(url) && url?.includes('af')) {
          const appFlyerDp = getAppFlyerDeepLink(url);
          if (!_.isEmpty(appFlyerDp)) {
            return appFlyerDp;
          }
        }

        setTimeout(async () => {
          await Linking.openURL(url);
        }, 100);
      }
    })();
  }, [status.modelReady]);

  let body = (
    <NavigationContainer
      ref={apptileNavigationRef}
      theme={{
        ...DefaultTheme,
        colors: status.theme,
      }}
      linking={status.linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="NocodeRoot"
          component={ApptileAppRoot}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="NativeUtils"
          component={UpdateModal}
          options={{headerShown: true}}
          initialParams={{appId: status.appId}}
        />
        <Stack.Screen
          name="AdminPage"
          component={AdminPage}
          options={{headerShown: true}}
          initialParams={{appId: status.appId}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

  let updateModal = null;
  if (status.hasUpdate === 'yes') {
    // Note that you can use status.updateDownloaded === "yes" to show this,
    // if you want to wait till the update is fully downloaded. In that case the
    // app will restart as soon as the modal is dismissed
    // If you want to show the update modal as soon as you have determined that there
    // is an update and want the download to happen while the modal is being
    // displayed then use the status.hasUpdate
    updateModal = (
      <FloatingUpdateModal
        navigationRef={apptileNavigationRef}
        appId={status.appId}
        updateDownloaded={status.updateDownloaded}
      />
    );
  }

  // The nocode layer will not do navigation to these screens so you can handle those navigations in the onNavigationEvent
  return (
    <ApptileWrapper
      noNavigatePaths={['NativeUtils', 'AdminPage']}
      onNavigationEvent={ev => {
        console.log('handle navigation event', ev);
        apptileNavigationRef.current.navigate(ev.screenName, {
          appId: status.appId,
        });
      }}>
      {body}
      {updateModal}
    </ApptileWrapper>
  );
}

export default App;
