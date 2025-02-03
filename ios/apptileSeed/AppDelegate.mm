#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTI18nUtil.h>
#import <React/RCTEventEmitter.h>

#if ENABLE_FIREBASE_ANALYTICS
#import <Firebase.h>
#endif

#if ENABLE_FBSDK
#import <AuthenticationServices/AuthenticationServices.h>
#import <SafariServices/SafariServices.h>
#import <FBSDKCoreKit/FBSDKCoreKit-Swift.h>
#endif

#if ENABLE_MOENGAGE_ANALYTICS
#import <ReactNativeMoEngage/MoEngageInitializer.h>
#import <MoEngageSDK/MoEngageSDK.h>
#endif

#if ENABLE_APPSFLYER
#import <AppsFlyerLib/AppsFlyerLib.h>
#import <AppsFlyerAttribution.h>
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"apptileSeed";
  self.initialProps = @{};
  
  [[RCTI18nUtil sharedInstance] allowRTL:NO];
  [[RCTI18nUtil sharedInstance] forceRTL:NO];
  
#if ENABLE_FIREBASE_ANALYTICS
  [FIRApp configure];
#endif

#if ENABLE_FBSDK
  [[FBSDKApplicationDelegate sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];
  [FBSDKApplicationDelegate.sharedInstance initializeSDK];
#endif
  
#if ENABLE_MOENGAGE_ANALYTICS
  NSString *moEngageAppId = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"MOENGAGE_APPID"];
  NSString *moEngageDataCenterString = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"MOENGAGE_DATACENTER"];
  MoEngageDataCenter moEngageDataCenter;
  
  // TODO(gaurav) add the rest of the cases
  if ([moEngageDataCenterString isEqualToString:@"data_center_1"]) {
    moEngageDataCenter = MoEngageDataCenterData_center_01;
  } else if ([moEngageDataCenterString isEqualToString:@"data_center_2"]) {
    moEngageDataCenter = MoEngageDataCenterData_center_02;
  } else {
    moEngageDataCenter = MoEngageDataCenterData_center_default;
  }
  
  MoEngageSDKConfig* sdkConfig = [[MoEngageSDKConfig alloc] initWithAppId:moEngageAppId dataCenter: moEngageDataCenter];
  sdkConfig.consoleLogConfig = [[MoEngageConsoleLogConfig alloc] initWithIsLoggingEnabled:false loglevel:MoEngageLoggerTypeVerbose];
  [[MoEngageInitializer sharedInstance] initializeDefaultSDKConfig:sdkConfig andLaunchOptions:launchOptions];
#endif

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  NSURL *url = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
  return url;
#else
  // Get the path to the Documents directory
  NSArray<NSURL *> *documentDirectories = [[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask];
  NSURL *documentsDirectory = [documentDirectories firstObject];

  // Create the file URL for main.jsbundle inside the bundles subdirectory
  NSURL *docBundlesDirectory = [documentsDirectory URLByAppendingPathComponent:@"bundles"];
  NSURL *mainJSBundleURL = [docBundlesDirectory URLByAppendingPathComponent:@"main.jsbundle"];

  // Check if the file exists at the specified URL
  if (![[NSFileManager defaultManager] fileExistsAtPath:[mainJSBundleURL path]]) {
      mainJSBundleURL = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  }
  return mainJSBundleURL;
#endif
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
#if ENABLE_FBSDK
  if ([[FBSDKApplicationDelegate sharedInstance] application:app openURL:url options:options]) {
    return YES;
  }
#endif
  
#if ENABLE_APPSFLYER
  [[AppsFlyerAttribution shared] handleOpenUrl:url options:options];
#endif
  return [RCTLinkingManager application:app openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
#if ENABLE_APPSFLYER
  [[AppsFlyerAttribution shared] continueUserActivity:userActivity restorationHandler:restorationHandler];
#endif
 return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

@end
