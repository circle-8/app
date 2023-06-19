import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Login } from '../screens/login.screen';
import { HelloWorld } from '../screens/hw.screen';

const LoginStack = createNativeStackNavigator();

export const LoginFlow = () => {
	return (
		<LoginStack.Navigator>
			<LoginStack.Screen name="Login" component={Login}/>
			<LoginStack.Screen name="HelloWorld" component={HelloWorld}/>
		</LoginStack.Navigator>
	);
}
