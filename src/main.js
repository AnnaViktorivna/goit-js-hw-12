import SimpleLightbox from 'simplelightbox';
import iziToast from 'izitoast';
import { PIXABAY_API } from './js/pixabay-api';
import { renderImage } from './js/render-functions.js';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';

const pixabay_api = new PIXABAY_API();

const gallerySimpleLightbox = new SimpleLightbox('.js-gallery a.link-item', {
  /* options */
  navText: ['←', '→'],
  closeText: '×',
  enableKeyboard: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});
const refs = {
  formEl: document.querySelector('.js-search-form[data-id="1"]'),
  listEl: document.querySelector('.js-gallery'),
  inputEl: document.querySelector('.js-input'),
  loaderEl: document.querySelector('.js-loader'),
  btnLoader: document.querySelector('#js-btn-load'),
  targetElem: document.querySelector('#observer'),
};

refs.formEl.addEventListener('submit', formSubmit);
refs.btnLoader.addEventListener('click', onLoaderMoreClick);

async function formSubmit(e) {
  e.preventDefault();

  clearGallery();

  pixabay_api.setDefaults();

  let imgName = e.target.elements.query.value;
  imgName = imgName ? imgName.trim() : '';
  if (imgName === '') {
    showLoadBtnIfNeeded();
    showError('Enter correct data!');
    return;
  }

  pixabay_api.query = imgName;

  clearInput();

  loadImages();
}

async function onLoaderMoreClick(e) {
  if (e) {
    e.preventDefault();
  }
  pixabay_api.page += 1;
  if (e && e.target.id === 'js-btn-load') {
    loadImages();
  }
}

async function loadImages() {
  refs.loaderEl.style.display = 'block';

  try {
    const searchData = await pixabay_api.getImages();
    if (searchData.hits.length === 0) {
      showError('no data on your search query');
      return;
    }

    const markup = await renderImage(searchData);
    refs.listEl.innerHTML += markup;

    gallerySimpleLightbox.refresh();
    showLoadBtnIfNeeded();
    checkEndOfCollection();
  } catch (error) {
    showError('An error occurred. Please try again later.');
  } finally {
    refs.loaderEl.style.display = 'none';
  }
  observerCkeckedLastPage();
}

function clearGallery() {
  refs.listEl.innerHTML = '';
}
function clearInput() {
  refs.inputEl.value = null;
}
function showError(error) {
  iziToast.error({
    message: error,
  });
}

function showMessage(msg) {
  iziToast.info({
    message: msg,
  });
}

function checkEndOfCollection() {
  if (pixabay_api.isLastPage()) {
    showMessage(`We're sorry, but you've reached the end of search results.`);
  }
}

function showLoadBtnIfNeeded() {
  if (pixabay_api.isLastPage()) {
    refs.btnLoader.classList.add('hidden');
  } else {
    refs.btnLoader.classList.remove('hidden');
  }
}

function observerCkeckedLastPage() {
  if (pixabay_api.isLastPage()) observer.unobserve(refs.targetElem);
}

const options = {
  root: document.querySelector('#scrollArea'),
  rootMargin: '0px',
  threshold: 1.0,
};
const callback = function (entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      onLoaderMoreClick();
      observerCkeckedLastPage();
    }
  });
};
const observer = new IntersectionObserver(callback, options);

observer.observe(refs.targetElem);
