'use strict';
import axios from 'axios';

export class PIXABAY_API {
  static PAGE_SIZE = 60;
  constructor() {
    this.BASE_URL = 'https://pixabay.com/api/';
    this.END_POINT = '';
    this.query = null;
    this.page = 1;
    this.totalHits = 0;
  }
  setDefaults() {
    this.page = 1;
    this.totalHits = 0;
  }
  async getImages() {
    const params = {
      q: this.query,
      image_type: 'photo',
      key: '42190247-000e45a6447d3626b5dd5a4c9',
      orientation: 'horizontal',
      safesearch: true,
      page: this.page,
      per_page: PIXABAY_API.PAGE_SIZE,
    };

    const url = `${this.BASE_URL}${this.END_POINT}?${params}`;
    const res = await axios.get(url, { params });
    this.totalHits = res.data.totalHits;
    return res.data;
  }
  isLastPage() {
    const maxPage = Math.ceil(this.totalHits / PIXABAY_API.PAGE_SIZE);
    return maxPage <= this.page;
  }
}
