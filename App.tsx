import React from "react";
import { NativeBaseProvider } from "native-base";
import { NavigationContainer } from "@react-navigation/native";

import { LoginFlow } from "./ui/navigation/login.flow";
import { MainTabsFlow } from "./ui/navigation/main-tabs.flow";
import { AuthContext } from "./context/auth.context";
import { SplashScreen } from "./ui/components/splash.component";
import { User } from "./services/types";

export default function App() {
	const [loading, setLoading] = React.useState(false);
	const [logged, setLogged] = React.useState(false);
	const authContext = React.useMemo(
		() => ({
			login: async (usr: User) => {
				setLogged(true);
			},
		}),
		[]
	);

	if (loading) {
		return (
			<NativeBaseProvider>
				<SplashScreen />
			</NativeBaseProvider>
		);
	}

	return (
		<NavigationContainer>
			<AuthContext.Provider value={authContext}>
				<NativeBaseProvider>
					{logged ? <MainTabsFlow /> : <LoginFlow />}
				</NativeBaseProvider>
			</AuthContext.Provider>
		</NavigationContainer>
	);
}
