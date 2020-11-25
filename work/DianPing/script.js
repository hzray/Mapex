'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerReviews = document.querySelector('.reviews');
const inputType = document.querySelector('.form__input--type');
const inputName = document.querySelector('.form__input--name');
const inputPrice = document.querySelector('.form__input--price');
const inputRate = document.querySelector('.form__input--rate');


class Review {
    constructor(coords, type, name, price, rate) {
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
    }
}





class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
        
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                         'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} 
                            ${this.date.getDate()}`;              
    }

}

class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}



class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed
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
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';    
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
        if (price < 0) {
            return alert('Price have to be a positive number');
        }
        const review = new Review([lat,lng], type, name, price, rate);

        // Add new object to workout array
        this.#reviewsArray.push(review);
        
        // Render workout on map as marker
        this._renderReviewMarker(review);

        // Render workout on list
        this._renderWorkout(review);
        

        
        this._hideForm();

        // Set local storage to all workouts
        // this._setLocalStorage();


    }

    _renderReviewMarker(review) {
        var popupContent, symbol, rate, customerIcon;
        switch (review.type) {
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
        popupContent = symbol + review.name;
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
            //.setPopupContent(`${review.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${review.description}`)
            .setPopupContent(popupContent)
            .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running'? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

        if (workout.type === 'running') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
          </li>`;
        }

        if (workout.type === 'cycling') {
            html +=  `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`
        }

        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e) {
        const workOutEl = e.target.closest('.workout');
        if (!workOutEl) return;

        const workout = this.#reviewsArray.find(work => work.id === workOutEl.dataset.id);
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
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
        this.#reviewsArray.forEach(work => {
            this._renderWorkout(work)
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


