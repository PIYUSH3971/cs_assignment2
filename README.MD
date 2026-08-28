# Session Fixation Demo

Minimal Express app demonstrating a Session Fixation vulnerability. The application fails to issue a fresh session identifier at the moment of login. An attacker can obtain a valid anonymous session ID and trick a victim into using it before authenticating.

## Run

```bash
npm install
npm start