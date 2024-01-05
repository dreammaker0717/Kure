# Kuremendocino.com

React Redux dashboard template made using the Material UI React component library with aim of flexibility and better
customizability.

### Requirements

Latest version of Node.js (v19.1.0+).

## Table of contents

- [Getting started](#getting-started)
- [Documentation](#documentation)

## Getting started

```
yarn
yarn start
```

## Technology stack

- [Material UI V5](https://mui.com/core/)
- Built with React Hooks API.
- Redux & React context API for state management.
- Redux toolkit.
- React Router for navigation routing.
- Support for react-script.
- Code splitting.
- CSS-in-JS.
- Google Workbench (offline-first)
- OAuth to authorize Drupal users

## Using Capacitor to build the Android project

- npx cap copy: Copies the web assets (build artifacts from your web app) into the native Android project. You need to run this after every web app build.
- npx cap open android: Opens the native Android project in Android Studio. This is useful for running on an emulator or a device directly from Android Studio or to make modifications to the native project.
- npx cap sync: Performs copy, and then updates the native plugins and dependencies defined in package.json. This command is a combination of npx cap copy and npx cap update.
- npx cap update: Updates the native plugins and dependencies based on package.json. Unlike sync, it does not copy web assets.
- npx cap doctor: Checks the current setup for common problems and prints out a report.
- npx cap run android: Runs the app on a connected device or emulator, similar to npm run build android, but also includes the copy and sync steps.
- npx cap add ios: Adds the iOS platform to your project, allowing you to build for iOS devices as well.
- npx cap serve: Serves the app through a local development server, useful for testing in the browser or on a device with live reload.

## Testing scenarios

Scenario one. A customer submits an order (needs_processing), an employee handles the order by completing it.

- Customer submits order
    1) Drupal receives it (1).
    2) Push notification to employee devices.
    3) Order notification panel populates.

- Employee handles order
    1) Completes the order and submits it to Drupal.

Scenario two. An employee submits an order (completed). It can be for a customer or for themselves.

- Employee submits order
    1) Drupal receives it (1).
    2) Push notification to employee devices.
    3) Order notification panel populates.

- Employee starts/creates a new order but does not complete it.
    1) Order is saved to IDB.
    2) Order is sent to Drupal (1).
    3) New order is pushed to all employee devices.
    4) Order notification panel populates.

Scenario three. A customer starts/orders a new order but does not submit it.

- A customer doesn't finish their order, but we want to save it in Drupal.
    1) Order is saved to IDB.
    2) Order submits to Drupal (1).
    3) Order is pushed to all employee devices (?).

#### Legend:

- (?) A feature we may not implement.
- (1) What happens when the device is offline?