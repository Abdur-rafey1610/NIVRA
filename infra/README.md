# Infra (Bicep) — Nivra

This folder contains a minimal infrastructure-as-code skeleton and a checklist for provisioning the Azure resources required by Nivra.

Priority resources:
- IoT Hub (ingest telemetry from the mobile gateway)
- App Service (Node/Express backend) or Azure Functions (consumer)
- Azure Machine Learning workspace + endpoint (host model)
- Azure SQL Database (sensor_logs, risk_events, alerts, users)
- Azure Key Vault (secrets: IoT keys, AML key, SQL credentials)
- Azure Functions (alert automation)

Quick checklist (manual steps):
1. Choose a resource group and location.
2. Deploy Key Vault first and add placeholder secrets.
3. Deploy IoT Hub and configure authentication.
4. Deploy Azure SQL and create schemas.
5. Deploy AML workspace and register model / endpoint.
6. Deploy App Service and Functions, configure managed identity.
7. Grant App Service / Functions access to Key Vault (managed identity).

Bicep templates:
- `main.bicep` — high-level skeleton referencing modules.
- Module placeholders: `iotHub.bicep`, `appService.bicep`, `functionApp.bicep`, `keyVault.bicep`, `sql.bicep`, `aml_workspace.bicep`.

Notes:
- This folder contains skeletons only; please edit values and parameters before deploying.
