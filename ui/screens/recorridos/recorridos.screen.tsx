import React from 'react'
import { Box, Button, Center, CircleIcon, HStack, ScrollView, Text, VStack, View, WarningOutlineIcon, useToast } from 'native-base'
import { LoadingScreen } from '../../components/loading.component'
import { UserService } from '../../../services/user.service'
import { match } from '../../../utils/either'
import { RecorridoService } from '../../../services/recorrido.service'
import { Recorrido } from '../../../services/types'

export const Recorridos = () => {
	const [recorridos, setRecorridos] = React.useState<Recorrido[]>([])
	const [isLoading, setLoading] = React.useState(true)
	const toast = useToast()

	const loadData = async () => {
		const user = await UserService.getCurrent()
		const recorridos = await RecorridoService.list({
			recicladorId: user.recicladorUrbanoId,
			fechaFinNull: false,
			expandZona: true
		})
		match(
			recorridos,
			rr => {
				setRecorridos(rr)
			},
			err => {
				toast.show({ description: err })
			},
		)

		setLoading(false)
	}

	const formatDate = dateString => {
		if (!dateString) return '';
	  
		const date = new Date(dateString);
	  
		if (isNaN(date.getTime())) {
		  return 'Fecha no válida';
		}
	  
		const formattedDate = new Intl.DateTimeFormat('es', {
		  year: 'numeric',
		  month: '2-digit',
		  day: '2-digit',
		  hour: '2-digit',
		  minute: '2-digit',
		}).format(date);
	  
		return formattedDate;
	  };

	  const getCantidadPorTipo = (puntos) => {
		const cantidadPorTipo: { [key: string]: number } = {};
		puntos.forEach(punto => {
			const tipoResiduo = punto.residuo.tipoResiduo.nombre;
			cantidadPorTipo[tipoResiduo] = (cantidadPorTipo[tipoResiduo] || 0) + 1;
		});
	
		return Object.entries(cantidadPorTipo).map(([tipoResiduo, cantidad]) => ({
			tipoResiduo,
			cantidad
		}));
	};


	React.useEffect(() => {
		loadData()
	}, [])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView alignContent="center">
			<Box margin={5}>
				<VStack space={4} alignItems="center" alignSelf="center">
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginTop: 2,
						}}
					>
						<View style={{ flex: 1, marginRight: 10 }}>
							<Text style={{ fontSize: 10, textAlign: 'center' }}>
								Aqui veras todos los recorridos que has realizado.
							</Text>
						</View>
					</View>
					{recorridos && recorridos.length != 0 ? (
						recorridos.map((r, idx) => (
							<Box
								key={`box-${idx}`}
								p={2}
								borderWidth={1}
								borderColor="gray.300"
								borderRadius="md"
								shadow={1}
								maxWidth={500}
								bg={'white'}
								width="90%"
								marginBottom={2}
							>
								<Text fontSize="sm" numberOfLines={4}>
									<Text style={{ fontWeight: 'bold' }}>
										Zona: {r.zona.nombre}
									</Text>{' '}
								</Text>
								<Text fontSize="sm" numberOfLines={4}>
									<Text style={{ fontWeight: 'bold' }}>Fecha de fin:</Text>{' '}
									{formatDate(r.fechaFin)}
								</Text>
								<Text fontSize="sm" numberOfLines={4}>
									<Text style={{ fontWeight: 'bold' }}>
										cantidad de puntos visitados:
									</Text>{' '}
									{r.puntos.length}
								</Text>
								<Text fontSize="sm" numberOfLines={4}>
									<Text style={{ fontWeight: 'bold' }}>
										cantidad de residuos recolectados:
									</Text>{' '}
								</Text>
								{getCantidadPorTipo(r.puntos).map(
									({ tipoResiduo, cantidad }) => (
										<Text key={tipoResiduo} fontSize="sm" numberOfLines={10}>
											{tipoResiduo} - cantidad: {cantidad} 
										</Text>
									),
								)}
							</Box>
						))
					) : (
						<>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<WarningOutlineIcon size={5} color="red.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									Aún no has realizado ningun recorrido.
								</Text>
							</View>
						</>
					)}
				</VStack>
			</Box>
		</ScrollView>
	)
}
