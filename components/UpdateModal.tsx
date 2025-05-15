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
  NativeModules,
} from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import RNRestart from "react-native-restart";
import LottieView from "lottie-react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import DeviceInfo from "react-native-device-info";
import RNFS from "react-native-fs";
import { zip } from "react-native-zip-archive";

import { getConfigValue } from "apptile-core";

const BUNDLES_PATH = `${RNFetchBlob.fs.dirs.DocumentDir}/bundles`;
const LOCAL_BUNDLE_TRACKER_PATH = `${RNFetchBlob.fs.dirs.DocumentDir}/localBundleTracker.json`;
const APP_CONFIG_PATH = `${RNFetchBlob.fs.dirs.DocumentDir}/appConfig.json`;

const getFileMetadata = async (path: string) => {
  try {
    const exists = await RNFS.exists(path);
    if (!exists) return null;

    const stats = await RNFS.stat(path);
    return {
      size: formatBytes(Number(stats.size)),
      modified: new Date(stats.mtime).toLocaleString(),
      path: stats.path,
    };
  } catch (err) {
    return null;
  }
};

const copyDirectory = async (srcDir: string, destDir: string) => {
  await RNFS.mkdir(destDir);
  const items = await RNFS.readDir(srcDir);

  for (const item of items) {
    const destPath = `${destDir}/${item.name}`;
    if (item.isFile()) {
      await RNFS.copyFile(item.path, destPath);
    } else if (item.isDirectory()) {
      await copyDirectory(item.path, destPath);
    }
  }
};

const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const getDeviceDetails = async () => {
  try {
    const totalMemory = await DeviceInfo.getTotalMemory();
    const totalDisk = await DeviceInfo.getTotalDiskCapacity();
    const freeDisk = await DeviceInfo.getFreeDiskStorage();

    return {
      AppId: await getConfigValue("APP_ID"),
      AppName: await DeviceInfo.getApplicationName(),
      AppVersion: DeviceInfo.getVersion(),
      BuildNumber: DeviceInfo.getBuildNumber(),
      BundleId: DeviceInfo.getBundleId(),
      Manufacturer: await DeviceInfo.getManufacturer(),
      Model: DeviceInfo.getModel(),
      DeviceType: DeviceInfo.getDeviceType(),
      IsEmulator: await DeviceInfo.isEmulator(),
      IsTablet: await DeviceInfo.isTablet(),
      SystemName: DeviceInfo.getSystemName(),
      SystemVersion: DeviceInfo.getSystemVersion(),
      TotalMemory: formatBytes(totalMemory),
      TotalDiskCapacity: formatBytes(totalDisk),
      FreeDiskStorage: formatBytes(freeDisk),
    };
  } catch (err) {
    return { error: `Error getting device details: ${err}` };
  }
};

const createExportZip = async () => {
  const tempDir = `${RNFS.TemporaryDirectoryPath}export_data`;
  const zipFile = `${RNFS.DocumentDirectoryPath}/export.zip`;

  try {
    if (await RNFS.exists(tempDir)) await RNFS.unlink(tempDir);
    await RNFS.mkdir(tempDir);

    if (await RNFS.exists(BUNDLES_PATH)) {
      await copyDirectory(BUNDLES_PATH, `${tempDir}/bundles`);
    }

    if (await RNFS.exists(LOCAL_BUNDLE_TRACKER_PATH)) {
      await RNFS.copyFile(
        LOCAL_BUNDLE_TRACKER_PATH,
        `${tempDir}/localBundleTracker.json`
      );
    }

    if (await RNFS.exists(APP_CONFIG_PATH)) {
      await RNFS.copyFile(APP_CONFIG_PATH, `${tempDir}/appConfig.json`);
    }

    const deviceInfo = await getDeviceDetails();
    await RNFS.writeFile(
      `${tempDir}/deviceInfo.json`,
      JSON.stringify(deviceInfo, null, 2),
      "utf8"
    );

    return await zip(tempDir, zipFile);
  } catch (err) {
    console.error("Zip creation error:", err);
    throw err;
  }
};

const uploadToS3 = async (filePath: string, presignedUrl: string) => {
  try {
    const fileData = await RNFS.readFile(filePath, "base64");
    const blob = RNFetchBlob.base64.decode(fileData);

    const res = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/zip" },
      body: blob,
    });

    if (!res.ok) throw new Error("Failed to upload ZIP to S3");
  } catch (err) {
    console.error("Upload error:", err);
    throw err;
  }
};

const onExport = async () => {
  try {
    Alert.alert("✅ Info", "Not yet implemented");
    return;
    const zipPath = await createExportZip();
    const presignedUrl = "https://your-s3-presigned-url.amazonaws.com"; // Replace this in production

    await uploadToS3(zipPath, presignedUrl);

    await RNFS.unlink(zipPath);
    await RNFS.unlink(`${RNFS.TemporaryDirectoryPath}export_data`);

    Alert.alert("✅ Success", "Exported and uploaded successfully!");
  } catch (err) {
    Alert.alert("❌ Error", err.message || "Export failed.");
  }
};

