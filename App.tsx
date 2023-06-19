import React from "react";
import { NativeBaseProvider, Box, } from "native-base";
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import { LoginFlow } from './ui/navigation/login.flow';
import { HelloWorldFlow } from './ui/navigation/hw.flow';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <NativeBaseProvider>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName;
              if ( route.name === 'LoginTab' ) {
                iconName = focused
                  ? 'ios-information-circle'
                  : 'ios-information-circle-outline';
              } else if ( route.name === 'HelloWorldTab' ) {
                iconName = focused ? 'ios-list' : 'ios-list-outline';
              }

              return <Ionicons name={iconName} size={size} color={color}/>;
            },
            headerShown: false
          })}
        >
          <Tab.Screen name="LoginTab" component={LoginFlow} />
          <Tab.Screen name="HelloWorldTab" component={HelloWorldFlow} />
        </Tab.Navigator>
      </NativeBaseProvider>
    </NavigationContainer>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


