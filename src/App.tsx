/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';

import { Colors, Header } from 'react-native/Libraries/NewAppScreen';

import * as mqtt from './libs/mqtt';

const TOPIC = 'mqtt/poc/topic';

function App(): JSX.Element {
  const [receivedData, setReceivedData] = useState<any | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const handlePressConnect = () => {
    if (connected) {
      mqtt.disconnect();
    } else {
      mqtt.connect(() => {
        setConnected(true);
      }, () => {
        mqtt.unsubscribe(TOPIC);
        setReceivedData(null);
        setSubscribed(false);
        setConnected(false);
      });
    }
  };

  const handlePressSubscribe = () => {
    if (!connected) {
      return;
    }

    if (subscribed) {
      mqtt.unsubscribe(TOPIC);
      setReceivedData(null);
      setSubscribed(false);
    } else {
      mqtt.subscribe(TOPIC, (topic, message) => {
        console.log(topic, message);
        setReceivedData({ topic, message });
      });
      setSubscribed(true);
    }
  };

  const handlePressPublish = () => {
    if (!connected) {
      return;
    }
    setReceivedData(null);
    mqtt.publish(TOPIC, new Date().toString());
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
          <View style={{ backgroundColor: isDarkMode ? Colors.black : Colors.white }}>
            <TouchableOpacity onPress={handlePressConnect}>
              <Text style={{ padding: 10, textAlign: 'center' }}>{ connected ? 'disconnect' : 'connect' }</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePressSubscribe}>
              <Text style={{ padding: 10, textAlign: 'center' }}>{ subscribed ? 'unsubscribe' : 'subscribe' }</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePressPublish}>
              <Text style={{ padding: 10, textAlign: 'center' }}>publish</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: isDarkMode ? Colors.black : Colors.white }}>
            { receivedData && <Text style={{ padding: 20, color: '#000', textAlign: 'center' }}>{ `${receivedData.topic} - ${receivedData.message}` }</Text> }
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
