import React, {useRef, useState} from 'react';
import {WebView} from 'react-native-webview';
import {useFocusEffect} from '@react-navigation/native';
import {navigateToScreen} from 'apptile-core';
import {useDispatch} from 'react-redux';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {Platform} from 'react-native';

export function ReactComponent({model}) {
  const dispatch = useDispatch();
  const value = model.get('value')?.toString();
  const reloadOnFocus = model.get('reloadOnFocus') || false;
  const [isLoading, setIsLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(1);
  const webviewRef = useRef(null);
  console.log("webview value: ", value)
  useFocusEffect(
    React.useCallback(() => {
      if (reloadOnFocus) {
        setIsLoading(true);
        setWebViewKey(Date.now());
        console.log('Screen is focused!');
      }

      return () => {
        console.log('Screen is unfocused!');
      };
    }, [reloadOnFocus]),
  );

  const handleNavigationStateChange = navState => {
    const {url} = navState;
    try {
      console.log("Routing to :", url, navState)
      // Routing logic based on specific path patterns
      // if (
      //   Platform.OS !== 'android' &&
      //   !navState.isTopFrame &&
      //   navState.navigationType != 'click'
      // ) {
      //   return true;
      // }
      if (value === url) {
        return true;
      } else if (/^https?:\/\/[^\/]+\/products\/[^\/]+/.test(url)) {
        dispatch(navigateToScreen('Product', {url: url}));
        return false;
      } else if (/^https?:\/\/[^\/]+\/collections\/[^\/]+/.test(url)) {
        dispatch(navigateToScreen('Collection', {url: url}));
        return false;
      } else if (/^https?:\/\/[^\/]+\/checkout\/[^\/?]+(\?.+)?$/.test(url)) {
        dispatch(navigateToScreen('ShoplazzaWebCheckout', {url: url}));
        return false;
      } else if (/^https?:\/\/[^\/]+\/search(\?.*)?$/.test(url)) {
        dispatch(navigateToScreen('Search', {url: url}));
        return false;
      } else if (/^https?:\/\/[^\/]+\/cart(\?.*)?$/.test(url)) {
        dispatch(navigateToScreen('Cart', {url: url}));
        return false;
      } else if (/^https?:\/\/[^\/]+\/?(\?.*)?$/.test(url)) {
        dispatch(navigateToScreen('Home', {}));
        return false;
      } else if (/^https?:\/\/[^\/]+\/account\/order(\?.*)?$/.test(url)) {
        dispatch(navigateToScreen('Orders', {url: url}));
        return false;
      } else if (/^https?:\/\/[^\/]+\/account\/login(\?.*)?$/.test(url)) {
        return true;
      } else if (/^https?:\/\/[^\/]+\/order\/[^\/?]+(\?.*)?$/.test(url)) {
        dispatch(navigateToScreen('OrderDetails', {url: url}));
        return false;
      } else {
        dispatch(navigateToScreen('DynamicWebView', {url: url}));
        return false;
      }
    } catch (error) {
      console.warn('Invalid URL format:', error);
    }
  };
  const loadScript = () => {
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`
          var styles = '#shoplaza-section-header, #shoplaza-section-footer { display:none !important }';
          var styleSheet = document.createElement("style");
          styleSheet.textContent = styles;
          document.head.appendChild(styleSheet);
          const script = document.createElement("script");
          script.setAtrributes('src', "https://unpkg.com/@apptile/apptile-web-tunnel@latest/dist/index.min.js");
          if(!window.Apptile) document.head.appendChild(script);
          if(window.Apptile) window.Apptile.sendRawMessageAsync({event: 'stopLoading', type: 'get'})
        `);
    } else {
      console.log('\nn\n\n\n\n\n\nRUNNER\n\n\n\n\n\n\n');
    }
  };
  return (
    <View style={{flex: 1}}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <WebView
        ref={webviewRef}
        key={webViewKey}
        onLoadStart={loadScript}
        onLoad={loadScript}
        style={{width: '100%', height: '100%'}}
        onShouldStartLoadWithRequest={request => {
          return handleNavigationStateChange(request);
        }}
        source={{uri: value}}
        originWhitelist={['*']}
        injectedJavaScript={`
          var styles = '#shoplaza-section-header, #shoplaza-section-footer { display:none !important }';
          var styleSheet = document.createElement("style");
          styleSheet.textContent = styles;
          document.head.appendChild(styleSheet);
          const script = document.createElement("script");
          script.setAtrributes('src', "https://unpkg.com/@apptile/apptile-web-tunnel@latest/dist/index.min.js");
          if(!window.Apptile) document.head.appendChild(script);
          if(window.Apptile) window.Apptile.sendRawMessageAsync({event: 'stopLoading', type: 'get'})
        `}
        onLoadEnd={() => {
          loadScript();
          setTimeout(() => setIsLoading(false), 100);
        }}
        javaScriptEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export const WidgetConfig = {
  value: '',
  reloadOnFocus: false 
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'value',
      props: {
        label: 'Value',
      },
    },
    {
      type: 'codeInput',
      name: 'reloadOnFocus',
      props: {
        label: 'Reload on focus',
      },
    }
  ],
};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {},
};
