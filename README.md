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