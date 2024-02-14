import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
// import axios from 'axios';
import { PIXABAY_API } from './pixabay-api';
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
refs.btnLoader.addEventListener('click', onLoaderMoreClick);

async function onLoaderMoreClick(e) {
  if (e) {
    e.preventDefault();
  }

  if (e && e.target.id === 'js-btn-load') {
    loadImages();
  }
  pixabay_api.page += 1;
}

async function loadImages() {
  refs.loaderEl.style.display = 'block';

  try {
    const searchData = await pixabay_api.getImages();
    if (searchData.hits.length === 0) {
      showError('no data on your search query');
      return;
    }

    await renderImage(searchData);
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

function renderImage(data) {
  const markup = imagesTemplate(data.hits);
  refs.listEl.innerHTML += markup;
}

function imagesTemplate(images) {
  return images.map(imageTemplate).join('');
}

function imageTemplate(img) {
  const {
    largeImageURL,
    likes,
    views,
    webformatURL,
    tags,
    comments,
    downloads,
  } = img;

  return `<li class="gallery-item">
    <a class="link-item" href="${largeImageURL}"><img class="gallery-img" src="${webformatURL}" alt="${tags}" title=""/></a>
      <div class="info">
        <p class="info-item"><b>Likes</b><br>${likes}</p>
        <p class="info-item"><b>Views</b><br>${views}</p>
        <p class="info-item"><b>Comments</b><br>${comments}</p>
        <p class="info-item"><b>Downloads</b><br>${downloads}</p>
      </div>
    </li>`;
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
