const HOVER_CLASS = 'rym__hover';


document.addEventListener('mouseover', (e) => {
  e.srcElement.classList.add(HOVER_CLASS);
}, false);

document.addEventListener('mouseout', (e) => {
  e.srcElement.classList.remove(HOVER_CLASS);
}, false);

document.addEventListener('click', (e) => {

}, false);
