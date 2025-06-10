const serviceNames = [
  {
    SERVICE_CODE: '1',
    NAME: 'Platni Promet',
    IMG: './img/services/1.png',
  },
  {
    SERVICE_CODE: '3',
    NAME: 'Ria transfer',
    IMG: './img/services/3.png',
  },
  {
    SERVICE_CODE: '22',
    NAME: 'PaySpotNET',
    IMG: './img/services/22.png',
  },
]

// Global variables
let map
let markers = []
let allLocations = []
let filteredLocations = []
let openInfoWindow = null
let isEnglish = false
const ITEMS_PER_PAGE = 10
let serviceFilterValue = 'all'
let inputFilterValue = ''
// Initialize the dropdown when the DOM is loaded

const viewButtons = document.querySelectorAll('.locator__view-button')
const locatorHolder = document.querySelector('.locator')

const fetchAllLocation = async () => {
  try {
    // Fetch locations and services in parallel using native fetch API
    const [lokacije1Response, lokacije2Response, servisiResponse] =
      await Promise.all([
        fetch('data/lokacije1.json'),
        fetch('data/lokacije2.json'),
        fetch('data/servisi.json'),
      ])

    // Parse JSON responses
    const lokacije1 = await lokacije1Response.json()
    const lokacije2 = await lokacije2Response.json()
    const servisiRes = await servisiResponse.json()

    // Combine location data
    const allLocation = [
      ...(lokacije1.Data.Body?.ORGUNITLOCATIONS || []),
      ...(lokacije2.Data.Body?.ORGUNITLOCATIONS || []),
    ]

    const allServices = servisiRes.Data.Body?.ORGUNITSERVICES || []

    // Add services (with names and images) to each location
    const locationsWithServices = allLocation.map((location) => {
      const servicesForLocation = allServices
        .filter((service) => service.ORG_UNIT === location.ORG_UNIT)
        .map((service) => {
          const serviceDetails = serviceNames.find(
            (s) => s.SERVICE_CODE === service.SERVICE_CODE
          )
          return {
            ...service,
            ...serviceDetails, // adds NAME and IMG if found
          }
        })

      return {
        ...location,
        SERVICES: servicesForLocation,
      }
    })
    filteredLocations = locationsWithServices // Save to global
    return locationsWithServices
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
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

// Create info window content for a location
const createInfoWindowContent = (store) => {
  const storeStatus = isStoreOpen(store)

  // Create service HTML safely, checking for undefined values
  const serviceHTML =
    store.SERVICES && Array.isArray(store.SERVICES)
      ? store.SERVICES.map((service) => {
          // Check if service has valid IMG path
          const imgSrc = service.IMG || './img/services/1.png'
          const serviceName = service.NAME || 'Service'

          return `
          <div class="locations-box-1" style="display: flex; align-items: center; margin-bottom: 5px; font-size:13px;">
            <img src="${imgSrc}" style="height: 18px; margin-bottom: 5px;" onerror="this.onerror=null; this.src='./img/services/1.png';">
            <p style="color: #000000de; margin: 0 0 0 5px;">${serviceName}</p>
          </div>`
        }).join('')
      : ''

  if (isEnglish) {
    return `
    <div>
      <div style="width: 315px; height: 100%; background: white; padding: 0;">
        <p style="color: #000000de; margin: 0 0 5px; font-weight: 700; font-size: 14px;">${
          store.ORG_UNIT_NAME
        }</p>
        <hr> <p style="color: #000000de; margin: 0 0 4px; font-weight: 600; font-size: 14px;">Services</p>
        ${serviceHTML}
        <p style="color: #000000de; margin: 4px 0 5px; font-weight: 600; font-size: 14px;">Address</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">${
          store.ADDRESS
        }</p>
        <p style="color: #000000de; margin: 4px 0 3px; font-weight: 600; font-size: 14px;">Working hours</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Working days: ${
          store.WORKING_TIME_FROM
        } - ${store.WORKING_TIME_TO}</p>


        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Saturday: ${
          store.SATURDAY_FROM === 'Neradni dan' ? 'Closed' : store.SATURDAY_FROM
        } ${store.SATURDAY_TO !== null ? `- ` + store.SATURDAY_TO : ''}</p>


        <p style="color: #000000de; margin: 0 0 5px; font-size: 13px;">Sunday: ${
          store.SUNDAY_FROM2 === 'Neradni dan' ? 'Closed' : store.SUNDAY_FROM2
        }  ${store.SUNDAY_TO !== null ? `-` + store.SUNDAY_TO : ''} </p>


        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px; font-weight: bold;">Branch status: 
        ${
          storeStatus == 1
            ? '<span style="color: green">Open</span>'
            : '<span style="color: red">Closed</span>'
        }
        </p>
        <p style="color: #000000de; margin: 4px 0 5px; font-weight: 600; font-size: 14px;">Contact</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Phone: ${
          store.PHONE || ''
        }</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Email: ${
          store.EMAIL || ''
        }</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Branch code: ${
          store.ORG_UNIT
        }</p>
        </div>
      </div>`
  } else {
    return `
    <div>
      <div style="width: 315px; height: 100%; background: white; padding: 0;">
        <p style="color: #000000de; margin: 0 0 5px; font-weight: 700; font-size: 14px;">${
          store.ORG_UNIT_NAME
        }</p>
        <hr> <p style="color: #000000de; margin: 0 0 4px; font-weight: 600; font-size: 14px;">Usluge</p>
        ${serviceHTML}
        <p style="color: #000000de; margin: 4px 0 5px; font-weight: 600; font-size: 14px;">Adresa</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">${
          store.ADDRESS
        }</p>
        <p style="color: #000000de; margin: 4px 0 3px; font-weight: 600; font-size: 14px;">Radno vrijeme</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Radnim danima: ${
          store.WORKING_TIME_FROM
        } - ${store.WORKING_TIME_TO}</p>


        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Subotom: ${
          store.SATURDAY_FROM
        } ${store.SATURDAY_TO !== null ? `- ` + store.SATURDAY_TO : ''}</p>


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
        <p style="color: #000000de; margin: 4px 0 5px; font-weight: 600; font-size: 14px;">Kontakt</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Telefon: ${
          store.PHONE || ''
        }</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Email: ${
          store.EMAIL || ''
        }</p>
        <p style="color: #000000de; margin: 0 0 3px; font-size: 13px;">Sifra filijale: ${
          store.ORG_UNIT
        }</p>
        </div>
      </div>`
  }
}

// Render locations list with pagination
const renderLocationsList = (locations) => {
  const locationsListContainer = document.getElementById('locations-list')
  locationsListContainer.innerHTML = ''

  // Initialize pagination
  // Declare $ as jQuery
  const $ = jQuery
  $('#pagination-container').pagination({
    items: locations.length,
    itemsOnPage: ITEMS_PER_PAGE,
    prevText: '<',
    nextText: '>',
    displayedPages: 3, // or whatever fits your design
    edges: 1,
    onPageClick: (pageNumber) => {
      // Calculate start and end index for the current page
      const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE
      const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, locations.length)

      // Clear the container
      locationsListContainer.innerHTML = ''

      // Render locations for the current page
      for (let i = startIndex; i < endIndex; i++) {
        const location = locations[i]
        if (!location) continue

        const storeStatus = isStoreOpen(location)
        const statusText = isEnglish
          ? storeStatus == 1
            ? 'Open'
            : 'Closed'
          : storeStatus == 1
          ? 'Otvoreno'
          : 'Zatvoreno'

        const statusClass = storeStatus == 1 ? 'open' : 'closed'

        // Create service tags
        const serviceTags =
          location.SERVICES && Array.isArray(location.SERVICES)
            ? location.SERVICES.map((service) => {
                const imgSrc = service.IMG || './img/services/1.png'
                return `
                <div class="service-tag">
                  <img src="${imgSrc}" onerror="this.onerror=null; this.src='./img/services/1.png';">
                  <p>${service.NAME || ''}</p>
                </div>
              `
              }).join('')
            : ''

        const locationItem = document.createElement('div')
        locationItem.className = 'location-item'
        locationItem.dataset.index = i
        locationItem.innerHTML = isEnglish
          ? `
          <h3 class="location-item__name">${location.ORG_UNIT_NAME}</h3>
          <p class="location-item__address"><strong>Address: </strong> ${
            location.ADDRESS
          }</p>

          
          <div class="location-hours-contact">
            <div class="location-hours">
              <p><strong>Working hours</strong></p>

              <p>Working days: ${
                location.WORKING_TIME_FROM ? location.WORKING_TIME_FROM : ''
              } - ${location.WORKING_TIME_TO ? location.WORKING_TIME_TO : ''}
              
              </p>

              <p>Saturday: 
              ${location.SATURDAY_FROM} ${
              location.SATURDAY_TO !== null ? `- ` + location.SATURDAY_TO : ''
            }
              </p>


            <p>Sunday:  
              ${location.SUNDAY_FROM2}  ${
              location.SUNDAY_TO !== null ? `-` + location.SUNDAY_TO : ''
            }  
            </p>

              <p class="status ${statusClass}">Branch status: <span>${statusText}</span></p>
          </div>


          </div>

          <div class="location-services">
           <p><strong>Services</strong></p>
            <div class="location-services-holder">
               ${serviceTags}
              </div>
          </div>
        `
          : `
          <h3 class="location-item__name">${location.ORG_UNIT_NAME}</h3>
          <p class="location-item__address"><strong>Adresa: </strong> ${
            location.ADDRESS
          }, ${location.CITY_NAME}</p>

          
          <div class="location-hours-contact">
            <div class="location-hours">
              <p><strong>Radno vrijeme</strong></p>

              <p>Radnim danima: ${
                location.WORKING_TIME_FROM ? location.WORKING_TIME_FROM : ''
              } - ${location.WORKING_TIME_TO ? location.WORKING_TIME_TO : ''}
              
              </p>

              <p>Subotom: 
              ${location.SATURDAY_FROM} ${
              location.SATURDAY_TO !== null ? `- ` + location.SATURDAY_TO : ''
            }
              </p>


            <p>Nedeljom:  
              ${location.SUNDAY_FROM2}  ${
              location.SUNDAY_TO !== null ? `-` + location.SUNDAY_TO : ''
            }  
            </p>

              <p class="status ${statusClass}">Status filijale: <span>${statusText}</span></p>
          </div>
          </div>

          <div class="location-services">
           <p><strong>Usluge</strong></p>
            <div class="location-services-holder">
               ${serviceTags}
              </div>
          </div>
        `

        // Add click event to open the corresponding info window
        locationItem.addEventListener('click', () => {
          // Find the corresponding marker
          const marker = markers[i]
          if (marker) {
            // Trigger a click on the marker
            google.maps.event.trigger(marker, 'click')

            // Center the map on the marker
            map.panTo(marker.position)
          }
        })

        locationsListContainer.appendChild(locationItem)
      }
    },
  })

  // Trigger the first page
  $('#pagination-container').pagination('selectPage', 1)
}

const normalize = (str) =>
  str
    ?.toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') || ''

const applyTextFilter = () => {
  const inputFilter = input.value
  inputFilterValue = inputFilter
  locator(serviceFilterValue, inputFilterValue)
}

const input = document.getElementById('locatorInput')
const button = document.getElementById('locatorButton')
let debounceTimeout = null
// Button click filters locations
button.addEventListener('click', applyTextFilter)

// Pressing ENTER in input triggers filter
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    applyTextFilter()
  }
})

