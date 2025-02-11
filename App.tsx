import React, { useEffect, useState } from 'react';
import { Alert, Modal, View, Button, Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
// import NativeDevSettings from 'react-native/Libraries/NativeModules/specs/NativeDevSettings';
import { 
  apptileNavigationRef, 
  getAppStartAction,  
  ApptileWrapper, 
  ApptileAppRoot, 
  getAppDispatch,
  getConfigValue
} from 'apptile-core';

import JSSplash from './JSSplash';
import UpdateModal from './UpdateModal';

import {init as initAnalytics} from './analytics';
import AdminPage from './AdminPage';

export type ScreenParams = {
  NocodeRoot: undefined;
  NativeUtils: {appId: string};
  AdminPage: {appId: string};
};

const Stack = createNativeStackNavigator<ScreenParams>();

function App(): React.JSX.Element {
  const dispatch = getAppDispatch();  
  const [showCodepushModal, setShowCodepushModal] = useState(false);
  const [startingConf, setStartingConf] = useState({isDownloading: true, appId: undefined});

  useEffect(() => {
    logger.info("starting app");
    // NativeDevSettings.setIsDebuggingRemotely(false);
    const startP = getConfigValue('APP_ID')
      .then(appId => {
        logger.info("starting app with appId", appId);
        if (appId) {
          return getAppStartAction(appId)
            .then(startAction => ({startAction, appId}))
        } else {
          logger.info('failed to get appstart action');
          throw new Error("Cannot launch app without APP_ID. Make sure its present in strings.xml or info.plist. It should get inserted via apptile.config.json");
        }
      })
      .then(({startAction, appId}) => {
        if (startAction.hasError) {
          logger.info("Error ocurred while trying to get config: ", startAction);
          Alert.alert("Couldn't load app. Please restart.");
        }
        setStartingConf({isDownloading: false, appId});
        setTimeout(() => {
          // last ditch effort to make the app load everytime
          logger.info('dispatching appstart action');
          dispatch(startAction.action)
        }, 100);
        return startAction.updateCheckResult;
      })
      .then(({updateCheckResult}) => {
        if (updateCheckResult) {
          setShowCodepushModal(true);
        }
        
        // return registerCallback(onCodePush);
      })
      .catch((err) => {
        logger.error("Failure when starting app: ", err);
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

  if (!startingConf.isDownloading) {
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
            initialParams={{appId: startingConf.appId}} 
          />
          <Stack.Screen 
            name="AdminPage" 
            component={AdminPage} 
            options={{headerShown: true}}
            initialParams={{appId: startingConf.appId}}
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
        apptileNavigationRef.current.navigate(ev.screenName, {appId: startingConf.appId});
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
                  route={{params: {appId: startingConf.appId}}}
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
