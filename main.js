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
      modal.classList.add('visible');
   }
}
function closeModal() {
   modal.classList.remove('visible');
}

// Набросок для темплейта

// const body = document.querySelector('body');

// let getData = function () {
//    fetch('https://api.tvmaze.com/shows')
//       .then((res) => res.json())
//       .then((data) => {
//          console.log(data);
//          data.forEach((show) => {
//             let image = document.createElement('img');
//             image.setAttribute('src', `${show.image.medium}`);
//             body.append(image);
//          });
//       });
// };
// getData();
