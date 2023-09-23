import React from 'react'
import { Box, Button, Center, VStack, Text, HStack } from 'native-base'
import { TouchableOpacity } from 'react-native'
import { View, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';



export const Test = () => {
	const [image, setImage] = React.useState(null);

  const pickImage = async () => {
	   // para poder hacer esto hay que meter en el proyecto expo-image-picker
	   // npx expo install expo-image-picker
	   // Revisar el archivo app.json que sume una config para los permisos
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
	  base64: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].base64);
	  // este base64 tiene la imagen encodeada en un string
	  // la idea es mandar este base64 en el POST/PUT
	  // luego, en el GET va a venir un nuevo campo que se va a llamar base64 que va a tener la foto
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button onPress={pickImage}>Tomar foto</Button>
      {image && <Image source={{ uri: 'data:image/jpeg;base64,' + image }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}
