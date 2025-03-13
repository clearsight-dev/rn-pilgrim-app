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
  NSLog(@"ApptileStartupProcess: Running in: %@", [NSThread isMainThread] ? @"Main Thread" : @"Background Thread");
  NSLog(@"ApptileStartupProcess: Starting Startup Process");
 
 if ([BundleTrackerPrefs isBrokenBundle]) {
     NSLog(@"ApptileStartupProcess: Previous bundle status: failed, starting rollback");
     [Actions rollBackUpdates];
 }
 
 dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
     @try {
         [Actions startApptileAppProcess:^(BOOL success) {
             dispatch_async(dispatch_get_main_queue(), ^{
                 NSLog(@"ApptileStartupProcess: Startup Process %@", success ? @"Completed" : @"Failed");
             });
         }];
     } @catch (NSException *exception) {
         NSLog(@"ApptileStartupProcess: Startup Process failed: %@", exception.reason);
     }
 });
}

@end
