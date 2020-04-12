import $ from 'jquery';

const fillOutForm = (data) => {
  const title = $('#title');
  console.log(title);
  $('#title').text(data.find((d) => d.field === 'title').data || '');
};

window.addEventListener('message', ({ data }) => {
  console.log('fill');
  console.log(data);
  if (data.formData) fillOutForm(data.formData);
}, false);
