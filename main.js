const API_URL = 'https://api.tvmaze.com/shows';

async function init() {
   const tvShows = await fetchShows();
   getTopRated(tvShows);
   getNewestShows(tvShows);
   getFilterShowsArr(tvShows);

   getMediaElementWidth();
}
// fetching the data

const fetchShows = async () => {
   try {
      const response = await fetch(API_URL);
      const shows = await response.json();
      return shows;
   } catch (err) {
      console.error(err);
   }
};

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
   const topRatedScroller = document.querySelector('[data-top-rated-scroller]');
   const topRatedShows = shows.filter((show) => show.rating.average >= 8.5);
   createCards(topRatedShows, topRatedScroller);
}
function getNewestShows(shows) {
   const newestScroller = document.querySelector('[data-newest-scroller]');
   const newestShows = shows.filter((show) => show.premiered.slice(0, 4) >= 2014);
   createCards(newestShows, newestScroller);
}
function getFilterShowsArr(shows) {
   // применение фильтров
   filteredShows = shows.filter((show) => show.name.length > 1);
   let numberOfItems = filteredShows.length;
   let numberOfPages = Math.ceil(numberOfItems / numberPerPage);
   createPagination(numberOfPages, filteredShows);
   return filteredShows;
}

//  pagination
const paginationList = document.querySelector('.pagination-list');
const filterElementsContainer = document.querySelector('.filter-elements-list');
const paginationLeftBtn = document.querySelector('.pagination-arrow-left');
const paginationRightBtn = document.querySelector('.pagination-arrow-right');

const numberPerPage = 20;
const currentPage = 1;
let filteredShows;
let active;

function createPagination(numberOfPages, showsArray) {
   let paginationItem = [];
   for (let i = 1; i <= numberOfPages; i++) {
      let li = document.createElement('li');
      li.classList.add('pagination-item');
      paginationList.append(li);
      let span = document.createElement('span');
      span.textContent = i;
      li.append(span);
      paginationItem.push(span);
   }
   buildPage(paginationItem[0], showsArray);

   for (let item of paginationItem) {
      item.addEventListener('click', function () {
         tvShowList.scrollIntoView({ block: 'start', behavior: 'smooth' });

         buildPage(this, showsArray);
      });
   }
}
function buildPage(item, showsArray) {
   if (active) {
      active.classList.remove('active');
   }
   active = item;
   item.classList.add('active');

   let currPage = +item.textContent;

   const trimStart = (currPage - 1) * numberPerPage;
   const trimEnd = trimStart + numberPerPage;
   let shows = showsArray.slice(trimStart, trimEnd);

   filterElementsContainer.innerHTML = '';
   createCards(shows, filterElementsContainer);
   hideOverPages();
}
paginationLeftBtn.addEventListener('click', () => {
   if (active.parentElement.previousElementSibling) {
      // let showsArray = указать тут селекторо для выбора всех элементов на странице
      buildPage(active.parentElement.previousElementSibling.querySelector('span'), filteredShows);
   }
   tvShowList.scrollIntoView({ block: 'start', behavior: 'smooth' });
});
paginationRightBtn.addEventListener('click', () => {
   if (active.parentElement.nextElementSibling) {
      // let showsArray = указать тут селекторо для выбора всех элементов на странице
      buildPage(active.parentElement.nextElementSibling.querySelector('span'), filteredShows);
   }
   tvShowList.scrollIntoView({ block: 'start', behavior: 'smooth' });
});
function hideOverPages() {
   let items = [...paginationList.children];
   if (items.length > 5) {
      items.forEach((item) => item.classList.add('hide'));
      items[0].classList.remove('hide');
      if (active.parentElement.previousElementSibling) {
         active.parentElement.previousElementSibling.classList.remove('hide');
      }
      active.parentElement.classList.remove('hide');
      if (active.parentElement.nextElementSibling) {
         active.parentElement.nextElementSibling.classList.remove('hide');
      }
      items[items.length - 1].classList.remove('hide');
   }
}

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
// focus state cards code
//
let prevEventTarget;
window.addEventListener('keyup', (e) => {
   if (e.key === 'Tab' && e.target.classList.contains('modalBtn')) {
      prevEventTarget?.parentElement.classList.remove('visible');
      e.target.parentElement.classList.add('visible');
      prevEventTarget = e.target;
   }
});

//
// media scrollers sections code
//
const mediaScrollerLeftBtn = document.querySelectorAll('.media-scroller-arrow.left');
const mediaScrollerRightBtn = document.querySelectorAll('.media-scroller-arrow.right');
const mediaScroller = document.querySelector('.media-scroller');

let mediaElementWidth = 0;
let mediaScrollerWidth = 0;

window.addEventListener('resize', getMediaElementWidth);

function getMediaElementWidth() {
   const mediaElement = document.querySelector('.media-element');
   mediaElementWidth = mediaElement.offsetWidth;
}

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
const tvShowList = document.querySelector('.tv-shows-list');
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
window.onload = init();
