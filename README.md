# Splite: Simplify Your Finances

Welcome to Splite! Splite is an app designed to help you manage your finances with ease. With Splite, you can create accounts, log your expenses, track them with graphs and lists, create or join groups, share expenses with others, and summarize your expenses effortlessly.

## Run Locally

### Clone the project

```bash
git clone https://github.com/cemerenb/splite
```

### Install packages
```bash
cd splite
```

```bash
yarn install
```

## Firebase Config
### Important Note
This app is already in use by users, so you need to generate your own FirebaseConfig.ts file.

Create a file named FirebaseConfig.ts in the src directory and add the following code:
```React
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const DATABASE = getDatabase(FIREBASE_APP);

```
## Run Application
```bash
npx expo start
```
Select your platform
```bash
a //for android
i //for ios
```

## Visit Splite on Play Store
Click [here](https://play.google.com/store/apps/details?id=cemerenb.splite.com)
## Images
<img src="https://github.com/cemerenb/splite/assets/82811515/1fc5e7aa-a069-483c-bece-4f8f0f3895de" width="350">
<img src="https://github.com/cemerenb/splite/assets/82811515/04a1b908-a3d2-4d84-8fed-0ef771d5b3b2" width="350">
<img src="https://github.com/cemerenb/splite/assets/82811515/f0ac6f39-7e65-4da1-9cc4-ca9dd70edd02" width="350">
<img src="https://github.com/cemerenb/splite/assets/82811515/38ebcc99-fb0e-4e7f-b723-8f7e5f4a9094" width="350">
