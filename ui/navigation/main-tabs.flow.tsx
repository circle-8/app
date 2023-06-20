import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HelloWorldFlow } from './hw.flow';

const Tab = createBottomTabNavigator();

export const MainTabsFlow = () => {
	return (
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
			<Tab.Screen name="HelloWorldTab" component={HelloWorldFlow} />
		</Tab.Navigator>
	);
}
