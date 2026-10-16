#import "SceneDelegate.h"
#import "AppDelegate.h"
#import <React/RCTLinkingManager.h>

@implementation SceneDelegate

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  UIWindowScene *windowScene = (UIWindowScene *)scene;
  AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;

  UIWindow *oldWindow = appDelegate.window;
  UIViewController *rootVC = oldWindow.rootViewController;
  oldWindow.rootViewController = nil;
  oldWindow.hidden = YES;

  self.window = [[UIWindow alloc] initWithWindowScene:windowScene];
  self.window.rootViewController = rootVC;
  appDelegate.window = self.window;
  [self.window makeKeyAndVisible];
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
  for (UIOpenURLContext *context in URLContexts) {
    [RCTLinkingManager application:UIApplication.sharedApplication openURL:context.URL options:@{}];
  }
}

@end
