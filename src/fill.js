import $ from 'jquery';
import _ from 'lodash';

const fillOutForm = (data) => {
  const {
    url,
    artist,
    id,
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

  console.info(data);

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

  if (label) {
    $('#searchterm').val(label);

    const iframe = $('#labellist');

    iframe.on('load', () => { // capture iframe update
      const results = iframe.contents().find('.infobox');
      results.length && results[0].parentElement.parentElement.parentElement.click();
    });

    $('td > .gosearch > .button').click();
  }

  $('#catalog_no').val(catalogId);

  countries.length && $('#countries').val(countries.join(', '));

  if (format) {
    const container = $(`.submit_field_content:nth-child(3) label:contains('${format}')`);
    if (container) {
      const inputs = container.find('input');
      inputs.length && inputs[0].click();
    }
  }

  if (format === 'Vinyl') {
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
  }

  if (tracks.length) {
    const baseRow = $('#track_base');
    const prefix = 'track_';
    let counter = 3;

    const setAttrs = (elm) => {
      const elmId = elm.attr('id');
      elm.attr('id', `${prefix}${elmId}${counter}`);
      elm.attr('name', `${prefix}${elmId}${counter}`);
    };

    tracks.forEach((track, i) => {
      const row = baseRow.clone(true, true);
      row.attr('id', `${prefix}${counter}`);
      row.attr('style', '');
      row.insertBefore(baseRow);

      const cells = row.find('td');

      const btn = cells.eq(0).find('input');
      setAttrs(btn);

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

      counter++;
    });
  }

  $('#notes').val(url);

  $('#previewbtn').click();
  $('html, body').scrollTop($(document).height());
};

window.addEventListener('message', ({ data }) => {
  $(document).ready(() => { if (data.formData) fillOutForm(data.formData); });
}, false);
