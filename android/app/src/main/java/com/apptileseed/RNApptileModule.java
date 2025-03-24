package com.apptileseed;

import com.apptileseed.R;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;
import android.util.Log;

import java.lang.ClassNotFoundException;
import java.lang.IllegalAccessException;
import java.lang.reflect.Field;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.Promise;

import java.util.Map;
import java.util.HashMap;

public class RNApptileModule extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;
  public RNApptileModule(ReactApplicationContext context) {
    super(context);
     reactContext = context;
  }

  @Override
  public String getName() {
    return "RNApptile";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("VERSION_CODE", BuildConfig.VERSION_CODE);
    return constants;
  }

  @ReactMethod
  public void notifyJSReady() {
    SplashManager.INSTANCE.removeSplash();
  }

  // @ReactMethod
  // public void getVersionNumber(Callback cb) {
  //   cb.invoke(BuildConfig.VERSION_CODE);
  // }
}
