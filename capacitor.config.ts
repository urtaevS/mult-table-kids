import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akira.multtable',
  appName: 'Математика — играя',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: { enabled: false },
  },
  android: {
    backgroundColor: '#FFF8EC',
  },
};

export default config;
