import React, { useEffect, useState } from 'react';
import { Alert, Modal, View, Button, Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
// import NativeDevSettings from 'react-native/Libraries/NativeModules/specs/NativeDevSettings';
import { 
  apptileNavigationRef, 
  initStoreWithRootSagas, 
  getAppStartAction,  
  ApptileWrapper, 
  ApptileAppRoot, 
  getAppDispatch,
  registerCreator
} from 'apptile-core';
import { initPlugins } from 'apptile-plugins';
// import { loadDatasourcePlugins as loadShopifyPlugin } from './apptile-shopify';
import { loadDatasourcePlugins as loadShopifyPlugin } from 'apptile-shopify';
import { loadDatasourcePlugins } from 'apptile-datasource';
import {APP_ID as appId} from './apptile.config';
import JSSplash from './JSSplash';
import UpdateModal from './UpdateModal';

import {initPlugins as initRemotePlugins} from './remoteCode';
import {initNavs} from './remoteCode/indexNav';
import {init as initAnalytics} from './analytics';
import AdminPage from './AdminPage';
// import {registerCallback} from './websocket';

initStoreWithRootSagas();
loadDatasourcePlugins();
loadShopifyPlugin();
initPlugins();
initRemotePlugins();
initNavs();

export type ScreenParams = {
  NocodeRoot: undefined;
  NativeUtils: {appId: string};
  AdminPage: {appId: string};
};

const Stack = createNativeStackNavigator<ScreenParams>();

function App(): React.JSX.Element {
  const dispatch = getAppDispatch();  
  const [showCodepushModal, setShowCodepushModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(true);

  useEffect(() => {
    // NativeDevSettings.setIsDebuggingRemotely(false);
    const startP = getAppStartAction(appId)
      .then(response => {
        if (response.hasError) {
          console.error("Error ocurred while trying to get config: ", response);
          Alert.alert("Couldn't load app. Please restart.");
        }
        setIsDownloading(false);
        dispatch(response.action)
        return response.updateCheckResult;
      })
      .then(({updateCheckResult}) => {
        if (updateCheckResult) {
          setShowCodepushModal(true);
        }
        
        // return registerCallback(onCodePush);
      })
      .finally(() => {
        initAnalytics();
      });

    return () => {
      startP.then(unregisterSocketListener => {
        // unregisterSocketListener();
      })
    };
  }, []);


  let body = <JSSplash />;

  if (!isDownloading) {
    body = (
      <NavigationContainer
        ref={apptileNavigationRef}
      >
        <Stack.Navigator>
          <Stack.Screen name="NocodeRoot" component={ApptileAppRoot} options={{headerShown: false}} /> 
          <Stack.Screen 
            name="NativeUtils" 
            component={UpdateModal} 
            options={{headerShown: true}} 
            initialParams={{appId: appId}} 
          />
          <Stack.Screen 
            name="AdminPage" 
            component={AdminPage} 
            options={{headerShown: true}}
            initialParams={{appId: appId}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <ApptileWrapper
      noNavigatePaths={["NativeUtils", "AdminPage"]} // The nocode layer will not do navigation to these screens so you can handle those navigations in the onNavigationEvent
      onNavigationEvent={(ev) => {
        console.log("handle navigation event", ev)
        apptileNavigationRef.current.navigate(ev.screenName, {appId});
      }}
    >
      {body}
      {
        showCodepushModal && (
          <Modal
            visible={showCodepushModal} 
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCodepushModal(false)}
          >
            <Pressable
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: "#000000cc"
              }}
              onPress={() => setShowCodepushModal(false)}
            >
              <View
                style={{
                  width: '90%',
                  height: '80%',
                  padding: 12,
                  backgroundColor: 'white',
                  borderRadius: 8
                }}
              >
                <UpdateModal
                  onDismiss={() => setShowCodepushModal(false)}
                  navigation={apptileNavigationRef}
                  route={{params: {appId}}}
                />
              </View>
            </Pressable>
          </Modal>
        )
      }
    </ApptileWrapper>
  );
}

export default App;
