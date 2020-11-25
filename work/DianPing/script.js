'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerReviews = document.querySelector('.reviews');
const inputType = document.querySelector('.form__input--type');
const inputName = document.querySelector('.form__input--name');
const inputPrice = document.querySelector('.form__input--price');
const inputRate = document.querySelector('.form__input--rate');


class Review {
    constructor(id, coords, type, name, price, rate) {
        this.id = id;
        this.coords = coords;
        this.type = type;
        this.name = name;
        this.price = price;
        this.rate = rate;
    }

    convertRate() {
        if (this.rate <= 1) {
            return 'bad';
        } else if (this.rate <= 3) {
            return 'normal';
        } else if (this.rate == 4) {
            return 'good';
        } else {
            return 'perfect';
        }
    };

    getDescription() {
        this. description = '';
        var symbol;
        switch (this.type) {
            case 'food':
                symbol = '🍲';
                break;
            case 'leisure':
                symbol = '🎤';
                break;
            case 'hotel':
                symbol = '🛏️';
                break;
            case 'beauty':
                symbol = '💈';
                break;
            case 'activity':
                symbol = '⚾';
                break;
            case 'attraction':
                symbol = '🏕️';
                break;
            default:
                symbol = '✨'
                break;
        }
        this.description = this.description + symbol + '    ' + this.name;
        console.log(this.description);
        return this.description
    }
}




class App {
    #map;
    #mapEvent;
    #reviewsArray = [];
    #mapZoomLevel = 13;

    constructor() {
        // Get User's position
        this._getPosition();

        // Get data from local storage

        // this._getLocalStorage();

        form.addEventListener('submit', this._newReview.bind(this));
        // inputType.addEventListener('change', this._toggleElevationField);
        containerReviews.addEventListener('click', this._moveToPopup.bind(this));   
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),        
                function () {
                    alert('Could not get your position')
                }
            )
        }
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords
        const coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords,this.#mapZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);



        this.#map.on('click', this._showForm.bind(this));
        this.#reviewsArray.forEach(review => {
            this._renderReviewMarker(review);
        });
        
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputName.focus();
    }

    _hideForm() {
        inputName.value = inputPrice.value = '';    
        form.style.display = 'none';
        form.classList.add('hidden'); 
        setTimeout(() => (form.style.display = 'grid'), 1000);
    }

    // _toggleElevationField() {
    //     inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    //     inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    // }

    _newReview(e) {
        e.preventDefault();

        // Get data from form
        const type = inputType.value;
        const name = inputName.value;
        const price = inputPrice.value;
        const rate = inputRate.value;

        const { lat, lng } = this.#mapEvent.latlng;
        if (name ===  '' || price === '') {
            return alert('Please enter all information');
        }
        if (isNaN(price) || price < 0 ) {
            return alert('Price have to be a positive number');
        }

        const id = this.#reviewsArray.length === 0 ? 0 : this.#reviewsArray[this.#reviewsArray.length-1].id+1;
        const review = new Review(id, [lat,lng], type, name, price, rate);
        console.log(review.id);
        // Add new object to workout array
        this.#reviewsArray.push(review);
        
        // Render workout on map as marker
        this._renderReviewMarker(review);

        // Render workout on list
        this._renderReview(review);
        

        
        this._hideForm();

        // Set local storage to all workouts
        // this._setLocalStorage();


    }

    _renderReviewMarker(review) {
        var popupContent, rate, customerIcon;
        popupContent = review.getDescription();
        
        rate = review.convertRate();
        customerIcon = this._makeMarker(rate);

        
        L.marker(review.coords, {icon:customerIcon})
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    closeOnClick: false,
                    className: `${rate}-popup`
                })
            )
            .setPopupContent(popupContent)
            .openPopup();
    }

    _renderReview(review) {
        var rate = review.convertRate();
        let html = `
        <li class="review review--${rate}" data-id="${review.id}">
        <h2 class="review__title">${review.description}</h2>
        <div class="review__details">
          <span class="review__icon">💵  </span>
          <span class="review__value"> ${review.price}</span>
          <span class="review__unit"> /per</span>
        </div>
        <div class="review__details">
            <span class="review__icon">⭐</span>
            <span class="review__value">${review.rate}</span>
          </div>
        `;

        // if (review.type === 'running') {
        //     html += `
        //     <div class="workout__details">
        //     <span class="workout__icon">⚡️</span>
        //     <span class="workout__value">${review.pace.toFixed(1)}</span>
        //     <span class="workout__unit">min/km</span>
        //   </div>
        //   <div class="workout__details">
        //     <span class="workout__icon">🦶🏼</span>
        //     <span class="workout__value">${review.cadence}</span>
        //     <span class="workout__unit">spm</span>
        //   </div>
        //   </li>`;
        // }

        // if (review.type === 'cycling') {
        //     html +=  `<div class="workout__details">
        //     <span class="workout__icon">⚡️</span>
        //     <span class="workout__value">${review.speed.toFixed(1)}</span>
        //     <span class="workout__unit">km/h</span>
        //   </div>
        //   <div class="workout__details">
        //     <span class="workout__icon">⛰</span>
        //     <span class="workout__value">${review.elevationGain}</span>
        //     <span class="workout__unit">m</span>
        //   </div>
        // </li>`
        // }

        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e) {
        const reviewEl = e.target.closest('.review');
        if (!reviewEl) return;
        
        const review = this.#reviewsArray.find(review => review.id === parseInt(reviewEl.dataset.id));
        console.log(typeof(reviewEl.dataset.id));
        this.#map.setView(review.coords, this.#mapZoomLevel, {
            animate:true,
            pan: {
                duration: 1,
            }
        });
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#reviewsArray));
    };
    
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));
        if (!data) return;

        this.#reviewsArray = data;
        this.#reviewsArray.forEach(review => {
            this._renderReview(review)
        });
    }

    _makeMarker(rate) {
        var color, url, icon;
        if (rate === 'perfect') {
           color = 'blue';
        } else if (rate === 'good') {
            color = 'green';
        } else if (rate === 'normal'){
            color = 'orange';
        } else {
            color = 'red';
        }
        url = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
        icon = new L.Icon({
            iconUrl: url,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
        return icon;
    }

};
    
   
const app = new App();


