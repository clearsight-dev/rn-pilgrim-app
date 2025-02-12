import React, {useState} from 'react';
import {Modal, Pressable, View, Text} from 'react-native';
import UpdateModal from './UpdateModal';

export default function FloatingUpdateModal({navigationRef, appId, updateDownloaded}) {
  const [showCodepushModal, setShowCodepushModal] = useState(true);
  return (
    <Modal
      visible={showCodepushModal} 
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCodepushModal(false)}
    >
      <Pressable
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: "#000000cc"
        }}
        onPress={() => setShowCodepushModal(false)}
      >
        <View
          style={{
            width: '90%',
            height: '80%',
            padding: 12,
            backgroundColor: 'white',
            borderRadius: 8
          }}
        >
          {updateDownloaded !== 'yes' && <Text style={{color: 'red'}}>Still downloading...</Text>}
          <UpdateModal
            onDismiss={() => setShowCodepushModal(false)}
            navigation={navigationRef}
            route={{params: {appId: appId}}}
          />
        </View>
      </Pressable>
    </Modal>
  );
}
