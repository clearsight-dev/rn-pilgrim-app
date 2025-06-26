#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h>
#import <React/RCTImageView.h>
#import <React/RCTImageSource.h>
#import <React/RCTImageLoader.h>
#import <Firebase.h>

@class RCTRootView;

@interface AppDelegate : RCTAppDelegate <FIRMessagingDelegate, UNUserNotificationCenterDelegate>

@property (nonatomic, strong) RCTImageView *splash;
@property (nonatomic, strong) NSDictionary *storedLaunchOptions;
@property BOOL minDurationPassed;
@property BOOL jsLoaded;

- (void)startReactNativeApp:(UIApplication *)application withOptions:(NSDictionary *)launchOptions;

@end
