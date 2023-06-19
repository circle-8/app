import React from "react";
import {
  NativeBaseProvider,
  Box,
  Text,
  Heading,
  VStack,
  FormControl,
  Input,
  Link,
  Button,
  HStack,
  Center
} from "native-base";
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

const LoginStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <NativeBaseProvider>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName;
              if ( route.name === 'Login' ) {
                iconName = focused
                  ? 'ios-information-circle'
                  : 'ios-information-circle-outline';
              } else if ( route.name === 'HelloWorld' ) {
                iconName = focused ? 'ios-list' : 'ios-list-outline';
              }

              return <Ionicons name={iconName} size={size} color={color}/>;
            },
            headerShown: false
          })}
        >
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="HelloWorld" component={HelloWorldScreen} />
        </Tab.Navigator>
      </NativeBaseProvider>
    </NavigationContainer>
  )
}

const LoginScreen = () => {
  return (
    <LoginStack.Navigator>
      <LoginStack.Screen name="Login" component={Login}/>
      <LoginStack.Screen name="HelloWorld" component={HelloWorld}/>
    </LoginStack.Navigator>
  );
}
const HelloWorldScreen = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HelloWorld2" component={HelloWorld}/>
    </HomeStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const HelloWorld = () => {
  return (
    <Box>
      Hello World
    </Box>
  );
}

const Login = ({navigation}) => {
  return <Center w="100%">
    <Box safeArea p="2" py="8" w="90%" maxW="290">
      <Heading size="lg" fontWeight="600" color="coolGray.800" _dark={{
        color: "warmGray.50"
        }}>
        Welcome
      </Heading>
      <Heading mt="1" _dark={{
        color: "warmGray.200"
        }} color="coolGray.600" fontWeight="medium" size="xs">
        Sign in to continue!
      </Heading>

      <VStack space={3} mt="5">
        <FormControl>
          <FormControl.Label>Email ID</FormControl.Label>
          <Input />
        </FormControl>
        <FormControl>
          <FormControl.Label>Password</FormControl.Label>
          <Input type="password" />
          <Link _text={{
            fontSize: "xs",
            fontWeight: "500",
            color: "indigo.500"
            }} alignSelf="flex-end" mt="1">
            Forget Password?
          </Link>
        </FormControl>
        <Button mt="2" colorScheme="indigo" onPress={() => navigation.navigate('HelloWorld')}>
          Sign in
        </Button>
        <HStack mt="6" justifyContent="center">
          <Text fontSize="sm" color="coolGray.600" _dark={{
            color: "warmGray.200"
            }}>
            I'm a new user.{" "}
          </Text>
          <Link _text={{
            color: "indigo.500",
            fontWeight: "medium",
            fontSize: "sm"
            }} href="#">
            Sign Up
          </Link>
        </HStack>
      </VStack>
    </Box>
  </Center>;
};
