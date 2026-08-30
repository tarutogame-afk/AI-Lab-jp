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
  });
});

const formatSeason = (season) => {
  const number = Number.parseInt(String(season).match(/\d+/)?.[0], 10);
  return { label: `SEASON ${String(number).padStart(2, '0')}`, number };
};

const millisecondsPerDay = 1000 * 60 * 60 * 24;
const today = new Date();
const statusFor = (published) => {
  const daysSincePublished = Math.floor((today - new Date(`${published}T00:00:00`)) / millisecondsPerDay);
  if (daysSincePublished >= 0 && daysSincePublished <= 30) return 'NEW CHARACTER';
  if (daysSincePublished >= 31 && daysSincePublished <= 60) return 'FRESH CHARACTER';
  return '';
};

const seasonGroups = new Map();
window.CHARACTERS.forEach((character) => {
  const season = formatSeason(character.season);
  const key = `${season.number}-${character.period}`;
  if (!seasonGroups.has(key)) seasonGroups.set(key, { ...season, period: character.period, characters: [] });
  seasonGroups.get(key).characters.push(character);
});

const groups = [...seasonGroups.values()].sort((a, b) => b.number - a.number || b.period.localeCompare(a.period));
document.querySelector('[data-all-characters]').innerHTML = groups.map((group) => `
  <section class="season-group" aria-labelledby="season-${group.number}-${group.period.replace('.', '')}">
    <header class="season-heading">
      <h3 id="season-${group.number}-${group.period.replace('.', '')}">${group.label}</h3>
      <time datetime="20${group.period.replace('.', '-')}">${group.period}</time>
    </header>
    <div class="season-grid">
      ${group.characters.map((character) => {
        const status = statusFor(character.published);
        const rating = Math.max(1, Math.min(5, character.creatorRating));
        const total = character.performance.tiktok + character.performance.instagram + character.performance.chili;
        return `
          <article class="all-character-card">
            <a href="character.html?id=${character.id}" aria-label="${character.name}の詳細と投票ページを見る">
              <div class="all-character-image">
                <img src="${character.images[0]}" alt="${character.name}のキャラクタービジュアル">
                ${status ? `<span class="character-status">${status}</span>` : ''}
              </div>
              <div class="all-character-meta">
                <h3>${character.name}</h3><p>${group.label}</p><time datetime="20${character.period.replace('.', '-')}">${character.period}</time>
                <div class="all-character-stats">
                  <div class="all-character-stat"><span>CREATOR RATING</span><strong>${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</strong> <small>${rating} / 5</small></div>
                  <div class="all-character-stat"><span>TOTAL</span><strong>${total.toLocaleString('ja-JP')}</strong> <small>POINT</small></div>
                </div>
                <div class="all-character-cta"><span>VIEW &amp; VOTE</span><b>→</b></div>
              </div>
            </a>
          </article>`;
      }).join('')}
    </div>
  </section>
`).join('');
