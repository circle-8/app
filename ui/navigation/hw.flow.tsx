import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HelloWorld } from "../screens/hw.screen";

const HomeStack = createNativeStackNavigator();

export const HelloWorldFlow = () => {
	return (
		<HomeStack.Navigator>
			<HomeStack.Screen name="HelloWorld" component={HelloWorld} />
		</HomeStack.Navigator>
	);
};
