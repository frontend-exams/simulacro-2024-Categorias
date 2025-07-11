import { get, post, put, destroy, patch } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('users/myrestaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

function create (data) {
  return post('restaurants', data)
}

function update (id, data) {
  return put(`restaurants/${id}`, data)
}

function remove (id) {
  return destroy(`restaurants/${id}`)
}

// Usamos el endpoint para promocionar un restaurante, optenemos su ruta en el controlador, vemos que es un patch
function promote (id) {
  return patch(`restaurants/${id}/promote`) // No poner nunca la barra del principio (/restaurants...) en las rutas, esto solo pasa en el RestaurantRoutes
}

export { getAll, getDetail, getRestaurantCategories, create, update, remove, promote }
