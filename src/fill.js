import $ from 'jquery';

window.addEventListener('message', ({ data }) => {
  if (data.formData) fillOutForm(data.formData);
}, false);

const fillOutForm = (data) => {
  console.log(data);
  $('#title').val(data.title || '');
};
