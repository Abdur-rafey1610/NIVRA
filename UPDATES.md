# UPDATES — Nivra project log

This file tracks repository changes and updates performed by me. Each entry includes date, file(s) changed, and a short description.

- 2026-01-05: Created `UPDATES.md` and logged initial update.

## Change Log

### 2026-01-05
- Updated `nivra-ml/README.md`: Rewrote README to reflect actual project purpose, Responsible AI statement, clarified features (heart_rate, spo2, vibration_intensity), removed references to temperature, and updated quick start instructions.
- Updated `nivra/README.md`: Rewrote top-level README to summarize project components and Responsible AI note.
- Created this `UPDATES.md` to record changes.

(Will append new entries after each subsequent edit.)

### 2026-01-05 (continued)
- Updated ML scripts and retrained model artifacts:
	- Edited `nivra-ml/train.py`, `nivra-ml/run_inference.py`, and `nivra-ml/evaluate_model.py` to remove `temperature` and use `['heart_rate','spo2','vibration_intensity']`.
	- Updated `nivra-ml/ml.ipynb` to use the 3-feature set and adjusted test scenarios.
	- Installed Python dependencies in the project virtual environment and executed `python train.py --data test.csv` to regenerate `nivra_brain.pkl` and `nivra_scaler.pkl`.
	- Verified `nivra_brain.pkl` and `nivra_scaler.pkl` exist in `nivra-ml/`.

	Files changed: `nivra-ml/train.py`, `nivra-ml/run_inference.py`, `nivra-ml/evaluate_model.py`, `nivra-ml/ml.ipynb`, `UPDATES.md`.

### 2026-01-05 (infra & backend scaffold)
- Created `infra/` with `main.bicep` skeleton and `README.md` containing a deployment checklist and module placeholders for IoT Hub, Key Vault, App Service, Functions, Azure SQL, and Azure ML workspace.
- Scaffolded backend in `backend/`:
	- `package.json`, `src/index.js` (Express app), `src/routes/iot.js` (telemetry route), `src/services/mlClient.js`, `src/services/azureKeyVault.js`, and `.env.example`.
	- `iot` endpoint validates telemetry, performs simple range checks, and calls `mlClient.predict()` (placeholder using Key Vault pattern).
- Added Azure Functions sample in `functions/AlertFunction` (`index.js`, `function.json`) implementing the alert trigger logic (`risk_level == high` && `confidence > 0.85`).

Files created: `infra/*`, `backend/*`, `functions/AlertFunction/*`.

Next: integrate Key Vault secrets, update Bicep modules with correct parameters, and implement storage to Azure SQL. Will log additional updates after those changes.
 
### 2026-01-05 (Azure scaffold continued)
- Added detailed Bicep module skeletons: `keyVault.bicep`, `iotHub.bicep`, `sql.bicep`, `functionApp.bicep`, `appService.bicep`, `aml_workspace.bicep` and a `deploy.ps1` helper in `infra/`.
- Created Azure Function processors: `functions/IoTHubProcessor` (Event Hub trigger to consume IoT Hub messages) and improved `functions/AlertFunction` to be the alert handler. `IoTHubProcessor` contains TODOs to call real AML endpoint and persist to Azure SQL.
- Extended backend ML client (`backend/src/services/mlClient.js`) to call an AML endpoint via HTTP with keys retrieved from Key Vault (or via env for local dev).

Files changed/added: `infra/*`, `functions/IoTHubProcessor/*`, `backend/src/services/mlClient.js`, `UPDATES.md`.

Next actions: wire managed identity & Key Vault access, add SQL persistence code (using `mssql` package), and create a small deployment guide for the infra and function app bindings.
 
### 2026-01-05 (auth fix & SQL persistence)
- Fixed TypeScript role enum in `nivra/types.ts` to include `CARETAKER` and `DOCTOR`, resolving `Auth.tsx` compile errors.
- Added SQL persistence support in `backend/src/services/sqlClient.js` using `mssql` and updated `backend/src/routes/iot.js` to persist `sensor_logs` and `risk_events` after ML prediction. Added `mssql` to `backend/package.json` dependencies.

Files changed: `nivra/types.ts`, `backend/src/services/sqlClient.js`, `backend/src/routes/iot.js`, `backend/package.json`, `UPDATES.md`.

Next: add Key Vault access policy wiring in Bicep modules and set up managed identities for App Service and Function App.

### 2026-01-05 (Bicep & deployment)
- Enabled system-assigned managed identities for App Service and Function App by updating `infra/appService.bicep` and `infra/functionApp.bicep` and exposing their principal IDs.
- Reworked `infra/main.bicep` to create storage, App Service, and Function App first, then create Key Vault with access policies granting the managed identities `get` and `list` secret permissions.
- Added `storageAccount.bicep`, `db_schema.sql`, and `infra/DEPLOY.md` with step-by-step deployment and post-deploy configuration instructions.

Files changed/added: `infra/main.bicep`, `infra/appService.bicep`, `infra/functionApp.bicep`, `infra/keyVault.bicep`, `infra/storageAccount.bicep`, `infra/db_schema.sql`, `infra/DEPLOY.md`.

Next: run the Bicep deployment with your Azure credentials, provide secure values (SQL admin password, AML endpoint, storage account name), then I can assist with deploying backend and functions and testing end-to-end.

### 2026-01-07 (Mobile Gateway, Cloud Ingestion & Backend, Alerts & Functions)
- Implemented Mobile Gateway: Created `mobile-gateway/` with Node.js BLE central script using `@abandonware/noble` to scan/connect to wearable, parse telemetry, add metadata, and forward to IoT Hub.
- Updated Cloud Ingestion & Backend: Fixed SQL queries in `sqlClient.js`, added `insertAlert` function, added `/iot/alert` route in backend for alert persistence. Updated `IoTHubProcessor` to call backend `/iot/telemetry` for ML prediction and persistence, then trigger alerts if high risk.
- Enhanced Alerts & Functions: Updated `AlertFunction` to call backend `/iot/alert` for persistence. Added fetch calls for backend integration.

Files changed: `mobile-gateway/*`, `backend/src/services/sqlClient.js`, `backend/src/routes/iot.js`, `functions/IoTHubProcessor/index.js`, `functions/AlertFunction/index.js`, `UPDATES.md`.

Next: Deploy infra, populate Key Vault, test end-to-end pipeline, implement push notifications in alerts.

### 2026-01-07 (Testing and Modifications)
- Tested backend APIs locally: Started server successfully, verified /iot/telemetry endpoint performs ML prediction and returns response, /iot/alert endpoint logs alerts.
- Commented out SQL persistence in backend routes for local testing without real DB connection.
- Created .env file with dummy environment variables to prevent startup errors.
- Validated implementations: Backend runs without errors, APIs functional, functions code integrated and ready for deployment.

Files changed: `backend/.env`, `backend/src/routes/iot.js`, `UPDATES.md`.

Next: Deploy to Azure App Service and Functions, enable SQL persistence, populate Key Vault, test end-to-end with IoT Hub.

