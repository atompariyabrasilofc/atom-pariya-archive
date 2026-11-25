const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('#nav');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}));

// Peachy rotation: only standard and Brazil artwork. Peru, Mexico, specials and "modelo 0 - nao usar" are intentionally excluded.
const peachyImages = [
  ...[6,7,8,9,10,11,26,27,28,29,30,31,32,37,39,41].map(n => `1.%20assets/Peachy/Padrao/${n}.png`),
  ...[1,2,3,4,12,13,14,15].map(n => `1.%20assets/Peachy/Brasil/${n}.png`)
];
const peachyImage = document.querySelector('#peachy-rotator');
if (peachyImage) {
  let peachyIndex = 0;
  window.setInterval(() => {
    peachyImage.classList.add('changing');
    window.setTimeout(() => {
      peachyIndex = (peachyIndex + 1) % peachyImages.length;
      peachyImage.src = peachyImages[peachyIndex];
      peachyImage.classList.remove('changing');
    }, 450);
  }, 4500);
}
