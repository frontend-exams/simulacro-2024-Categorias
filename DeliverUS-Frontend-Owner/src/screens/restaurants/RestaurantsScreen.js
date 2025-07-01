/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'

import { getAll, remove, promote } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import DeleteModal from '../../components/DeleteModal'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import ConfirmationModal from '../../components/ConfirmationModal'
export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [restaurantToBeDeleted, setRestaurantToBeDeleted] = useState(null)
  const [restaurantToBePromoted, setRestaurantToBePromoted] = useState(null)
  const [backendErrors, setBackendErrors] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchRestaurants()
    } else {
      setRestaurants(null)
    }
  }, [loggedInUser, route])

  const renderRestaurant = ({ item }) => {
    console.log('Restaurant item:', item)
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
        {/* A partir de aquí mostramos lo de la promoció */}
        {item.promoted && (<TextRegular textStyle={styles.promotedText}>¡En promoción!</TextRegular>)}
        </View>
        <View style={styles.actionButtonsContainer}>
          <Pressable
            onPress={() => navigation.navigate('EditRestaurantScreen', { id: item.id })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
            <TextRegular textStyle={styles.text}>
              Edit
            </TextRegular>
          </View>
        </Pressable>

        <Pressable
            onPress={() => { setRestaurantToBeDeleted(item) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.actionButton
            ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
            <TextRegular textStyle={styles.text}>
              Delete
            </TextRegular>
          </View>
        </Pressable>

        {/* Botón de Promote */}
        <Pressable
            onPress={() => { setRestaurantToBePromoted(item) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandSuccess
                  : GlobalStyles.brandSuccessTap
              },
              styles.actionButton
            ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='chat-alert' color={'white'} size={20}/>
            <TextRegular textStyle={styles.text}>
              Promote
            </TextRegular>
          </View>
        </Pressable>
        </View>
      </ImageCard>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived. Are you logged in?
      </TextRegular>
    )
  }

  const renderHeader = () => {
    return (
      <>
      {loggedInUser &&
      <Pressable
        onPress={() => navigation.navigate('CreateRestaurantScreen')
        }
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandGreenTap
              : GlobalStyles.brandGreen
          },
          styles.button
        ]}>
        <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name='plus-circle' color={'white'} size={20}/>
          <TextRegular textStyle={styles.text}>
            Create restaurant
          </TextRegular>
        </View>
      </Pressable>
    }
    </>
    )
  }
  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAll()
      // Ordenamos los restaurantes para que se muestre primero los que están con promoción
      // Los que tienen promoted = true van primero
      const sortedRestaurants = fetchedRestaurants.sort((a, b) => {
        return (b.promoted === true) - (a.promoted === true)
      })

      setRestaurants(sortedRestaurants)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const removeRestaurant = async (restaurant) => {
    try {
      await remove(restaurant.id)
      await fetchRestaurants()
      setRestaurantToBeDeleted(null)
      showMessage({
        message: `Restaurant ${restaurant.name} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setRestaurantToBeDeleted(null)
      showMessage({
        message: `Restaurant ${restaurant.name} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const promoteRestaurant = async (restaurant) => {
    setBackendErrors([])
    try {
      await promote(restaurant.id)
      await fetchRestaurants() // Actualizamos la lista de restaurantes para que aparezcan ya los restaurantes promocionados
      setRestaurantToBePromoted(null) // Hacemos desaparecer el modal
      showMessage({
        message: `Restaurant ${restaurant.name} succesfully promoted`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setRestaurantToBePromoted(null) // Cerramos el modal
      setBackendErrors(error.errors)
      showMessage({
        message: `Restaurant ${restaurant.name} could not be promoted.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <>
    {backendErrors && backendErrors.length > 0 && (
  <View style={styles.errorBox}>
    {backendErrors.map((e, index) => (
      <TextRegular key={index} textStyle={styles.errorText}>{e}</TextRegular>
    ))}
  </View>
    )}
    <FlatList
      style={styles.container}
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyRestaurantsList}
    />
    <DeleteModal
      isVisible={restaurantToBeDeleted !== null}
      onCancel={() => setRestaurantToBeDeleted(null)}
      onConfirm={() => removeRestaurant(restaurantToBeDeleted)}>
        <TextRegular>The products of this restaurant will be deleted as well</TextRegular>
        <TextRegular>If the restaurant has orders, it cannot be deleted.</TextRegular>
    </DeleteModal>
    <ConfirmationModal
      isVisible={restaurantToBePromoted !== null}
      onCancel={() => setRestaurantToBePromoted(null)}
      onConfirm={() => promoteRestaurant(restaurantToBePromoted)}
    >
      <TextRegular>Other promoted restaurant, if any, will be unpromoted</TextRegular>

    </ConfirmationModal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    // width: '50%'
    minWidth: '28%',
    maxWidth: '32%',
    flexBasis: '30%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    bottom: 5,
    position: 'absolute',
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  promotedText: {
    color: GlobalStyles.brandPrimary,
    borderWidth: 3,
    borderColor: GlobalStyles.brandSuccess,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2

  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffe6e6',
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10
  },
  errorText: {
    color: 'red',
    textAlign: 'center'
  }
})
