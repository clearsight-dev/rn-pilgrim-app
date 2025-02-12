import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { 
  apptileNavigationRef, 
  ApptileWrapper, 
  ApptileAppRoot, 
} from 'apptile-core';

// Import the generated code. The folder analytics is generated when you run the app.
import {init as initAnalytics} from './analytics';

import JSSplash from './JSSplash';
import UpdateModal from './UpdateModal';

import AdminPage from './AdminPage';
import FloatingUpdateModal from './FloatingUpdateModal';
import {useStartApptile} from './useStartApptile';

export type ScreenParams = {
  NocodeRoot: undefined;
  NativeUtils: {appId: string};
  AdminPage: {appId: string};
};

const Stack = createNativeStackNavigator<ScreenParams>();

function App(): React.JSX.Element {
  const status = useStartApptile(initAnalytics);

  let body = null;
  if (!status.isDownloading) {
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
  } else {
    body = <JSSplash />;
  }

  let updateModal = null;
  if (status.hasUpdate === "yes") {
    // Note that you can use status.updateDownloaded === "yes" to show this, 
    // if you want to wait till the update is fully downloaded. In that case the
    // app will restart as soon as the modal is dismissed
    // If you want to show the update modal as soon as you have determined that there
    // is an update and want the download to happen while the modal is being 
    // displayed then use the status.hasUpdate
    updateModal = (<FloatingUpdateModal 
      navigationRef={apptileNavigationRef}
      appId={status.appId}
      updateDownloaded={status.updateDownloaded}
    />);
  }

  // The nocode layer will not do navigation to these screens so you can handle those navigations in the onNavigationEvent
  return (
    <ApptileWrapper
      noNavigatePaths={["NativeUtils", "AdminPage"]} 
      onNavigationEvent={(ev) => {
        console.log("handle navigation event", ev)
        apptileNavigationRef.current.navigate(ev.screenName, {appId: status.appId});
      }}
    >
      {body}
      {updateModal}
    </ApptileWrapper>
  );
}

export default App;
