const API_URL = 'https://api.tvmaze.com/shows';

async function init() {
   const tvShows = await fetchShows();
   getTopRated(tvShows);
   getNewestShows(tvShows);

   let values = getInputValues();
   fillUpExtra(values);
   getFilterShowsArr(tvShows);

   getMediaElementWidth();

   window.addEventListener('scroll', throttle(getWindowScroll, 1000));
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
      let mediaElem = card.querySelector('[media-element]');
      let name = card.querySelector('[data-name]');
      let genre = card.querySelector('[data-genre]');
      let year = card.querySelector('[data-year]');
      let rate = card.querySelector('[data-rate]');

      let id = show.id;
      card.dataset.id = `${id}`;
      img.src = show.image.medium;
      img.alt = show.name + ' poster';
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
   let valuesObj = getInputValues();
   let genresValues = valuesObj.genres;
   let yearValues = valuesObj.year;
   let ratingValues = valuesObj.rate;

   allShowsContainer = shows;

   filteredByGenre = shows.filter((show) => {
      if (show.genres.length < 1) {
         show.genres = ['Without Genres'];
      }
      if (strictMode) {
         return genresValues.every((genre) => {
            return show.genres.includes(genre);
         });
      }
      return show.genres.some((genreItem) => {
         return genresValues.includes(genreItem);
      });
   });
   filteredByGenreAndYear = filteredByGenre.filter((show) => {
      if (yearValues == 'All years') {
         return show.premiered.slice(0, 4) <= 2020;
      }
      if (yearValues == 'before 2000') {
         return show.premiered.slice(0, 4) < 2000;
      }
      return show.premiered.slice(0, 4) == yearValues;
   });
   filteredByGenreAndYearAndRate = filteredByGenreAndYear.filter((show) => {
      if (ratingValues == 'All ratings') {
         return show.rating.average <= 10;
      }
      if (ratingValues == 'less 6') {
         return show.rating.average < 6;
      }
      return show.rating.average >= ratingValues;
   });
   filteredShows = filteredByGenreAndYearAndRate;
   if (filteredShows.length < 1) {
      showFilterError();
      return;
   }
   let numberOfItems = filteredShows.length;
   let numberOfPages = Math.ceil(numberOfItems / numberPerPage);
   createPagination(numberOfPages, filteredShows);
   return filteredShows;
}
function showFilterError() {
   let error = document.createElement('div');
   error.classList.add('filter-error');
   error.textContent = 'There are no shows matching specified criteria...';
   filterElementsContainer.insertAdjacentElement('beforebegin', error);
   setTimeout(() => {
      error.remove();
   }, 3000);
}
//  pagination
const paginationList = document.querySelector('.pagination-list');
const filterElementsContainer = document.querySelector('.filter-elements-list');
const paginationLeftBtn = document.querySelector('.pagination-arrow-left');
const paginationRightBtn = document.querySelector('.pagination-arrow-right');

const numberPerPage = 20;
const currentPage = 1;
let filteredShows;
let allShowsContainer;
let active;

