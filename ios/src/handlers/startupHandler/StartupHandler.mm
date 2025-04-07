//
//  StartupHandler.m
//  apptileSeed
//
//  Created by Vadivazhagan on 12/03/25.
//

#import "StartupHandler.h"
#import "apptileSeed-Swift.h"
#import "AppDelegate.h"

@implementation StartupHandler

+ (void)handleStartupProcess {
    // Launching apptile startup process in background thread
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
                    
            [Logger info:[NSString stringWithFormat:@"Running in: %@", [NSThread isMainThread] ? @"Main Thread" : @"Background Thread"]];
            [Logger info:@"Starting Startup Process"];
          
            [Actions startApptileAppProcess:^(BOOL success) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    [Logger success:[NSString stringWithFormat:@"Startup Process %@", success ? @"Completed" : @"Failed"]];
                  
                  // Get reference to AppDelegate
                  AppDelegate *appDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];

                  // Retrieve stored launchOptions
                  UIApplication *application = [UIApplication sharedApplication];
                  [appDelegate startReactNativeApp:application withOptions:appDelegate.storedLaunchOptions];
                });
            }];
        } @catch (NSException *exception) {
            [Logger error:[NSString stringWithFormat:@"Startup Process failed: %@", exception.reason]];
        }
    });
}

@end

