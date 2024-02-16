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
    showError('Your query is empty! Please try enter your query again!');
    return;
  }

  pixabay_api.query = imgName;

  clearInput();

  loadImages();
}

async function onLoaderMoreClick() {
  //   e.preventDefault();

  pixabay_api.page += 1;
  loadImages();
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
    refs.listEl.insertAdjacentHTML('beforeend', markup);

    gallerySimpleLightbox.refresh();
    showLoadBtnIfNeeded();
    checkEndOfCollection();

    // Отримуємо висоту однієї карточки галереї
    const cardHeight = document
      .querySelector('.gallery-item')
      .getBoundingClientRect().height;

    // Плавна прокрутка сторінки на дві висоти карточки галереї
    window.scrollBy({
      top: cardHeight * 2, // Прокрутити на дві висоти карточки галереї
      behavior: 'smooth', // Плавна анімація
    });
  } catch (error) {
    showError('An error occurred. Please try again later.');
  } finally {
    refs.loaderEl.style.display = 'none';
  }
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
