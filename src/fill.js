import $ from 'jquery';

const fillOutForm = (data) => {
  console.log(data);

  $('#title').val(data.title || '');
};

window.addEventListener('message', ({ data }) => {
  if (data.formData) fillOutForm(data.formData);
}, false);
