const page = document.querySelector('[data-character-page]');
const notFound = document.querySelector('[data-character-not-found]');
const characterId = new URLSearchParams(window.location.search).get('id');
const character = window.CHARACTERS.find((item) => item.id === characterId);

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.global-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.classList.toggle('open');
  navigation.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
});

if (!character) {
  notFound.hidden = false;
} else {
  page.hidden = false;
  document.title = `${character.name} | AI Lab_jp`;
  document.querySelector('[data-character-name]').textContent = character.name;
  document.querySelector('[data-character-season]').textContent = character.season;
  const period = document.querySelector('[data-character-period]');
  period.textContent = character.period;
  period.dateTime = `20${character.period.replace('.', '-')}`;

  const placeholderLabels = ['OUTFIT 01', 'OUTFIT 02', 'SIGNATURE POSE'];
  const detailImages = character.detailImages || character.images;
  const slides = detailImages.map((src, index) => `
    <figure class="detail-slide"><img src="${src}" alt="${character.name} ビジュアル ${index + 1}"></figure>
  `);

  while (detailImages.length === 1 && slides.length < 4) {
    const label = placeholderLabels[slides.length - 1] || `VISUAL ${String(slides.length + 1).padStart(2, '0')}`;
    slides.push(`<div class="detail-slide detail-placeholder"><div><span>${label}</span><strong>COMING SOON</strong></div></div>`);
  }

  const slider = document.querySelector('[data-detail-slider]');
  document.querySelector('[data-slider-track]').innerHTML = slides.join('');
  document.querySelector('[data-slide-total]').textContent = String(slides.length).padStart(2, '0');
  const sliderPrev = document.querySelector('[data-slider-prev]');
  const sliderNext = document.querySelector('[data-slider-next]');
  const slideCurrent = document.querySelector('[data-slide-current]');

  const updateSlider = () => {
    const index = Math.round(slider.scrollLeft / slider.clientWidth);
    const maxIndex = slides.length - 1;
    slideCurrent.textContent = String(index + 1).padStart(2, '0');
    sliderPrev.disabled = index <= 0;
    sliderNext.disabled = index >= maxIndex;
  };

  const moveSlider = (direction) => slider.scrollBy({ left: direction * slider.clientWidth, behavior: 'smooth' });
  sliderPrev.addEventListener('click', () => moveSlider(-1));
  sliderNext.addEventListener('click', () => moveSlider(1));
  slider.addEventListener('scroll', updateSlider, { passive: true });
  window.addEventListener('resize', updateSlider);
  updateSlider();

  const { tiktok, instagram, chili } = character.performance;
  document.querySelector('[data-tiktok]').textContent = tiktok.toLocaleString('ja-JP');
  document.querySelector('[data-instagram]').textContent = instagram.toLocaleString('ja-JP');
  document.querySelector('[data-chili]').textContent = chili.toLocaleString('ja-JP');
  document.querySelector('[data-total]').textContent = (tiktok + instagram + chili).toLocaleString('ja-JP');

  const rating = Math.max(1, Math.min(5, character.creatorRating));
  document.querySelector('[data-rating-stars]').textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  document.querySelector('[data-rating-number]').textContent = rating;
  if (character.creatorNote) {
    document.querySelector('[data-creator-note]').textContent = character.creatorNote;
    document.querySelector('[data-creator-note-wrap]').hidden = false;
  }

  const characterIndex = window.CHARACTERS.findIndex((item) => item.id === character.id);
  const previousCharacter = window.CHARACTERS[(characterIndex - 1 + window.CHARACTERS.length) % window.CHARACTERS.length];
  const nextCharacter = window.CHARACTERS[(characterIndex + 1) % window.CHARACTERS.length];
  const setCirculationCard = (direction, item) => {
    const link = document.querySelector(`[data-${direction}-character]`);
    const image = document.querySelector(`[data-${direction}-image]`);
    link.href = `character.html?id=${item.id}`;
    image.src = item.images[0];
    image.alt = `${item.name}のキャラクタービジュアル`;
    document.querySelector(`[data-${direction}-name]`).textContent = item.name;
    document.querySelector(`[data-${direction}-meta]`).textContent = `${item.season} / ${item.period}`;
  };
  setCirculationCard('previous', previousCharacter);
  setCirculationCard('next', nextCharacter);

  const voteButton = document.querySelector('[data-character-vote]');
  const voteMessage = document.querySelector('[data-vote-message]');
  const specialImage = document.querySelector('[data-special-image]');
  const voteStorageKey = 'aiLabJpDailyVote';
  const localDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const showVoteState = () => {
    let savedVote = null;
    try { savedVote = JSON.parse(localStorage.getItem(voteStorageKey)); } catch (error) { localStorage.removeItem(voteStorageKey); }

    if (savedVote?.date === localDate()) {
      voteButton.disabled = true;
      if (savedVote.characterId === character.id) {
        voteButton.textContent = 'THANK YOU ♡';
        voteMessage.textContent = `${character.name}への投票を受け付けました。`;
        if (character.voteImage) {
          specialImage.innerHTML = `<img src="${character.voteImage}" alt="${character.name} 投票特典ビジュアル">`;
          specialImage.classList.add('has-image');
        }
        specialImage.hidden = false;
      } else {
        voteButton.textContent = 'VOTED TODAY';
        voteMessage.textContent = '本日の投票は完了しています。また明日投票できます。';
      }
      return;
    }

    voteButton.disabled = false;
    voteButton.textContent = `VOTE FOR ${character.name}`;
  };

  voteButton.addEventListener('click', () => {
    localStorage.setItem(voteStorageKey, JSON.stringify({ date: localDate(), characterId: character.id }));
    showVoteState();
  });

  showVoteState();
}
