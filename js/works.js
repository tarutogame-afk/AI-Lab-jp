const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.global-nav');
const worksGrid = document.querySelector('[data-works-grid]');
const works = [...window.WORKS].sort((a, b) => b.displayOrder - a.displayOrder);

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

worksGrid.innerHTML = works.map((work, index) => `
  <article class="work-item${index === 0 || index === 4 ? ' work-item-featured' : ''}">
    <button class="work-image-button" type="button" data-work-index="${index}" aria-label="${work.title}を拡大表示">
      <span class="work-image-frame">
        <img src="${work.image}" alt="${work.title}" loading="${index < 2 ? 'eager' : 'lazy'}">
        <span class="work-image-placeholder" aria-hidden="true"><b>${work.id}</b><small>IMAGE COMING SOON</small></span>
        <span class="work-view">VIEW</span>
      </span>
    </button>
    <div class="work-caption"><span>${work.id}</span><div><h2>${work.title}</h2><p>${work.category} / ${work.date}</p></div></div>
  </article>
`).join('');

worksGrid.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => image.closest('.work-image-frame').classList.add('is-missing'));
});

const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxTitle = document.querySelector('[data-lightbox-title]');
const lightboxMeta = document.querySelector('[data-lightbox-meta]');
const lightboxCounter = document.querySelector('[data-lightbox-counter]');
const lightboxClose = document.querySelector('[data-lightbox-close]');
const lightboxPrevious = document.querySelector('[data-lightbox-previous]');
const lightboxNext = document.querySelector('[data-lightbox-next]');
let activeWorkIndex = 0;
let lastFocusedElement = null;
let touchStartX = 0;

const renderLightbox = () => {
  const work = works[activeWorkIndex];
  lightboxImage.src = work.image;
  lightboxImage.alt = work.title;
  lightboxTitle.textContent = work.title;
  lightboxMeta.textContent = `${work.category} / ${work.date}`;
  lightboxCounter.textContent = `${String(activeWorkIndex + 1).padStart(2, '0')} / ${String(works.length).padStart(2, '0')}`;
};

const openLightbox = (index, trigger) => {
  activeWorkIndex = index;
  lastFocusedElement = trigger;
  renderLightbox();
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
};

const closeLightbox = () => {
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  lastFocusedElement?.focus();
};

const moveLightbox = (direction) => {
  activeWorkIndex = (activeWorkIndex + direction + works.length) % works.length;
  renderLightbox();
};

worksGrid.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-work-index]');
  if (trigger) openLightbox(Number(trigger.dataset.workIndex), trigger);
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrevious.addEventListener('click', () => moveLightbox(-1));
lightboxNext.addEventListener('click', () => moveLightbox(1));
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 55) moveLightbox(distance > 0 ? -1 : 1);
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});
