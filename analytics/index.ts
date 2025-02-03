// This file is generated at build time do not edit
//
// import {ApptileAnalytics} from 'apptile-core';
// import {checkATTPermission, ApptileAnalytics, addCustomEventListener} from 'apptile-core';
// import {FacebookAnalytics, FirebaseAnalytics, AppsFlyerAnalytics, MoengageAnalytics} from 'apptile-core';
// import {checkATTPermission, Firebase as FirebaseAnalytics, addCustomEventListener} from 'apptile-core';
import {checkATTPermission, addCustomEventListener, ApptileAnalytics} from 'apptile-core';
import {
  // Facebook as FacebookAnalytics, 
  // Firebase as FirebaseAnalytics, 
  // AppsFlyer as AppsFlyerAnalytics, 
  // Moengage as MoengageAnalytics,
  // registerForMoengageNotification,
  OneSignal as OneSignalAnalytics
} from 'apptile-core';
export async function init() {
  try {
    await checkATTPermission();
    await ApptileAnalytics.initialize([OneSignalAnalytics]);
  } catch (err) {
    console.error('Failure in initializing ApptileAnalytics');
  }
}

addCustomEventListener('ApptileAnalyticsSendEvent', (type, name, params) => {
  ApptileAnalytics.sendEvent(type, name, params);
});

// addCustomEventListener('ApptileAnalyticsSendInternalEvent', (type, name, params) => {
//   ApptileAnalytics.sendInternalEvent(type, name, params);
// });
// 
// addCustomEventListener('registerForMoengageNotification', token => {
//   registerForMoengageNotification(token);
// });
// 
// addCustomEventListener('markStart', (label: string, meta: any) => {
//   ApptileAnalytics.markStart(label, meta);
// });
// 
// addCustomEventListener('markEnd', (label: string, meta: any) => {
//   ApptileAnalytics.markEnd(label, meta);
// });