function createPagination(numberOfPages, showsArray) {
   if ((paginationList.children = !null)) {
      paginationList.innerHTML = '';
   }
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
      buildPage(active.parentElement.previousElementSibling.querySelector('span'), filteredShows);
   }
   tvShowList.scrollIntoView({ block: 'start', behavior: 'smooth' });
});
paginationRightBtn.addEventListener('click', () => {
   if (active.parentElement.nextElementSibling) {
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
const sliderCardsList = document.querySelectorAll('.hero-slider-card');
let sliderCardsStyles = window.getComputedStyle(sliderCards);
let gap = parseInt(sliderCardsStyles.getPropertyValue('gap'));
let slideWidth;
let stopSlideChange;

sliderCardsList.forEach((card) => {
   card.addEventListener('mouseover', stopSliderAutoplay);
});
sliderCardsList.forEach((card) => {
   card.addEventListener('mouseout', resumeSliderAutoplay);
});
sliderCards.addEventListener('transitionend', moveSlide, false);

function changeSlide() {
   stopSlideChange = setInterval(() => {
      let sliderCard = document.querySelector('.hero-slider-card');
      slideWidth = sliderCard.clientWidth;
      let translateValue = -slideWidth - gap;
      sliderCards.style.transform = `translate(${translateValue}px)`;
   }, 3000);
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
//  code for filter dropdowns
//
const dropdownContentBtns = document.querySelectorAll('.dropdown-content');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
const genresList = document.querySelector('.genres-list');
const dropdownLists = document.querySelectorAll('.dropdown-list');
const genresCheckedToggleBtn = document.querySelector('.toggle-genres');
const tvShowList = document.querySelector('.tv-shows-list');
const filterBtn = document.querySelector('.toggleFilter');
const filter = document.querySelector('.filter');
const strictModeToggler = document.querySelector('.strict-mode-toggler');
const applyFilterBtn = document.querySelector('.apply-filter');
const clearFilterBtn = document.querySelector('.clear-filter');
let strictMode = false;

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
dropdownLists.forEach((list) => {
   list.addEventListener('click', (e) => {
      if (
         e.target.parentElement.classList.contains('dropdown-list-item') ||
         e.target.parentElement.classList.contains('dropdown-label')
      ) {
         let values = getInputValues();
         fillUpExtra(values);
         e.stopPropagation();
      }
   });
});
strictModeToggler.addEventListener('click', (e) => {
   if (
      e.target.parentElement.classList.contains('strict-mode-label') ||
      e.target.parentElement.classList.contains('dropdown-label-check-icon')
   ) {
      if (strictMode === false) {
         strictMode = true;
         return;
      }
      strictMode = false;
      e.stopPropagation();
   }
});
// apply filter settings
applyFilterBtn.addEventListener('click', () => {
   getFilterShowsArr(allShowsContainer);
});
// clear filter settings
clearFilterBtn.addEventListener('click', () => {
   let genresInputs = genresList.querySelectorAll('[data-genre-input]');
   genresInputs.forEach((input) => {
      input.checked = false;
   });
   genresCheckedToggleBtn.textContent = 'Check All';
   let yearInput = document.querySelector("[data-year='All years']");
   yearInput.previousElementSibling.checked = 'true';
   let rateInput = document.querySelector("[data-rate='All ratings']");
   rateInput.previousElementSibling.checked = 'true';
   strictMode = false;
   let strictModeBtn = document.querySelector('#strictModeBtn');
   strictModeBtn.checked = false;
   let values = getInputValues();
   fillUpExtra(values);
});
// toggle genre inputs checked state
genresCheckedToggleBtn.addEventListener('click', () => {
   toggleGenresCheckState();
   if (genresCheckedToggleBtn.textContent.toLowerCase() == 'uncheck all') {
      genresCheckedToggleBtn.textContent = 'Check All';
   } else {
      genresCheckedToggleBtn.textContent = 'Uncheck All';
   }
});
function toggleGenresCheckState() {
   let genresInputs = genresList.querySelectorAll('[data-genre-input]');

   genresInputs.forEach((input) => {
      if (genresCheckedToggleBtn.textContent.toLowerCase() == 'check all') {
         input.checked = true;
      } else {
         input.checked = false;
      }
   });
}
function getInputValues() {
   let values = {
      genres: [],
   };
   let genresDropdown = document.querySelector('.genres-dropdown');
   let genresInputs = genresDropdown.querySelectorAll('input:checked');
   genresInputs.forEach((input) => {
      values.genres.push(input.nextElementSibling.textContent);
   });
   let yearDropdown = document.querySelector('.years-dropdown');
   let yearInputs = yearDropdown.querySelectorAll('input:checked');
   yearInputs.forEach((input) => {
      values.year = [input.nextElementSibling.dataset.year];
   });
   let ratingDropdown = document.querySelector('.rating-dropdown');
   let ratingInputs = ratingDropdown.querySelectorAll('input:checked');
   ratingInputs.forEach((input) => {
      values.rate = [input.nextElementSibling.dataset.rate];
   });
   if (values.genres.length < 1) {
      values.genres.push('No choosen genres');
   }
   return values;
}
function fillUpExtra(valuesObj) {
   let genresDropdown = document.querySelector('.genres-dropdown');
   let yearDropdown = document.querySelector('.years-dropdown');
   let ratingDropdown = document.querySelector('.rating-dropdown');

   genresDropdown.querySelector('.dropdown-content-extra').textContent = valuesObj.genres
      .toString()
      .replaceAll(',', ', ');
   yearDropdown.querySelector('.dropdown-content-extra').textContent = valuesObj.year;
   if (valuesObj.rate == 'less 6' || valuesObj.rate == 'All ratings') {
      ratingDropdown.querySelector('.dropdown-content-extra').textContent = valuesObj.rate;
   } else {
      ratingDropdown.querySelector('.dropdown-content-extra').textContent = `${valuesObj.rate}+`;
   }
}
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
let modalImg = modalContent.querySelector('img');
let modalTitle = modalContent.querySelector('#tvTitle');
let modalYear = modalContent.querySelector('#tvYear');
let modalGenres = modalContent.querySelector('#tvGenres');
let modalCountry = modalContent.querySelector('#tvCountry');
let modalStatus = modalContent.querySelector('#tvStatus');
let modalRate = modalContent.querySelector('#tvRate');
let modalDesc = modalContent.querySelector('#tvDesc');
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
      let id = e.target.closest('.media-element').dataset.id;
      body.classList.add('modal-opened');
      document.documentElement.classList.add('behavior-instant');
      fillUpModalInfo(id);

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
   setTimeout(() => {
      document.documentElement.classList.remove('behavior-instant');
   }, 500);
}
function fillUpModalInfo(showId) {
   let showPosition = binarySearchShow(allShowsContainer, showId);
   let showData = allShowsContainer[showPosition];
   console.log(showData);
   modalImg.src = showData.image.original;
   modalTitle.textContent = showData.name;
   modalYear.textContent = showData.premiered.slice(0, 4);
   if (showData.genres.length < 1) {
      modalGenres.textContent = 'No genre';
   } else {
      modalGenres.textContent = showData.genres.toString().replaceAll(',', ', ');
   }
   modalCountry.textContent = showData.network.country.name;
   modalStatus.textContent = showData.status;
   if (showData.rating.average === null) {
      modalRate.textContent = 'No rating';
   } else {
      modalRate.textContent = showData.rating.average;
   }
   modalDesc.innerHTML = showData.summary;
}
function binarySearchShow(showsList, showId) {
   let start = 0;
   let end = showsList.length - 1;
   let mid;
   showId = parseInt(showId);

   while (start <= end) {
      mid = Math.round((end - start) / 2) + start;
      if (showId == showsList[mid].id) {
         return mid;
      } else if (showId < showsList[mid].id) {
         end = mid - 1;
      } else {
         start = mid + 1;
      }
   }
   return -1;
}
// go up btn
const goUpBtn = document.querySelector('.go-up-btn');
// сделать функцию фротл или дебаунс
goUpBtn.addEventListener('click', () => {
   window.scrollTo(0, 0);
});

const throttle = (func, delay) => {
   let shouldWait = false;
   let lastValue;
   const timeoutFunc = () => {
      if (lastValue == null) {
         shouldWait = false;
      } else {
         func(...lastValue);
         lastValue = null;
         setTimeout(timeoutFunc, delay);
      }
   };
   return (...args) => {
      if (shouldWait) {
         lastValue = args;
         return;
      }

      func(...args);
      shouldWait = true;
      setTimeout(timeoutFunc, delay);
   };
};
function getWindowScroll() {
   let verticalScroll = window.scrollY;
   if (verticalScroll > 400) {
      goUpBtn.classList.add('active');
      return;
   }
   goUpBtn.classList.remove('active');
}
window.addEventListener('load', init);
