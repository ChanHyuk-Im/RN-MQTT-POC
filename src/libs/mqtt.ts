import DeviceInfo from 'react-native-device-info';
import * as mqtt from '@taoqf/react-native-mqtt';

type SubscribeCallbackType = {
  [name: string]: (topic: string, message: string) => void;
};

let globalClient: mqtt.MqttClient | null = null;
const subscribeCallback: SubscribeCallbackType = {};

export async function connect(connectCallback: () => void, disconnectCallback: () => void) {
  try {
    const systemName = DeviceInfo.getSystemName();
    const uniqueId = await DeviceInfo.getUniqueId();

    globalClient = mqtt.connect('ws://test.mosquitto.org', {
      // username: CONFIG.MQTT_USER,
      // password: CONFIG.MQTT_PASS,
      port: 8080,
      clientId: `${systemName}-${uniqueId}`,
    });

    globalClient.on('error', function (msg) {
      console.error(msg);
    });

    globalClient.on('message', function (topic, msg) {
      const message = msg.toString();

      console.log(topic, message);
      if (subscribeCallback[topic]) {
        subscribeCallback[topic](topic, message);
      }
    });

    globalClient.on('connect', function () {
      console.log('connected to mqtt');
      connectCallback();
    });

    globalClient.on('end', function () {
      console.log('disconnected from mqtt');
      disconnectCallback();
    });
  } catch (err) {
    console.error(err);
  }
}

export function disconnect() {
  if (!globalClient) {
    return;
  }

  globalClient.end();
}

export function subscribe(topic: string, callback: (topic: string, message: string) => void) {
  if (!globalClient) {
    return;
  }

  if (subscribeCallback[topic]) {
    return;
  }

  globalClient.subscribe(topic);
  subscribeCallback[topic] = callback;
}

export function unsubscribe(topic: string) {
  if (!globalClient) {
    return;
  }

  if (!subscribeCallback[topic]) {
    return;
  }

  globalClient.unsubscribe(topic);
  delete subscribeCallback[topic];
}

export function publish(topic: string, message = '') {
  if (!globalClient) {
    return;
  }

  if (typeof message === 'string') {
    globalClient.publish(topic, message);
  } else {
    globalClient.publish(topic, JSON.stringify(message));
  }
}