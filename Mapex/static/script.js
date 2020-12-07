/*
  Reference:
  Logic of this part is based on 
  https://github.com/jonasschmedtmann/complete-javascript-course/blob/master/15-Mapty/starter/script.js
*/

"use strict";

// prettier-ignore
const form = document.querySelector('.form');
const containerReviews = document.querySelector(".reviews");
const inputType = document.querySelector(".form__input--type");
const inputName = document.querySelector(".form__input--name");
const inputPrice = document.querySelector(".form__input--price");
const inputRate = document.querySelector(".form__input--rate");
const typeFilter = document.querySelector(".filter--type");
const rateFilter = document.querySelector(".filter--rate");
const inputDescript = document.querySelector(".form__input--descript");

class Review {
  constructor(id, coords, type, name, price, rate, descript) {
    this.id = id;
    this.coords = coords;
    this.type = type;
    this.name = name;
    this.price = price;
    this.rate = rate;
    this.descript = descript;
    this.setDescription();
    this.setWordRate();
  }

  static getInstance(review) {
    return new Review(
      review.id,
      review.coords,
      review.type,
      review.name,
      review.price,
      review.rate,
      review.descript
    );
  }

  setWordRate() {
    if (this.rate <= 1) {
      this.wordRate = "bad";
    } else if (this.rate <= 3) {
      this.wordRate = "normal";
    } else if (this.rate === 4) {
      this.wordRate = "good";
    } else {
      this.wordRate = "perfect";
    }
  }

  setDescription() {
    this.description = "";
    let symbol;
    switch (this.type) {
      case "food":
        symbol = "🍲";
        break;
      case "leisure":
        symbol = "🎤";
        break;
      case "hotel":
        symbol = "🛏️";
        break;
      case "beauty":
        symbol = "💈";
        break;
      case "activity":
        symbol = "⚾";
        break;
      case "attraction":
        symbol = "🏕️";
        break;
      default:
        symbol = "✨";
        break;
    }
    this.description = this.description + symbol + "    " + this.name;
  }
}

class App {
  #map;
  #mapEvent;
  #reviewsArray = [];
  #mapZoomLevel = 13;
  #layerGroup;
  #markerArray = [];

  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener("submit", this._makeNewReview.bind(this));
    containerReviews.addEventListener("click", this._moveToPopup.bind(this));
    containerReviews.addEventListener("click", this._deleteReview.bind(this));
    typeFilter.addEventListener("change", this._filterReview.bind(this));
    rateFilter.addEventListener("change", this._filterReview.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#layerGroup = L.layerGroup().addTo(this.#map);
    this.#map.on("click", this._showForm.bind(this));
    this.#reviewsArray.forEach((review) => {
      this._setReviewMarker(review);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputName.focus();
  }

  _hideForm() {
    inputName.value = inputPrice.value = inputDescript.value = "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _makeNewReview(e) {
    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const name = inputName.value;
    const price = inputPrice.value;
    const rate = parseInt(inputRate.value);
    const descript = inputDescript.value;

    const { lat, lng } = this.#mapEvent.latlng;
    if (name === "" || price === "") {
      return alert("Please enter all information");
    }
    if (isNaN(price) || price < 0) {
      return alert("Price have to be a positive number");
    }

    const id =
      this.#reviewsArray.length === 0
        ? 0
        : this.#reviewsArray[this.#reviewsArray.length - 1].id + 1;
    const review = new Review(
      id,
      [lat, lng],
      type,
      name,
      price,
      rate,
      descript
    );

    // Add new object to workout array
    this.#reviewsArray.push(review);

    // Render workout on map as marker
    this._setReviewMarker(review);

    // Render workout on list
    this._setReviewList(review);

    this._hideForm();

    this._setLocalStorage();

    this._updateServer();
  }

