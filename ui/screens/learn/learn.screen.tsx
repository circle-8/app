import React from 'react'
import { Center, ScrollView, Text, View, useToast } from 'native-base'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingScreen } from '../../components/loading.component';
import { match } from '../../../utils/either';
import { TabRoutes } from '../../../constants/routes';
import { ConsejoService } from '../../../services/consejo.service';
import { Consejo } from '../../../services/types';

export const Learn = (navigation) => {
	const toast = useToast()
	const [isLoading, setLoading] = React.useState(true)
	const [consejos, setConsejos] = React.useState<Consejo[]>([])

	const initialLoad = async () => {
		const cons = await ConsejoService.getAll()
		match(
			cons,
			c => {
				setConsejos(c)
			},
			err => {
				toast.show({ description: err })
				navigation.navigate(TabRoutes.home)
			},
		)

		setLoading(false)
	}

	/* Initial data loading */
	React.useEffect(() => {
		initialLoad()
	}, [])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<ScrollView>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: 20
				}}
			>
				<View style={{ flex: 1, marginRight: 10 }}>
					<Text style={{ fontSize: 12, textAlign: 'left' }}>
					En esta seccion encontraras consejos para aprender y mejorar tus habitos sustentables
					</Text>
				</View>
				<MaterialCommunityIcons name="lightbulb-on-outline" size={40} color="black" />
			</View>

			{consejos.map((consejo, index) => (
			<View key={index} style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
				<Text style={{ fontSize: 18, fontWeight: 'bold' }}>{consejo.titulo}</Text>
				<Text style={{ marginTop: 10 }}>{consejo.descripcion}</Text>
				<Text style={{ position: 'absolute', bottom: 10, right: 20, color: '#888', fontSize: 12 }}>{consejo.fechaCreacion}</Text>
			</View>
			))}
		</ScrollView>
		);
}
