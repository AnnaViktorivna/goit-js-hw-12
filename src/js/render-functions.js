export { renderImage };

// render js
function renderImage(data) {
  return imagesTemplate(data.hits);
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
