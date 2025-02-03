import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import {Linking, Dimensions} from 'react-native';

class ShoplazzaActions {
  openLink = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    const {width, height} = Dimensions.get('screen');
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(params?.url, {
          // iOS Properties
          dismissButtonStyle: 'done',
          preferredBarTintColor: '#453AA4',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'pageSheet',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: true,
          // Android Properties
          showTitle: false,
          toolbarColor: '#6200EE',
          secondaryToolbarColor: 'black',
          navigationBarColor: 'black',
          navigationBarDividerColor: 'white',
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          forceCloseOnRedirection: true,
          formSheetPreferredContentSize: {
            width,
            height: 0.5 * height,
          },
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
          headers: {
            'my-custom-header': 'my custom header value',
          },
        });
        await this.sleep(800);
      } else {
        Linking.openURL(url);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}

const shoplazzaActions = new ShoplazzaActions();
export default shoplazzaActions;
