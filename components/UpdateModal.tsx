import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Platform,
  Alert,
  Pressable,
} from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import RNRestart from "react-native-restart";
import LottieView from "lottie-react-native";
import Clipboard from "@react-native-clipboard/clipboard";

export default function UpdateModal({ route, onDismiss }) {
  const [fileData, setFileData] = useState<string>();
  const [fileStatus, setFileStatus] = useState<{
    bundles: boolean;
    tracker: boolean;
    config: boolean;
  }>({ bundles: false, tracker: false, config: false });

  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);

  const BUNDLES_PATH = `${RNFetchBlob.fs.dirs.DocumentDir}/bundles`;
  const LOCAL_BUNDLE_TRACKER_PATH = `${RNFetchBlob.fs.dirs.DocumentDir}/localBundleTracker.json`;
  const APP_CONFIG_PATH = `${RNFetchBlob.fs.dirs.DocumentDir}/appConfig.json`;

  useEffect(() => {
    readFileData();
    checkFilesExist();
  }, []);

  const readFileData = async () => {
    try {
      const data = await RNFetchBlob.fs.readFile(LOCAL_BUNDLE_TRACKER_PATH, "utf8");
      const parsed = JSON.parse(data);
      setFileData(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setFileData(`Error reading file: ${err.message}`);
    }
  };

  const checkFilesExist = async () => {
    const [bundles, tracker, config] = await Promise.all([
      RNFetchBlob.fs.exists(BUNDLES_PATH),
      RNFetchBlob.fs.exists(LOCAL_BUNDLE_TRACKER_PATH),
      RNFetchBlob.fs.exists(APP_CONFIG_PATH),
    ]);
    setFileStatus({ bundles, tracker, config });
  };

  const deleteCodePushedBundle = async () => {
    try {
      const paths = [BUNDLES_PATH, LOCAL_BUNDLE_TRACKER_PATH, APP_CONFIG_PATH];
      for (const path of paths) {
        const exists = await RNFetchBlob.fs.exists(path);
        if (exists) await RNFetchBlob.fs.unlink(path);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const restartApp = () => {
    RNRestart.Restart();
  };

  const confirmRevert = () => {
    Alert.alert(
      "Confirm Factory Reset",
      "This will delete local bundles and restart the app. Do you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => deleteCodePushedBundle().then(restartApp) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {onDismiss && (
        <View style={styles.header}>
          <Button title="Cancel" onPress={onDismiss} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {isDownloadingUpdate ? (
          <LottieView
            style={styles.lottie}
            source={require("../assets/loadingplane.json")}
            autoPlay
            loop
          />
        ) : (
          <View style={styles.infoContainer}>
            <Image
              style={styles.logo}
              source={require("../assets/logo.png")}
              resizeMode="contain"
            />
            <Text style={styles.description}>
              You can revert updates or debug local bundle files here.
            </Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          <Button title="Factory Reset" onPress={confirmRevert} />
          <View style={{ height: 10 }} />
          <Button title="Restart App" onPress={restartApp} />
          <View style={{ height: 10 }} />
          <Button title="Refresh Status" onPress={() => {
            checkFilesExist();
            readFileData();
          }} />
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>📂 File Status</Text>
          <Text style={styles.statusItem}>
            📁 Bundles: {fileStatus.bundles ? "✅ Exists" : "❌ Missing"}
          </Text>
          <Text style={styles.statusItem}>
            📄 localBundleTracker.json: {fileStatus.tracker ? "✅ Exists" : "❌ Missing"}
          </Text>
          <Text style={styles.statusItem}>
            ⚙️ appConfig.json: {fileStatus.config ? "✅ Exists" : "❌ Missing"}
          </Text>
        </View>

        {fileData && (
          <Pressable
            onPress={() => {
              Clipboard.setString(fileData);
              Alert.alert("Copied", "File data copied to clipboard.");
            }}
          >
            <View style={styles.logBox}>
              <Text style={styles.logTitle}>📄 localBundleTracker.json Content</Text>
              <Text style={styles.logText}>{fileData}</Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 10,
    alignItems: "flex-end",
  },
  scroll: {
    padding: 20,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    height: 50,
    width: 50,
    marginBottom: 10,
    borderRadius: 8,
  },
  description: {
    fontWeight: "300",
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  lottie: {
    width: "100%",
    height: 200,
  },
  buttonGroup: {
    marginVertical: 20,
  },
  statusBox: {
    backgroundColor: "#f1f8ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#007acc",
  },
  statusItem: {
    fontSize: 13,
    color: "#333",
    marginBottom: 3,
  },
  logBox: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  logText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 12,
    color: "#444",
  },
});
