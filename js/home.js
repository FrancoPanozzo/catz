const apiKey = 'bebd1e5e-c548-41c7-9930-f340c7afa8d3';
let favourites = JSON.parse(localStorage.getItem('favourites')) || [];
const feed = document.querySelector('#infinite-scroll');

function debounce(func, wait = 20, immediate = true) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function displayToFeed(array) {
  array.forEach((element) => {
    feed.innerHTML += `
        <div class="card my-4 mx-auto" style="max-width:700px">
          <img src="${element.url}" class="card-img-top" alt="IMAGE-ID:${element.id}" data-id="${element.id}"/>
          <div class="card-body p-2 bg-light">
              <button
                type="button"
                title="Like"
                class="like btn btn-outline-light text-dark p-1 ml-2"
              >
                <i data-id="${element.id}" class="far fa-heart" style="font-size:1.2rem"></i>
              </button>
          </div>
        </div>
        `;
  });
}

function getPictures() {
  const uri = 'https://api.thecatapi.com/v1/images/search?size="small"&limit=5';
  let headers = new Headers();
  headers.append('x-api-key', apiKey);
  const options = {
    method: 'GET',
    headers: headers,
  };
  const request = new Request(uri, options);

  fetch(request)
    .then((response) => response.json())
    .then((catObjects) => displayToFeed(catObjects));
}

function handleVote(e) {
  let classes;
  let imageID;
  const el = e.target;

  if (el.classList.contains('fa-heart')) {
    classes = el.classList;
    imageID = el.dataset.id;
    el.parentNode.classList.toggle('text-danger');
    el.parentNode.classList.toggle('text-dark');
  } else if (el.firstElementChild?.classList.contains('fa-heart')) {
    classes = el.firstElementChild.classList;
    imageID = el.firstElementChild.dataset.id;
    el.classList.toggle('text-danger');
    el.classList.toggle('text-dark');
  } else {
    return;
  }

  if (classes.contains('far')) {
    vote('up', imageID);
  } else {
    vote('down', imageID);
  }
  toggleClasses(classes);
}

function vote(string, imageID) {
  // Binary system to up-/down- vote from the receiving API itself
  let n;
  if (string.toLowerCase() === 'up') n = 1;
  if (string.toLowerCase() === 'down') n = 0;

  // Compose a JSON object to send
  const data = JSON.stringify({
    image_id: imageID,
    value: n,
  });

  sendRequest(data);
}

// function handleFav(e) {
//   let classes;
//   let imageID;
//   const el = e.target;

//   if (el.classList.contains('fa-star')) {
//     classes = el.classList;
//     imageID = el.dataset.id;
//     imageURL = el.parentNode.parentNode.previousElementSibling.src;
//   } else if (el.firstElementChild?.classList.contains('fa-star')) {
//     classes = el.firstElementChild.classList;
//     imageID = el.firstElementChild.dataset.id;
//     imageURL = el.parentNode.previousElementSibling.src;
//   } else {
//     return;
//   }
//   if (classes.contains('far')) {
//     fav(true, imageID, imageURL);
//   } else {
//     fav(false, imageID);
//   }
//   toggleClasses(classes);
//   localStorage.setItem('favourites', JSON.stringify(favourites));
// }

// function fav(boolean, imageID, imageURL) {
//   if (!boolean) {
//     favourites.forEach((el, i, arr) => {
//       if (el.id === imageID) arr.splice(i, 1);
//     });
//   } else {
//     favourites.push({ id: imageID, url: imageURL });
//   }
// }

function sendRequest(json) {
  let xhr = new XMLHttpRequest();
  xhr.withCredentials = false;

  // xhr.addEventListener('readystatechange', () => {
  //   if (this.readyState === this.DONE) {
  //     if (!JSON.parse(this.responseText).message === 'SUCCESS') {
  //     }
  //   }
  // });

  xhr.open('POST', 'https://api.thecatapi.com/v1/votes');
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.setRequestHeader('x-api-key', apiKey);

  xhr.send(json);
}

function toggleClasses(classes) {
  // Toggle Font Awesome filled/empty icons
  classes.toggle('fas');
  classes.toggle('far');
}

// Events
document.addEventListener('DOMContentLoaded', getPictures);

document.addEventListener(
  'scroll',
  debounce(() => {
    if (window.innerHeight * 4 + window.scrollY >= document.body.offsetHeight) {
      getPictures();
    }
  })
);

feed.addEventListener('click', handleVote);

// feed.addEventListener('click', handleFav);
