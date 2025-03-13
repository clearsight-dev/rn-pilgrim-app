//
//  StartupHandler.m
//  apptileSeed
//
//  Created by Vadivazhagan on 12/03/25.
//

#import "StartupHandler.h"
#import "apptileSeed-Swift.h"

@implementation StartupHandler

+ (void)handleStartupProcess {
  NSString *tag = [ApptileConstants APPTILE_LOG_TAG];
  NSLog(@"%@: Running in: %@", tag, [NSThread isMainThread] ? @"Main Thread" : @"Background Thread");
  NSLog(@"%@: Starting Startup Process", tag);
 
 if ([BundleTrackerPrefs isBrokenBundle]) {
     NSLog(@"%@: Previous bundle status: failed, starting rollback", tag);
     [Actions rollBackUpdates];
 }
 
 dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
     @try {
         [Actions startApptileAppProcess:^(BOOL success) {
             dispatch_async(dispatch_get_main_queue(), ^{
               NSLog(@"%@: Startup Process %@", tag, success ? @"Completed" : @"Failed");
             });
         }];
     } @catch (NSException *exception) {
         NSLog(@"%@: Startup Process failed: %@", tag, exception.reason);
     }
 });
}

@end
