const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.global-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.classList.toggle('open');
  navigation.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.classList.remove('open');
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'メニューを開く');
  });
});

document.querySelector('[data-vote]').addEventListener('click', (event) => {
  event.currentTarget.innerHTML = 'VOTING OPENS SOON <span>♡</span>';
});

const characterCarousel = document.querySelector('[data-character-carousel]');
const scrollCharacters = (direction) => {
  const card = characterCarousel.querySelector('.character-card');
  const track = characterCarousel.querySelector('.character-grid');
  const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
  characterCarousel.scrollLeft += direction * (card.offsetWidth + gap);
};

document.querySelector('[data-character-prev]').addEventListener('click', () => scrollCharacters(-1));
document.querySelector('[data-character-next]').addEventListener('click', () => scrollCharacters(1));
