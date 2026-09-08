\# PrefixFix



\### Gambian Mobile Number Migration Assistant



PrefixFix is a free, open-source React Native application that automates the migration of eligible Gambian phone numbers from the old 7-digit format to the new 9-digit format.



Instead of manually editing hundreds of contacts, PrefixFix scans the device address book, identifies numbers that require migration, shows the proposed changes, creates a backup, and applies the approved updates directly to the device.



\## Project Status



\*\*Version:\*\* 1.0.0

\*\*Platform:\*\* Android

\*\*License:\*\* MIT

\*\*Status:\*\* Functional and tested on physical Android devices





\## Table of Contents



\* \[Overview](#overview)

\* \[The Problem](#the-problem)

\* \[Features](#features)

\* \[Migration Rules](#migration-rules)

\* \[How It Works](#how-it-works)

\* \[Application Flow](#application-flow)

\* \[Screenshots](#screenshots)

\* \[Technical Architecture](#technical-architecture)

\* \[Number Processing Engine](#number-processing-engine)

\* \[Contact Management](#contact-management)

\* \[Backup and Restore](#backup-and-restore)

\* \[Android Implementation](#android-implementation)

\* \[Testing](#testing)

\* \[Real-Device Testing](#real-device-testing)

\* \[Technology Stack](#technology-stack)

\* \[Project Structure](#project-structure)

\* \[Getting Started](#getting-started)

\* \[Development](#development)

\* \[Android Release Build](#android-release-build)

\* \[Privacy](#privacy)

\* \[Limitations](#limitations)

\* \[Future Improvements](#future-improvements)

\* \[Contributing](#contributing)

\* \[License](#license)

\* \[Developer](#developer)



\---



\# Overview



Gambia's transition from 7-digit to 9-digit phone numbers creates a practical problem for people with large contact lists.



A contact list containing hundreds or thousands of phone numbers can be extremely time-consuming to update manually.



PrefixFix automates this process while providing safeguards against unintended changes.



The application:



1\. Reads contacts from the device.

2\. Examines their phone numbers.

3\. Normalizes numbers for reliable comparison.

4\. Matches numbers against configured migration rules.

5\. Generates a list of proposed changes.

6\. Allows the user to review the migration.

7\. Creates a backup before making changes.

8\. Updates eligible numbers.

9\. Reports the results.



The core design is intentionally simple:



```text

Scan

&#x20; ↓

Match

&#x20; ↓

Preview

&#x20; ↓

Backup

&#x20; ↓

Update

&#x20; ↓

Verify

```



\---



\# The Problem



A Gambian phone number can appear in a contact list in different formats.



For example:



```text

7123456

07123456

+2207123456

002207123456

```



A user may also have:



\* Numbers that have already been migrated.

\* Numbers belonging to different operators.

\* Foreign phone numbers.

\* Formatted phone numbers.

\* Invalid or incomplete numbers.

\* Multiple phone numbers stored under the same contact.



Manually identifying and updating eligible numbers is error-prone and inefficient.



PrefixFix treats the migration as a structured data transformation problem.



\---



\# Features



\## Automatic Contact Scanning



PrefixFix reads the device address book and identifies contacts containing phone numbers that match the configured migration rules.



Contact reading is paginated to better handle larger address books.



\## Rule-Based Migration



Migration behavior is defined through explicit operator rules rather than hard-coded transformations scattered throughout the application.



\## Number Normalization



The application can recognize common representations of Gambian numbers, including country-code and trunk-prefix formats.



\## Migration Preview



Users can review the proposed changes before modifying their contacts.



\## Automatic Backup



A backup is created before changes are applied.



\## Bulk Updates



Multiple contacts and phone numbers can be updated in a single migration operation.



\## Already-Migrated Protection



Numbers that are already in the expected format are not migrated again.



\## Foreign Number Protection



Numbers that do not match the supported Gambian migration rules are ignored.



\## Failure Tracking



The application tracks successful and failed contact updates and reports the final result.



\## Restore Support



Backups can be selected and used to restore contact information.



\---



\# Migration Rules



PrefixFix currently implements the following migration rules:



| Operator      | Old Prefix    | New Prefix | Example                 |

| ------------- | ------------- | ---------- | ----------------------- |

| Africell      | `2`, `4`, `7` | `87`       | `7123456` → `877123456` |

| QCell         | `3`, `5`      | `83`       | `3123456` → `833123456` |

| Comium        | `6`           | `86`       | `6123456` → `866123456` |

| Gamcel/Gamtel | `9`           | No change  | `9123456` → unchanged   |



Only 7-digit numbers matching the supported rules are eligible for migration.



\### Africell



```text

7123456

&#x20;   ↓

877123456

```



The same `87` prefix is applied to eligible numbers beginning with `2`, `4`, or `7`.



\### QCell



```text

3123456

&#x20;   ↓

833123456

```



The `83` prefix is applied to eligible numbers beginning with `3` or `5`.



\### Comium



```text

6123456

&#x20;   ↓

866123456

```



The `86` prefix is applied to eligible numbers beginning with `6`.



\### Gamcel/Gamtel



Numbers beginning with `9` are currently left unchanged.



\---



\# How It Works



PrefixFix separates the migration process into several stages.



\## 1. Read Contacts



The application requests contact permission and retrieves the device's contacts.



\## 2. Normalize Numbers



Phone numbers are converted into a consistent representation for matching.



Formatting characters and supported country/trunk prefixes are handled by the normalization layer.



\## 3. Match Migration Rules



Each phone number is evaluated against the configured migration rules.



A number that does not match a rule is ignored.



\## 4. Generate Changes



For matching numbers, PrefixFix creates a change record containing the original and proposed values.



Example:



```text

Original:

7123456



Updated:

877123456

```



\## 5. Preview



The application presents the changes before modifying the address book.



\## 6. Backup



A backup is created before any contact updates are performed.



\## 7. Apply Changes



Approved changes are written back to the device's contacts.



\## 8. Report Results



The application reports:



```text

Contacts updated

Numbers updated

Contacts failed

```



\---



\# Application Flow



```text

┌───────────────┐

│   Onboarding  │

└───────┬───────┘

&#x20;       ↓

┌───────────────┐

│   Permission  │

└───────┬───────┘

&#x20;       ↓

┌───────────────┐

│     Scan      │

└───────┬───────┘

&#x20;       ↓

┌───────────────┐

│ Rule Matching │

└───────┬───────┘

&#x20;       ↓

┌───────────────┐

│    Preview    │

└───────┬───────┘

&#x20;       ↓

┌───────────────┐

│    Backup     │

└───────┬───────┘

&#x20;       ↓

┌───────────────┐

│    Update     │

└───────┬───────┘

&#x20;       ↓

┌───────────────┐

│    Success    │

└───────────────┘

```





\# Technical Architecture



PrefixFix separates presentation, state management, business logic, device integration, and backup functionality.



```text

PrefixFix

│

├── React Native UI

│

├── Application State

│       └── AppContext

│

├── Business Logic

│       └── Number Migration Engine

│

├── Migration Configuration

│       └── Operator Rules

│

├── Device Integration

│       └── Expo Contacts

│

├── Data Protection

│       └── Backup / Restore

│

└── Infrastructure

&#x20;       └── Firebase

```



This separation allows the migration engine to be tested independently from the user interface.



\---



\# Number Processing Engine



The core number-processing logic is located in:



```text

src/lib/numbers.ts

```



Migration rules are defined in:



```text

src/data/rules.ts

```



This makes the migration system configurable and easier to maintain.



\## Supported Transformations



The migration engine supports:



```text

prefix-prepend

prefix-replace

```



The current Gambian migration rules primarily use prefix prepending.



\## Normalization



Before matching, the engine can normalize common representations of the same phone number.



For example:



```text

+220 7123456

&#x20;     ↓

7123456

```



The normalized value is used for rule matching while the original value can be preserved when generating the actual update.



\## Rule Matching



Rules are evaluated according to their specificity.



The engine supports longest-pattern matching so that more specific rules can take precedence over broader ones.



\## No-Op Protection



If a number does not require migration, the engine returns no change.



This prevents unnecessary updates and repeated transformations.



\---



\# Contact Management



Contact functionality is implemented in:



```text

src/lib/contacts.ts

```



Responsibilities include:



\* Contact permission handling

\* Contact retrieval

\* Phone-number extraction

\* Migration matching

\* Change generation

\* Contact updates

\* Failure tracking



\## Paginated Contact Reading



Contacts are retrieved using pagination rather than assuming the entire address book can be loaded in one operation.



Conceptually:



```text

Request contacts

&#x20;     ↓

Process page

&#x20;     ↓

More contacts?

&#x20;  /       \\

&#x20;Yes        No

&#x20; ↓          ↓

Next       Finish

page

```



This approach is better suited to larger contact databases.



\---



\# Backup and Restore



Backup functionality is implemented in:



```text

src/lib/backup.ts

```



PrefixFix creates a backup before applying contact modifications.



The backup system supports:



\* Creating backups

\* Storing backups locally

\* Sharing backup files

\* Selecting backup files

\* Restoring contact information



The intended migration sequence is:



```text

Scan

&#x20;↓

Preview

&#x20;↓

Backup

&#x20;↓

Update

```



This provides a recovery mechanism before bulk modifications are made.



\---



\# Android Implementation



One of the more significant engineering challenges in the project was updating actual Android contact records.



The initial implementation used the legacy Expo Contacts update method.



During physical-device testing, contact updates produced:



```text

OperationApplicationException

```



The contact-update implementation was subsequently redesigned around the modern Expo Contacts `Contact` API.



The updated process:



1\. Load the existing contact.

2\. Retrieve its phone records.

3\. Locate the phone record identified during scanning.

4\. Compare the current value with the proposed value.

5\. Update the phone record.

6\. Persist the change.

7\. Record the result.



This resolved the contact-update issue encountered during testing.



The final implementation was then validated against real Android contacts.



\---



\# Testing



The migration engine is covered by automated tests using Vitest.



Current test result:



```text

Test Files  1 passed (1)

Tests       25 passed (25)

```



Run the test suite with:



```bash

npm test

```



Run TypeScript validation with:



```bash

npm run typecheck

```



\## Tested Areas



The test suite covers scenarios including:



\* Gambian number normalization

\* Africell migration

\* QCell migration

\* Comium migration

\* Already-migrated numbers

\* Gamcel/Gamtel numbers

\* Formatted phone numbers

\* `+220` numbers

\* `00220` numbers

\* Leading `0` numbers

\* Foreign numbers

\* Invalid numbers

\* Short numbers

\* Multiple migration rules

\* Rule specificity

\* Prefix transformations

\* No-op cases



\---



\# Real-Device Testing



PrefixFix was tested on physical Android hardware rather than relying solely on an emulator.



A complete migration test successfully processed:



```text

1,417 phone numbers

468 contacts

```



After the migration, the updated numbers were verified directly in the device's native Contacts application.



A subsequent scan correctly detected that there were no remaining numbers requiring migration.



The application was also tested on another physical Android device and successfully completed the migration.



This physical-device testing was important because contact-management APIs interact with the device's native data layer and can behave differently from mocked or simulated environments.



\---



\# Technology Stack



| Technology    | Role                                    |

| ------------- | --------------------------------------- |

| React Native  | Mobile application framework            |

| Expo SDK 57   | React Native tooling and native modules |

| TypeScript    | Application and business logic          |

| Expo Contacts | Contact access and modification         |

| AsyncStorage  | Local persistence                       |

| Firebase      | Backend infrastructure                  |

| Vitest        | Automated testing                       |

| Android SDK   | Android development                     |

| Gradle        | Android build system                    |

| Git           | Version control                         |



\---



\# Project Structure



```text

PrefixFix/

│

├── assets/

│   ├── icon.png

│   ├── android-icon-background.png

│   ├── android-icon-foreground.png

│   ├── android-icon-monochrome.png

│   └── favicon.png

│

├── functions/

│   ├── index.js

│   └── package.json

│

├── src/

│   ├── data/

│   │   └── rules.ts

│   │

│   ├── lib/

│   │   ├── numbers.ts

│   │   ├── numbers.test.ts

│   │   ├── contacts.ts

│   │   ├── backup.ts

│   │   └── firebase.ts

│   │

│   ├── screens/

│   │   ├── OnboardingScreen.tsx

│   │   ├── PreviewScreen.tsx

│   │   ├── SettingsScreen.tsx

│   │   └── SuccessScreen.tsx

│   │

│   ├── state/

│   │   └── AppContext.tsx

│   │

│   └── theme.ts

│

├── App.tsx

├── app.json

├── package.json

├── tsconfig.json

├── LICENSE

└── README.md

```



\---



\# Getting Started



\## Requirements



To develop PrefixFix locally, install:



\* Node.js

\* npm

\* Android Studio

\* Android SDK

\* Git

\* A physical Android device or Android emulator



For physical-device testing, Android Developer Options and USB debugging should be enabled.



\## Clone the Repository



```bash

git clone https://github.com/Barry054/PrefixFix.git

cd PrefixFix

```



\## Install Dependencies



```bash

npm install

```



\## Start the Development Server



```bash

npm start

```



\## Run on Android



```bash

npm run android

```



\---



\# Development



A typical development workflow is:



```text

Install dependencies

&#x20;      ↓

Run tests

&#x20;      ↓

Run TypeScript validation

&#x20;      ↓

Start Expo

&#x20;      ↓

Test application

&#x20;      ↓

Test physical device

&#x20;      ↓

Build release version

```



Before committing changes:



```bash

npm test

npm run typecheck

```



Changes to migration behavior should always be accompanied by appropriate test coverage.



\---



\# Android Release Build



PrefixFix has been successfully compiled as a release Android APK.



The native Android project uses:



```text

Android target SDK: 36

NDK: 30.0.16138531

```



The generated release APK is:



```text

android/app/build/outputs/apk/release/app-release.apk

```



The release APK was installed and tested on physical Samsung Android devices.



\---



\# Privacy



PrefixFix requires contact permission because contact migration is its primary purpose.



Contact data is accessed to:



1\. Read contact records.

2\. Read phone numbers.

3\. Identify eligible numbers.

4\. Generate migration changes.

5\. Create a backup.

6\. Apply approved updates.



Users should only grant contact permission when they intend to use the application's contact migration functionality.



Because contact information is personal data, users should understand the permission being granted before performing a migration.



\---



\# Limitations



PrefixFix currently focuses on the Gambian migration rules implemented in the project.



Current limitations include:



\* Migration rules may need to change if official numbering requirements change.

\* Android contact behavior can vary between device manufacturers and Android versions.

\* iOS has not received the same level of physical-device validation.

\* Backup management can be expanded.

\* Additional edge cases can be added to the test suite.

\* The current implementation focuses on the supported Gambian numbering patterns.

\* The application has not been positioned as an official service of any Gambian telecommunications operator.



Users should maintain independent backups of important contact information.



\---



\# Future Improvements



Potential improvements include:



\### Expanded Migration Rules



Support additional numbering changes if required.



\### Improved Backup Management



Possible additions:



\* Multiple backup versions

\* Backup history

\* Backup metadata

\* Backup validation

\* More granular restore controls



\### Detailed Migration Reports



Future versions could provide statistics such as:



```text

Contacts scanned

Phone numbers scanned

Eligible numbers

Already-migrated numbers

Skipped numbers

Numbers updated

Failed updates

```



\### Expanded Test Coverage



Additional datasets and edge cases could improve confidence across different contact formats and Android environments.



\### iOS Support



The application could be further developed and physically tested on iOS.



\### Distribution



The application could eventually be packaged and distributed through official mobile application stores.



\---



\# Contributing



PrefixFix is open source and contributions are welcome.



Potential contribution areas include:



\* Migration rules

\* Number normalization

\* Automated tests

\* Backup and restore

\* Android compatibility

\* iOS support

\* Accessibility

\* User interface improvements

\* Documentation

\* Performance improvements



Before submitting a pull request, run:



```bash

npm test

npm run typecheck

```



Pull requests should describe:



\* What was changed

\* Why the change was necessary

\* How it was tested

\* Whether migration behavior was affected



\---



\# License



PrefixFix is released under the MIT License.



```text

Copyright (c) 2026 Ebrima Alsan Barry

```



See \[LICENSE](LICENSE) for the complete license text.



\---



\# Developer



\*\*Ebrima Alsan Barry\*\*



Computer Science student and software developer based in The Gambia.



PrefixFix was developed as an independent open-source project to solve a practical problem involving Gambian mobile-number migration.



\*\*GitHub:\*\* https://github.com/Barry054

\*\*LinkedIn:\*\* https://www.linkedin.com/in/ebrima-alsan-barry-243bba25

\*\*Email:\*\* \[barristeryanzeh054@gmail.com](mailto:barristeryanzeh054@gmail.com)



\---



\## Project Summary



PrefixFix combines mobile development, contact-management APIs, data transformation, automated testing, backup and restore, Android debugging, and physical-device validation into a single application.



The project demonstrates a complete development workflow:



```text

Problem

&#x20; ↓

Requirements

&#x20; ↓

Design

&#x20; ↓

Implementation

&#x20; ↓

Testing

&#x20; ↓

Debugging

&#x20; ↓

Physical-device Validation

&#x20; ↓

Release Build

```



The source code is available under the MIT License for developers who want to inspect, learn from, improve, or extend the project.



