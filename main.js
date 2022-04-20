const API_URL = 'https://api.tvmaze.com/shows';
//
// Hero slider code
//
const slider = document.querySelector('.hero-slider');
const sliderCards = document.querySelector('.hero-slider-cards');
let slideWidth;
let stopSlideChange;

slider.addEventListener('mouseover', stopSliderAutoplay);
slider.addEventListener('mouseout', resumeSliderAutoplay);
sliderCards.addEventListener('transitionend', moveSlide, false);

function changeSlide() {
   stopSlideChange = setInterval(() => {
      sliderCards.style.transform = `translate(-100%)`;
   }, 5000);
}
function moveSlide() {
   sliderCards.append(sliderCards.firstElementChild);
   sliderCards.style.transition = 'none';
   sliderCards.style.transform = `translate(0)`;
   setTimeout(() => {
      sliderCards.style.transition = 'all 1s ease';
   });
}
function stopSliderAutoplay() {
   clearInterval(stopSlideChange);
}
function resumeSliderAutoplay() {
   changeSlide();
}
changeSlide();

//
// media scrollers sections code
//
const mediaScrollerLeftBtn = document.querySelectorAll('.media-scroller-arrow.left');
const mediaScrollerRightBtn = document.querySelectorAll('.media-scroller-arrow.right');
const mediaScroller = document.querySelector('.media-scroller');
const mediaElement = document.querySelector('.media-element');

let mediaElementWidth = 0;
let mediaScrollerWidth = 0;

window.addEventListener('resize', getMediaElementWidth);

function getMediaElementWidth() {
   mediaElementWidth = mediaElement.offsetWidth;
   return mediaElementWidth;
}
getMediaElementWidth();

mediaScrollerLeftBtn.forEach((btn) => {
   btn.addEventListener('click', scrollLeft);
});
mediaScrollerRightBtn.forEach((btn) => {
   btn.addEventListener('click', scrollRight);
});
function scrollLeft(e) {
   e.target
      .closest('[data-media-scroller]')
      .scrollBy({ left: -mediaElementWidth * 2, behavior: 'smooth' });
}
function scrollRight(e) {
   e.target
      .closest('[data-media-scroller]')
      .scrollBy({ left: mediaElementWidth * 2, behavior: 'smooth' });
}

//
//  code for toggle filter dropdowns
//
const dropdownContentBtns = document.querySelectorAll('.dropdown-content');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
const tvShowList = document.querySelector('.tv-show-list');
const filterBtn = document.querySelector('.toggleFilter');
const filter = document.querySelector('.filter');

// toggle filter
filterBtn.addEventListener('click', () => {
   filter.classList.toggle('active');
});
// hide dropdowns clicking outside
tvShowList.addEventListener('click', function (e) {
   dropdownToggles.forEach((dropdown) => {
      if (!dropdown.contains(e.target)) {
         dropdown.classList.remove('active');
      }
   });
   e.stopPropagation();
});

// toggle dropdowns lists
dropdownContentBtns.forEach((btn) => {
   btn.addEventListener('click', (e) => {
      let parent = e.target.closest('.dropdown-toggle');
      let dropdownList = parent.querySelector('.dropdown-list');
      parent.classList.toggle('active');
      if (parent.classList.contains('active')) {
         dropdownList.scrollTop = 0;
         return;
      } else {
         hideActiveDropdowns();
      }
      e.stopPropagation();
   });
});
function hideActiveDropdowns() {
   let dropdowns = document.querySelectorAll('.dropdown-toggle.active');
   dropdowns.forEach((elem) => {
      elem.classList.remove('active');
   });
}

//
// modal code
//
const modal = document.querySelector('.modal');
const body = document.body;
const modalContent = document.querySelector('.modal-content');
const mediaElementsParents = document.querySelectorAll('.media-element-parent');
const modalCloseBtn = document.querySelector('.modal-close-icon');

mediaElementsParents.forEach((elem) => {
   elem.addEventListener('click', openModal);
});
modal.addEventListener('click', closeModal);
modalContent.addEventListener('click', (e) => {
   e.preventDefault();
   e.stopPropagation();
   e.stopImmediatePropagation();
   return false;
});
modalCloseBtn.addEventListener('click', closeModal);

function openModal(e) {
   if (e.target.classList.contains('modalBtn')) {
      body.classList.add('modal-opened');
      body.style.top = `-${window.scrollY}px`;
      body.style.position = 'fixed';

      modal.classList.add('visible');
   }
}
function closeModal() {
   const scrollVertical = body.style.top;
   body.style.position = '';
   body.style.top = '';
   body.classList.remove('modal-opened');
   window.scrollTo(0, parseInt(scrollVertical || '0') * -1);

   modal.classList.remove('visible');
}

// fetching the data

async function fetchShows() {
   try {
      const response = await fetch(API_URL);
      const shows = await response.json();
      return shows;
   } catch (err) {
      console.error(err);
   }
}
function createCards(shows, context) {
   const template = document.querySelector('[data-media-card-template]');
   shows.forEach((show) => {
      const card = template.content.cloneNode(true).children[0];
      let img = card.querySelector('[data-img]');
      img.setAttribute('loading', 'lazy');
      let name = card.querySelector('[data-name]');
      let genre = card.querySelector('[data-genre]');
      let year = card.querySelector('[data-year]');
      let rate = card.querySelector('[data-rate]');

      img.src = show.image.medium;
      img.alt = show.name + 'poster';
      name.textContent = show.name;
      if (show.genres.length < 1) {
         genre.textContent = 'No-genre';
      } else {
         show.genres.forEach((showGenre) => {
            genre.innerHTML += `<li>${showGenre}</li>`;
         });
      }
      year.textContent = show.premiered.slice(0, 4);
      rate.textContent = show.rating.average;
      if (show.rating.average === null) {
         rate.textContent = 'No-rating';
      }
      context.append(card);
   });
}
function getTopRated(shows) {
   const topRatedShows = shows.filter((show) => show.rating.average >= 8.5);
   return topRatedShows;
}
function getNewestShows(shows) {
   const newestShows = shows.filter((show) => show.premiered.slice(0, 4) >= 2014);
   return newestShows;
}

async function fetchAndShow() {
   const topRatedScroller = document.querySelector('[data-top-rated-scroller]');
   const newestScroller = document.querySelector('[data-newest-scroller]');

   const shows = await fetchShows();
   const topRated = getTopRated(shows);
   const newest = getNewestShows(shows);
   createCards(topRated, topRatedScroller);
   createCards(newest, newestScroller);
}
fetchAndShow();
