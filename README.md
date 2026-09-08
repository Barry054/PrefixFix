\# PrefixFix



\### Gambian Mobile Number Migration Assistant



\[!\[Project Status](https://img.shields.io/badge/status-functional-success)](https://github.com/Barry054/PrefixFix)

\[!\[Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/Barry054/PrefixFix)

\[!\[Platform](https://img.shields.io/badge/platform-Android-green)](https://github.com/Barry054/PrefixFix)

\[!\[React Native](https://img.shields.io/badge/React%20Native-mobile-61DAFB)](https://reactnative.dev/)

\[!\[Expo](https://img.shields.io/badge/Expo-SDK%2057-000020)](https://expo.dev/)

\[!\[TypeScript](https://img.shields.io/badge/TypeScript-application%20logic-3178C6)](https://www.typescriptlang.org/)

\[!\[License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)



PrefixFix is a free and open-source React Native application designed to automate the migration of eligible Gambian mobile numbers from the legacy \*\*7-digit format\*\* to the newer \*\*9-digit format\*\*.



Instead of manually editing hundreds of contacts, PrefixFix scans the device address book, identifies numbers that match configured migration rules, previews the proposed changes, creates a backup, and applies the approved updates.



The project is designed around \*\*rule-based processing, data safety, testability, and real-device validation\*\*.



\---



\## Table of Contents



\* \[Overview](#overview)

\* \[The Problem](#the-problem)

\* \[Project Status](#project-status)

\* \[Key Features](#key-features)

\* \[Supported Migration Rules](#supported-migration-rules)

\* \[How It Works](#how-it-works)

\* \[Application Flow](#application-flow)

\* \[Technical Architecture](#technical-architecture)

\* \[Number Processing Engine](#number-processing-engine)

\* \[Contact Management](#contact-management)

\* \[Backup and Restore](#backup-and-restore)

\* \[Android Implementation](#android-implementation)

\* \[Testing](#testing)

\* \[Real-Device Validation](#real-device-validation)

\* \[Technology Stack](#technology-stack)

\* \[Project Structure](#project-structure)

\* \[Getting Started](#getting-started)

\* \[Development Workflow](#development-workflow)

\* \[Android Release Build](#android-release-build)

\* \[Privacy and Data Handling](#privacy-and-data-handling)

\* \[Security and Safety](#security-and-safety)

\* \[Known Limitations](#known-limitations)

\* \[Future Improvements](#future-improvements)

\* \[Contributing](#contributing)

\* \[License](#license)

\* \[Developer](#developer)



\---



\## Overview



Gambian mobile-number migration creates a practical problem for users with large address books.



A contact list may contain numbers stored in several different representations:



```text

7123456

07123456

+220 7123456

002207123456

```



Manually converting these numbers is slow and increases the risk of modifying the wrong data.



PrefixFix treats the problem as a structured data-transformation process:



```text

Scan → Normalize → Match Rules → Preview → Backup → Update → Verify

```



The application separates number-processing logic from contact management and the user interface. This makes the migration engine easier to test and reduces the risk of mixing business rules with device-specific operations.



\---



\## The Problem



A numbering migration may appear to require nothing more than adding a prefix. In practice, a contact-management application must account for many different situations.



PrefixFix needs to determine:



\* Whether a number is eligible for migration

\* Which migration rule applies

\* Whether the number has already been migrated

\* Whether the number contains `+220` or `00220`

\* Whether the number contains a leading `0`

\* Whether formatting characters are present

\* Whether the number belongs to a supported Gambian pattern

\* Whether the number is foreign or otherwise unsupported

\* Whether a contact contains multiple phone numbers

\* What should happen when an individual update fails



Because PrefixFix operates on real contact data, the application also needs mechanisms for previewing changes, creating backups, and reporting failures.



\---



\## Project Status



| Property         | Details                                           |

| ---------------- | ------------------------------------------------- |

| Version          | 1.0.0                                             |

| Platform         | Android                                           |

| Status           | Functional and tested on physical Android devices |

| Application Type | React Native mobile application                   |

| Primary Language | TypeScript                                        |

| Expo             | SDK 57                                            |

| License          | MIT                                               |



The current release focuses on supported Gambian mobile-number migration patterns and Android contact management.



\---



\## Key Features



\### Contact Scanning



Reads contact records and their associated phone numbers from the device address book.



\### Rule-Based Migration



Only numbers matching configured migration rules are considered for modification.



\### Number Normalization



Handles supported representations such as:



```text

+220 7123456

002207123456

7123456

```



before applying migration rules.



\### Migration Preview



Shows proposed changes before modifying the device's contacts.



\### Automatic Backup



Creates a backup before approved migration changes are applied.



\### Bulk Migration



Processes large contact lists without requiring users to manually edit individual records.



\### Already-Migrated Protection



Prevents supported numbers that are already in the new format from being migrated again.



\### Foreign Number Protection



Numbers outside the supported Gambian migration rules are ignored.



\### Failure Tracking



Records unsuccessful operations so failed updates can be identified rather than silently discarded.



\---



\## Supported Migration Rules



PrefixFix currently implements the following migration configuration:



| Operator        | Legacy Prefixes | New Prefix | Example               |

| --------------- | --------------- | ---------- | --------------------- |

| Africell        | `2`, `4`, `7`   | `87`       | `7123456 → 877123456` |

| QCell           | `3`, `5`        | `83`       | `3123456 → 833123456` |

| Comium          | `6`             | `86`       | `6123456 → 866123456` |

| Gamcel / Gamtel | `9`             | No change  | `9123456 → 9123456`   |



\### Africell



Supported legacy numbers beginning with `2`, `4`, or `7` receive the `87` migration prefix.



```text

7123456 → 877123456

```



\### QCell



Supported legacy numbers beginning with `3` or `5` receive the `83` migration prefix.



```text

3123456 → 833123456

```



\### Comium



Supported legacy numbers beginning with `6` receive the `86` migration prefix.



```text

6123456 → 866123456

```



\### Gamcel / Gamtel



Numbers beginning with `9` remain unchanged under the current configuration.



```text

9123456 → 9123456

```



> \*\*Note:\*\* Migration rules are configuration-dependent and may need to be updated if official numbering requirements change.



\---



\## How It Works



\### 1. Read Contacts



PrefixFix requests contact permission and retrieves contact records from the device.



\### 2. Normalize Numbers



Phone numbers are converted into a consistent internal representation before rule matching.



For example:



```text

+220 7123456

```



can be normalized to:



```text

7123456

```



\### 3. Match Migration Rules



The normalized number is evaluated against the configured migration rules.



The engine determines whether the number is:



\* eligible for migration,

\* already migrated,

\* unsupported,

\* invalid,

\* or otherwise unsuitable for modification.



\### 4. Generate Proposed Changes



For eligible numbers, the engine produces the original value and proposed migrated value.



```text

Original:  7123456

Proposed:  877123456

```



\### 5. Preview



The proposed changes are presented to the user before modification.



\### 6. Backup



A backup is created before contact updates are applied.



\### 7. Apply Changes



Approved changes are written back to the device contact records.



\### 8. Report Results



The application records successful and failed operations.



\---



\## Application Flow



```text

┌─────────────────────┐

│     Onboarding      │

└──────────┬──────────┘

&#x20;          ↓

┌─────────────────────┐

│ Contact Permission  │

└──────────┬──────────┘

&#x20;          ↓

┌─────────────────────┐

│   Scan Contacts     │

└──────────┬──────────┘

&#x20;          ↓

┌─────────────────────┐

│  Normalize Numbers  │

└──────────┬──────────┘

&#x20;          ↓

┌─────────────────────┐

│    Match Rules      │

└──────────┬──────────┘

&#x20;          ↓

┌─────────────────────┐

│  Migration Preview  │

└──────────┬──────────┘

&#x20;          ↓

┌─────────────────────┐

│       Backup        │

└──────────┬──────────┘

&#x20;          ↓

┌─────────────────────┐

│    Apply Updates    │

└──────────┬──────────┘

&#x20;          ↓

┌─────────────────────┐

│    Results / Done   │

└─────────────────────┘

```



\---



\## Technical Architecture



PrefixFix separates presentation, application state, business logic, configuration, device integration, and data protection.



```text

PrefixFix

│

├── React Native UI

│

├── Application State

│   └── AppContext

│

├── Business Logic

│   └── Number Migration Engine

│

├── Migration Configuration

│   └── Operator Rules

│

├── Device Integration

│   └── Expo Contacts

│

├── Data Protection

│   └── Backup / Restore

│

└── Infrastructure

&#x20;   └── Firebase

```



This separation allows the migration engine to be tested independently from the UI and keeps operator-specific rules separate from implementation logic.



\---



\## Number Processing Engine



The number-processing engine is the core business-logic layer of PrefixFix.



\### Core implementation



```text

src/lib/numbers.ts

```



Migration rules are maintained separately:



```text

src/data/rules.ts

```



The engine is responsible for:



\* number normalization,

\* migration-rule matching,

\* transformation,

\* rule specificity,

\* already-migrated detection,

\* invalid-number handling,

\* foreign-number protection,

\* no-op protection.



\### Transformation types



The engine supports transformation strategies such as:



```text

prefix-prepend

prefix-replace

```



The current Gambian migration rules primarily use prefix prepending.



\### Rule specificity



When multiple patterns could potentially apply, the engine uses rule specificity to select the appropriate migration behavior.



\### No-op protection



Numbers that do not require modification are returned unchanged.



This prevents already-migrated numbers from being transformed repeatedly.



\---



\## Contact Management



Contact-specific functionality is isolated from the number-processing engine.



```text

src/lib/contacts.ts

```



The contact-management layer handles:



\* contact permissions,

\* contact retrieval,

\* phone-number extraction,

\* migration candidate detection,

\* change generation,

\* contact updates,

\* failure tracking.



Contact retrieval uses pagination to support larger address books more efficiently.



The separation also allows the number-processing engine to operate without depending directly on the native Android Contacts provider.



\---



\## Backup and Restore



PrefixFix modifies real contact data, making backup and recovery an important part of the system.



Backup functionality is implemented in:



```text

src/lib/backup.ts

```



The migration sequence is intentionally:



```text

Scan → Preview → Backup → Update

```



The backup system supports:



\* creating backups,

\* storing backup information locally,

\* sharing backup files,

\* selecting backup files,

\* restoring contact information.



The backup step occurs before contact modification to provide a recovery mechanism.



\---



\## Android Implementation



During development, an Android-specific contact-update problem was discovered during physical-device testing.



An earlier implementation produced:



```text

OperationApplicationException

```



when attempting to update contacts.



The contact-update implementation was subsequently redesigned around the modern Expo Contacts `Contact` API.



The updated process is:



```text

Load contact

&#x20;   ↓

Retrieve phone records

&#x20;   ↓

Locate target phone record

&#x20;   ↓

Compare existing value

&#x20;   ↓

Apply new value

&#x20;   ↓

Persist contact

&#x20;   ↓

Record result

```



This resolved the contact-update issue and allowed the migration workflow to operate successfully against real Android contact data.



The issue also reinforced an important engineering principle: native device functionality should be validated on physical hardware rather than relying exclusively on mocks or emulators.



\---



\## Testing



PrefixFix uses \*\*Vitest\*\* to test the number-processing engine.



Current test results:



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



\### Test coverage includes



\* Gambian number normalization

\* Africell migration

\* QCell migration

\* Comium migration

\* Gamcel / Gamtel numbers

\* already-migrated numbers

\* formatted numbers

\* `+220` numbers

\* `00220` numbers

\* leading-zero numbers

\* foreign numbers

\* invalid numbers

\* short numbers

\* multiple rules

\* rule specificity

\* valid transformations

\* no-op transformations



The test suite provides regression protection for the application's core migration rules.



\---



\## Real-Device Validation



PrefixFix has been tested against physical Android devices and real contact data.



One complete migration test processed:



```text

Contacts:       468

Phone numbers:  1,417

```



The resulting contact changes were verified using the device's native Contacts application.



A subsequent scan confirmed that no remaining numbers required migration under the configured rules.



The application was also successfully tested on another physical Android device.



\### Why physical testing matters



Native contact behavior can vary across:



\* Android versions,

\* device manufacturers,

\* contact providers,

\* permission implementations,

\* synchronized accounts,

\* real-world contact data.



For an application that modifies device contacts, physical-device validation is therefore an important part of the testing process.



\---



\## Technology Stack



| Technology    | Purpose                                |

| ------------- | -------------------------------------- |

| React Native  | Mobile application framework           |

| Expo SDK 57   | Development tooling and native modules |

| TypeScript    | Application and business logic         |

| Expo Contacts | Contact access and modification        |

| AsyncStorage  | Local persistence                      |

| Firebase      | Backend infrastructure                 |

| Vitest        | Automated testing                      |

| Android SDK   | Android development                    |

| Gradle        | Android build system                   |

| Git           | Version control                        |

| GitHub        | Source-code hosting                    |



\---



\## Project Structure



```text

PrefixFix/

├── assets/

│   ├── icon.png

│   ├── android-icon-background.png

│   ├── android-icon-foreground.png

│   ├── android-icon-monochrome.png

│   └── favicon.png

├── functions/

│   ├── index.js

│   └── package.json

├── src/

│   ├── data/

│   │   └── rules.ts

│   ├── lib/

│   │   ├── numbers.ts

│   │   ├── numbers.test.ts

│   │   ├── contacts.ts

│   │   ├── backup.ts

│   │   └── firebase.ts

│   ├── screens/

│   │   ├── OnboardingScreen.tsx

│   │   ├── PreviewScreen.tsx

│   │   ├── SettingsScreen.tsx

│   │   └── SuccessScreen.tsx

│   ├── state/

│   │   └── AppContext.tsx

│   └── theme.ts

├── App.tsx

├── app.json

├── package.json

├── tsconfig.json

├── LICENSE

└── README.md

```



\---



\## Getting Started



\### Prerequisites



Install the following before running PrefixFix:



\* Node.js

\* npm

\* Git

\* Android Studio

\* Android SDK

\* Physical Android device or Android emulator



For physical-device development, enable \*\*Developer Options\*\* and \*\*USB debugging\*\*.



\### Clone the repository



```bash

git clone https://github.com/Barry054/PrefixFix.git

cd PrefixFix

```



\### Install dependencies



```bash

npm install

```



\### Start the development server



```bash

npm start

```



\### Run on Android



```bash

npm run android

```



\---



\## Development Workflow



The recommended development cycle is:



```text

Install

&#x20; ↓

Test

&#x20; ↓

Typecheck

&#x20; ↓

Run Expo

&#x20; ↓

Test Application

&#x20; ↓

Validate on Physical Device

&#x20; ↓

Build Release

```



Before committing changes:



```bash

npm test

npm run typecheck

```



Any change to migration behavior should include appropriate automated test coverage.



\---



\## Android Release Build



The current Android configuration uses:



```text

Target SDK: 36

NDK: 30.0.16138531

```



The generated release APK is located at:



```text

android/app/build/outputs/apk/release/app-release.apk

```



The release build has been compiled, installed, and tested on physical Android devices.



\---



\## Privacy and Data Handling



PrefixFix requires contact permission because its primary function is to migrate phone numbers stored in the device address book.



Contact access is used to:



1\. Read contact records.

2\. Read phone numbers.

3\. Identify eligible numbers.

4\. Generate migration previews.

5\. Create backups.

6\. Apply approved changes.



Users should only grant contact permission when they intend to use the migration functionality.



Because contact information is personal data, users should understand the permission being granted before using the application.



PrefixFix is an independent open-source project and is \*\*not an official application of any Gambian telecommunications operator\*\*.



\---



\## Security and Safety



Because PrefixFix modifies real user data, the application includes safeguards designed to reduce unintended changes.



\### Preview



Users can review proposed migrations before updates are applied.



\### Backup



A backup is created before contact modification.



\### Rule-Based Selection



Only numbers matching supported migration rules are selected.



\### Already-Migrated Protection



Numbers already using the supported new format are not repeatedly migrated.



\### Foreign Number Protection



Numbers outside supported Gambian rules are ignored.



\### Failure Reporting



Failed operations are recorded and reported rather than silently discarded.



Users should still maintain independent backups of important contact information.



\---



\## Known Limitations



Current limitations include:



\* Migration rules may need to change if official numbering requirements change.

\* Contact API behavior can vary across Android versions and manufacturers.

\* iOS has not received the same level of physical-device validation.

\* Backup management can be expanded.

\* Additional edge cases can be added to the automated test suite.

\* The current implementation focuses on supported Gambian migration patterns.

\* PrefixFix is not an official telecommunications service.



\---



\## Future Improvements



Planned or potential improvements include:



\### Additional Migration Rules



Support additional numbering migrations when required.



\### Advanced Backup Management



Potential additions include:



\* multiple backup versions,

\* backup history,

\* backup metadata,

\* backup validation,

\* granular restore controls.



\### Detailed Migration Reports



Future releases could provide statistics such as:



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



Additional datasets and edge cases can strengthen the migration engine.



\### iOS Support



Further development and physical-device testing could extend the application beyond Android.



\### Public Distribution



The application could eventually be prepared for wider distribution through mobile application stores.



\---



\## Contributing



Contributions are welcome.



Potential areas include:



\* Migration rules

\* Number normalization

\* Automated testing

\* Backup and restore

\* Android compatibility

\* iOS support

\* Accessibility

\* UI improvements

\* Documentation

\* Performance



\### Before submitting a pull request



Run:



```bash

npm test

npm run typecheck

```



A pull request should explain:



\* what was changed,

\* why the change was necessary,

\* how it was tested,

\* whether migration behavior was affected.



Changes to migration rules should include corresponding tests.



\---



\## License



PrefixFix is released under the \*\*MIT License\*\*.



Copyright © 2026 \*\*Ebrima Alsan Barry\*\*



See \[LICENSE](LICENSE) for the complete license text.



\---



\## Developer



\### Ebrima Alsan Barry



\*\*Software Developer · Computer Science Student\*\*



PrefixFix was designed and developed by Ebrima Alsan Barry, a Gambian software developer focused on building practical software solutions across mobile, backend, web, and application development.



His technical work includes Java, Python, JavaScript, TypeScript, React, React Native, Next.js, Expo, Spring Boot, REST APIs, MySQL, Firebase, JDBC, Android development, and automated testing.



PrefixFix reflects an engineering approach centered on:



\* solving real-world problems,

\* separating application responsibilities,

\* testing critical business logic,

\* debugging systematically,

\* protecting real user data,

\* validating software on physical hardware,

\* and taking projects from implementation through release.



\### Links



\* \*\*GitHub:\*\* \[github.com/Barry054](https://github.com/Barry054)

\* \*\*LinkedIn:\*\* \[linkedin.com/in/ebrima-alsan-barry-243bba25](https://www.linkedin.com/in/ebrima-alsan-barry-243bba25)

\* \*\*Email:\*\* \[barristeryanzeh054@gmail.com](mailto:barristeryanzeh054@gmail.com)



\---



\## Project Summary



PrefixFix began with a practical problem: migrating large numbers of Gambian contacts without requiring users to manually edit every phone number.



Solving that problem required more than adding prefixes. The project combines:



\* rule-based data transformation,

\* number normalization,

\* contact management,

\* native Android integration,

\* backup and restore,

\* automated testing,

\* failure handling,

\* physical-device validation,

\* and release engineering.



The result is an open-source application that demonstrates how a real-world problem can be translated into a structured, tested, and deployable software system.



