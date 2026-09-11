const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.global-nav');
const characterGrid = document.querySelector('[data-character-grid]');
const formatSeasonLabel = (season) => `SEASON ${String(Number.parseInt(String(season).match(/\d+/)?.[0], 10)).padStart(2, '0')}`;
const homeWorks = document.querySelector('[data-home-works]');
const heroImage = document.querySelector('.hero-image');
const voteRanking = document.querySelector('[data-vote-ranking]');
const voteRankingList = document.querySelector('[data-vote-ranking-list]');

if (heroImage && window.WORKS?.length) {
  const fallbackImage = heroImage.getAttribute('src');
  const selectedWork = window.WORKS[Math.floor(Math.random() * window.WORKS.length)];

  heroImage.alt = `${selectedWork.title} — AI Lab_jp WORKS`;
  heroImage.addEventListener('error', () => {
    heroImage.src = fallbackImage;
    heroImage.alt = 'AI Lab_jpのメインキャラクター';
  }, { once: true });
  heroImage.src = selectedWork.image;
}

if (homeWorks && window.WORKS) {
  const previewWorks = [...window.WORKS]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id, undefined, { numeric: true }))
    .slice(0, 3);
  homeWorks.innerHTML = previewWorks.map((work, index) => `
    <article class="home-work-card${index === 0 ? ' home-work-card-featured' : ''}">
      <a href="works.html" aria-label="${work.title}をWORKSページで見る">
        <span class="home-work-image"><img src="${work.image}" alt="${work.title}"></span>
        <span class="home-work-caption"><b>${work.id}</b><span><strong>${work.title}</strong><small>${work.category} / ${work.date}</small></span></span>
      </a>
    </article>
  `).join('');
}

characterGrid.innerHTML = window.CHARACTERS.map((character) => `
  <article class="character-card" data-published="${character.published}">
    <a class="character-card-link" href="character.html?id=${character.id}" aria-label="${character.name}の詳細と投票ページを見る">
      <div class="character-image-wrap"><img src="${character.images[0]}" alt="${character.name}のキャラクタービジュアル" onerror="this.hidden=true"></div>
      <div class="character-meta"><h3>${character.name}</h3><p>${formatSeasonLabel(character.season)}</p><time datetime="20${character.period.replace('.', '-')}">${character.period}</time></div>
    </a>
  </article>
`).join('');

const updateVoteRanking = async () => {
  if (!voteRanking || !voteRankingList) return;

  try {
    const voteMap = await window.AILabVotes.fetchAll();
    const rankedCharacters = window.CHARACTERS
      .map((character, displayOrder) => ({
        ...character,
        displayOrder,
        votes: voteMap.get(character.id) ?? 0,
      }))
      .sort((a, b) => b.votes - a.votes || a.displayOrder - b.displayOrder)
      .slice(0, 5);
    const topVotes = rankedCharacters[0]?.votes ?? 0;

    voteRankingList.innerHTML = rankedCharacters.map((character, index) => {
      const barWidth = topVotes > 0 ? (character.votes / topVotes) * 100 : 0;
      return `
        <li class="vote-ranking-item">
          <span class="vote-ranking-position">${String(index + 1).padStart(2, '0')}</span>
          <strong>${character.name}</strong>
          <span class="vote-ranking-count">${character.votes.toLocaleString('ja-JP')} VOTES</span>
          <span class="vote-ranking-track" aria-hidden="true"><span style="width:${barWidth}%"></span></span>
        </li>`;
    }).join('');
    voteRanking.hidden = false;
  } catch (error) {
    console.error(error);
    voteRanking.hidden = true;
  }
};

updateVoteRanking();
window.addEventListener('focus', updateVoteRanking);
window.addEventListener('storage', (event) => {
  if (event.key === 'aiLabJpDailyVote') updateVoteRanking();
});

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

const characterCarousel = document.querySelector('[data-character-carousel]');
const characterPrev = document.querySelector('[data-character-prev]');
const characterNext = document.querySelector('[data-character-next]');

if (characterCarousel && characterPrev && characterNext) {
  const updateCharacterNavigation = () => {
    const maxScroll = characterCarousel.scrollWidth - characterCarousel.clientWidth;
    characterPrev.disabled = characterCarousel.scrollLeft <= 1;
    characterNext.disabled = characterCarousel.scrollLeft >= maxScroll - 1;
  };

  const scrollCharacters = (direction) => {
    const card = characterCarousel.querySelector('.character-card');
    const track = characterCarousel.querySelector('.character-grid');
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    characterCarousel.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
  };

  characterPrev.addEventListener('click', () => scrollCharacters(-1));
  characterNext.addEventListener('click', () => scrollCharacters(1));
  characterCarousel.addEventListener('scroll', updateCharacterNavigation, { passive: true });
  window.addEventListener('resize', updateCharacterNavigation);
  updateCharacterNavigation();
}

const today = new Date();
const millisecondsPerDay = 1000 * 60 * 60 * 24;

document.querySelectorAll('.character-card[data-published]').forEach((card) => {
  const publishedDate = new Date(`${card.dataset.published}T00:00:00`);
  const daysSincePublished = Math.floor((today - publishedDate) / millisecondsPerDay);
  let status = '';

  if (daysSincePublished >= 0 && daysSincePublished <= 30) status = 'NEW CHARACTER';
  if (daysSincePublished >= 31 && daysSincePublished <= 60) status = 'FRESH CHARACTER';

  if (status) {
    const ribbon = document.createElement('span');
    ribbon.className = 'character-status';
    ribbon.textContent = status;
    card.querySelector('.character-image-wrap').append(ribbon);
  }
});
