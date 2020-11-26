'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerReviews = document.querySelector('.reviews');
const inputType = document.querySelector('.form__input--type');
const inputName = document.querySelector('.form__input--name');
const inputPrice = document.querySelector('.form__input--price');
const inputRate = document.querySelector('.form__input--rate');
const typeFilter = document.querySelector('.filter__type');
const rateFilter = document.querySelector('.filter__rate');


class Review {
    constructor(id, coords, type, name, price, rate) {
        this.id = id;
        this.coords = coords;
        this.type = type;
        this.name = name;
        this.price = price;
        this.rate = rate;
        this.setMarker();
    }

    setMarker() {
        var markerIcon = this._makeMarkerIcon(this.convertRate(this.rate));
        this.marker  = L.marker(this.coords, {icon:markerIcon});
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
        this.description = '';
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
        return this.description
    }

    _makeMarkerIcon(rate) {
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

        this._getLocalStorage();

        form.addEventListener('submit', this._newReview.bind(this));
        // inputType.addEventListener('change', this._toggleElevationField);
        containerReviews.addEventListener('click', this._moveToPopup.bind(this));   
        containerReviews.addEventListener('click', this._deleteReview.bind(this));   
        typeFilter.addEventListener('change', function() {
            alert('changed!');
        })

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
        // Add new object to workout array
        this.#reviewsArray.push(review);
        
        // Render workout on map as marker
        this._renderReviewMarker(review);


        // Render workout on list
        this._renderReview(review);

        this._hideForm();

        this._setLocalStorage();
    }

    _renderReviewMarker(review) {
        var popupContent, rate, markerIcon, customerMarker;
        popupContent = review.getDescription();
        review.marker.addTo(this.#map)
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
        <li class="review review--${rate}" id="${review.id}">
            <h2 class="review__title">${review.description}</h2>
            <div class="review__details">
                <div class="price_sec">
                    <span class="review__icon">💵  </span>
                    <span class="review__value"> ${review.price}</span>
                    <span class="review__unit"> /per</span>
                </div>
                <div class="rate_sec">
                    <span class="review__icon">⭐</span>
                    <span class="review__value">${review.rate}</span>
                </div>
            </div>
            <button class="item__delete--btn">
                <i class="ion-ios-close-outline"></i>
            </button>
        </li>
        `;
        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e) {
        const reviewEl = e.target.closest('.review');
        if (!reviewEl) return;
        
        const review = this.#reviewsArray.find(review => review.id === parseInt(reviewEl.id));
        this.#map.setView(review.coords, this.#mapZoomLevel, {
            animate:true,
            pan: {
                duration: 1,
            }
        });
    }

    _setLocalStorage() {
        localStorage.setItem('reviews', JSON.stringify(this.#reviewsArray));
    };
    
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('reviews'));
        if (!data) return;
        this.#reviewsArray = data;
        this.#reviewsArray.forEach(review => {
            this._renderReview(review)
        });
    }

   
    _deleteReview(e) {
        if (e.target.className==='ion-ios-close-outline') {
            const reviewID = e.target.parentNode.parentNode.id;
            if (reviewID) {
                this._deleteReviewMarker(reviewID);
                this._deleteReviewFromList(reviewID);
                this._deleteReviewFromBuffer(reviewID);
            }
        }
    }

    _deleteReviewFromBuffer(id) {
        var ids, index;
        ids = this.#reviewsArray.map(function(current){
            return current.id;
        })
        index = ids.indexOf(parseInt(id));
        if (index !== -1) {
            this.#reviewsArray.splice(index, 1); 
        }
    }

    _deleteReviewMarker(id) {
        var ids, index, targetMarker;
        ids = this.#reviewsArray.map(function(current){
            return current.id;
        })
        index = ids.indexOf(parseInt(id));
        if (index !== -1) {
            targetMarker = this.#reviewsArray[index].marker;
            this.#map.removeLayer(targetMarker);
        }
    }

    _deleteReviewFromList(selectorID) {
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
    }
};


   
const app = new App();


