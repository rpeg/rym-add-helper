import $ from 'jquery';
import _ from 'lodash';

import { FormData } from './app/types';

const fillOutForm = (data: FormData) => {
  const {
    url,
    title,
    date,
    type,
    format,
    discSize,
    discSpeed,
    label,
    catalogId,
    countries,
    tracks,
  } = data;

  let isAwaitingLabel = false;

  title && $('#title').val(title);

  date.month && $('#month').val(date.month);
  date.day && $('#day').val(date.day);
  date.year && $('#year').val(date.year);

  if (type) {
    const container = $(`label[for*='category']:contains('${type}')`);
    if (container) {
      const inputs = container.find('input');
      inputs.length && inputs[0].click();
    }
  }

  // search label name and choose top match if any
  if (label) {
    isAwaitingLabel = true;

    $('#searchterm').val(label);

    $('td > .gosearch > .button').click();

    $('#labellist').on('load', () => { // capture iframe update
      const results = $('#labellist .infobox');
      results.length && results[0].parentElement.parentElement.parentElement.click();

      isAwaitingLabel = false;
    });
  }

  $('#catalog_no').val(catalogId);

  countries.length && $('#countries').val(countries.join(', '));

  if (format === 'Vinyl') {
    if (discSize) {
      const container = $(`.submit_field_content:nth-child(6) tr:nth-child(1) label:contains('${discSize}')`);

      if (container) {
        const inputs = container.find('input');
        inputs.length && inputs[0].click();
      }
    }

    if (discSpeed) {
      const container = $(`#attrib_cat_45 label:contains('${discSpeed}')`);
      if (container) {
        const inputs = container.find('input');
        inputs.length && inputs[0].click();
      }
    }
  }

  tracks.length && $('#track_advanced').val(tracks.join('\n'));

  $('#notes').val(url);

  if (!isAwaitingLabel) {
    $('#previewbtn').click();
  }
};

window.addEventListener('message', ({ data }) => {
  if (data.formData) fillOutForm(data.formData);
}, false);
