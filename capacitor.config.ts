import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akira.multtable',
  appName: 'Математика — играя',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: { enabled: true },
    StatusBar: {
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#FFF8EC',
    },
  },
  android: {
    backgroundColor: '#FFF8EC',
  },
};

export default config;
