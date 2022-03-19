// Hero slider code
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

// media scrollers sections code

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

// Подумать как сделать единый медиа скроллер код для всех скроллеров на странице
// использовать дата атрибуты? или поиск по родителю

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
