import React from 'react'
import { ImageBackground } from 'react-native';

export const SplashScreen = () => {
	return (
	
		<ImageBackground
		style={{
			flex: 1,
			width: '100%',
			height: '100%',
			backgroundColor: '#D9F3D5', 
		}}
            source={require("../../assets/splash.png")}
        >
        </ImageBackground>
    );
}