// input trigered on search
input.addEventListener('input', () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    applyTextFilter()
  }, 300)
})

const locator = async (serviceFilter, inputFilter) => {
  // initialize map
  const initMap = async () => {
    // Create a new map instance
    // Declare google as window.google
    const google = window.google
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 42.9481062, lng: 19.2337873 },
      zoom: 8.5,
      mapId: '85d6b624f1ef221e',
      // scrollwheel: false,
      // gestureHandling: 'cooperative',
    })

    allLocations = await fetchAllLocation()

    // Get the selected service filter value
    // const serviceFilter = document.getElementById('service-filter').value

    // Fetch all locations

    const query = normalize(inputFilter)

    // Filter by both service and input
    filteredLocations = allLocations.filter((location) => {
      const matchesService =
        serviceFilter === 'all' ||
        location.SERVICES?.some(
          (service) => service.SERVICE_CODE === serviceFilter
        )

      const matchesText =
        !query ||
        normalize(location.CITY_NAME).includes(query) ||
        normalize(location.ADDRESS).includes(query) ||
        normalize(location.ORG_UNIT_NAME).includes(query)

      return matchesService && matchesText
    })

    if (filteredLocations.length === 0) {
      locatorHolder.classList.add('noResult')
    } else {
      locatorHolder.classList.remove('noResult')
    }

    // Clear existing markers
    markers = []

    // Create markers for filtered locations
    markers = filteredLocations
      .filter((store) => store && store.LATITUDE && store.LONGITUDE)
      .map((store, index) => {
        if (!store) return null

        const pinImage = document.createElement('img')
        pinImage.src = './img/map-pin.png'

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: {
            lat: Number.parseFloat(store.LATITUDE),
            lng: Number.parseFloat(store.LONGITUDE),
          },
          content: pinImage,
          title: store.ORG_UNIT_NAME,
        })

        // Create info window content
        const contentString = createInfoWindowContent(store)

        const infowindow = new google.maps.InfoWindow({
          content: contentString,
          ariaLabel: store.ORG_UNIT_NAME,
          disableAutoPan: true,
        })

        // Add click listener to marker
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

    // Create marker clusterer with custom renderer
    // Declare markerClusterer as window.markerClusterer
    const markerClusterer = window.markerClusterer
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
      markers: markers.filter(Boolean), // Remove any null markers
      map,
      renderer: customRenderer,
    })

    // Render the locations list with pagination
    renderLocationsList(filteredLocations)
  }

  await initMap()
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if the page is in English
  const urlPath = window.location.pathname
  const pathSegments = urlPath.split('/')
  const slug = pathSegments[pathSegments.length - 1]
  isEnglish = slug.includes('en')

  // filter inputs

  // Populate service dropdown
  const serviceFilter = document.getElementById('service-filter')
  serviceFilter.tabIndex = -1
  const dropdownBtn = document.querySelector('.button-filter-dropdown')
  const dropdownBtnArrow = document.querySelector(
    '.button-filter-dropdown span'
  )

  // Add "All Services" button
  const allLi = document.createElement('li')
  const allButton = document.createElement('button')
  allButton.classList.add('active')
  allButton.textContent = isEnglish ? 'All Services' : 'Svi servisi'
  allButton.dataset.value = 'all'
  allLi.appendChild(allButton)
  serviceFilter.appendChild(allLi)

  // Add service buttons dynamically
  serviceNames.forEach((service) => {
    const li = document.createElement('li')
    const button = document.createElement('button')
    button.dataset.value = service.SERVICE_CODE
    button.innerHTML = `
    <img src="${service.IMG}" alt="${service.NAME}" />
    <span>${service.NAME}</span>
  `
    li.appendChild(button)
    serviceFilter.appendChild(li)
  })

  // Add event listener for buttons
  serviceFilter.addEventListener('click', (e) => {
    if (e.target.closest('button')) {
      const value = e.target.closest('button').dataset.value
      // Optionally highlight the active button
      document
        .querySelectorAll('#service-filter button')
        .forEach((btn) => btn.classList.remove('active'))
      e.target.closest('button').classList.add('active')

      // Trigger map filtering
      toggleDropdown()
      serviceFilterValue = value
      locator(serviceFilterValue, inputFilterValue)
    }
  })

  const toggleDropdown = () => {
    if (serviceFilter.classList.contains('active')) {
      serviceFilter.classList.remove('active')
      dropdownBtnArrow.classList.add('down')
      dropdownBtnArrow.classList.remove('up')
    } else {
      serviceFilter.classList.add('active')
      dropdownBtnArrow.classList.remove('down')
      dropdownBtnArrow.classList.add('up')
    }
  }

  dropdownBtn.addEventListener('click', toggleDropdown)

  document.addEventListener('click', (e) => {
    if (e.target !== dropdownBtn) {
      serviceFilter.classList.remove('active')
      dropdownBtnArrow.classList.add('down')
      dropdownBtnArrow.classList.remove('up')
    }
  })

  // Initialize the locator
  locator(serviceFilterValue, inputFilterValue)

  // view handle

  const viewHandler = (event) => {
    locatorHolder.classList.remove('map')
    locatorHolder.classList.remove('list')
    locatorHolder.classList.add(event.target.dataset.tab)
    viewButtons.forEach((button) => {
      button.classList.remove('active')
    })
    event.target.classList.add('active')
  }

  viewButtons.forEach((button) => {
    button.addEventListener('click', viewHandler)
  })
})
