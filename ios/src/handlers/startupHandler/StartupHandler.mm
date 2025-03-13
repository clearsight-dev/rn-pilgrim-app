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
    [Logger info:[NSString stringWithFormat:@"Running in: %@", [NSThread isMainThread] ? @"Main Thread" : @"Background Thread"]];
    [Logger info:@"Starting Startup Process"];

    if ([BundleTrackerPrefs isBrokenBundle]) {
        [Logger warn:@"Previous bundle status: failed, starting rollback"];
        [Actions rollBackUpdates];
    }

    // Launching apptile startup process in background thread
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            [Actions startApptileAppProcess:^(BOOL success) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    [Logger success:[NSString stringWithFormat:@"Startup Process %@", success ? @"Completed" : @"Failed"]];
                });
            }];
        } @catch (NSException *exception) {
            [Logger error:[NSString stringWithFormat:@"Startup Process failed: %@", exception.reason]];
        }
    });
}

@end
