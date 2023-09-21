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

	const consejosMock: Consejo[] = [
		{ id: 1, titulo: 'Consejo 1', descripcion: 'Elige productos de limpieza ecologicos o haz tus propios limpiadores con ingredientes naturales como vinagre o bicarbonato de sodio.', fechaCreacion: '20-09-2023' },
		{ id: 2, titulo: 'Consejo 2', descripcion: 'Evita el uso de productos de plastico desechables, como botellas de agua o bolsas de plastico. Opta por alternativas reutilizables, como botellas de acero inoxidable o bolsas de tela.', fechaCreacion: '20-09-2023' },
		{ id: 3, titulo: 'Consejo 3', descripcion: 'Elije productos con etiquetas ecologicas o certificaciones que indiquen que son sostenibles y amigables con el medio ambiente.', fechaCreacion: '20-09-2023' },
	];

	const initialLoad = async () => {

		//TODO descomentar cuando este armado el back
		
		/*
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
		)*/
		setConsejos(consejosMock)
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
