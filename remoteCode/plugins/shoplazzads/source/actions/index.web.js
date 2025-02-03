import {Linking} from 'react-native';
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
    try {
      // window.open(url);
      console.log('Opening url: ', params?.url);
    } catch (error) {
      console.log(error.message);
      // Linking.openURL(url);
    }
  };
}

const shoplazzaActions = new ShoplazzaActions();
export default shoplazzaActions;
