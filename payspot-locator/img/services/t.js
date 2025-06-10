const serviceNames = [
  {
    SERVICE_CODE: '1',
    NAME: 'Platni Promet',
    IMG: 'img/services/1.png',
  },
]

const locator = async () => {
  // get all locations
  // const fetchAllLocation = async () => {
  //   return Promise.all([
  //     axios.get('data/lokacije1.json'),
  //     axios.get('data/lokacije2.json'),
  //   ])
  //     .then((responses) => {
  //       let allLocation = []

  //       responses.forEach((response) => {
  //         const data = response.data
  //         let orgUnitLocations = data.Data.Body?.ORGUNITLOCATIONS
  //         allLocation = allLocation.concat(orgUnitLocations)
  //       })

  //       return allLocation
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching JSON:', error)
  //     })
  // }

  const fetchAllLocation = async () => {
    try {
      // Fetch locations and services in parallel
      const [lokacije1, lokacije2, servisiRes] = await Promise.all([
        axios.get('data/lokacije1.json'),
        axios.get('data/lokacije2.json'),
        axios.get('data/servisi.json'),
      ])

      // Combine location data
      const allLocation = [
        ...(lokacije1.data.Data.Body?.ORGUNITLOCATIONS || []),
        ...(lokacije2.data.Data.Body?.ORGUNITLOCATIONS || []),
      ]

      const allServices = servisiRes.data.Data.Body?.ORGUNITSERVICES // Assuming it's an array of services

      // Add services to each location based on ORG_UNIT
      const locationsWithServices = allLocation.map((location) => {
        const servicesForLocation = allServices.filter(
          (service) => service.ORG_UNIT === location.ORG_UNIT
        )
        return {
          ...location,
          SERVICES: servicesForLocation,
        }
      })

      return locationsWithServices
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // return is store currently open or closed
  const isStoreOpen = (store) => {
    const now = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/Paris',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const [currentDay, currentTime] = now.split(' ')

    function isTimeInRange(from, to, current) {
      return from <= current && current <= to
    }

    if (
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(
        currentDay
      )
    ) {
      return isTimeInRange(
        store.WORKING_TIME_FROM,
        store.WORKING_TIME_TO,
        currentTime
      )
        ? 1
        : 0
    }

    if (currentDay === 'Saturday') {
      if (store.SATURDAY_TO === null) {
        return 0
      }
      return isTimeInRange(store.SATURDAY_FROM, store.SATURDAY_TO, currentTime)
        ? 1
        : 0
    }

    if (currentDay === 'Sunday') {
      if (store.SUNDAY_TO === null || store.SUNDAY_FROM2 === 'Neradni dan') {
        return 0
      }
      return isTimeInRange(store.SUNDAY_FROM2, store.SUNDAY_TO, currentTime)
        ? 1
        : 0
    }

    return 0
  }

  // initialize map
  const initMap = async () => {
    let map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 42.9481062, lng: 19.2337873 },
      zoom: 8.5,
      mapId: '85d6b624f1ef221e',
    })

    let isEnglish = false

    const urlPath = window.location.pathname
    const pathSegments = urlPath.split('/')
    const slug = pathSegments[pathSegments.length - 1]

    if (slug.includes('en')) {
      isEnglish = true
    }

    let openInfoWindow = null
    fetchAllLocation().then((allLocation, i) => {
      console.log(allLocation)
      let markers = allLocation
        .filter((store) => store && store.LATITUDE && store.LONGITUDE)
        .map((store) => {
          if (!store) return

          const pinImage = document.createElement('img')
          pinImage.src = './img/map-pin.png'

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: {
              lat: parseFloat(store.LATITUDE),
              lng: parseFloat(store.LONGITUDE),
            },
            content: pinImage,
            title: store.ORG_UNIT_NAME,
          })

          //   <div class="locations-box-1" style="display: flex; align-items: center; margin-bottom: 5px; font-size:13px;">
          //   <img src="/assets/img/logo/1.png" style="height: 18px; margin-bottom: 5px;">
          //   <p style="color: #000000de; margin: 0 0 0 5px;">Platni promet</p>
          // </div>

          // <div class="locations-box-3" style="display: flex; align-items: center; margin-bottom: 5px; font-size:13px;">
          //   <img src="/assets/img/logo/3.png" style="height: 18px; margin-bottom: 5px;">
          //   <p style="color: #000000de; margin: 0 0 0 5px;">RIA transfer novca</p>
          // </div>

          // <div class="locations-box-4" style="display: flex; align-items: center; margin-bottom: 5px; font-size:13px;">
          //   <img src="/assets/img/logo/4.png" style="height: 18px; margin-bottom: 5px;">
          //   <p style="color: #000000de; margin: 0 0 0 5px;">KoronaPay transfer novca</p>
          // </div>

          // <div class="locations-box-22" style="display: flex; align-items: center; margin-bottom: 5px; font-size:13px;">
          //   <img src="/assets/img/logo/22.png" style="height: 18px; margin-bottom: 5px;">
          //   <p style="color: #000000de; margin: 0 0 0 5px;">PaySpotNET</p>
          // </div>

          const storeStatus = isStoreOpen(store)

          let contentString = `
          <div>
            <div style="width: 315px; height: 100%; background: white; padding: 0;">
              <p style="color: #000000de; margin: 0 0 5px; font-weight: 700; font-size: 14px;">${
                store.ORG_UNIT_NAME
              }</p>
              <hr> <p style="color: #000000de; margin: 0 0 4px; font-weight: 600; font-size: 14px;">Usluge</p>
  
  
         
              <p style="color: #000000de; margin: 4px 0 5px; font-weight: 600; font-size: 14px;">Adresa</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">${
                store.ADDRESS
              }</p>
              <p style="color: #000000de; margin: 4px 0 3px; font-weight: 600; font-size: 14px;">Radno Vreme</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Radnim Danima: ${
                store.WORKING_TIME_FROM
              } - ${store.WORKING_TIME_TO}</p>
  
  
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Subotom: ${
                store.SATURDAY_FROM
              } ${
            store.SATURDAY_TO !== null ? `- ` + store.SATURDAY_TO : ''
          }</p>
  
  
              <p style="color: #000000de; margin: 0 0 5px; font-size: 13px;">Nedeljom: ${
                store.SUNDAY_FROM2
              }  ${store.SUNDAY_TO !== null ? `-` + store.SUNDAY_TO : ''}  </p>
  
  
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px; font-weight: bold;">Status filijale: 
              ${
                storeStatus == 1
                  ? '<span style="color: green">Otvoreno</span>'
                  : '<span style="color: red">Zatvoreno</span>'
              }
              </p>
              <p style="color: #000000de; margin: 4px 0 5px; font-weight: 600; font-size: 13px;">Kontakt</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Telefon: ${
                store.PHONE
              }</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Email: ${
                store.EMAIL
              }</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Sifra filijale: ${
                store.ORG_UNIT
              }</p>
              </div>
            </div>`

          if (isEnglish) {
            contentString = `
          <div>
            <div style="width: 315px; height: 100%; background: white; padding: 0;">
              <p style="color: #000000de; margin: 0 0 5px; font-weight: 700; font-size: 14px;">${
                store.ORG_UNIT_NAME
              }</p>
              <hr> <p style="color: #000000de; margin: 0 0 4px; font-weight: 600; font-size: 14px;">Services</p>
         
              <p style="color: #000000de; margin: 4px 0 5px; font-weight: 600; font-size: 14px;">Address</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">${
                store.ADDRESS
              }</p>
              <p style="color: #000000de; margin: 4px 0 3px; font-weight: 600; font-size: 14px;">Working hours</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Working days: ${
                store.WORKING_TIME_FROM
              } - ${store.WORKING_TIME_TO}</p>
  
  
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Saturday: ${
                store.SATURDAY_FROM === 'Neradni dan'
                  ? 'Closed'
                  : store.SATURDAY_FROM
              } ${
              store.SATURDAY_TO !== null ? `- ` + store.SATURDAY_TO : ''
            }</p>
  
  
              <p style="color: #000000de; margin: 0 0 5px; font-size: 13px;">Sunday: ${
                store.SUNDAY_FROM2 === 'Neradni dan'
                  ? 'Closed'
                  : store.SUNDAY_FROM2
              }  ${store.SUNDAY_TO !== null ? `-` + store.SUNDAY_TO : ''} </p>
  
  
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px; font-weight: bold;">Branch status: 
              ${
                storeStatus == 1
                  ? '<span style="color: green">Open</span>'
                  : '<span style="color: red">Closed</span>'
              }
              </p>
              <p style="color: #000000de; margin: 4px 0 5px; font-weight: 600; font-size: 13px;">Contact</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Phone: ${
                store.PHONE
              }</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Email: ${
                store.EMAIL
              }</p>
              <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Branch code: ${
                store.ORG_UNIT
              }</p>
              </div>
            </div>`
          }

          const infowindow = new google.maps.InfoWindow({
            content: contentString,
            ariaLabel: store.ORG_UNIT_NAME,
            disableAutoPan: true,
          })

          marker.addListener('click', () => {
            if (openInfoWindow) {
              openInfoWindow.close()
            }

            infowindow.open({
              anchor: marker,
              map,
            })

            openInfoWindow = infowindow

            const markerPosition = marker.position
            const projection = map.getProjection()

            if (projection) {
              const markerLatLng = new google.maps.LatLng(
                markerPosition.lat,
                markerPosition.lng
              )

              const point = projection.fromLatLngToPoint(markerLatLng)

              point.y += -250 / Math.pow(2, map.getZoom())

              const adjustedLatLng = projection.fromPointToLatLng(point)

              map.panTo(adjustedLatLng)
            }
          })

          return marker
        })

      const customRenderer = {
        render({ count, position }) {
          const div = document.createElement('div')
          div.style.width = '40px'
          div.style.height = '40px'
          div.style.backgroundColor = '#c52f32' // Custom background color (orange-red)
          div.style.borderRadius = '50%'
          div.style.display = 'flex'
          div.style.alignItems = 'center'
          div.style.justifyContent = 'center'
          div.style.color = 'white' // Custom text color
          div.style.fontSize = '14px'
          div.style.fontWeight = 'bold'
          div.textContent = count // Display the cluster count
          return new google.maps.marker.AdvancedMarkerElement({
            position,
            content: div,
          })
        },
      }

      new markerClusterer.MarkerClusterer({
        markers,
        map,
        renderer: customRenderer,
      })
    })

    // Fetch the user's current location
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       const userLat = position.coords.latitude
    //       const userLng = position.coords.longitude

    //       // Create a marker for the user's location
    //       const userMarker = new google.maps.marker.AdvancedMarkerElement({
    //         position: { lat: userLat, lng: userLng },
    //         map: map,
    //         title: 'Your Location',
    //         // icon: {
    //         //   url: './img/user-location-icon.png', // Use a custom icon if desired
    //         //   scaledSize: new google.maps.Size(50, 50), // Size of the icon
    //         // },
    //       })

    //       // Center the map on the user's location
    //       map.setCenter({ lat: userLat, lng: userLng })
    //       map.setZoom(14) // Zoom in to user's location
    //     },
    //     (error) => {
    //       console.error('Error fetching user location:', error)
    //     }
    //   )
    // } else {
    //   console.log('Geolocation is not supported by this browser.')
    // }
  }

  await initMap()
}

locator()
