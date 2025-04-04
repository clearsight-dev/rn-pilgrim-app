//! OTP autofetch & manual prefill only supported in android
import {
  startOtpListener,
  getHash,
  removeListener,
} from 'react-native-otp-verify';

export const startOTPFetchListener = fn => {
  getHash().then(hash => {
    console.log('OTP auto fetch hash', hash);
  });

  startOtpListener(message => {
    fn(message);
  });
};

export const removeOTPFetchListener = () => {
  removeListener();
};
