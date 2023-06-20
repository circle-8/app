import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Login } from '../screens/login.screen';

const LoginStack = createNativeStackNavigator();

export const LoginFlow = () => {
	return (
		<LoginStack.Navigator>
			<LoginStack.Screen name="Login" component={Login} />
		</LoginStack.Navigator>
	);
}
