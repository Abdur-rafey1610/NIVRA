# Nivra — Codebase Audit (summary)

Date: 2026-01-05

Purpose: review current repository state against the provided Nivra project specification and list what is done vs. what remains to complete the project (stick to provided details).

---

## What exists (implemented)

- Firmware (PlatformIO): `c:/Users/rafey/OneDrive/Documents/PlatformIO/Projects/Nivra/src/main.cpp`
  - Reads `MPU6050` (accelerometer) and `MAX30102` (heart rate / SpO2) over I2C.
  - I2C pins: SDA = GPIO 8, SCL = GPIO 9 (matches provided wiring).
  - TP4056 charger wiring is referenced in user notes and main board power connections present.
  - No BLE transmit code found in `main.cpp` (only sensor reads + serial output + motor test).

- ML artifacts (`nivra-ml/`):
  - `ml.ipynb`, `train.py`, `run_inference.py`, `evaluate_model.py`, `run_inference.py`, `train.py`, `test.csv` present.
  - Training and inference pipelines exist and save `nivra_brain.pkl` and `nivra_scaler.pkl`.
  - Safety veto using `SpO2 >= 95` is implemented in inference/evaluation logic.

- Frontend UI (`nivra/`):
  - React app with views and mock services in `services/` including `geminiService.ts` (GenAI helper) and `smsService.ts` (simulated OTP).
  - UI scaffolding present to display vitals / dashboards, but no connection to a backend or live telemetry.


## Partial / Inconsistent areas (work required to align to spec)

- Feature set inconsistency in ML code and docs:
  - Many ML files (e.g., `train.py`, `run_inference.py`, `evaluate_model.py`, `nivra-ml/README.md`) include `temperature` in `FEATURES` and CLI flags.
  - Project spec states *no temperature sensor*. ML must be updated to use only: `heart_rate`, `spo2`, and `motion` (or the existing `vibration_intensity` column renamed/aliased to `motion`).
  - Multiple places to update: `FEATURES` constants, notebook cells, `test.csv` usage, CLI args in `run_inference.py`, and `nivra-ml/README.md` instructions.

- Saved model & scaler consistency:
  - Current saved artifacts expect the older feature ordering including `temperature`. After retraining without temperature, saved artifacts and inference code must be regenerated and replaced.

- Firmware BLE & telemetry forwarding:
  - `main.cpp` currently prints sensor values to serial; no BLE advertising/GATT or JSON payload transmission implemented.
  - For the wearable to act as described, firmware must package readings as JSON and send via BLE (or the MCU must expose streamed data for the mobile gateway to read).

- Mobile gateway (required but missing):
  - No mobile app source found for BLE gateway. The mobile gateway must:
    - Connect to BLE wearable, parse JSON payload (`hr`, `spo2`, `motion`), add `deviceId` and `timestamp`, and securely forward telemetry to Azure IoT Hub.

- Cloud ingestion / backend (missing):
  - No Node/Express backend, no Azure IoT Hub ingestion code, no Azure Function for alert automation, and no Azure ML endpoint wiring present.
  - Key Vault usage and Azure SQL schemas not implemented.

- Alerting and automation (not implemented):
  - No Azure Function or backend rule that triggers push notifications when `risk_level == high` and `confidence > 0.85`.

- Security & infra (not implemented):
  - No ARM/Bicep/Terraform or deployment scripts for IoT Hub, App Service, Functions, Key Vault, Azure SQL, or AML workspace.
  - No evidence of Key Vault secrets usage — secrets and credentials appear to be absent from code.

- Frontend integration:
  - React UI exists but currently relies on simulated services (`geminiService.simulatePrediction()` and GenAI). It lacks endpoints to receive real telemetry, ML predictions, or alerts.


## Clear next actions (recommended, prioritized)

1. ML cleanup (high priority)
   - Remove `temperature` from `FEATURES` across `train.py`, `run_inference.py`, `evaluate_model.py`, and `ml.ipynb`.
   - Use `['heart_rate', 'spo2', 'vibration_intensity']` or rename to `motion` consistently. Update `test.csv` column handling if necessary.
   - Retrain and overwrite `nivra_brain.pkl` and `nivra_scaler.pkl` artifacts.
   - Update `nivra-ml/README.md` and any CLI flags (`--temp`) to remove temperature.

