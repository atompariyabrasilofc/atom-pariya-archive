const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#nav');
const brand=document.querySelector('.brand');
const profileHome=document.querySelector('#home-cards');
const pageSections=[...document.querySelectorAll('main > section')].filter(section=>section!==profileHome && !section.classList.contains('hero') && !section.classList.contains('intro'));

function showPage(target) {
  const isHome = target === 'home-cards' || !target;
  profileHome.classList.toggle('page-active', isHome);
  profileHome.classList.toggle('page-hidden', !isHome);
  pageSections.forEach(section => {
    const active = !isHome && section.id === target;
    section.classList.toggle('page-active', active);
    section.classList.toggle('page-hidden', !active);
  });
  nav.querySelectorAll('a').forEach(link => {
    const active = link.getAttribute('href') === (isHome ? '#home-cards' : '#'+target);
    if (active) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  window.scrollTo({top:0,behavior:'smooth'});
}

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const target = link.getAttribute('href').slice(1);
  showPage(target);
  history.replaceState(null,'','#'+target);
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded','false');
}));
brand.addEventListener('click', event => {
  event.preventDefault();
  showPage('home-cards');
  history.replaceState(null,'','#home-cards');
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded','false');
});
toggle.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded',String(open));
});
showPage(location.hash ? location.hash.slice(1) : 'home-cards');

document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}));

// Peachy artwork interaction and rotation. Only standard and Brazil artwork are included.
const peachyImages = [
  ...[6,7,8,26,27,28,29,30,31,32,37,39,41].map(n => `1.%20assets/Peachy/Padrao/${n}.png`),
  ...[1,2,3,4,12,13,14,15].map(n => `1.%20assets/Peachy/Brasil/${n}.png`)
];
const peachyImage = document.querySelector('#peachy-rotator');
if (peachyImage) {
  let peachyIndex = 0;
  let holdTimer = null;
  let longPress = false;
  const holdDuration = 500;
  function showNextPeachy() {
    peachyImage.classList.add('changing');
    window.setTimeout(() => {
      peachyIndex = (peachyIndex + 1) % peachyImages.length;
      peachyImage.src = peachyImages[peachyIndex];
      peachyImage.classList.remove('changing');
    }, 180);
  }
  function startHold() {
    longPress = false;
    holdTimer = window.setTimeout(() => {
      longPress = true;
      peachyImage.classList.add('expanded');
      if (navigator.vibrate) navigator.vibrate(45);
    }, holdDuration);
  }
  function endHold() {
    if (holdTimer) window.clearTimeout(holdTimer);
    holdTimer = null;
    peachyImage.classList.remove('expanded');
  }
  peachyImage.addEventListener('pointerdown', startHold);
  peachyImage.addEventListener('pointerup', endHold);
  peachyImage.addEventListener('pointercancel', endHold);
  peachyImage.addEventListener('pointerleave', endHold);
  peachyImage.addEventListener('contextmenu', event => event.preventDefault());
  peachyImage.addEventListener('click', () => {
    if (longPress) { longPress = false; return; }
    showNextPeachy();
  });
  peachyImage.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showNextPeachy();
    }
  });
  window.setInterval(showNextPeachy, 4500);
}


// Timeline photo rotation: six Social Death Vote photos, one every six seconds.
document.querySelectorAll('[data-slideshow="social-death-vote"]').forEach(slideshow => {
  const slides = [...slideshow.querySelectorAll('.timeline-slide')];
  let current = 0;
  if (slides.length > 1) {
    window.setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 6000);
  }
});
