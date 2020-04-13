import $ from 'jquery';

window.addEventListener('message', (message) => {
  console.log('fill');
  console.log(message);
  const { data } = message;
  if (data.formData) fillOutForm(data.formData);
}, false);

const fillOutForm = (data) => {
  const title = $('#title');
  console.log(data);
  $('#title').text(data.find((d) => d.field === 'title').data || '');
};
