import axios from 'axios';

export class PIXABAY_API {
  constructor() {
    this.BASE_URL = 'https://pixabay.com/api/';
    this.END_POINT = '';
  }
  getImages(image) {
    const params = {
      q: image,
      image_type: 'photo',
      key: '42190247-000e45a6447d3626b5dd5a4c9',
      orientation: 'horizontal',
      safesearch: true,
    };

    const url = `${this.BASE_URL}${this.END_POINT}?${params}`;
    return axios.get(url, { params }).then(res => res.data);
  }
}
