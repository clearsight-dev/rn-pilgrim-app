//
//  ShakeEventModule.m
//  apptileSeed
//
//  Created by Gaurav Gautam on 10/10/24.
//

#import "React/RCTEventEmitter.h"
#import "React/RCTBridgeModule.h"

@interface ShakeEventModule : RCTEventEmitter <RCTBridgeModule>
@end

@implementation ShakeEventModule

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[@"ShakeEvent"];
}

- (void)startObserving {
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(emitShakeEvent)
                                               name:@"ShakeEvent"
                                             object:nil];
}

- (void)stopObserving {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)emitShakeEvent {
  [self sendEventWithName:@"ShakeEvent" body:nil];
}

@end
