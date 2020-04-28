import $ from 'jquery';
import _ from 'lodash';

import { FormData, Formats } from './types';

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

  title && $('#title').val(title);

  const [month, day, year] = date.split('/');

  month && $('#month').val(month);
  day && $('#day').val(day);
  year && $('#year').val(year);

  if (type) {
    const container = $(`label[for*='category']:contains('${type}')`);
    if (container) {
      const inputs = container.find('input');
      inputs.length && inputs[0].click();
    }
  }

  if (label) {
    $('#searchterm').val(label);

    $('#labellist').one('load', () => {
      const results = $('#labellist').contents().find('.infobox');
      const top = $(results.get(0));

      if (top) {
        const labelIdText = top.attr('id');
        const matches = labelIdText.match(/\d+/);

        top && top.parent().parent().parent().click();

        if (matches) $('#label').val(matches[0]);
      }
    });

    $('td > .gosearch > .button').click();
  }

  $('#catalog_no').val(catalogId);

  countries && countries.length && $('#countries').val(countries.join(', '));

  if (format) {
    const container = $(`.submit_field_content:nth-child(3) label:contains('${format}')`);
    if (container) {
      const inputs = container.find('input');
      inputs.length && inputs[0].click();
    }
  }

  if (format === Formats.Vinyl) {
    if (discSize) {
      const container = $(`.submit_field_content:nth-child(6) tr:nth-child(1) label:contains('${discSize}')`);
      if (container) {
        const inputs = container.find('input');
        inputs.length && inputs[0].click();
      }
    } else {
      $('#disc_size88').click();
    }

    if (discSpeed) {
      const container = $(`#attrib_cat_45 label:contains('${discSpeed}')`);
      if (container) {
        const inputs = container.find('input');
        inputs.length && inputs[0].click();
      }
    }
  } else if (format === Formats.DigitalFile) {
    $('#attrib123').click(); // assume Streaming
  }

  if (tracks.length) {
    const baseRow = $('#track_base');
    const prefix = 'track_';
    let counter = 2;

    const setAttrs = (elm: JQuery<HTMLElement>) => {
      const elmId = elm.attr('id');
      elm.attr('id', `${prefix}${elmId}${counter}`);
      elm.attr('name', `${prefix}${elmId}${counter}`);
    };

    tracks.forEach((track, i) => {
      const newRow = baseRow.clone(true, true);
      counter++;

      $('#track_num').val(counter);

      newRow.attr('id', `${prefix}${counter}`);
      newRow.css('display', '');

      const cells = newRow.find('td');

      const btn = cells.eq(0).find('input');
      btn.attr('id', `${prefix}delete_track${counter}`);
      btn.attr('name', `${prefix}delete_track${counter}`);

      const pos = cells.eq(1).find('input');
      setAttrs(pos);
      pos.val(track.position ? track.position : i + 1);

      const name = cells.eq(2).find('input');
      setAttrs(name);
      name.val(`${track.artist ? `${track.artist} - ` : ''}${track.title}`);
      // TODO insert artist links

      const length = cells.eq(3).find('input');
      setAttrs(length);
      length.val(track.duration);

      newRow.insertBefore(baseRow);
    });
  }

  $('#notes').val(url);

  $('html, body').scrollTop($(document).height());

  // preview hack to bind label
  const t1 = setTimeout(() => {
    $('#previewbtn').click();

    const t2 = setTimeout(() => {
      $('#previewbtn').click();
      $('#previewbtn').off('click');
      clearTimeout(t1);
      clearTimeout(t2);
    }, 2000);
  }, 1500);
};

window.addEventListener('message', ({ data }) => {
  $(document).ready(() => {
    if (data.formData && !data.isFilled) {
      fillOutForm(data.formData);
    }
  });
}, false);
