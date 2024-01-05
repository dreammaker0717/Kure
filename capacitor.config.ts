import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kuremendocino.kure',
  appName: 'Kurewellness',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;  
