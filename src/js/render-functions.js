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
};

refs.formEl.addEventListener('submit', formSubmit);

async function formSubmit(e) {
  e.preventDefault();
  const imgName = e.target.elements.query.value;
  refs.loaderEl.style.display = 'block';
  clearGallery();
  try {
    const searchData = await pixabay_api.getImages(imgName);
    await renderImage(searchData);
    gallerySimpleLightbox.refresh();
    gallerySimpleLightbox.on('error.simplelightbox', function (e) {
      console.log(e);
    });
  } catch (error) {
    handleError();
  } finally {
    refs.loaderEl.style.display = 'none';
    clearInput();
  }
}

function renderImage(data) {
  if (data.hits.length === 0) {
    return iziToast.error({
      message:
        'Sorry, there are no images matching your search query. Please try again!',
    });
  } else {
    const markup = imagesTemplate(data.hits);
    refs.listEl.innerHTML = markup;
  }
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
function handleError() {
  iziToast.error({
    message: 'An error occurred. Please try again later.',
  });
}
