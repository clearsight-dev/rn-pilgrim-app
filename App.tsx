import React, {useEffect, useState, useRef} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import {
  apptileNavigationRef,
  ApptileWrapper,
  ApptileAppRoot,
  useStartApptile,
  ApolloQueryRunner
} from 'apptile-core';
import {NativeModules} from 'react-native';

import JSSplash from './components/JSSplash';
import UpdateModal from './components/UpdateModal';
import AdminPage from './components/AdminPage';
import FloatingUpdateModal from './components/FloatingUpdateModal';
import {PilgrimContext} from './PilgrimContext';

export type ScreenParams = {
  NocodeRoot: undefined;
  NativeUtils: { appId: string };
  AdminPage: { appId: string };
};

// const {RNApptile} = NativeModules;

// Import the generated code. The folder analytics is generated when you run the app.
import { init as initAnalytics } from './analytics';

const Stack = createNativeStackNavigator<ScreenParams>();

function App(): React.JSX.Element {
  const [pilgrimGlobals, setPilgrimGlobals] = useState({homePageScrolledDown: false});
  const status = useStartApptile(initAnalytics);

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
