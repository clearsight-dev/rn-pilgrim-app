import {useState, useEffect} from 'react';
import {
  getConfigValue,
  getAppStartAction,
  numRootSagasStarted,
  store
} from 'apptile-core';
import {Alert} from 'react-native';
import _ from 'lodash';

export function useStartApptile(initAnalytics) {
  const [localState, setLocalState] = useState({
    isDownloading: true,
    appId: null,
    hasUpdate: "notavailable", // "yes", "no"
    updateDownloaded: "notavailable", // "yes", "no"
    theme: {
      primary: "#000000", 
      background: "#ffffff", 
      card: "#ffffff", 
      text: "#000000", 
      border: "#ffffff",
      notification: "#000000",
    }
  });
  useEffect(() => {
    let lastTheme = {...localState.theme}
    let updateCount = 0;
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      const model = state.apptileTheme
      if (model.modelInitialized) {
        const themeValue = model.themeValue;
        const primary = _.get(themeValue, 'colors.navPrimary');       
        const background = _.get(themeValue, 'colors.navBackground');
        const card = _.get(themeValue, 'colors.navCard');
        const text = _.get(themeValue, 'colors.navText');
        const border = _.get(themeValue, 'colors.navBorder');
        const notification = _.get(themeValue, 'colors.navBadge');
        let hasChanges = false
        hasChanges = hasChanges || (lastTheme.primary !== primary);
        hasChanges = hasChanges || (lastTheme.background !== background);
        hasChanges = hasChanges || (lastTheme.card !== card);
        hasChanges = hasChanges || (lastTheme.text !== text);
        hasChanges = hasChanges || (lastTheme.border !== border);
        hasChanges = hasChanges || (lastTheme.notification !== notification);

        if (hasChanges) {
          lastTheme = {
            primary,
            background,
            card,
            text,
            border,
            notification
          }
          setLocalState(prev => {
            return {
              ...prev,
              theme: lastTheme
            };
          })
          updateCount++;
        }

        if (updateCount > 15) {
          unsubscribe()
        }
      }
    });

    logger.info("starting app");
    // NativeDevSettings.setIsDebuggingRemotely(false);
    function tryToDispathStart(action) {
      if (numRootSagasStarted.current >= 8) {
        logger.info("dispatching appstart");
        store.dispatch(action)
      } else {
        logger.info("Waiting for sagas to start");
        setTimeout(() => tryToDispathStart(action), 100);
      }
    }
    getConfigValue('APP_ID')
      .then(appId => {
        setLocalState(prev => {
          return {
            ...prev,
            appId: appId
          }; 
        });
        logger.info("starting app with appId", appId);
        if (appId) {
          return getAppStartAction(appId)
            .then(startAction => ({startAction, appId}))
        } else {
          logger.info('failed to get appstart action');
          throw new Error("Cannot launch app without APP_ID. Make sure its present in strings.xml or info.plist. It should get inserted via apptile.config.json");
        }
      })
      .then(({startAction, appId}) => {
        if (startAction.hasError) {
          logger.info("Error ocurred while trying to get config: ", startAction);
          Alert.alert("Couldn't load app. Please restart.");
        }
        // last ditch effort to make the app load everytime
        logger.info('dispatching appstart action');
        tryToDispathStart(startAction.action);
        setLocalState(prev => {
          return {
            ...prev,
            isDownloading: false
          };
        });
      })
      .then(({hasUpdate, updateProgressPromise}) => {
        setLocalState(prev => {
          return {
            ...prev,
            hasUpdate: hasUpdate ? "yes" : "no",
            updateDownloaded: "no"
          };
        });
        return updateProgressPromise;
      })
      .then(() => {
        setLocalState(prev => {
          return {
            ...prev,
            updateDownloaded: "yes"
          };
        });
      })
      .catch((err) => {
        logger.error("Failure when starting app: ", err);
      })
      .finally(() => {
        initAnalytics();
      });

    return () => {
      try {
        unsubscribe();
      } catch(err) {
        console.error("Failed to unsubscribe from store");
      }
    };
  }, []);

  return localState;
}