2. Firmware (medium priority)
   - Add BLE peripheral code to `main.cpp` to advertise/notify JSON payloads: {"hr":...,"spo2":...,"motion":...} at a fixed interval.
   - Optionally add a simple BLE GATT service + characteristic for telemetry.
   - Keep I2C wiring and sensor init as-is; add battery monitoring if desired (but user noted ADC divider not connected for now).

3. Mobile gateway (high priority)
   - Implement a mobile app (or lightweight Node/React Native script) to act as BLE central, attach metadata (`deviceId`, `timestamp`) and forward to Azure IoT Hub.
   - Ensure TLS and authentication for IoT Hub.

4. Cloud & backend (high priority)
   - Provision Azure IoT Hub to receive device telemetry from mobile gateway.
   - Implement a Node/Express App Service or a serverless consumer for IoT Hub messages that validates ranges, normalizes values, stores to Azure SQL, and calls the ML endpoint.
   - Deploy the ML model to Azure ML as an endpoint or use the trained artifacts behind a secure endpoint; return `risk_level` + `confidence`.

5. Alerts & Functions (medium)
   - Add an Azure Function to listen for high-risk predictions (risk_level == high & confidence > 0.85) and push alerts to mobile/UI and log `alerts` in SQL.

6. Security & infra (high)
   - Use Azure Key Vault to store secrets (IoT Hub keys, ML endpoint key, SQL credentials).
   - Add infrastructure-as-code (Bicep/ARM/Terraform) for reproducible provisioning (IoT Hub, App Service, Functions, Key Vault, Azure SQL, AML workspace).

7. Frontend integration (medium)
   - Replace simulated prediction flows with calls to the backend endpoints and show live telemetry, risk level, confidence, and alert history.


## Files to edit now (minimal changes required)

- `c:/Users/rafey/OneDrive/Desktop/Nivra ML/nivra-ml/train.py` — remove `temperature` from `FEATURES`
- `c:/Users/rafey/OneDrive/Desktop/Nivra ML/nivra-ml/run_inference.py` — remove CLI `--temp`, adjust features
- `c:/Users/rafey/OneDrive/Desktop/Nivra ML/nivra-ml/evaluate_model.py` — remove `temperature` from `FEATURES` and evaluation
- `c:/Users/rafey/OneDrive/Desktop/Nivra ML/nivra-ml/ml.ipynb` — update notebook cells to use the 3-feature set and add the Responsible AI disclaimer cell
- `c:/Users/rafey/OneDrive/Desktop/Nivra ML/nivra-ml/README.md` — update usage examples to remove `--temp`
- `c:/Users/rafey/OneDrive/Documents/PlatformIO/Projects/Nivra/src/main.cpp` — add BLE telemetry logic (separate PR)


## Notes & constraints (from your provided details)

- Follow the rule: Nivra is a decision-support system, not a diagnostic tool. Keep the Responsible AI statement in UI and docs.
- Hardware wiring (ESP32-C3 final wiring) is consistent with existing `main.cpp` I2C pins (SDA=8, SCL=9) and TP4056 notes — add `WIRING.md` to PlatformIO project to document the wiring (I can create this file if you want).
- Do not reintroduce `temperature` into the pipeline — user specified no temperature sensor.


---

If you want, I can now apply the ML-focused code changes (update `FEATURES` to drop `temperature` across the scripts and notebook, retrain locally to produce new artifacts, and update `nivra-ml/README.md`).

Options: (choose one)
- Update ML code & retrain now (I will edit `train.py`, `run_inference.py`, `evaluate_model.py`, update the notebook, run `train.py` and regenerate `nivra_brain.pkl`/`nivra_scaler.pkl`).
- Create `WIRING.md` in the PlatformIO project documenting the ESP32-C3 wiring you provided.
- Scaffold the backend/API and an Azure infra checklist (I will list required endpoints, sample Express routes, and infra resources to provision).

Which would you like me to do next? (reply with the option.)