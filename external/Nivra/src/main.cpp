#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <MAX30105.h>

#define SDA_PIN 8
#define SCL_PIN 9
#define MOTOR_PIN 6

Adafruit_MPU6050 mpu;
MAX30105 max30102;

void testMotor() {
  Serial.println("🔊 Motor test (0.5s)");
  digitalWrite(MOTOR_PIN, HIGH);
  delay(500);
  digitalWrite(MOTOR_PIN, LOW);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n===== BASIC HARDWARE TEST (NO ADC) =====");

  pinMode(MOTOR_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);

  // I2C init
  Wire.begin(SDA_PIN, SCL_PIN);
  Serial.println("✅ I2C initialized");

  // ---------- MPU6050 ----------
  Serial.print("🧭 Checking MPU6050... ");
  if (!mpu.begin()) {
    Serial.println("❌ NOT FOUND");
  } else {
    Serial.println("✅ OK");
  }

  // ---------- MAX30102 ----------
  Serial.print("❤️ Checking MAX30102... ");
  if (!max30102.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("❌ NOT FOUND");
  } else {
    Serial.println("✅ OK");
    max30102.setup();                 // Default config
    max30102.setPulseAmplitudeRed(0x1F);   // RED LED ON (low power)
    max30102.setPulseAmplitudeGreen(0);    // GREEN OFF
  }

  // ---------- Motor ----------
  testMotor();

  Serial.println("===== SETUP COMPLETE =====\n");
}

void loop() {
  sensors_event_t accel, gyro, temp;
  mpu.getEvent(&accel, &gyro, &temp);

  Serial.print("Accel X: ");
  Serial.print(accel.acceleration.x);
  Serial.print(" | Y: ");
  Serial.print(accel.acceleration.y);
  Serial.print(" | Z: ");
  Serial.println(accel.acceleration.z);

  delay(1000);
}
