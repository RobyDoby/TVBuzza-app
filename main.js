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
// navbar burger menu code

const navBurgerMenu = document.querySelector('.burger-menu');
const closeNavBtn = document.querySelector('.close-nav-btn');
const navList = document.querySelector('.nav-list');

navList.addEventListener('click', (e) => {
   if (e.target.classList.contains('nav-list__links')) {
      closeNav();
   }
});
navBurgerMenu.addEventListener('click', () => {
   navList.classList.add('active');
});
closeNavBtn.addEventListener('click', closeNav);

function closeNav() {
   navList.classList.remove('active');
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
// fetching embedded data for current show
const fetchEmbedded = async (url) => {
   try {
      const response = await fetch(`${url}?embed[]=seasons&embed[]=cast`);
      const data = await response.json();
      // console.log(data._embedded.cast);
      return data;
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
      let btn = card.querySelector('[data-modal-btn]');

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
      if (context.hasAttribute('data-scroller')) {
         btn.setAttribute('tabindex', -1);
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

   let filteredByGenre = shows.filter((show) => {
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
   let filteredByGenreAndYear = filteredByGenre.filter((show) => {
      if (yearValues == 'All years') {
         return show.premiered.slice(0, 4) <= 2020;
      }
      if (yearValues == 'before 2000') {
         return show.premiered.slice(0, 4) < 2000;
      }
      return show.premiered.slice(0, 4) == yearValues;
   });
   let filteredByGenreAndYearAndRate = filteredByGenreAndYear.filter((show) => {
      if (ratingValues == 'All ratings') {
         return show.rating.average <= 10;
      }
      if (ratingValues == 'Less 6') {
         return show.rating.average < 6;
      }
      if (ratingValues == 'No rating') {
         return show.rating.average == null;
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
const mediaScrollerContainer = document.querySelector('.scroller-container');
const scrollerSections = document.querySelectorAll('.scroller-section');

scrollerSections.forEach((section) => {
   section.addEventListener('mouseover', throttle(showProgressBar, 1000));

   function showProgressBar() {
      section.querySelector('.scroller-progress-bar').classList.add('active');
   }
});
scrollerSections.forEach((section) => {
   section.addEventListener('mouseleave', throttle(hideProgressBar, 1000));

   function hideProgressBar() {
      section.querySelector('.scroller-progress-bar').classList.remove('active');
   }
});

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
   let closestScroller = e.target
      .closest('[data-scroller-container]')
      .querySelector('.media-scroller');

   let slideIndex = parseInt(getComputedStyle(closestScroller).getPropertyValue('--slide-index'));
   let itemsPerScreen = parseInt(
      getComputedStyle(document.body).getPropertyValue('--items-per-screen')
   );
   let closestProgressBar = e.target.closest('.wrapper').querySelector('.scroller-progress-bar');
   closestProgressBar.textContent = `${itemsPerScreen * slideIndex} / ${
      closestScroller.children.length - 1
   }`;
   closestProgressBar.classList.add('active');
   closestScroller.style.setProperty('--slide-index', slideIndex - 1);

   if (slideIndex <= 1) {
      let closestLeftArrow = e.target
         .closest('[data-scroller-container]')
         .querySelector('.media-scroller-arrow.left');
      closestLeftArrow.setAttribute('disabled', '');
      return;
   } else {
      let closestRightArrow = e.target
         .closest('[data-scroller-container]')
         .querySelector('.media-scroller-arrow.right');
      closestRightArrow.removeAttribute('disabled');
      e.target.removeAttribute('disabled');
   }
}
function scrollRight(e) {
   let closestScroller = e.target
      .closest('[data-scroller-container]')
      .querySelector('.media-scroller');

   let slideIndex = parseInt(getComputedStyle(closestScroller).getPropertyValue('--slide-index'));
   closestScroller.style.setProperty('--slide-index', slideIndex + 1);
   slideIndex = slideIndex + 1;

   let itemsPerScreen = parseInt(
      getComputedStyle(document.body).getPropertyValue('--items-per-screen')
   );
   let closestProgressBar = e.target.closest('.wrapper').querySelector('.scroller-progress-bar');
   closestProgressBar.textContent = `${itemsPerScreen * (slideIndex + 1)} / ${
      closestScroller.children.length - 1
   }`;
   closestProgressBar.classList.add('active');

   let itemsLengthIndex = (closestScroller.children.length - 1) / itemsPerScreen;

   if (slideIndex >= Math.ceil(itemsLengthIndex - 1) || slideIndex === itemsLengthIndex - 1) {
      let closestRightArrow = e.target
         .closest('[data-scroller-container]')
         .querySelector('.media-scroller-arrow.right');
      closestRightArrow.setAttribute('disabled', '');
      closestProgressBar.textContent = `${closestScroller.children.length - 1} / ${
         closestScroller.children.length - 1
      }`;
      return;
   } else {
      let closestLeftArrow = e.target
         .closest('[data-scroller-container]')
         .querySelector('.media-scroller-arrow.left');
      closestLeftArrow.removeAttribute('disabled');
      e.target.removeAttribute('disabled');
   }
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
      strictModeChange();
      e.stopPropagation();
   }
});
function strictModeChange() {
   if (strictMode === false) {
      strictMode = true;
      return;
   }
   strictMode = false;
}
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
   if (
      valuesObj.rate == 'Less 6' ||
      valuesObj.rate == 'All ratings' ||
      valuesObj.rate == 'No rating'
   ) {
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
let modalSeasons = modalContent.querySelector('#tvSeasons');
let modalCountry = modalContent.querySelector('#tvCountry');
let modalStatus = modalContent.querySelector('#tvStatus');
let modalRating = modalContent.querySelector('.tvRating');
let ratingActive = modalRating.querySelector('.rating-active');
let ratingValue = modalRating.querySelector('.rating-value');
let modalDesc = modalContent.querySelector('#tvDesc');
let modalCast = modalContent.querySelector('.cast');
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

      modalContent.scrollTop = 0;
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
async function fillUpModalInfo(showId) {
   let showPosition = binarySearchShow(allShowsContainer, showId);
   let showData = allShowsContainer[showPosition];
   let url = showData._links.self.href;
   let embeddedData = await fetchEmbedded(url);

   modalImg.src = showData.image.original;
   modalTitle.textContent = showData.name;
   modalYear.textContent = showData.premiered.slice(0, 4);
   if (showData.genres.length < 1) {
      modalGenres.textContent = 'No genre';
   } else {
      modalGenres.textContent = showData.genres.toString().replaceAll(',', ', ');
   }
   modalSeasons.textContent = embeddedData._embedded.seasons.length;
   modalCountry.textContent = showData.network.country.name;
   modalStatus.textContent = showData.status;
   let rate = getShowRating(showData.rating.average);
   if (rate === -1) {
      ratingValue.textContent = 'No rating';
   } else {
      ratingValue.textContent = rate;
   }
   modalDesc.innerHTML = showData.summary;
   let castList = fillUpCast(embeddedData._embedded.cast);
   modalCast.innerHTML = '';
   modalCast.append(castList);
}
function fillUpCast(cast) {
   let ul = document.createElement('ul');
   ul.classList.add('cast-items');
   cast.forEach((actor) => {
      let li = document.createElement('li');
      li.classList.add('cast-item');
      let img = document.createElement('img');
      if (actor.person?.image?.medium === undefined) {
         img.src = './image/Dummy-Person.png';
      } else {
         img.src = actor.person.image.medium;
      }
      let actorName = document.createElement('h3');
      actorName.classList.add('c-accent');
      actorName.textContent = actor.person.name;
      let character = document.createElement('p');
      character.textContent = actor.character.name;
      li.append(img);
      li.append(actorName);
      li.append(character);
      ul.append(li);
   });
   return ul;
}
function getShowRating(showRating) {
   if (showRating === null) {
      return -1;
   }
   let ratingActiveWidth = showRating / 0.1;
   ratingActive.style.width = `${ratingActiveWidth}%`;
   return showRating;
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

function getWindowScroll() {
   let verticalScroll = window.scrollY;
   if (verticalScroll > 1000) {
      goUpBtn.classList.add('active');
      return;
   }
   goUpBtn.classList.remove('active');
}

// credits section code
// validation
const contactForm = document.querySelector('.contact-form form');
const contactFormInputs = document.querySelectorAll('.contact-form-input');

contactFormInputs.forEach((input) => {
   input.addEventListener('input', function (event) {
      if (input.validity.valid) {
         let emailError = input.nextElementSibling;
         emailError.textContent = '';
         emailError.className = 'form-error';
      } else {
         showError(input, input.name);
      }
   });
});

contactForm.addEventListener('submit', function (event) {
   contactFormInputs.forEach((input) => {
      if (!input.validity.valid) {
         showError(input, input.name);
         event.preventDefault();
      } else {
         contactForm.setAttribute('method', 'post');
         contactForm.setAttribute('name', 'myemailform');
         contactForm.setAttribute('target', '_blank');
         contactForm.setAttribute(
            'action',
            'https://public.herotofu.com/v1/6e75d550-f3e1-11ec-95d6-ef970076a4ff'
         );
      }
   });
   contactFormInputs.forEach((input) => {
      input.value = '';
   });
});

function showError(input, name) {
   let emailError = input.nextElementSibling;
   if (input.validity.valueMissing) {
      emailError.textContent = `You need to enter the ${name}`;
   } else if (input.validity.typeMismatch) {
      emailError.textContent = 'Entered value needs to be an e-mail address.';
   }
   emailError.className = 'form-error active';
}
// change count of entered characters
const contactFormTextArea = document.querySelector('#contact-form-message');
const currentSymbolVal = document.querySelector('.current');
contactFormTextArea.addEventListener('input', (e) => {
   currentSymbolVal.textContent = e.target.value.length;
});
// update copyright year
function updateCopyrightYear() {
   const copyrightYear = document.querySelector('.copyright-year');
   let year = new Date().getFullYear();
   copyrightYear.textContent = year;
}
updateCopyrightYear();
window.addEventListener('load', init);
