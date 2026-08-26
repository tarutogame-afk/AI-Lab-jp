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

document.querySelector('[data-all-characters]').innerHTML = window.CHARACTERS.map((character) => `
  <article class="all-character-card">
    <a href="character.html?id=${character.id}" aria-label="${character.name}の詳細と投票ページを見る">
      <div class="all-character-image"><img src="${character.images[0]}" alt="${character.name}のキャラクタービジュアル"></div>
      <div class="all-character-meta"><h3>${character.name}</h3><p>${character.season}</p><time datetime="20${character.period.replace('.', '-')}">${character.period}</time></div>
    </a>
  </article>
`).join('');
