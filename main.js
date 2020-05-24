ymaps.ready(init);


function init () {
    

    let currentCoordinates;
    let newPlacemark;
    let inputAddress;

    let modalAdr = document.querySelector('.coords');

    let map = new ymaps.Map('map', {
        center: [55.766001, 37.604961],
        zoom: 14,
        controls: ['zoomControl'],
        behaviors: ['drag'],
    });

   // map.events.add('click', spawnModal);

    map.events.add('click', function (e){
        currentCoordinates = e.get('coords');
        updateAddress(currentCoordinates);
        spawnModal(e);
        renderModal();

    });



    function createPlacemark (coords) {

        return new ymaps.Placemark(coords, {

            balloonContentHeader: inputPlace.value,
            balloonContentBody: modalAdr.innerText,
            balloonContent: inputReview.value,
            balloonContentFooter: inputReview.timeStamp,

            


        }, {
            preset: 'islands#violetDotIconWithCaption',
            draggable: false,
            hasBalloon: false
            
        });
    }

    const submitReview = () => {
        

                    newPlacemark = createPlacemark(currentCoordinates);

                    //Запись координат пина
                    let newPlacemarkCoords = currentCoordinates;

                    newPlacemark.events.add('click',  () => {
                        renderModal(newPlacemarkCoords);
                        updateAddress(newPlacemarkCoords);
                        currentCoordinates = newPlacemarkCoords
                        console.log('click on a placemark')
                    });
                        map.geoObjects.add(newPlacemark);
                        clusterer.add(newPlacemark);
                        console.log(newPlacemark);
                    
                    if (!([currentCoordinates] in addedObjects)) { 
                        console.log('New location logged')
                        addedObjects[currentCoordinates] = [];
                       } else {
                       console.log('New placemark added to existing location')
                   };

        if (inputReview.value.length > 0) { 
            
                let currentObjectArray = addedObjects[currentCoordinates];
                let newReviewObj = {};

                let today = new Date();
                let timeStamp = today.getHours() + ':' + today.getMinutes();

                newReviewObj.name = inputName.value;
                newReviewObj.place = inputPlace.value;
                newReviewObj.review = inputReview.value;
                newReviewObj.timeStamp = timeStamp;
                newReviewObj.address = inputAddress;
               
               
               clearInput();

               currentObjectArray.push(newReviewObj);

               renderModal(currentCoordinates)
            }  else {
                console.log('No review')
            }

    }

    const renderModal = (coords) => {
        reviewBox.innerHTML = '';

        console.log('initializing renderModal, coordinates are ' + coords);

        if ((coords) && (addedObjects[coords].length> 0)) {
            console.log('entry found! cycling thouugh ')
            let reviewsArray = addedObjects[coords];
            reviewsArray.forEach(review => {

                    console.log(review)
                    let reviewContainer = document.createElement('div');
                    reviewContainer.classList.add('review');

                    let reviewSignature = document.createElement('div');
                    reviewSignature.classList.add('review-sign');

                    let nameInfo = document.createElement('span');
                    nameInfo.classList.add('name-info');

                    let placeInfo = document.createElement('span');
                    placeInfo.classList.add('place-info');

                     let dateInfo = document.createElement('span');
                    dateInfo.classList.add('date-info');

                    let reviewText = document.createElement('div');
                    reviewText.classList.add('review-text');

                    nameInfo.innerText = review.name + '  ';
                    placeInfo.innerText = review.place + '  ';
                    dateInfo.innerText = review.timeStamp;
                    reviewText.innerText = review.review;

                    reviewSignature.append(nameInfo);
                    reviewSignature.append(placeInfo);
                    reviewSignature.append(dateInfo);

                    reviewContainer.append(reviewSignature);
                    reviewContainer.append(reviewText);

                    reviewBox.append(reviewContainer);



        })} else {
            noReviews();
        }

    }

    function updateAddress(coords) {

        modalAdr.innerText = 'Ищем адрес...';

        ymaps.geocode(coords).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);
            let fullAddress = firstGeoObject.getAddressLine();

            let address = fullAddress.replace('Россия, Москва, ', "");

            modalAdr.innerText = address;
            inputAddress = address;

            
        });
    }

    submitButton.addEventListener('click', submitReview);

    // const spawnModal = (e) => {
    //     if (modal.style.display !== 'initial'){
    //         let x = e.pageX;
    //         let y = e.pageY;
    //         modal.style.left = x;
    //         modal.style.top = y; 
    //         modal.style.display = 'initial';
    //         //renderModal();
    //     } else {
    //         console.log ('The modal is already visible')
    //     }
    // };

    let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<div style="font-weight:bold;" class=ballon_header>{{ properties.balloonContentHeader|raw }}</div>' +
        ' <div class = ballon_address> {{ properties.balloonContentBody|raw }}</div>' +
            '<div class=ballon_body>{{ properties.balloonContent|raw }} ревью</div>' +
            '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    let clusterer = new ymaps.Clusterer ({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        clusterBalloonItemContentLayout: customItemContentLayout


    });

    map.geoObjects.add(clusterer);



    clusterer.events.add('balloonopen', (e) => {
        console.log('balloon opened');
        clusterBaloonOpen = true;
        modal.style.display = 'none';
    }
     )

     clusterer.events.add('balloonclose', (e) => {
        console.log('balloon closed');
        clusterBaloonOpen = false;
    }
     )
    



}


// balloonContentHeader: inputPlace.value,
// balloonContentBody: modalAdr.innerText,
// balloonContent: inputReview.value,
// balloonContentFooter: inputReview.timeStamp,
// 


let addedObjects = {};

let modal = document.querySelector('.modal');

let closeButton = document.querySelector('.close-button');

let submitButton = document.querySelector('.submit-button');

let reviewBox = document.querySelector('.reviews');

let reviewPlaceholder = document.querySelector('.review-placeholder')

let inputName = document.querySelector('#name');

let inputPlace = document.querySelector('#place');

let inputReview = document.querySelector('#review');

let clusterBaloonOpen = false;



const hideModal = () => {
        modal.style.display = 'none';
        noReviews();
        clearInput();

};

closeButton.addEventListener ('click', hideModal);



const spawnModal = (e) => {
    if (modal.style.display !== 'initial'){
        let x = e.pageX;
        let y = e.pageY;
        modal.style.left = x;
        modal.style.top = y; 
        modal.style.display = 'initial';



    } else {
        console.log ('The modal is already visible')
    }
};



// оригиналное событие появляения модала
// map.addEventListener('click', e => {
//     if (e.target.classList.contains("ymaps-2-1-76-events-pane")) {
//         spawnModal(e);
//     } 
// })



const clearInput = () => {
    inputName.value = '';
    inputPlace.value = '';
    inputReview.value = '';
}

const noReviews = () => {
    reviewBox.innerHTML = '<p class="review-placeholder">Отзывов пока нет</p>'
}