  _setReviewMarker(review) {
    let popupContent, rate, marker;
    popupContent = review.description;
    marker = getMarker(review);
    this.#markerArray.push(marker);

    marker
      .addTo(this.#layerGroup)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 50,
          maxHeight: 80,
          closeOnClick: false,
          className: `${rate}-popup`,
        })
      )
      .setPopupContent(popupContent)
      .openPopup();
  }

  _setReviewList(review) {
    let rate = review.wordRate;
    let html = `
        <li class="review review--${rate}" id="${review.id}">

            <button class="item__delete--btn">
                <i class="ion-ios-close-outline"></i>
            </button>

            <div class="stats"> 
                <p class="review__value sub w__emoji">💵 ${review.price}</p>
                <p class="review__value sub w__emoji">⭐ ${review.rate}</p>
            </div>
  
            <div class="info"> 
                <p class="info__title sub w__emoji">${review.description}</p>
                <P class="info__descript sub ">${review.descript} </p>
            </div>             
        </li>
        `;
    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const reviewEl = e.target.closest(".review");
    if (!reviewEl) return;

    const review = this.#reviewsArray.find(
      (review) => review.id === parseInt(reviewEl.id)
    );
    this.#map.setView(review.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("reviews", JSON.stringify(this.#reviewsArray));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("reviews"));
    if (!data) return;
    console.log(data);
    this.#reviewsArray = data;
    this.#reviewsArray.forEach((review) => {
      this._setReviewList(review);
    });
  }

  _deleteReview(e) {
    if (e.target.className === "ion-ios-close-outline") {
      const reviewID = e.target.parentNode.parentNode.id;
      if (reviewID) {
        this._deleteReviewMarker(reviewID);
        this._deleteReviewFromList(reviewID);
        this._deleteReviewFromBuffer(reviewID);
      }
    }
  }

  _deleteReviewFromBuffer(id) {
    let ids, index;
    ids = this.#reviewsArray.map(function (current) {
      return current.id;
    });
    index = ids.indexOf(parseInt(id));
    if (index !== -1) {
      this.#reviewsArray.splice(index, 1);
    }
    this._setLocalStorage();
    this._updateServer();
  }

  _deleteReviewMarker(id) {
    let ids, index, targetMarker;
    ids = this.#reviewsArray.map(function (current) {
      return current.id;
    });
    index = ids.indexOf(parseInt(id));
    if (index !== -1) {
      targetMarker = this.#markerArray[index];
      this.#map.removeLayer(targetMarker);
      this.#markerArray.splice(index, 1);
    }
  }

  _deleteReviewFromList(selectorID) {
    let el = document.getElementById(selectorID);
    el.parentNode.removeChild(el);
  }

  _filterReview() {
    $("ul li").remove();
    this.#layerGroup.clearLayers();

    let type, rate, review;
    type = typeFilter.value;
    rate = rateFilter.value;
    if (type === "all" && rate === "all") {
      for (review of this.#reviewsArray) {
        this._setReviewList(review);
        this._setReviewMarker(review);
      }
    } else if (type === "all") {
      for (review of this.#reviewsArray) {
        if (review.rate === parseInt(rate)) {
          this._setReviewList(review);
          this._setReviewMarker(review);
        }
      }
    } else if (rate === "all") {
      for (review of this.#reviewsArray) {
        if (review.type === type) {
          this._setReviewList(review);
          this._setReviewMarker(review);
        }
      }
    } else {
      for (review of this.#reviewsArray) {
        if (review.type === type && review.rate === parseInt(rate)) {
          this._setReviewList(review);
          this._setReviewMarker(review);
        }
      }
    }
  }

  _updateServer() {
    let reviewArr = JSON.stringify(this.#reviewsArray);
    $.ajax({
      url: "/update-csv",
      type: "POST",
      contentType: "application/json;charset=UTF-8",
      data: reviewArr,
      dataType: "json",
    });
  }
}

function getMarker(review) {
  let markerIcon, marker;
  markerIcon = makeMarkerIcon(review.wordRate);
  marker = L.marker(review.coords, { icon: markerIcon });
  return marker;
}

function makeMarkerIcon(rate) {
  let color, url, icon;
  if (rate === "perfect") {
    color = "blue";
  } else if (rate === "good") {
    color = "green";
  } else if (rate === "normal") {
    color = "orange";
  } else {
    color = "red";
  }
  url = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
  icon = new L.Icon({
    iconUrl: url,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  return icon;
}

const app = new App();
