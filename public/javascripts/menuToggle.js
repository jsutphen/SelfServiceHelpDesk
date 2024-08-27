const menuToggle = document.querySelector('#menuToggle');
const nav = document.querySelector('nav');

menuToggle.addEventListener('click', () => {
  nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
});

function initLayout() {
  const gridContainer = document.querySelector('#gridContainer');
  if (gridContainer.clientWidth < 800) {
    nav.style.display = 'none';
    menuToggle.style.display = 'block';
  } else {
    nav.style.display = 'block';
    menuToggle.style.display = 'none';
  }
}

window.onresize = initLayout;

window.onload = initLayout;