export default function DeveloperScreen({ route, onDismiss }: any) {
  const [fileData, setFileData] = useState("");
  const [fileStatus, setFileStatus] = useState({
    bundles: null,
    tracker: null,
    config: null,
  });
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);

  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = async () => {
    setDeviceInfo(await getDeviceDetails());
    await checkFilesExist();
    await readFileData();
  };

  const readFileData = async () => {
    try {
      const data = await RNFetchBlob.fs.readFile(
        LOCAL_BUNDLE_TRACKER_PATH,
        "utf8"
      );
      setFileData(JSON.stringify(JSON.parse(data), null, 2));
    } catch (err) {
      setFileData(`Error reading file: ${err.message}`);
    }
  };

  const checkFilesExist = async () => {
    const [bundles, tracker, config] = await Promise.all([
      getFileMetadata(BUNDLES_PATH),
      getFileMetadata(LOCAL_BUNDLE_TRACKER_PATH),
      getFileMetadata(APP_CONFIG_PATH),
    ]);
    setFileStatus({ bundles, tracker, config });
  };

  const deleteCodePushedBundle = async () => {
    try {
      const paths = [BUNDLES_PATH, LOCAL_BUNDLE_TRACKER_PATH, APP_CONFIG_PATH];
      for (const path of paths) {
        if (await RNFetchBlob.fs.exists(path)) {
          await RNFetchBlob.fs.unlink(path);
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const restartApp = () => RNRestart.Restart();

  const confirmRevert = () => {
    Alert.alert(
      "Confirm Factory Reset",
      "This will delete local bundles and restart the app. Do you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => deleteCodePushedBundle().then(restartApp),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {onDismiss && (
        <View style={styles.header}>
          <Pressable onPress={onDismiss}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
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
              Manage local bundles, revert updates, and export debug info.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📂 File Status</Text>
          {["bundles", "tracker", "config"].map((key) => {
            const data = fileStatus[key];
            const label =
              key === "bundles"
                ? "📁 Bundles"
                : key === "tracker"
                ? "📄 Tracker"
                : "⚙️ Config";

            return (
              <View key={key} style={styles.statusBlock}>
                <Text style={styles.statusLabel}>{label}</Text>
                {data ? (
                  <>
                    <Text style={styles.statusDetail}>✅ Exists</Text>
                    <Text style={styles.statusDetail}>Size: {data.size}</Text>
                    <Text style={styles.statusDetail}>
                      Modified: {data.modified}
                    </Text>
                    <Text style={styles.statusDetail}>Path: {data.path}</Text>
                  </>
                ) : (
                  <Text style={styles.statusMissing}>❌ Missing</Text>
                )}
              </View>
            );
          })}
        </View>

        {deviceInfo && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📱 Device Info</Text>
            {Object.entries(deviceInfo).map(([key, value]) => (
              <Text key={key} style={styles.statusItem}>
                {key}: {JSON.stringify(value)}
              </Text>
            ))}
          </View>
        )}

        {fileData && (
          <Pressable
            onPress={() => {
              Clipboard.setString(fileData);
              Alert.alert("Copied", "File data copied to clipboard.");
            }}
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📄 Tracker File</Text>
              <Text style={styles.logText}>{fileData}</Text>
            </View>
          </Pressable>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔧 Actions</Text>
          <Pressable style={styles.button} onPress={confirmRevert}>
            <Text style={styles.buttonText}>Factory Reset</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={restartApp}>
            <Text style={styles.buttonText}>Restart App</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={refreshStatus}>
            <Text style={styles.buttonText}>Refresh Status</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={onExport}>
            <Text style={styles.buttonText}>Export Bundle</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    padding: 10,
    alignItems: "flex-end",
    backgroundColor: "#fff",
  },
  closeButton: {
    fontSize: 18,
    color: "#666",
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
    borderRadius: 10,
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    fontWeight: "400",
  },
  lottie: {
    width: "100%",
    height: 200,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },
  button: {
    backgroundColor: "#007acc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 14,
  },
  statusItem: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
  },
  logText: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  statusBlock: {
    marginBottom: 16, 
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6, 
  },
  statusDetail: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
  },
  statusMissing: {
    fontSize: 14,
    color: "red",
    marginLeft: 10, 
  },
});

// create a section that will display
// device information
// network information - not possible because it need package

// Todo:
// app info:
// - appid, apptile endpoint, app fork everything configurations
// device infomation
// network information
// local tracker information
// app name
// reported customer name
// info
// reported issue

// log exports need to be in next release
// exports
// appconfig
// app bundle
// localtracker
// uploaded to s3
