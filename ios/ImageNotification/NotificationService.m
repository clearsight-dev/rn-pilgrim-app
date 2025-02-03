//
//  NotificationService.m
//  ImageNotification
//
//  Created by Gaurav Gautam on 13/01/25.
//

#import "NotificationService.h"

#if ENABLE_MOENGAGE_NOTIFICATIONS
@import MoEngageRichNotification;
#endif

#if ENABLE_ONESIGNAL
#import <OneSignalExtension/OneSignalExtension.h>
#endif

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;
@property (nonatomic, strong) UNNotificationRequest *receivedRequest;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
  self.contentHandler = contentHandler;
  self.bestAttemptContent = [request.content mutableCopy];
  
#if ENABLE_MOENGAGE_NOTIFICATIONS
  @try {
    // TODO(gaurav) get this from info.plist of notification service
    [MoEngageSDKRichNotification setAppGroupID: @"group.com.discoverpilgrimindia.notification"];
    [MoEngageSDKRichNotification handleWithRichNotificationRequest:request withContentHandler:contentHandler];
  } @catch (NSException *exception) {
    NSLog(@"MoEngage : exception : %@",exception);
  }
#endif
  
#if ENABLE_ONESIGNAL
  self.receivedRequest = request;
  [OneSignalExtension didReceiveNotificationExtensionRequest:self.receivedRequest withMutableNotificationContent:self.bestAttemptContent withContentHandler:self.contentHandler];
#endif
}

- (void)serviceExtensionTimeWillExpire {
#if ENABLE_ONESIGNAL
  [OneSignalExtension serviceExtensionTimeWillExpireRequest:self.receivedRequest withMutableNotificationContent:self.bestAttemptContent];
#endif
  // Called just before the extension will be terminated by the system.
  // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
  self.contentHandler(self.bestAttemptContent);
}

@end
