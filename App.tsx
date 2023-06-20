import React from "react";
import { NativeBaseProvider } from "native-base";
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { LoginFlow } from './ui/navigation/login.flow';
import { MainTabsFlow } from './ui/navigation/main-tabs.flow';
import { AuthContext } from './context/auth.context';

const Tab = createBottomTabNavigator();

export default function App() {
  const [logged, setLogged] = React.useState(false);
  const authContext = React.useMemo(
    () => ({
      login: async (data) => {
        setLogged(true);
      }
   })
  );

  return (
    <NavigationContainer>
      <AuthContext.Provider value={authContext}>
        <NativeBaseProvider>
          { logged ? (
            <MainTabsFlow/>
          ) : (
            <LoginFlow/>
          )}
        </NativeBaseProvider>
      </AuthContext.Provider>
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


