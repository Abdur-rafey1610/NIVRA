# Mobile Gateway — Nivra

This is a lightweight Node.js BLE central application that acts as a gateway between the Nivra wearable (BLE peripheral) and Azure IoT Hub.

## Features
- Scans for BLE devices advertising the Nivra service.
- Connects to the wearable, subscribes to telemetry characteristic.
- Parses JSON telemetry, adds metadata (deviceId, timestamp, location, gatewayId).
- Forwards enriched data to Azure IoT Hub via MQTT.

## Setup
1. Install dependencies: `npm install`
2. Set environment variable: `IOT_HUB_CONNECTION_STRING` with your IoT Hub device connection string.
3. Run: `npm start`

## Notes
- Assumes wearable advertises with localName 'NIVRA-WEARABLE' and service UUID `12345678-1234-1234-1234-123456789abc`.
- Telemetry characteristic UUID: `abcd1234-5678-1234-5678-abcdef123456`.
- Update UUIDs to match firmware implementation.
- For production, add authentication, error handling, and GPS for location.