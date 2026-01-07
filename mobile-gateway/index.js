const noble = require('@abandonware/noble');
const { Client } = require('azure-iot-device');
const { Mqtt } = require('azure-iot-device-mqtt');

// Configuration
const IOT_HUB_CONNECTION_STRING = process.env.IOT_HUB_CONNECTION_STRING || 'HostName=nivra-iothub.azure-devices.net;DeviceId=mobile-gateway;SharedAccessKey=...'; // Replace with actual
const NIVRA_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc'; // Placeholder UUID for Nivra BLE service
const TELEMETRY_CHARACTERISTIC_UUID = 'abcd1234-5678-1234-5678-abcdef123456'; // Placeholder for telemetry char

let client = Client.fromConnectionString(IOT_HUB_CONNECTION_STRING, Mqtt);

async function sendToIoTHub(data) {
  try {
    await client.sendEvent(JSON.stringify(data));
    console.log('Sent telemetry to IoT Hub:', data);
  } catch (err) {
    console.error('Failed to send to IoT Hub:', err);
  }
}

noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    console.log('BLE scanning for Nivra wearable...');
    noble.startScanning([NIVRA_SERVICE_UUID], false);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  console.log('Discovered device:', peripheral.advertisement.localName);
  if (peripheral.advertisement.localName === 'NIVRA-WEARABLE') { // Assume wearable advertises this name
    noble.stopScanning();
    connectToWearable(peripheral);
  }
});

async function connectToWearable(peripheral) {
  peripheral.connect((error) => {
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    console.log('Connected to wearable');

    peripheral.discoverServices([NIVRA_SERVICE_UUID], (error, services) => {
      if (error) {
        console.error('Service discovery error:', error);
        return;
      }
      const service = services[0];
      service.discoverCharacteristics([TELEMETRY_CHARACTERISTIC_UUID], (error, characteristics) => {
        if (error) {
          console.error('Characteristic discovery error:', error);
          return;
        }
        const telemetryChar = characteristics[0];
        telemetryChar.subscribe((error) => {
          if (error) {
            console.error('Subscribe error:', error);
            return;
          }
          console.log('Subscribed to telemetry');
        });

        telemetryChar.on('data', (data, isNotification) => {
          try {
            const telemetry = JSON.parse(data.toString());
            // Add metadata
            const enrichedData = {
              ...telemetry,
              deviceId: peripheral.id,
              timestamp: new Date().toISOString(),
              location: 'mobile-location', // Placeholder, could use GPS
              gatewayId: 'mobile-gateway'
            };
            sendToIoTHub(enrichedData);
          } catch (err) {
            console.error('Error parsing telemetry:', err);
          }
        });
      });
    });
  });

  peripheral.on('disconnect', () => {
    console.log('Disconnected from wearable, restarting scan...');
    noble.startScanning([NIVRA_SERVICE_UUID], false);
  });
}

client.open((err) => {
  if (err) {
    console.error('IoT Hub connection error:', err);
    process.exit(1);
  }
  console.log('Connected to IoT Hub');
});

// Graceful shutdown
process.on('SIGINT', () => {
  noble.stopScanning();
  client.close();
  process.exit();
});