const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#nav');
const brand=document.querySelector('.brand');
const profileHome=document.querySelector('#home-cards');
const hero=document.querySelector('.hero');
const pageSections=[...document.querySelectorAll('main > section')].filter(section=>section!==profileHome && !section.classList.contains('hero') && !section.classList.contains('intro'));

function showPage(target) {
  const isHome = target === 'home-cards' || !target;
  hero?.classList.toggle('page-hidden', !isHome);
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

// Peachy artwork protection and small integrated mascots across archive sections.
const peachyAsset = '1.%20assets/Peachy/Padrao/6.png';
const peachyImages = [
  ...[6,7,8,26,27,28,29,30,31,32,37,39,41].map(n => `1.%20assets/Peachy/Padrao/${n}.png`),
  ...[1,2,3,4,12,13,14,15].map(n => `1.%20assets/Peachy/Brasil/${n}.png`)
];
const peachyImage = document.querySelector('#peachy-rotator');

// Browsers cannot fully prevent screenshots or image extraction, but these measures
// discourage casual saving, dragging and the mobile long-press image menu.
function protectPeachyArtwork(image) {
  if (!image) return;
  image.draggable = false;
  image.setAttribute('aria-label', 'Arte exclusiva do mascote Peachy');
  ['contextmenu','dragstart','selectstart','copy'].forEach(type => {
    image.addEventListener(type, event => event.preventDefault());
  });
}
document.querySelectorAll('.peachy-showcase img').forEach(protectPeachyArtwork);

// Peachy mascots are part of the HTML headings, so they appear reliably on every tab.
if (peachyImage && peachyImages.length > 1) {
  let peachyIndex = 0;
  let rotationTimer = null;
  function showNextPeachy() {
    peachyIndex = (peachyIndex + 1) % peachyImages.length;
    peachyImage.classList.add('changing');
    peachyImage.src = peachyImages[peachyIndex];
    peachyImage.alt = `Mascote Peachy — arte ${peachyIndex + 1} de ${peachyImages.length}`;
    window.setTimeout(() => peachyImage.classList.remove('changing'), 220);
  }
  function startRotation() {
    if (rotationTimer) window.clearInterval(rotationTimer);
    rotationTimer = window.setInterval(showNextPeachy, 3000);
  }
  peachyImage.addEventListener('click', () => {
    showNextPeachy();
    startRotation();
  });
  peachyImage.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showNextPeachy();
      startRotation();
    }
  });
  startRotation();
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


// Re:Peach: sort archived lives chronologically when a date is available.
const liveGrid = document.querySelector('.live-grid');
const liveSort = document.querySelector('#live-sort');
if (liveGrid && liveSort) {
  const liveCards = [...liveGrid.querySelectorAll('.live-card')];
  liveCards.forEach((card, index) => {
    card.dataset.archiveOrder = String(index);
  });
  function sortLiveCards(direction) {
    const sorted = [...liveCards].sort((a, b) => {
      const dateA = a.dataset.date || '';
      const dateB = b.dataset.date || '';
      // Keep undated entries together after dated entries until their dates are confirmed.
      if (!dateA && !dateB) return Number(a.dataset.archiveOrder) - Number(b.dataset.archiveOrder);
      if (!dateA) return 1;
      if (!dateB) return -1;
      const comparison = dateA.localeCompare(dateB);
      if (comparison !== 0) return direction === 'newest' ? -comparison : comparison;
      // Same-day ordering can be customized for related recordings; otherwise preserve archive order.
      const orderA = a.dataset.dateOrder !== undefined ? Number(a.dataset.dateOrder) : Number(a.dataset.archiveOrder);
      const orderB = b.dataset.dateOrder !== undefined ? Number(b.dataset.dateOrder) : Number(b.dataset.archiveOrder);
      return orderA - orderB;
    });
    sorted.forEach(card => liveGrid.appendChild(card));
  }
  liveSort.addEventListener('change', () => sortLiveCards(liveSort.value));
  sortLiveCards(liveSort.value);
}

// Re:Peach: load the exact public YouTube title for each archived live.
document.querySelectorAll('.live-card[data-video-id]').forEach(async card => {
  const videoId = card.dataset.videoId;
  const titleLink = card.querySelector('[data-video-title]');
  if (!videoId || !titleLink) return;
  try {
    const response = await fetch('https://www.youtube.com/oembed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + videoId) + '&format=json');
    if (!response.ok) throw new Error('YouTube metadata unavailable');
    const data = await response.json();
    if (data.title) titleLink.textContent = data.title;
  } catch (error) {
    titleLink.textContent = 'Live da Atom · ver título no YouTube';
  }
});


// Multilingual interface: Portuguese is the default; the selected language is remembered.
const languageSelect = document.querySelector('#language-select');
const translations = {
  en: {
    "Filters":"Filters",
    "Platform":"Platform",
    "All platforms":"All platforms",
    "Search by words":"Search by words",
    "Search titles and descriptions":"Search titles and descriptions",
    "Period":"Period",
    "Any date":"Any date",
    "Today":"Today",
    "Last 7 days":"Last 7 days",
    "Last 30 days":"Last 30 days",
    "Last 3 months":"Last 3 months",
    "This year":"This year",
    "Custom range":"Custom range",
    "From":"From",
    "To":"To",
    "Sort":"Sort",
    "Newest first":"Newest first",
    "Oldest first":"Oldest first",
    "Showing":"Showing",
    "results":"results",
    "No results found":"No results found",
    "Try changing your filters or search terms.":"Try changing your filters or search terms.",
    "Social media":"Social media",
    "No updates yet":"No updates yet",
    "New updates will appear here when added to the archive.":"New updates will appear here when added to the archive.",
    "View original post ↗":"View original post ↗",
    "Social Updates":"Social Updates",
    "ATOM · SOCIAL MEDIA ARCHIVE":"ATOM · SOCIAL MEDIA ARCHIVE",
    "Posts":"Posts",
    "Interactions":"Interactions",
    "Fan Moments":"Fan Moments",
    "Posts and moments shared by Atom across her official social media accounts.":"Posts and moments shared by Atom across her official social media accounts.",
    "Coming soon":"Coming soon",
    "Social media updates will appear here as they are added to the archive.":"Social media updates will appear here as they are added to the archive.",
    "Lives are archived separately in Re:Peach.":"Lives are archived separately in Re:Peach.",
    "ATOM PARIYA ARCHIVE":"ATOM PARIYA ARCHIVE",
    "Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.":"Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.",
    "Aestiny":"Aestiny",
    "Home":"Home","Timeline":"Timeline","Events":"Events","Projects":"Projects","Specials":"Specials",
    "A FAN-MADE ARCHIVE BY ATOM PARIYA BRASIL":"A FAN-MADE ARCHIVE BY ATOM PARIYA BRASIL",
    "Every moment, every chapter, preserved with love.":"Every moment, every chapter, preserved with love.",
    "Explore our projects ↗":"Explore our projects ↗","Peachy · A little piece of our archive":"Peachy · A little piece of our archive",
    "The Artist":"The Artist","Find Atom’s official social media accounts and follow her latest updates.":"Find Atom’s official social media accounts and follow her latest updates.",
    "OFFICIAL LINKS":"OFFICIAL LINKS","Follow Atom around the web":"Follow Atom around the web","Official page":"Official page",
    "Official profile":"Official profile","Actor profile":"Actor profile","THE COMMUNITY":"THE COMMUNITY","Our Projects":"Our Projects",
    "Three projects, three ways of celebrating and preserving Atom's journey.":"Three projects, three ways of celebrating and preserving Atom's journey.",
    "Meet our projects ↗":"Meet our projects ↗","WELCOME TO THE ARCHIVE":"WELCOME TO THE ARCHIVE","A place for every chapter.":"A place for every chapter.",
    "Browse updates, events, projects, special moments, fashion looks and archived live streams.":"Browse updates, events, projects, special moments, fashion looks and archived live streams.",
    "OUR UNIVERSE":"OUR UNIVERSE","A curated catalogue of Atom's acting, music and media work. Entries are organized by their original release dates whenever verified.":"A curated catalogue of Atom's acting, music and media work. Entries are organized by their original release dates whenever verified.",
    "ACTING · FIRST WORK · MAY–JUNE 2018":"ACTING · FIRST WORK · MAY–JUNE 2018","Role:":"Role:",
    "Best · One of the drama's central characters":"Best · One of the drama's central characters","Original broadcast:":"Original broadcast:",
    "Channel 3 (CH3), with episodes also available on LINE TV":"Channel 3 (CH3), with episodes also available on LINE TV",
    "Format:":"Format:","6 episodes · released weekly on Saturdays":"6 episodes · released weekly on Saturdays",
    "Genres & themes · MyDramaList":"Genres & themes · MyDramaList",
    "Fan-curated playlist created for archiving, cataloguing and preserving content related to Atom Pariya's participation in the drama.":"Fan-curated playlist created for archiving, cataloguing and preserving content related to Atom Pariya's participation in the drama.",
    "View Atom's MyDramaList profile ↗":"View Atom's MyDramaList profile ↗","ACTING · SECOND WORK · 2026":"ACTING · SECOND WORK · 2026",
    "Role: Lalin / Lyla · Premiere: March 28, 2026":"Role: Lalin / Lyla · Premiere: March 28, 2026","View MyDramaList ↗":"View MyDramaList ↗",
    "MUSIC · COVERS":"MUSIC · COVERS","Atom's Cover Archive":"Atom's Cover Archive",
    "Listen to Atom's original cover performances on her YouTube channel and explore the playlists curated by Atom Pariya Brasil.":"Listen to Atom's original cover performances on her YouTube channel and explore the playlists curated by Atom Pariya Brasil.",
    "Original cover videos ↗":"Original cover videos ↗","Fanbase-curated playlist ↗":"Fanbase-curated playlist ↗",
    "The individual cover entries will be displayed from the earliest to the latest upload after the playlist track dates are verified.":"The individual cover entries will be displayed from the earliest to the latest upload after the playlist track dates are verified.",
    "FANBASE":"FANBASE","News, updates, translations, fan projects and support for Atom.":"News, updates, translations, fan projects and support for Atom.",
    "Explore fanbase archive ↗":"Explore fanbase archive ↗","FASHION ARCHIVE":"FASHION ARCHIVE",
    "Looks, brands, outfits, accessories and fashion appearances.":"Looks, brands, outfits, accessories and fashion appearances.","Explore the closet ↗":"Explore the closet ↗",
    "LIVE & VIDEO ARCHIVE":"LIVE & VIDEO ARCHIVE","Lives, translations, subtitles and moments worth replaying.":"Lives, translations, subtitles and moments worth replaying.",
    "Enter Repeach ↗":"Enter Repeach ↗","THE JOURNEY":"THE JOURNEY","Atom's first acting work. She played Best in the Channel 3 series.":"Atom's first acting work. She played Best in the Channel 3 series.",
    "Filmography · MyDramaList ↗":"Filmography · MyDramaList ↗","Lead vocalist and dancer in the T-pop girl group VIIS.":"Lead vocalist and dancer in the T-pop girl group VIIS.",
    "A new chapter in Atom's career, expanding her work as an actress and performer.":"A new chapter in Atom's career, expanding her work as an actress and performer.",
    "Atom's second acting work, starring as Lalin / Lyla. Premiered on March 28, 2026.":"Atom's second acting work, starring as Lalin / Lyla. Premiered on March 28, 2026.",
    "MEET · SHOWS · APPEARANCES":"MEET · SHOWS · APPEARANCES","Events archive":"Events archive",
    "Browse events by date, category and project.":"Browse events by date, category and project.",
    "MOMENTS THAT MATTER":"MOMENTS THAT MATTER","Special collections":"Special collections",
    "Birthdays, milestones, celebrations and themed collections.":"Birthdays, milestones, celebrations and themed collections.",
    "K. PARIYA CLOSET":"K. PARIYA CLOSET","All Looks":"All Looks","Casual":"Casual","Airport":"Airport",
    "Brand Events":"Brand Events","Accessories":"Accessories","The fashion archive":"The fashion archive",
    "Each look will have its own entry with date, occasion, identified pieces, brands and source links. Unconfirmed details will be marked as such.":"Each look will have its own entry with date, occasion, identified pieces, brands and source links. Unconfirmed details will be marked as such.",
    "Every live deserves another peach.":"Every live deserves another peach.","Full lives · Translations · Subtitles · Memorable moments":"Full lives · Translations · Subtitles · Memorable moments",
    "THE LIVE COLLECTION":"THE LIVE COLLECTION","Atom Live Archive":"Atom Live Archive",
    "A collection of lives featuring Atom — whether she is on camera or heard in the background.":"A collection of lives featuring Atom — whether she is on camera or heard in the background.",
    "Resumo da live":"Live summary","Espaço reservado para registrar os assuntos, momentos e interações desta transmissão.":"Space reserved for notes about the topics, moments and interactions in this livestream.",
    "Assistir no YouTube ↗":"Watch on YouTube ↗","COMPLETE PLAYLIST":"COMPLETE PLAYLIST","All Lives Featuring Atom":"All Lives Featuring Atom",
    "Playlist with lives in which Atom participates, appears on screen or can be heard speaking in the background.":"Playlist with lives in which Atom participates, appears on screen or can be heard speaking in the background.",
    "Open the complete YouTube playlist ↗":"Open the complete YouTube playlist ↗"
  },
  pt: {
    "Filters":"Filtros",
    "Platform":"Plataforma",
    "All platforms":"Todas as plataformas",
    "Search by words":"Buscar por palavras",
    "Search titles and descriptions":"Buscar em títulos e descrições",
    "Period":"Período",
    "Any date":"Todas as datas",
    "Today":"Hoje",
    "Last 7 days":"Últimos 7 dias",
    "Last 30 days":"Últimos 30 dias",
    "Last 3 months":"Últimos 3 meses",
    "This year":"Este ano",
    "Custom range":"Intervalo personalizado",
    "From":"De",
    "To":"Até",
    "Sort":"Ordenação",
    "Newest first":"Mais recentes",
    "Oldest first":"Mais antigos",
    "Showing":"Exibindo",
    "results":"resultados",
    "No results found":"Nenhum resultado encontrado",
    "Try changing your filters or search terms.":"Tente alterar os filtros ou os termos da busca.",
    "Social media":"Rede social",
    "No updates yet":"Ainda não há atualizações",
    "New updates will appear here when added to the archive.":"As novidades aparecerão aqui quando forem adicionadas ao arquivo.",
    "View original post ↗":"Ver publicação original ↗",
    "Social Updates":"Atualizações nas redes",
    "ATOM · SOCIAL MEDIA ARCHIVE":"ATOM · ARQUIVO DE REDES SOCIAIS",
    "Posts":"Publicações",
    "Interactions":"Interações",
    "Fan Moments":"Momentos com fãs",
    "Posts and moments shared by Atom across her official social media accounts.":"Publicações e momentos compartilhados por Atom em suas redes sociais oficiais.",
    "Coming soon":"Em breve",
    "Social media updates will appear here as they are added to the archive.":"As atualizações das redes sociais aparecerão aqui à medida que forem adicionadas ao arquivo.",
    "Lives are archived separately in Re:Peach.":"As lives estão arquivadas separadamente no Re:Peach.",
    "ATOM PARIYA ARCHIVE":"ARQUIVO ATOM PARIYA",
    "Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.":"Criado com carinho por Atom Pariya Brasil. Projeto feito por fãs, sem afiliação ou endosso de Atom ou de seus representantes.",
    "Aestiny":"Aestiny",
    "Home":"Início","Timeline":"Linha do tempo","Events":"Eventos","Projects":"Projetos","Specials":"Especiais",
    "A FAN-MADE ARCHIVE BY ATOM PARIYA BRASIL":"UM ARQUIVO DE FÃS POR ATOM PARIYA BRASIL",
    "Every moment, every chapter, preserved with love.":"Cada momento, cada capítulo, preservado com carinho.",
    "Explore our projects ↗":"Explore nossos projetos ↗","Peachy · A little piece of our archive":"Peachy · Um pedacinho do nosso arquivo",
    "The Artist":"A artista","Find Atom’s official social media accounts and follow her latest updates.":"Encontre as redes sociais oficiais da Atom e acompanhe suas novidades.",
    "OFFICIAL LINKS":"LINKS OFICIAIS","Follow Atom around the web":"Acompanhe Atom pela internet","Official page":"Página oficial",
    "Official profile":"Perfil oficial","Actor profile":"Perfil de atriz","THE COMMUNITY":"A COMUNIDADE","Our Projects":"Nossos projetos",
    "Three projects, three ways of celebrating and preserving Atom's journey.":"Três projetos, três formas de celebrar e preservar a trajetória da Atom.",
    "Meet our projects ↗":"Conheça nossos projetos ↗","WELCOME TO THE ARCHIVE":"BEM-VINDOS AO ARQUIVO","A place for every chapter.":"Um lugar para cada capítulo.",
    "Browse updates, events, projects, special moments, fashion looks and archived live streams.":"Explore novidades, eventos, projetos, momentos especiais, looks e transmissões ao vivo arquivadas.",
    "OUR UNIVERSE":"NOSSO UNIVERSO","A curated catalogue of Atom's acting, music and media work. Entries are organized by their original release dates whenever verified.":"Um catálogo selecionado dos trabalhos de atuação, música e mídia da Atom. As entradas são organizadas pelas datas originais de lançamento sempre que verificadas.",
    "ACTING · FIRST WORK · MAY–JUNE 2018":"ATUAÇÃO · PRIMEIRO TRABALHO · MAIO–JUNHO DE 2018","Role:":"Personagem:",
    "Best · One of the drama's central characters":"Best · Uma das personagens centrais da série","Original broadcast:":"Exibição original:",
    "Channel 3 (CH3), with episodes also available on LINE TV":"Channel 3 (CH3), com episódios também disponíveis no LINE TV",
    "Format:":"Formato:","6 episodes · released weekly on Saturdays":"6 episódios · lançados semanalmente aos sábados",
    "Genres & themes · MyDramaList":"Gêneros e temas · MyDramaList",
    "Fan-curated playlist created for archiving, cataloguing and preserving content related to Atom Pariya's participation in the drama.":"Playlist organizada por fãs para arquivar, catalogar e preservar conteúdos relacionados à participação de Atom Pariya na série.",
    "View Atom's MyDramaList profile ↗":"Ver perfil de Atom no MyDramaList ↗","ACTING · SECOND WORK · 2026":"ATUAÇÃO · SEGUNDO TRABALHO · 2026",
    "Role: Lalin / Lyla · Premiere: March 28, 2026":"Personagem: Lalin / Lyla · Estreia: 28 de março de 2026","View MyDramaList ↗":"Ver no MyDramaList ↗",
    "MUSIC · COVERS":"MÚSICA · COVERS","Atom's Cover Archive":"Arquivo de covers da Atom",
    "Listen to Atom's original cover performances on her YouTube channel and explore the playlists curated by Atom Pariya Brasil.":"Ouça as performances de covers da Atom em seu canal do YouTube e explore as playlists organizadas por Atom Pariya Brasil.",
    "Original cover videos ↗":"Vídeos originais de covers ↗","Fanbase-curated playlist ↗":"Playlist organizada pela fanbase ↗",
    "The individual cover entries will be displayed from the earliest to the latest upload after the playlist track dates are verified.":"As entradas individuais dos covers serão exibidas da mais antiga à mais recente após a confirmação das datas de publicação.",
    "FANBASE":"FANBASE","News, updates, translations, fan projects and support for Atom.":"Notícias, atualizações, traduções, projetos de fãs e apoio à Atom.",
    "Explore fanbase archive ↗":"Explore o arquivo da fanbase ↗","FASHION ARCHIVE":"ARQUIVO DE MODA",
    "Looks, brands, outfits, accessories and fashion appearances.":"Looks, marcas, produções, acessórios e aparições relacionadas à moda.","Explore the closet ↗":"Explore o closet ↗",
    "LIVE & VIDEO ARCHIVE":"ARQUIVO DE LIVES E VÍDEOS","Lives, translations, subtitles and moments worth replaying.":"Lives, traduções, legendas e momentos que merecem ser revistos.",
    "Enter Repeach ↗":"Acesse o Repeach ↗","THE JOURNEY":"A TRAJETÓRIA","Atom's first acting work. She played Best in the Channel 3 series.":"Primeiro trabalho de atuação da Atom. Ela interpretou Best na série do Channel 3.",
    "Filmography · MyDramaList ↗":"Filmografia · MyDramaList ↗","Lead vocalist and dancer in the T-pop girl group VIIS.":"Vocalista principal e dançarina do grupo feminino de T-pop VIIS.",
    "A new chapter in Atom's career, expanding her work as an actress and performer.":"Um novo capítulo na carreira da Atom, ampliando sua atuação como atriz e artista.",
    "Atom's second acting work, starring as Lalin / Lyla. Premiered on March 28, 2026.":"Segundo trabalho de atuação da Atom, como Lalin / Lyla. Estreou em 28 de março de 2026.",
    "MEET · SHOWS · APPEARANCES":"ENCONTROS · SHOWS · APARIÇÕES","Events archive":"Arquivo de eventos",
    "Browse events by date, category and project.":"Explore eventos por data, categoria e projeto.",
    "MOMENTS THAT MATTER":"MOMENTOS ESPECIAIS","Special collections":"Coleções especiais",
    "Birthdays, milestones, celebrations and themed collections.":"Aniversários, marcos, comemorações e coleções temáticas.",
    "K. PARIYA CLOSET":"CLOSET DA K. PARIYA","All Looks":"Todos os looks","Casual":"Casual","Airport":"Aeroporto",
    "Brand Events":"Eventos de marcas","Accessories":"Acessórios","The fashion archive":"O arquivo de moda",
    "Each look will have its own entry with date, occasion, identified pieces, brands and source links. Unconfirmed details will be marked as such.":"Cada look terá sua própria entrada com data, ocasião, peças identificadas, marcas e links de origem. Informações não confirmadas serão sinalizadas.",
    "Every live deserves another peach.":"Toda live merece ser revivida.","Full lives · Translations · Subtitles · Memorable moments":"Lives completas · Traduções · Legendas · Momentos memoráveis",
    "THE LIVE COLLECTION":"A COLEÇÃO DE LIVES","Atom Live Archive":"Arquivo de lives da Atom",
    "A collection of lives featuring Atom — whether she is on camera or heard in the background.":"Uma coleção de lives com a participação da Atom — aparecendo na tela ou sendo ouvida ao fundo.",
    "Resumo da live":"Resumo da live","Espaço reservado para registrar os assuntos, momentos e interações desta transmissão.":"Espaço reservado para registrar os assuntos, momentos e interações desta transmissão.",
    "Assistir no YouTube ↗":"Assistir no YouTube ↗","COMPLETE PLAYLIST":"PLAYLIST COMPLETA","All Lives Featuring Atom":"Todas as lives com participação da Atom",
    "Playlist with lives in which Atom participates, appears on screen or can be heard speaking in the background.":"Playlist com lives das quais Atom participa, aparece na tela ou pode ser ouvida falando ao fundo.",
    "Open the complete YouTube playlist ↗":"Abrir a playlist completa no YouTube ↗"
  },
  es: {
    "Filters":"Filtros",
    "Platform":"Plataforma",
    "All platforms":"Todas las plataformas",
    "Search by words":"Buscar por palabras",
    "Search titles and descriptions":"Buscar en títulos y descripciones",
    "Period":"Período",
    "Any date":"Todas las fechas",
    "Today":"Hoy",
    "Last 7 days":"Últimos 7 días",
    "Last 30 days":"Últimos 30 días",
    "Last 3 months":"Últimos 3 meses",
    "This year":"Este año",
    "Custom range":"Rango personalizado",
    "From":"Desde",
    "To":"Hasta",
    "Sort":"Orden",
    "Newest first":"Más recientes",
    "Oldest first":"Más antiguos",
    "Showing":"Mostrando",
    "results":"resultados",
    "No results found":"No se encontraron resultados",
    "Try changing your filters or search terms.":"Intenta cambiar los filtros o los términos de búsqueda.",
    "Social media":"Redes sociales",
    "No updates yet":"Aún no hay actualizaciones",
    "New updates will appear here when added to the archive.":"Las novedades aparecerán aquí cuando se agreguen al archivo.",
    "View original post ↗":"Ver publicación original ↗",
    "Social Updates":"Actualizaciones en redes",
    "ATOM · SOCIAL MEDIA ARCHIVE":"ATOM · ARCHIVO DE REDES SOCIALES",
    "Posts":"Publicaciones",
    "Interactions":"Interacciones",
    "Fan Moments":"Momentos con fans",
    "Posts and moments shared by Atom across her official social media accounts.":"Publicaciones y momentos compartidos por Atom en sus redes sociales oficiales.",
    "Coming soon":"Próximamente",
    "Social media updates will appear here as they are added to the archive.":"Las actualizaciones aparecerán aquí a medida que se añadan al archivo.",
    "Lives are archived separately in Re:Peach.":"Los transmisión en vivos están archivados por separado en Re:Peach.",
    "ATOM PARIYA ARCHIVE":"ARCHIVO ATOM PARIYA",
    "Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.":"Creado con cariño por Atom Pariya Brasil. Proyecto hecho por fans, sin afiliación ni respaldo de Atom o sus representantes.",
    "Aestiny":"Aestiny",
    "Home":"Inicio","Timeline":"Cronología","Events":"Eventos","Projects":"Proyectos","Specials":"Especiales",
    "A FAN-MADE ARCHIVE BY ATOM PARIYA BRASIL":"UN ARCHIVO DE FANS DE ATOM PARIYA BRASIL",
    "Every moment, every chapter, preserved with love.":"Cada momento, cada capítulo, preservado con cariño.",
    "Explore our projects ↗":"Explora nuestros proyectos ↗","Peachy · A little piece of our archive":"Peachy · Un pedacito de nuestro archivo",
    "The Artist":"La artista","Find Atom’s official social media accounts and follow her latest updates.":"Encuentra las redes sociales oficiales de Atom y sigue sus últimas novedades.",
    "OFFICIAL LINKS":"ENLACES OFICIALES","Follow Atom around the web":"Sigue a Atom en internet","Official page":"Página oficial",
    "Official profile":"Perfil oficial","Actor profile":"Perfil de actriz","THE COMMUNITY":"LA COMUNIDAD","Our Projects":"Nuestros proyectos",
    "Three projects, three ways of celebrating and preserving Atom's journey.":"Tres proyectos, tres maneras de celebrar y preservar la trayectoria de Atom.",
    "Meet our projects ↗":"Conoce nuestros proyectos ↗","WELCOME TO THE ARCHIVE":"BIENVENIDOS AL ARCHIVO","A place for every chapter.":"Un lugar para cada capítulo.",
    "Browse updates, events, projects, special moments, fashion looks and archived live streams.":"Explora novedades, eventos, proyectos, momentos especiales, looks y transmisiones en vivo archivadas.",
    "OUR UNIVERSE":"NUESTRO UNIVERSO","A curated catalogue of Atom's acting, music and media work. Entries are organized by their original release dates whenever verified.":"Un catálogo seleccionado de los trabajos de actuación, música y medios de Atom. Las entradas se organizan por sus fechas originales de estreno cuando están verificadas.",
    "ACTING · FIRST WORK · MAY–JUNE 2018":"ACTUACIÓN · PRIMER TRABAJO · MAYO–JUNIO DE 2018","Role:":"Personaje:",
    "Best · One of the drama's central characters":"Best · Uno de los personajes centrales de la serie","Original broadcast:":"Emisión original:",
    "Channel 3 (CH3), with episodes also available on LINE TV":"Channel 3 (CH3), con episodios también disponibles en LINE TV",
    "Format:":"Formato:","6 episodes · released weekly on Saturdays":"6 episodios · estrenados semanalmente los sábados",
    "Genres & themes · MyDramaList":"Géneros y temas · MyDramaList",
    "Fan-curated playlist created for archiving, cataloguing and preserving content related to Atom Pariya's participation in the drama.":"Lista creada por fans para archivar, catalogar y preservar contenido relacionado con la participación de Atom Pariya en la serie.",
    "View Atom's MyDramaList profile ↗":"Ver el perfil de Atom en MyDramaList ↗","ACTING · SECOND WORK · 2026":"ACTUACIÓN · SEGUNDO TRABAJO · 2026",
    "Role: Lalin / Lyla · Premiere: March 28, 2026":"Personaje: Lalin / Lyla · Estreno: 28 de marzo de 2026","View MyDramaList ↗":"Ver en MyDramaList ↗",
    "MUSIC · COVERS":"MÚSICA · COVERS","Atom's Cover Archive":"Archivo de covers de Atom",
    "Listen to Atom's original cover performances on her YouTube channel and explore the playlists curated by Atom Pariya Brasil.":"Escucha las interpretaciones de covers de Atom en su canal de YouTube y explora las listas seleccionadas por Atom Pariya Brasil.",
    "Original cover videos ↗":"Videos originales de covers ↗","Fanbase-curated playlist ↗":"Lista seleccionada por la fanbase ↗",
    "The individual cover entries will be displayed from the earliest to the latest upload after the playlist track dates are verified.":"Las entradas individuales de covers se mostrarán de la más antigua a la más reciente después de verificar las fechas de publicación.",
    "FANBASE":"FANBASE","News, updates, translations, fan projects and support for Atom.":"Noticias, novedades, traducciones, proyectos de fans y apoyo a Atom.",
    "Explore fanbase archive ↗":"Explora el archivo de fans ↗","FASHION ARCHIVE":"ARCHIVO DE MODA",
    "Looks, brands, outfits, accessories and fashion appearances.":"Looks, marcas, conjuntos, accesorios y apariciones relacionadas con la moda.","Explore the closet ↗":"Explora el clóset ↗",
    "LIVE & VIDEO ARCHIVE":"ARCHIVO DE TRANSMISIONES EN VIVO Y VIDEOS","Lives, translations, subtitles and moments worth replaying.":"Transmisiones en vivo, traducciones, subtítulos y momentos que vale la pena volver a disfrutar.",
    "Enter Repeach ↗":"Visita Repeach ↗","THE JOURNEY":"LA TRAYECTORIA","Atom's first acting work. She played Best in the Channel 3 series.":"Primer trabajo de actuación de Atom. Interpretó a Best en la serie de Channel 3.",
    "Filmography · MyDramaList ↗":"Filmografía · MyDramaList ↗","Lead vocalist and dancer in the T-pop girl group VIIS.":"Vocalista principal y bailarina del grupo femenino de T-pop VIIS.",
    "A new chapter in Atom's career, expanding her work as an actress and performer.":"Un nuevo capítulo en la carrera de Atom, ampliando su trabajo como actriz y artista.",
    "Atom's second acting work, starring as Lalin / Lyla. Premiered on March 28, 2026.":"Segundo trabajo de actuación de Atom, como Lalin / Lyla. Se estrenó el 28 de marzo de 2026.",
    "MEET · SHOWS · APPEARANCES":"ENCUENTROS · SHOWS · APARICIONES","Events archive":"Archivo de eventos",
    "Browse events by date, category and project.":"Explora eventos por fecha, categoría y proyecto.",
    "MOMENTS THAT MATTER":"MOMENTOS IMPORTANTES","Special collections":"Colecciones especiales",
    "Birthdays, milestones, celebrations and themed collections.":"Cumpleaños, hitos, celebraciones y colecciones temáticas.",
    "K. PARIYA CLOSET":"ARMARIO DE K. PARIYA","All Looks":"Todos los looks","Casual":"Casual","Airport":"Aeropuerto",
    "Brand Events":"Eventos de marcas","Accessories":"Accesorios","The fashion archive":"El archivo de moda",
    "Each look will have its own entry with date, occasion, identified pieces, brands and source links. Unconfirmed details will be marked as such.":"Cada look tendrá su propia entrada con fecha, ocasión, prendas identificadas, marcas y enlaces de origen. Los datos no confirmados se indicarán.",
    "Every live deserves another peach.":"Cada transmisión en vivo merece volver a disfrutarse.","Full lives · Translations · Subtitles · Memorable moments":"Transmisión en vivos completos · Traducciones · Subtítulos · Momentos memorables",
    "THE LIVE COLLECTION":"LA COLECCIÓN DE TRANSMISIONES EN VIVO","Atom Live Archive":"Archivo de transmisiones en vivo de Atom",
    "A collection of lives featuring Atom — whether she is on camera or heard in the background.":"Una colección de transmisiones en vivo en las que participa Atom, ya sea apareciendo en pantalla o escuchándose su voz de fondo.",
    "Resumo da live":"Resumen de la transmisión en vivo","Espaço reservado para registrar os assuntos, momentos e interações desta transmissão.":"Espacio reservado para registrar los temas, momentos e interacciones de esta transmisión.",
    "Assistir no YouTube ↗":"Ver en YouTube ↗","COMPLETE PLAYLIST":"LISTA COMPLETA","All Lives Featuring Atom":"Todas las transmisiones en vivo con Atom",
    "Playlist with lives in which Atom participates, appears on screen or can be heard speaking in the background.":"Playlist de transmisiones en vivo en las que Atom participa, aparece en pantalla o se escucha su voz de fondo.",
    "Open the complete YouTube playlist ↗":"Abrir la lista completa en YouTube ↗"
  },
  th: {
    "Filters":"ตัวกรอง",
    "Platform":"แพลตฟอร์ม",
    "All platforms":"ทุกแพลตฟอร์ม",
    "Search by words":"ค้นหาด้วยคำ",
    "Search titles and descriptions":"ค้นหาในชื่อและคำอธิบาย",
    "Period":"ช่วงเวลา",
    "Any date":"ทุกวันที่",
    "Today":"วันนี้",
    "Last 7 days":"7 วันที่ผ่านมา",
    "Last 30 days":"30 วันที่ผ่านมา",
    "Last 3 months":"3 เดือนที่ผ่านมา",
    "This year":"ปีนี้",
    "Custom range":"กำหนดช่วงเวลา",
    "From":"ตั้งแต่",
    "To":"ถึง",
    "Sort":"เรียงลำดับ",
    "Newest first":"ใหม่ที่สุดก่อน",
    "Oldest first":"เก่าที่สุดก่อน",
    "Showing":"แสดง",
    "results":"รายการ",
    "No results found":"ไม่พบผลลัพธ์",
    "Try changing your filters or search terms.":"ลองเปลี่ยนตัวกรองหรือคำค้นหา",
    "Social media":"โซเชียลมีเดีย",
    "No updates yet":"ยังไม่มีอัปเดต",
    "New updates will appear here when added to the archive.":"อัปเดตใหม่จะแสดงที่นี่เมื่อเพิ่มลงในคลัง",
    "View original post ↗":"ดูโพสต์ต้นฉบับ ↗",
    "Social Updates":"อัปเดตโซเชียล",
    "ATOM · SOCIAL MEDIA ARCHIVE":"ATOM · คลังโซเชียลมีเดีย",
    "Posts":"โพสต์",
    "Interactions":"การมีปฏิสัมพันธ์",
    "Fan Moments":"ช่วงเวลากับแฟน ๆ",
    "Posts and moments shared by Atom across her official social media accounts.":"โพสต์และช่วงเวลาที่ Atom แชร์ผ่านบัญชีโซเชียลมีเดียทางการของเธอ",
    "Coming soon":"เร็ว ๆ นี้",
    "Social media updates will appear here as they are added to the archive.":"อัปเดตโซเชียลมีเดียจะแสดงที่นี่เมื่อมีการเพิ่มลงในคลัง",
    "Lives are archived separately in Re:Peach.":"ไลฟ์ถูกจัดเก็บแยกไว้ใน Re:Peach",
    "ATOM PARIYA ARCHIVE":"ATOM PARIYA ARCHIVE",
    "Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.":"จัดทำด้วยความรักโดย Atom Pariya Brasil เป็นโปรเจกต์แฟนคลับ ไม่ได้มีส่วนเกี่ยวข้องหรือได้รับการรับรองจาก Atom หรือผู้แทนของเธอ",
    "Aestiny":"Aestiny",
    "Home":"หน้าแรก","Timeline":"ไทม์ไลน์","Events":"อีเวนต์","Projects":"โปรเจกต์","Specials":"คอลเลกชันพิเศษ",
    "A FAN-MADE ARCHIVE BY ATOM PARIYA BRASIL":"แฟนเมดอาร์ไคฟ์โดย ATOM PARIYA BRASIL",
    "Every moment, every chapter, preserved with love.":"เก็บรักษาทุกช่วงเวลาและทุกบทของเส้นทางนี้ไว้ด้วยความรัก",
    "Explore our projects ↗":"สำรวจโปรเจกต์ของเรา ↗","Peachy · A little piece of our archive":"Peachy · ส่วนเล็ก ๆ ของอาร์ไคฟ์ของเรา",
    "The Artist":"ศิลปิน","Find Atom’s official social media accounts and follow her latest updates.":"ติดตามบัญชีโซเชียลมีเดียทางการของ Atom และอัปเดตล่าสุดของเธอ",
    "OFFICIAL LINKS":"ลิงก์ทางการ","Follow Atom around the web":"ติดตาม Atom บนโซเชียลมีเดีย","Official page":"เพจทางการ",
    "Official profile":"โปรไฟล์ทางการ","Actor profile":"โปรไฟล์นักแสดง","THE COMMUNITY":"ชุมชนแฟนคลับ","Our Projects":"โปรเจกต์ของเรา",
    "Three projects, three ways of celebrating and preserving Atom's journey.":"สามโปรเจกต์ สามวิธีในการร่วมฉลองและเก็บรักษาเส้นทางของ Atom",
    "Meet our projects ↗":"รู้จักโปรเจกต์ของเรา ↗","WELCOME TO THE ARCHIVE":"ยินดีต้อนรับสู่อาร์ไคฟ์","A place for every chapter.":"พื้นที่สำหรับทุกบทของเรื่องราว",
    "Browse updates, events, projects, special moments, fashion looks and archived live streams.":"สำรวจข่าวสาร อีเวนต์ โปรเจกต์ ช่วงเวลาพิเศษ แฟชั่นลุค และไลฟ์ที่เก็บไว้ในอาร์ไคฟ์",
    "OUR UNIVERSE":"จักรวาลของเรา","A curated catalogue of Atom's acting, music and media work. Entries are organized by their original release dates whenever verified.":"แคตตาล็อกผลงานการแสดง ดนตรี และสื่อของ Atom โดยจัดเรียงตามวันที่เผยแพร่ครั้งแรกเมื่อมีข้อมูลยืนยัน",
    "ACTING · FIRST WORK · MAY–JUNE 2018":"การแสดง · ผลงานแรก · พฤษภาคม–มิถุนายน 2018","Role:":"บทบาท:",
    "Best · One of the drama's central characters":"Best · หนึ่งในตัวละครหลักของซีรีส์","Original broadcast:":"ออกอากาศครั้งแรก:",
    "Channel 3 (CH3), with episodes also available on LINE TV":"Channel 3 (CH3) และรับชมตอนต่าง ๆ ได้ทาง LINE TV",
    "Format:":"รูปแบบ:","6 episodes · released weekly on Saturdays":"6 ตอน · ออกอากาศทุกวันเสาร์",
    "Genres & themes · MyDramaList":"แนวเรื่องและประเด็น · MyDramaList",
    "Fan-curated playlist created for archiving, cataloguing and preserving content related to Atom Pariya's participation in the drama.":"เพลย์ลิสต์ที่แฟนคลับจัดทำขึ้นเพื่อเก็บรวบรวม จัดหมวดหมู่ และรักษาเนื้อหาที่เกี่ยวข้องกับการร่วมแสดงของ Atom Pariya ในซีรีส์เรื่องนี้",
    "View Atom's MyDramaList profile ↗":"ดูโปรไฟล์ MyDramaList ของ Atom ↗","ACTING · SECOND WORK · 2026":"การแสดง · ผลงานที่สอง · 2026",
    "Role: Lalin / Lyla · Premiere: March 28, 2026":"บทบาท: Lalin / Lyla · ออกอากาศตอนแรก: 28 มีนาคม 2026","View MyDramaList ↗":"ดู MyDramaList ↗",
    "MUSIC · COVERS":"ดนตรี · คัฟเวอร์","Atom's Cover Archive":"อาร์ไคฟ์ผลงานคัฟเวอร์ของ Atom",
    "Listen to Atom's original cover performances on her YouTube channel and explore the playlists curated by Atom Pariya Brasil.":"รับชมการร้องคัฟเวอร์ของ Atom บนช่อง YouTube ของเธอ และสำรวจเพลย์ลิสต์ที่จัดทำโดย Atom Pariya Brasil",
    "Original cover videos ↗":"วิดีโอคัฟเวอร์ต้นฉบับ ↗","Fanbase-curated playlist ↗":"เพลย์ลิสต์ที่แฟนเบสจัดทำ ↗",
    "The individual cover entries will be displayed from the earliest to the latest upload after the playlist track dates are verified.":"รายการคัฟเวอร์จะแสดงเรียงจากเก่าไปใหม่หลังจากตรวจสอบวันที่เผยแพร่ในเพลย์ลิสต์แล้ว",
    "FANBASE":"แฟนเบส","News, updates, translations, fan projects and support for Atom.":"ข่าวสาร อัปเดต คำแปล โปรเจกต์แฟนคลับ และการสนับสนุน Atom",
    "Explore fanbase archive ↗":"สำรวจอาร์ไคฟ์แฟนเบส ↗","FASHION ARCHIVE":"อาร์ไคฟ์แฟชั่น",
    "Looks, brands, outfits, accessories and fashion appearances.":"ลุค แบรนด์ เสื้อผ้า เครื่องประดับ และการปรากฏตัวในงานแฟชั่น","Explore the closet ↗":"สำรวจแฟชั่น ↗",
    "LIVE & VIDEO ARCHIVE":"อาร์ไคฟ์ไลฟ์และวิดีโอ","Lives, translations, subtitles and moments worth replaying.":"ไลฟ์ คำแปล คำบรรยาย และช่วงเวลาที่ควรย้อนกลับมาดูอีกครั้ง",
    "Enter Repeach ↗":"เข้าสู่ Repeach ↗","THE JOURNEY":"เส้นทางของ Atom","Atom's first acting work. She played Best in the Channel 3 series.":"ผลงานการแสดงเรื่องแรกของ Atom โดยรับบท Best ในซีรีส์ของ Channel 3",
    "Filmography · MyDramaList ↗":"ผลงานการแสดง · MyDramaList ↗","Lead vocalist and dancer in the T-pop girl group VIIS.":"นักร้องนำและนักเต้นของเกิร์ลกรุ๊ป T-pop วง VIIS",
    "A new chapter in Atom's career, expanding her work as an actress and performer.":"บทใหม่ในเส้นทางอาชีพของ Atom ที่ขยายผลงานในฐานะนักแสดงและศิลปิน",
    "Atom's second acting work, starring as Lalin / Lyla. Premiered on March 28, 2026.":"ผลงานการแสดงเรื่องที่สองของ Atom รับบท Lalin / Lyla ออกอากาศตอนแรกวันที่ 28 มีนาคม 2026",
    "MEET · SHOWS · APPEARANCES":"มีตติ้ง · การแสดง · การปรากฏตัว","Events archive":"อาร์ไคฟ์อีเวนต์",
    "Browse events by date, category and project.":"เลือกชมอีเวนต์ตามวันที่ หมวดหมู่ และโปรเจกต์",
    "MOMENTS THAT MATTER":"ช่วงเวลาสำคัญ","Special collections":"คอลเลกชันพิเศษ",
    "Birthdays, milestones, celebrations and themed collections.":"วันเกิด หมุดหมายสำคัญ การเฉลิมฉลอง และคอลเลกชันตามธีม",
    "K. PARIYA CLOSET":"K. PARIYA CLOSET","All Looks":"ทุกลุค","Casual":"ลุคสบาย ๆ","Airport":"สนามบิน",
    "Brand Events":"อีเวนต์แบรนด์","Accessories":"เครื่องประดับ","The fashion archive":"อาร์ไคฟ์แฟชั่น",
    "Each look will have its own entry with date, occasion, identified pieces, brands and source links. Unconfirmed details will be marked as such.":"แต่ละลุคจะมีรายการของตัวเอง พร้อมวันที่ โอกาส เสื้อผ้าที่ระบุได้ แบรนด์ และแหล่งที่มา โดยจะแจ้งข้อมูลที่ยังไม่ยืนยัน",
    "Every live deserves another peach.":"ทุกไลฟ์ควรค่าแก่การกลับมาดูอีกครั้ง","Full lives · Translations · Subtitles · Memorable moments":"ไลฟ์เต็ม · คำแปล · คำบรรยาย · ช่วงเวลาที่น่าจดจำ",
    "THE LIVE COLLECTION":"คอลเลกชันไลฟ์","Atom Live Archive":"อาร์ไคฟ์ไลฟ์ของ Atom",
    "A collection of lives featuring Atom — whether she is on camera or heard in the background.":"รวบรวมไลฟ์ที่ Atom มีส่วนร่วม ไม่ว่าจะปรากฏบนหน้าจอหรือได้ยินเสียงอยู่เบื้องหลัง",
    "Resumo da live":"สรุปไลฟ์","Espaço reservado para registrar os assuntos, momentos e interações desta transmissão.":"พื้นที่สำหรับบันทึกหัวข้อ ช่วงเวลา และการโต้ตอบในไลฟ์นี้",
    "Assistir no YouTube ↗":"รับชมบน YouTube ↗","COMPLETE PLAYLIST":"เพลย์ลิสต์ฉบับเต็ม","All Lives Featuring Atom":"ทุกไลฟ์ที่มี Atom ร่วมด้วย",
    "Playlist with lives in which Atom participates, appears on screen or can be heard speaking in the background.":"เพลย์ลิสต์รวมไลฟ์ที่ Atom เข้าร่วม ปรากฏบนหน้าจอ หรือได้ยินเสียงพูดอยู่เบื้องหลัง",
    "Open the complete YouTube playlist ↗":"เปิดเพลย์ลิสต์ฉบับเต็มบน YouTube ↗"
  }
};
// Re:Peach summaries localized by native-sounding editorial copy.
const liveSummaryTranslations = {
  "Lmo2wD6LtfQ": {
    en: '<strong>Live summary</strong><p>This July 31, 2023 livestream mainly features an informal conversation between members of two groups from the same company: PERSES and the then-upcoming group VIIS.</p><p><strong>Highlights about Atom and VIIS:</strong></p><ul><li><strong>Atom joins the live:</strong> Atom, a member of VIIS, appears from 22:04 and stays until the end, chatting with the host.</li><li><strong>Before VIIS debuted:</strong> At the time, neither Atom nor her fellow member Cheers had debuted with VIIS yet.</li><li><strong>Food and everyday life:</strong> During a late dinner, Pluggy eats mala tang while Atom says she is having yum (a spicy Thai salad) and tom saeb (23:05–23:22).</li><li><strong>Training:</strong> They talk about their day and mention dance practice (24:32–25:02), showing how hard the trainees were working before their groups officially launched.</li></ul><p><strong>Sweet and funny moments:</strong></p><ol><li><strong>A million-year wait:</strong> Atom joins at 22:22, and they tease her about taking so long. Pluggy jokes that he has been waiting for her for “three million years” (22:37).</li><li><strong>A food debate:</strong> Pluggy has mala tang, while Atom has yum and tom saeb (23:05–23:22). They joke about which meal is spicier or tastier, turning the chat into a playful food review (23:30).</li><li><strong>A little tech confusion:</strong> Atom casually admits that, at first, she did not know how to invite people to join the live (24:05–24:11), making everyone laugh.</li></ol>',
    es: '<strong>Resumen dla transmisión en vivo</strong><p>Este transmisión en vivo del 31 de julio de 2023 gira en torno a una charla informal entre integrantes de dos grupos de la misma compañía: PERSES y el entonces futuro grupo VIIS.</p><p><strong>Momentos destacados de Atom y VIIS:</strong></p><ul><li><strong>Participación de Atom:</strong> Atom, integrante de VIIS, aparece a partir del minuto 22:04 y se queda hasta el final, conversando con quien conduce la transmisión en vivo.</li><li><strong>Antes del debut de VIIS:</strong> En esa fecha, ni Atom ni su compañera Cheers habían debutado todavía en VIIS.</li><li><strong>Comida y rutina:</strong> Durante una cena tardía, Pluggy come mala tang mientras Atom cuenta que está cenando yum (una ensalada tailandesa picante) y tom saeb (23:05–23:22).</li><li><strong>Entrenamiento:</strong> Hablan de su día y mencionan que practicaron coreografías (24:32–25:02), mostrando la dedicación de los trainees antes del debut oficial de sus grupos.</li></ul><p><strong>Momentos tiernos y divertidos:</strong></p><ol><li><strong>Una espera de millones de años:</strong> Atom entra a las 22:22 y bromean sobre cuánto tardó. Pluggy dice que llevaba esperándola “tres millones de años” (22:37).</li><li><strong>Debate gastronómico:</strong> Pluggy come mala tang y Atom cena yum y tom saeb (23:05–23:22). Bromean sobre cuál plato es más picante o sabroso, como si hicieran una reseña culinaria (23:30).</li><li><strong>Un pequeño lío técnico:</strong> Atom cuenta que al principio no sabía cómo invitar a otras personas al transmisión en vivo (24:05–24:11), lo que provoca risas.</li></ol>',
    th: '<strong>สรุปไลฟ์</strong><p>ไลฟ์วันที่ 31 กรกฎาคม 2023 เป็นบทสนทนาสบาย ๆ ระหว่างสมาชิกจากสองวงในค่ายเดียวกัน ได้แก่ PERSES และ VIIS ซึ่งในขณะนั้นยังไม่ได้เดบิวต์</p><p><strong>ช่วงสำคัญเกี่ยวกับ Atom และ VIIS:</strong></p><ul><li><strong>Atom เข้าร่วมไลฟ์:</strong> Atom สมาชิกวง VIIS ปรากฏตัวตั้งแต่นาทีที่ 22:04 และอยู่ร่วมไลฟ์จนจบ พร้อมพูดคุยกับผู้ดำเนินรายการ</li><li><strong>ช่วงก่อนเดบิวต์:</strong> ในวันนั้นทั้ง Atom และ Cheers ซึ่งเป็นสมาชิกวงเดียวกันยังไม่ได้เดบิวต์ในนาม VIIS</li><li><strong>อาหารและชีวิตประจำวัน:</strong> ระหว่างมื้อดึก Pluggy รับประทานหม่าล่าทัง ส่วน Atom บอกว่ากำลังรับประทานยำและต้มแซ่บ (23:05–23:22)</li><li><strong>การฝึกซ้อม:</strong> พวกเขาพูดถึงกิจกรรมในวันนั้นและเล่าว่าได้ซ้อมเต้น (24:32–25:02) สะท้อนถึงความตั้งใจของเหล่าเทรนนีก่อนที่วงจะเปิดตัวอย่างเป็นทางการ</li></ul><p><strong>ช่วงเวลาน่ารักและชวนขำ:</strong></p><ol><li><strong>การรอคอยนับล้านปี:</strong> Atom เข้าร่วมไลฟ์ในนาทีที่ 22:22 ทุกคนจึงแซวว่าเธอมาช้า Pluggy พูดติดตลกว่าเขารอเธอมา “สามล้านปี” แล้ว (22:37)</li><li><strong>ประชันเมนูอาหาร:</strong> Pluggy รับประทานหม่าล่าทัง ส่วน Atom เลือกยำและต้มแซ่บ (23:05–23:22) ทั้งคู่หยอกล้อกันว่าเมนูไหนเผ็ดหรืออร่อยกว่ากัน (23:30)</li><li><strong>ความสับสนเรื่องเทคนิค:</strong> Atom เล่าอย่างเป็นกันเองว่าในตอนแรกยังไม่รู้วิธีเชิญคนอื่นเข้ามาในไลฟ์ (24:05–24:11) ทำให้ทุกคนหัวเราะ</li></ol>'
  },
  "pNOs08qCO6I": {
    en: '<strong>Live summary</strong><p>This July 31, 2023 livestream captures a relaxed interaction between members of different Thai music groups: Atom and Cheers from VIIS, and Pluggy and Krittin from PERSES.</p><p><strong>What happens in the live:</strong></p><ul><li><strong>A casual start:</strong> The members chat while eating, talking about their sleep schedules and appetites. Atom says she is tired because she had to get up early (0:21).</li><li><strong>Filters and playful moments:</strong> They try camera filters and comment on the room lighting (1:41). There are also a few technical hiccups, people joining and leaving the live, and a moment when they talk about a phone that fell (3:21).</li><li><strong>Group introductions:</strong> The members introduce themselves and joke with viewers. Atom says she is eating and plans to rest after the livestream (4:16).</li><li><strong>Wrapping up:</strong> As they finish their meals, everyone starts saying goodnight. Before leaving, Atom asks fans to support the new group VIIS and listen to “Narak Noi Long Noi” (9:52).</li></ul><p><strong>Atom and VIIS highlights:</strong></p><ul><li><strong>Giving in to hunger:</strong> Atom sweetly says that although she feels like going to sleep, seeing the food (mala and yum) makes it impossible to resist (0:27).</li><li><strong>Having fun with filters:</strong> Atom jokes that she looks “worn out” and is grateful that filters exist to freshen up her look on the live (1:00).</li><li><strong>The dinner announcement:</strong> Atom politely and adorably says she needs to leave so she can enjoy dinner in peace, surprising the others and making them fondly tease her (4:16–4:34).</li><li><strong>A personal VIIS plug:</strong> Near the end, Atom switches to a more earnest tone to promote VIIS and the group launch, showing her affection and pride for the project (9:56–10:24).</li></ul>',
    es: '<strong>Resumen dla transmisión en vivo</strong><p>Este transmisión en vivo del 31 de julio de 2023 muestra una interacción distendida entre integrantes de distintos grupos musicales tailandeses: Atom y Cheers, de VIIS, y Pluggy y Krittin, de PERSES.</p><p><strong>Qué ocurre durante la transmisión en vivo:</strong></p><ul><li><strong>Un comienzo relajado:</strong> Conversan mientras comen y hablan de sus horarios de sueño y de las ganas de comer. Atom comenta que está cansada porque se levantó temprano (0:21).</li><li><strong>Filtros y bromas:</strong> Prueban filtros y comentan la iluminación del lugar (1:41). También hay algunos problemas técnicos, participantes que entran y salen dla transmisión en vivo y una conversación sobre un teléfono que se cayó (3:21).</li><li><strong>Presentaciones:</strong> Se presentan y bromean con quienes están viendo la transmisión en vivo. Atom cuenta que está comiendo y que piensa descansar después de la transmisión (4:16).</li><li><strong>Despedida:</strong> Cuando terminan de comer, empiezan a despedirse para ir a dormir. Antes de irse, Atom pide a los fans que apoyen al nuevo grupo VIIS y escuchen “Narak Noi Long Noi” (9:52).</li></ul><p><strong>Momentos destacados de Atom y VIIS:</strong></p><ul><li><strong>No pudo resistirse a la comida:</strong> Atom comenta con ternura que, aunque tenía ganas de dormir, al ver la comida (mala y yum) no pudo resistirse (0:27).</li><li><strong>Bromas con los filtros:</strong> Atom dice que está “agotada” y agradece que existan filtros para mejorar su aspecto durante la transmisión en vivo (1:00).</li><li><strong>El aviso de la cena:</strong> Atom anuncia de manera educada y adorable que tiene que retirarse para cenar tranquila, provocando sorpresa y cariño entre los demás (4:16–4:34).</li><li><strong>Promoción especial:</strong> Casi al final, Atom adopta un tono más serio para promocionar VIIS y el lanzamiento del grupo, mostrando el cariño y orgullo que siente por el proyecto (9:56–10:24).</li></ul>',
    th: '<strong>สรุปไลฟ์</strong><p>ไลฟ์วันที่ 31 กรกฎาคม 2023 เป็นช่วงเวลาพูดคุยอย่างเป็นกันเองระหว่างสมาชิกจากวงดนตรีไทยหลายวง ได้แก่ Atom และ Cheers จาก VIIS รวมถึง Pluggy และ Krittin จาก PERSES</p><p><strong>เรื่องราวภายในไลฟ์:</strong></p><ul><li><strong>เริ่มต้นอย่างสบาย ๆ:</strong> สมาชิกพูดคุยกันระหว่างรับประทานอาหาร ทั้งเรื่องเวลานอนและความอยากอาหาร Atom บอกว่ารู้สึกเหนื่อยเพราะต้องตื่นแต่เช้า (0:21)</li><li><strong>ฟิลเตอร์และการหยอกล้อ:</strong> ทุกคนลองใช้ฟิลเตอร์กล้องและพูดถึงแสงสว่างในห้อง (1:41) นอกจากนี้ยังมีจังหวะขัดข้องเล็กน้อย มีคนเข้าออกไลฟ์ และพูดถึงโทรศัพท์ที่ตกลงมา (3:21)</li><li><strong>แนะนำตัว:</strong> สมาชิกแนะนำตัวและหยอกล้อกับผู้ชม Atom บอกว่ากำลังรับประทานอาหารและตั้งใจจะพักผ่อนหลังจบไลฟ์ (4:16)</li><li><strong>ช่วงท้ายไลฟ์:</strong> เมื่อรับประทานอาหารเสร็จ ทุกคนทยอยกล่าวลาและเตรียมเข้านอน ก่อนออกจากไลฟ์ Atom ฝากให้แฟน ๆ สนับสนุนวง VIIS และฟังเพลง “Narak Noi Long Noi” (9:52)</li></ul><p><strong>ช่วงเด่นของ Atom และ VIIS:</strong></p><ul><li><strong>แพ้ให้กับความหิว:</strong> Atom พูดอย่างน่ารักว่าแม้จะอยากนอนแล้ว แต่พอเห็นอาหารอย่างหม่าล่าและยำก็อดใจไม่ไหว (0:27)</li><li><strong>สนุกกับฟิลเตอร์:</strong> Atom แซวตัวเองว่าดูโทรม และขอบคุณที่มีฟิลเตอร์ช่วยให้ดูสดใสขึ้นระหว่างไลฟ์ (1:00)</li><li><strong>ขอตัวไปทานข้าว:</strong> Atom บอกอย่างสุภาพและน่ารักว่าต้องขอตัวไปทานอาหารอย่างสบายใจ ทำให้คนอื่น ๆ แปลกใจและเอ็นดูเธอ (4:16–4:34)</li><li><strong>ฝากผลงาน VIIS:</strong> ช่วงท้าย Atom ใช้น้ำเสียงจริงจังขึ้นเพื่อประชาสัมพันธ์วง VIIS และการเปิดตัวของวง แสดงให้เห็นถึงความรักและความภูมิใจที่มีต่อโปรเจกต์นี้ (9:56–10:24)</li></ul>'
  },
  "C1crcinDXRU": {
    en: '<strong>Live summary</strong><p>In this November 16, 2023 livestream, Atom Pariya chats with fans, shares a health update and talks about what she has been up to.</p><ul><li><strong>Health update:</strong> Atom says she is recovering from COVID-19, which coincided with her 22nd birthday and meant she had to spend the day somewhat isolated. She reassures fans that she is feeling better (1:05, 2:36).</li><li><strong>Career and performances:</strong> She recalls recent showcases in Khon Kaen and Chon Buri (3:42), and invites fans to upcoming appearances, including an event at Thammasat University on the 20th (28:51) and Jaturamitr Samakkhi on the 18th (28:38).</li><li><strong>Music project:</strong> Atom promotes VIIS second single, “ร้ายก็ได้ (Don’t Mind),” and encourages fans to listen and learn the choreography (6:34, 10:36). She also mentions the group documentary, released every Thursday at 8 p.m. (30:23).</li><li><strong>What VIIS means:</strong> She explains that VIIS comes from the Finnish word for five, representing the group’s five members (14:51).</li></ul><p><strong>Sweet and funny moments:</strong></p><ol><li><strong>A belated birthday celebration:</strong> A birthday cake is brought out during the live to celebrate Atom’s 22nd birthday, and she gets to blow out the candles (20:23–22:00).</li><li><strong>Her “charming voice”:</strong> She jokes about her slightly hoarse voice after being ill, affectionately calling it her “charming voice” (8:38, 9:15, 25:12).</li><li><strong>Kanom Kheng nails:</strong> Atom compares the shape of her nails to a traditional Thai sweet called kanom kheng (15:14, 17:39).</li><li><strong>Fan interaction:</strong> Atom tries to keep up with the comments and asks fans to talk to her because she felt a little lonely at the start of the live (0:22, 12:55).</li></ol>',
    es: '<strong>Resumen dla transmisión en vivo</strong><p>En esta transmisión en vivo del 16 de noviembre de 2023, Atom Pariya conversa con sus fans, comparte cómo se encuentra de salud y cuenta algunas novedades.</p><ul><li><strong>Actualización de salud:</strong> Atom comenta que se está recuperando de COVID-19. La enfermedad coincidió con su cumpleaños número 22 y tuvo que pasar ese día algo aislada, aunque aclara que ya se encuentra mejor (1:05, 2:36).</li><li><strong>Carrera y presentaciones:</strong> Recuerda los showcases recientes en Khon Kaen y Chon Buri (3:42), e invita a los fans a próximos eventos, entre ellos uno en la Universidad Thammasat el día 20 (28:51) y Jaturamitr Samakkhi el día 18 (28:38).</li><li><strong>Proyecto musical:</strong> Atom promociona el segundo sencillo de VIIS, “ร้ายก็ได้ (Don’t Mind)”, y anima a los fans a escucharlo y aprender la coreografía (6:34, 10:36). También menciona el documental del grupo, que se publica cada jueves a las 20:00 (30:23).</li><li><strong>Significado de VIIS:</strong> Explica que el nombre proviene del finés y significa cinco, en referencia a las cinco integrantes (14:51).</li></ul><p><strong>Momentos tiernos y divertidos:</strong></p><ol><li><strong>Celebración de cumpleaños:</strong> Durante la transmisión en vivo le llevan un pastel para celebrar sus 22 años y Atom puede soplar las velas (20:23–22:00).</li><li><strong>Su “voz encantadora”:</strong> Bromea sobre su voz algo ronca después de enfermar y la llama cariñosamente su “voz con encanto” (8:38, 9:15, 25:12).</li><li><strong>Uñas de “kanom kheng”:</strong> Atom compara la forma de sus uñas con un dulce tradicional tailandés llamado kanom kheng (15:14, 17:39).</li><li><strong>Interacción con los fans:</strong> Intenta leer los comentarios y les pide que conversen con ella porque al comienzo se sentía un poco sola (0:22, 12:55).</li></ol>',
    th: '<strong>สรุปไลฟ์</strong><p>ในไลฟ์วันที่ 16 พฤศจิกายน 2023 Atom Pariya พูดคุยกับแฟน ๆ อัปเดตอาการป่วย และเล่าเรื่องราวต่าง ๆ ที่เกิดขึ้นในช่วงนั้น</p><ul><li><strong>อัปเดตสุขภาพ:</strong> Atom เล่าว่ากำลังฟื้นตัวจากโควิด-19 ซึ่งเกิดขึ้นในช่วงวันเกิดอายุครบ 22 ปี ทำให้วันนั้นต้องใช้เวลาอยู่ค่อนข้างลำพัง แต่เธอยืนยันว่าตอนนี้อาการดีขึ้นแล้ว (1:05, 2:36)</li><li><strong>งานและการแสดง:</strong> เธอย้อนเล่าถึงโชว์เคสที่ขอนแก่นและชลบุรี (3:42) พร้อมชวนแฟน ๆ ไปพบกันในงานที่จะจัดขึ้น รวมถึงงานที่มหาวิทยาลัยธรรมศาสตร์วันที่ 20 (28:51) และงานจตุรมิตรสามัคคีวันที่ 18 (28:38)</li><li><strong>ผลงานเพลง:</strong> Atom ฝากซิงเกิลที่สองของ VIIS เพลง “ร้ายก็ได้ (Don’t Mind)” และชวนแฟน ๆ ไปฟังพร้อมฝึกท่าเต้น (6:34, 10:36) นอกจากนี้ยังพูดถึงสารคดีของวงที่เผยแพร่ทุกวันพฤหัสบดี เวลา 20:00 น. (30:23)</li><li><strong>ความหมายของชื่อ VIIS:</strong> เธออธิบายว่าชื่อ VIIS มาจากภาษาฟินแลนด์ หมายถึงเลขห้า ซึ่งแทนสมาชิกทั้งห้าคนของวง (14:51)</li></ul><p><strong>ช่วงเวลาน่ารักและชวนขำ:</strong></p><ol><li><strong>ฉลองวันเกิดย้อนหลัง:</strong> มีคนนำเค้กมาเซอร์ไพรส์ Atom ระหว่างไลฟ์เพื่อฉลองวันเกิดอายุครบ 22 ปี พร้อมให้เธอเป่าเทียน (20:23–22:00)</li><li><strong>“เสียงมีเสน่ห์”:</strong> เธอหยอกล้อเรื่องเสียงที่แหบเล็กน้อยหลังป่วย และเรียกเสียงของตัวเองอย่างเอ็นดูว่าเป็น “เสียงที่มีเสน่ห์” (8:38, 9:15, 25:12)</li><li><strong>เล็บเหมือนขนมเข่ง:</strong> Atom เปรียบเทียบรูปทรงเล็บของตัวเองกับขนมเข่ง ซึ่งเป็นขนมแบบดั้งเดิม (15:14, 17:39)</li><li><strong>พูดคุยกับแฟน ๆ:</strong> Atom พยายามอ่านคอมเมนต์และชวนแฟน ๆ พูดคุย เพราะในช่วงต้นไลฟ์เธอรู้สึกเหงานิดหน่อย (0:22, 12:55)</li></ol>'
  },
  "wTMikUYp20I": {
    en: '<strong>Live summary</strong><p>In this pre-birthday livestream for Cheers on July 17, 2024 (0:29), Cheers hosts the session, introduces VIIS and talks about the group’s recent trip (0:57–1:15). Atom is not visible on camera, but she actively joins in through her voice in the background.</p><p><strong>Moments when Atom is mentioned or heard:</strong></p><ul><li><strong>Hair and performance style (5:56):</strong> Cheers says she cut her hair to make it feel lighter while performing, comparing its movement with Atom’s, Tara’s and Sonya’s hair.</li><li><strong>Introducing the group (8:05):</strong> Cheers introduces all five VIIS members, including Atom.</li><li><strong>The “spy” joke (9:23–10:42):</strong> The members joke that Atom is a “spy”, which is why she does not appear on camera. Her laughter and comments can be heard in the background. The joke refers to vlog and video content GNEST made with VIIS.</li><li><strong>Taking care of her hair (24:06, 25:42 and 26:58):</strong> Towards the end, Cheers explains several times that Atom is off-screen because she is busy looking after or washing her hair, while the others playfully tease her about being absent.</li></ul>',
    es: '<strong>Resumen dla transmisión en vivo</strong><p>Este transmisión en vivo previo al cumpleaños de Cheers, realizado el 17 de julio de 2024 (0:29), está conducido por Cheers, quien presenta a VIIS y comenta la rutina del viaje que hicieron (0:57–1:15). Atom no aparece en cámara, pero participa activamente con su voz de fondo.</p><p><strong>Momentos en los que se menciona o se escucha a Atom:</strong></p><ul><li><strong>El cabello y el estilo al bailar (5:56):</strong> Cheers cuenta que se cortó el cabello para sentirlo más ligero al actuar y compara el movimiento de su pelo con el de Atom, Tara y Sonya.</li><li><strong>Presentación del grupo (8:05):</strong> Cheers presenta a las cinco integrantes de VIIS, incluida Atom.</li><li><strong>La broma de la “espía” (9:23–10:42):</strong> Las integrantes bromean diciendo que Atom es una “espía” y por eso no aparece en cámara. Se escucha su voz, entre risas y comentarios. La broma hace referencia a contenido de los vlogs y videos que GNEST realizó junto con VIIS.</li><li><strong>Cuidado del cabello (24:06, 25:42 y 26:58):</strong> Hacia el final, Cheers explica varias veces que Atom está fuera de cámara porque está ocupada cuidándose o lavándose el cabello, mientras las demás bromean sobre su ausencia.</li></ul>',
    th: '<strong>สรุปไลฟ์</strong><p>ไลฟ์ฉลองวันเกิดล่วงหน้าให้ Cheers จัดขึ้นเมื่อวันที่ 17 กรกฎาคม 2024 (0:29) โดย Cheers เป็นผู้ดำเนินไลฟ์ แนะนำวง VIIS และเล่าถึงกิจวัตรระหว่างทริปของสมาชิก (0:57–1:15) แม้ Atom จะไม่ได้ปรากฏตัวบนหน้าจอ แต่เธอก็มีส่วนร่วมในการพูดคุยผ่านเสียงที่ได้ยินอยู่เบื้องหลัง</p><p><strong>ช่วงที่มีการพูดถึงหรือได้ยินเสียงของ Atom:</strong></p><ul><li><strong>ทรงผมและการแสดง (5:56):</strong> Cheers เล่าว่าตัดผมเพื่อให้รู้สึกเบาสบายขึ้นเวลาแสดง และเปรียบเทียบการเคลื่อนไหวของเส้นผมกับของ Atom, Tara และ Sonya</li><li><strong>แนะนำสมาชิกวง (8:05):</strong> Cheers แนะนำสมาชิก VIIS ทั้งห้าคน รวมถึง Atom</li><li><strong>มุก “สายลับ” (9:23–10:42):</strong> สมาชิกหยอกล้อว่า Atom เป็น “สายลับ” จึงไม่ปรากฏตัวหน้ากล้อง ระหว่างนั้นได้ยินเสียงหัวเราะและเสียงพูดของ Atom อยู่เบื้องหลัง มุกนี้อ้างอิงถึงคอนเทนต์ในวล็อกและวิดีโอที่ GNEST ทำร่วมกับ VIIS</li><li><strong>การดูแลเส้นผม (24:06, 25:42 และ 26:58):</strong> ในช่วงท้าย Cheers อธิบายหลายครั้งว่า Atom ไม่ได้อยู่หน้ากล้องเพราะกำลังดูแลหรือสระผม ขณะที่สมาชิกคนอื่น ๆ หยอกล้อเรื่องที่เธอหายไปจากหน้าจอ</li></ul>'
  }
};

const originalTextNodes = new Map();
const originalAttributes = new Map();
let activeLanguage = 'pt';

function collectTranslatable(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const key = node.nodeValue.trim();
    if (key && !originalTextNodes.has(node)) originalTextNodes.set(node, {value:node.nodeValue,key});
  }
  const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll('*')] : [];
  elements.forEach(element => ['placeholder','title','aria-label'].forEach(attribute => {
    const value = element.getAttribute(attribute);
    const attrNode = element.getAttributeNode(attribute);
    if (value && attrNode && !originalAttributes.has(attrNode)) originalAttributes.set(attrNode,{value,key:value});
  }));
}
collectTranslatable(document.body);

function applyTextTranslations(lang) {
  const dictionary = translations[lang] || translations.pt;
  originalTextNodes.forEach(({value,key},node) => {
    if (!node.isConnected) return;
    const leading = value.match(/^\s*/)?.[0] || '';
    const trailing = value.match(/\s*$/)?.[0] || '';
    let translated = dictionary[key] || key;
    const liveLabel = key.match(/^LIVE ARCHIVE · (\d{2})( · PART 2| · VIIS)?$/);
    if (liveLabel) {
      const suffix = liveLabel[2] === ' · PART 2' ? (lang==='pt'?' · PARTE 2':lang==='es'?' · PARTE 2':' · PART 2') : liveLabel[2] || '';
      const prefix = lang==='pt'?'ARQUIVO DE LIVES · ':lang==='es'?'ARCHIVO DE DIRECTOS · ':lang==='th'?'คลังไลฟ์ · ':'LIVE ARCHIVE · ';
      translated = prefix + liveLabel[1] + suffix;
    }
    node.nodeValue = leading + translated + trailing;
  });
  originalAttributes.forEach(({key},attrNode) => {
    if (attrNode?.ownerElement?.isConnected && dictionary[key]) attrNode.value = dictionary[key];
  });
}

const originalLiveSummaries = new Map();
document.querySelectorAll('.live-card').forEach(card => {
  const id = card.dataset.videoId;
  const summary = card.querySelector('.live-summary');
  if (id && summary) originalLiveSummaries.set(id,summary.innerHTML);
});

function setLanguage(lang) {
  activeLanguage = translations[lang] ? lang : 'pt';
  applyTextTranslations(activeLanguage);
  originalLiveSummaries.forEach((originalHTML,id) => {
    const card = document.querySelector('.live-card[data-video-id="' + id + '"]');
    const summary = card?.querySelector('.live-summary');
    if (!summary) return;
    const localized = liveSummaryTranslations[id]?.[activeLanguage];
    summary.innerHTML = activeLanguage === 'pt' || !localized ? originalHTML : localized;
  });
  document.documentElement.lang = activeLanguage === 'pt' ? 'pt-BR' : activeLanguage;
  const titles = {pt:'Atom Pariya Archive | Brasil',en:'Atom Pariya Archive | Brazil',es:'Atom Pariya Archive | Brasil',th:'Atom Pariya Archive | Brasil'};
  document.title = titles[activeLanguage];
  const descriptions = {
    pt:'Arquivo de fãs dedicado a Atom Pariya, criado por Atom Pariya Brasil.',
    en:'A fan-made archive dedicated to Atom Pariya, created by Atom Pariya Brasil.',
    es:'Archivo de fans dedicado a Atom Pariya, creado por Atom Pariya Brasil.',
    th:'แฟนอาร์ไคฟ์ที่จัดทำขึ้นเพื่อ Atom Pariya โดย Atom Pariya Brasil'
  };
  document.querySelector('meta[name="description"]')?.setAttribute('content',descriptions[activeLanguage]);
  if (languageSelect && languageSelect.value !== activeLanguage) languageSelect.value = activeLanguage;
  try { localStorage.setItem('atomArchiveLanguage',activeLanguage); } catch(e) {}
}
let initialLanguage = 'pt';
try { initialLanguage = localStorage.getItem('atomArchiveLanguage') || 'pt'; } catch(e) {}
if (!translations[initialLanguage]) initialLanguage = 'pt';
if (languageSelect) {
  languageSelect.value = initialLanguage;
  languageSelect.addEventListener('change',() => setLanguage(languageSelect.value));
}
setLanguage(initialLanguage);

// Keep the selected language applied to text inserted after initial page load.
const languageObserver = new MutationObserver(mutations => {
  let added = false;
  mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const key = node.nodeValue.trim();
      if (key && !originalTextNodes.has(node)) { originalTextNodes.set(node,{value:node.nodeValue,key}); added = true; }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const before = originalTextNodes.size;
      collectTranslatable(node);
      if (originalTextNodes.size !== before) added = true;
    }
  }));
  if (added) applyTextTranslations(activeLanguage);
});
languageObserver.observe(document.body,{childList:true,subtree:true});

// Social archive: filters, feed/table views and multilingual editorial fields.
const socialGrid = document.querySelector('#social-updates-grid');
const socialFilters = [...document.querySelectorAll('[data-social-filter]')];
const socialViewButtons = [...document.querySelectorAll('[data-social-view]')];
const socialPlatform = document.querySelector('#social-platform-filter');
const socialSearch = document.querySelector('#social-search');
const socialPeriod = document.querySelector('#social-period');
const socialSort = document.querySelector('#social-sort');
const socialFrom = document.querySelector('#social-from');
const socialTo = document.querySelector('#social-to');
const socialCount = document.querySelector('#social-results-count');
let socialEntries = [];
let activeSocialCategory = 'all';
let activeSocialView = 'feed';

const socialLabels = {
  pt:{all:'Todas as publicações',feed:'Feed',table:'Tabela',original:'Legenda original',translation:'Tradução · Português',context:'Contextualização',platform:'Plataforma',date:'Data',account:'Perfil',caption:'Legenda',hashtags:'Hashtags',metrics:'Métricas',source:'Origem',view:'Ver publicação original ↗',search:'Buscar legendas, traduções e hashtags...',showing:'Exibindo',results:'resultados',none:'Nenhuma publicação encontrada',empty:'As publicações aparecerão aqui quando forem adicionadas ao arquivo.',noContext:'',manual:'Cadastro manual',api:'API'},
  en:{all:'All publications',feed:'Feed',table:'Table',original:'Original caption',translation:'Translation · Portuguese',context:'Context & notes',platform:'Platform',date:'Date',account:'Account',caption:'Caption',hashtags:'Hashtags',metrics:'Metrics',source:'Source',view:'View original post ↗',search:'Search captions, translations and hashtags...',showing:'Showing',results:'results',none:'No publications found',empty:'New publications will appear here when added to the archive.',noContext:'',manual:'Manual entry',api:'API'},
  es:{all:'Todas las publicaciones',feed:'Feed',table:'Tabla',original:'Texto original',translation:'Traducción · Portugués',context:'Contexto y notas',platform:'Plataforma',date:'Fecha',account:'Perfil',caption:'Texto',hashtags:'Hashtags',metrics:'Métricas',source:'Origen',view:'Ver publicación original ↗',search:'Buscar textos, traducciones y hashtags...',showing:'Mostrando',results:'resultados',none:'No se encontraron publicaciones',empty:'Las publicaciones aparecerán aquí cuando se añadan al archivo.',noContext:'',manual:'Registro manual',api:'API'},
  th:{all:'โพสต์ทั้งหมด',feed:'ฟีด',table:'ตาราง',original:'แคปชันต้นฉบับ',translation:'คำแปล · ภาษาโปรตุเกส',context:'บริบทและหมายเหตุ',platform:'แพลตฟอร์ม',date:'วันที่',account:'บัญชี',caption:'แคปชัน',hashtags:'แฮชแท็ก',metrics:'สถิติ',source:'แหล่งที่มา',view:'ดูโพสต์ต้นฉบับ ↗',search:'ค้นหาแคปชัน คำแปล และแฮชแท็ก...',showing:'แสดง',results:'รายการ',none:'ไม่พบโพสต์',empty:'โพสต์ใหม่จะแสดงที่นี่เมื่อถูกเพิ่มลงในอาร์ไคฟ์',noContext:'',manual:'เพิ่มด้วยตนเอง',api:'API'}
};
function socialLang(){const l=document.documentElement.lang;return l==='pt-BR'?'pt':(socialLabels[l]?l:'en');}
function socialText(key){return socialLabels[socialLang()][key]||socialLabels.en[key]||key;}
function socialEscape(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function socialHashtags(entry){
  const source=String(entry.original_caption??entry.caption??entry.description??'');
  const found=source.match(/#[\p{L}\p{M}\p{N}_]+/gu)||[];
  return [...new Set([...(Array.isArray(entry.hashtags)?entry.hashtags:[]),...found])];
}
function localDateString(date){const year=date.getFullYear();const month=String(date.getMonth()+1).padStart(2,'0');const day=String(date.getDate()).padStart(2,'0');return year+'-'+month+'-'+day;}
function populateSocialPlatforms(){
  if(!socialPlatform)return;
  const known=['Instagram','TikTok','X','Facebook','Weibo','YouTube','Threads'];
  const platforms=[...new Set([...known,...socialEntries.map(entry=>entry.platform).filter(Boolean)])].sort((a,b)=>known.indexOf(a)-known.indexOf(b));
  const selected=socialPlatform.value||'all';
  socialPlatform.innerHTML='<option value="all">'+(socialLang()==='pt'?'Todas as plataformas':socialLang()==='es'?'Todas las plataformas':socialLang()==='th'?'ทุกแพลตฟอร์ม':'All platforms')+'</option>'+platforms.map(platform=>'<option value="'+socialEscape(platform)+'">'+socialEscape(platform)+'</option>').join('');
  socialPlatform.value=platforms.includes(selected)?selected:'all';
}
function socialMetrics(entry){
  const m=entry.metrics||{};
  return [['likes',entry.likes??m.likes],['comments',entry.comments??m.comments],['replies',entry.replies??m.replies],['views',entry.views??m.views]].filter(item=>item[1]!==undefined&&item[1]!==null&&item[1]!=='');
}
function socialEntryDate(entry){return entry.published_at||entry.publicationDate||entry.date||'';}
function renderSocialUpdates(){
  if(!socialGrid)return;
  const today=new Date(),todayString=localDateString(today),period=socialPeriod?.value||'all';
  let startDate='',endDate='';
  if(period==='today')startDate=endDate=todayString;
  if(period==='7d'){const d=new Date(today);d.setDate(d.getDate()-6);startDate=localDateString(d);endDate=todayString;}
  if(period==='30d'){const d=new Date(today);d.setDate(d.getDate()-29);startDate=localDateString(d);endDate=todayString;}
  if(period==='90d'){const d=new Date(today);d.setDate(d.getDate()-89);startDate=localDateString(d);endDate=todayString;}
  if(period==='year'){startDate=today.getFullYear()+'-01-01';endDate=todayString;}
  if(period==='custom'){startDate=socialFrom?.value||'';endDate=socialTo?.value||'';}
  const query=(socialSearch?.value||'').trim().toLocaleLowerCase();
  let entries=socialEntries.filter(entry=>{
    if(activeSocialCategory!=='all'&&entry.category!==activeSocialCategory)return false;
    if(socialPlatform?.value&&socialPlatform.value!=='all'&&entry.platform!==socialPlatform.value)return false;
    const hashtags=socialHashtags(entry);
    const searchable=[entry.title,entry.description,entry.original_caption,entry.caption,entry.translated_caption,entry.translation,entry.contextualization,entry.account,entry.profile,entry.platform,entry.category,...hashtags].join(' ').toLocaleLowerCase();
    if(query&&!searchable.includes(query))return false;
    const date=String(socialEntryDate(entry)).slice(0,10);
    if(startDate&&(!date||date<startDate))return false;
    if(endDate&&(!date||date>endDate))return false;
    return true;
  });
  entries.sort((a,b)=>{const da=socialEntryDate(a),db=socialEntryDate(b);return socialSort?.value==='oldest'?String(da).localeCompare(String(db)):String(db).localeCompare(String(da));});
  if(socialCount)socialCount.textContent=socialText('showing')+' '+entries.length+' '+socialText('results');
  if(!entries.length){
    const hasCategory=socialEntries.some(entry=>activeSocialCategory==='all'||entry.category===activeSocialCategory);
    const title=hasCategory?socialText('none'):(socialLang()==='pt'?'Ainda não há publicações':socialLang()==='es'?'Aún no hay publicaciones':socialLang()==='th'?'ยังไม่มีโพสต์':'No publications yet');
    socialGrid.innerHTML='<div class="empty-state social-empty"><span>♡</span><h3>'+socialEscape(title)+'</h3><p>'+socialEscape(socialText('empty'))+'</p></div>';
    return;
  }
  if(activeSocialView==='table'){
    socialGrid.innerHTML='<div class="social-table-wrap"><table class="social-table"><thead><tr>'+['platform','date','account','original','translation','context','hashtags','metrics','source'].map(k=>'<th>'+socialEscape(socialText(k==='original'?'caption':k))+'</th>').join('')+'</tr></thead><tbody>'+entries.map(entry=>{
      const tags=socialHashtags(entry).map(tag=>socialEscape(tag)).join(' ');
      const metrics=socialMetrics(entry).map(([k,v])=>socialEscape(k)+': '+socialEscape(Number(v).toLocaleString())).join(' · ');
      const url=entry.url||entry.permalink||'';
      return '<tr><td>'+socialEscape(entry.platform||'—')+'</td><td>'+socialEscape(socialEntryDate(entry)||'—')+'</td><td>'+socialEscape(entry.account||entry.profile||'—')+'</td><td>'+socialEscape(entry.original_caption??entry.caption??entry.description??'—')+'</td><td>'+socialEscape(entry.translated_caption??entry.translation??'—')+'</td><td>'+socialEscape(entry.contextualization??entry.context??'—')+'</td><td>'+tags+'</td><td>'+metrics+'</td><td>'+(url?'<a href="'+socialEscape(url)+'" target="_blank" rel="noopener noreferrer">'+socialEscape(socialText('view'))+'</a>':'—')+'</td></tr>';
    }).join('')+'</tbody></table></div>';
    return;
  }
  socialGrid.innerHTML=entries.map(entry=>{
    const mediaSource=entry.image||entry.thumbnail||entry.media_url||'';
    const media=mediaSource?'<img class="social-update-media" src="'+socialEscape(mediaSource)+'" alt="'+socialEscape(entry.imageAlt||entry.title||'Atom Pariya social update')+'" loading="lazy">':'<div class="social-update-placeholder" aria-hidden="true">♡</div>';
    const platform=socialEscape(entry.platform||'Social media');
    const date=socialEscape(socialEntryDate(entry)||'');
    const account=entry.account||entry.profile||'';
    const original=entry.original_caption??entry.caption??entry.description??'';
    const translation=entry.translated_caption??entry.translation??'';
    const context=entry.contextualization??entry.context??'';
    const hashtags=socialHashtags(entry);
    const metrics=socialMetrics(entry);
    const metricMarkup=metrics.length?'<div class="social-update-metrics">'+metrics.map(([k,v])=>'<span><strong>'+socialEscape(Number(v).toLocaleString())+'</strong> '+socialEscape(k)+'</span>').join('')+'</div>':'';
    const tagMarkup=hashtags.length?'<div class="social-hashtags" aria-label="'+socialEscape(socialText('hashtags'))+'">'+hashtags.map(tag=>'<button type="button" class="social-hashtag" data-hashtag="'+socialEscape(tag)+'">'+socialEscape(tag)+'</button>').join('')+'</div>':'';
    const link=entry.url||entry.permalink||'';
    const source=entry.source?'<p class="social-source-note">'+socialEscape(socialText('source'))+': '+socialEscape(entry.source==='api'?socialText('api'):socialText('manual'))+'</p>':'';
    const originalMarkup=original?'<section class="social-caption-block"><span class="social-caption-label">'+socialEscape(socialText('original'))+'</span><p class="social-caption-text">'+socialEscape(original)+'</p></section>':'';
    const translationMarkup=translation?'<section class="social-translation-panel"><span class="social-caption-label">'+socialEscape(socialText('translation'))+'</span><p class="social-caption-text">'+socialEscape(translation)+'</p></section>':'';
    const contextMarkup=context?'<section class="social-context-panel"><span class="social-caption-label">'+socialEscape(socialText('context'))+'</span><p class="social-caption-text">'+socialEscape(context)+'</p></section>':'';
    return '<article class="social-update-card">'+media+'<div class="social-update-body"><div class="social-update-meta"><span>'+platform+'</span><time datetime="'+date+'">'+date+'</time></div>'+(account?'<p class="social-account">'+socialEscape(account)+'</p>':'')+(entry.title?'<h3>'+socialEscape(entry.title)+'</h3>':'')+originalMarkup+translationMarkup+contextMarkup+tagMarkup+metricMarkup+(link?'<a class="social-update-link" href="'+socialEscape(link)+'" target="_blank" rel="noopener noreferrer">'+socialEscape(socialText('view'))+'</a>':'')+source+'</div></article>';
  }).join('');
}
socialFilters.forEach(button=>button.addEventListener('click',()=>{
  activeSocialCategory=button.dataset.socialFilter;
  socialFilters.forEach(item=>item.classList.toggle('active',item===button));
  renderSocialUpdates();
}));
socialViewButtons.forEach(button=>button.addEventListener('click',()=>{
  activeSocialView=button.dataset.socialView;
  socialViewButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
  renderSocialUpdates();
}));
socialGrid?.addEventListener('click',event=>{
  const button=event.target.closest('[data-hashtag]');
  if(!button||!socialSearch)return;
  socialSearch.value=button.dataset.hashtag;
  renderSocialUpdates();
  socialSearch.focus();
});
[socialPlatform,socialSearch,socialPeriod,socialSort,socialFrom,socialTo].forEach(control=>{
  control?.addEventListener('input',renderSocialUpdates);
  control?.addEventListener('change',renderSocialUpdates);
});
socialPeriod?.addEventListener('change',()=>{
  document.querySelector('.social-custom-dates')?.classList.toggle('visible',socialPeriod.value==='custom');
});
function refreshSocialFilterLanguage(){
  if(socialSearch)socialSearch.placeholder=socialText('search');
  const allButton=socialFilters.find(button=>button.dataset.socialFilter==='all');
  if(allButton)allButton.textContent=socialText('all');
  socialViewButtons.forEach(button=>button.textContent=socialText(button.dataset.socialView));
  populateSocialPlatforms();
  renderSocialUpdates();
}
if(socialGrid){
  fetch('data/social-updates.json').then(response=>{if(!response.ok)throw new Error('Social archive data unavailable');return response.json();})
    .then(data=>{socialEntries=Array.isArray(data)?data:[];populateSocialPlatforms();renderSocialUpdates();})
    .catch(()=>{socialEntries=[];populateSocialPlatforms();renderSocialUpdates();});
}
languageSelect?.addEventListener('change',refreshSocialFilterLanguage);
refreshSocialFilterLanguage();

// Individual career records opened from the Timeline.
const careerRecords={
'social-death-vote':{title:'Social Death Vote',kind:'Série · Suspense · Mistério',dates:'19 de maio a 23 de junho de 2018',description:'Primeiro trabalho de atuação de Atom. Ela interpretou Best na série exibida pelo Channel 3.',gallery:['1.%20assets/Timeline/Social%20Death%20Vote/IMG_2840.jpeg','1.%20assets/Timeline/Social%20Death%20Vote/IMG_2841.jpeg','1.%20assets/Timeline/Social%20Death%20Vote/IMG_2842.jpeg','1.%20assets/Timeline/Social%20Death%20Vote/IMG_2843.jpeg','1.%20assets/Timeline/Social%20Death%20Vote/IMG_2844.jpeg','1.%20assets/Timeline/Social%20Death%20Vote/IMG_2845.jpeg'],links:[['Perfil de Atom no MyDramaList','https://mydramalist.com/people/19658-atom-pariya-piyapanopas']]},
'broken-of-love':{title:'BROKEN (Of) LOVE · หัวใจช้ำรัก',kind:'Série · Drama · Romance · GL',dates:'28 de março a 16 de maio de 2026',description:'Atom interpreta Lalin / Lyla na produção da Fabel Entertainment. Este arquivo reúne as informações e poderá receber cartazes, fotos promocionais, vídeos, entrevistas, episódios e links oficiais.',gallery:['https://img.youtube.com/vi/T6h6tDomGQM/maxresdefault.jpg'],links:[['Assistir ao primeiro episódio','https://www.youtube.com/watch?v=T6h6tDomGQM'],['Perfil de Atom no MyDramaList','https://mydramalist.com/people/19658-atom-pariya-piyapanopas']]},
'viis':{title:'VIIS · GNEST',kind:'Grupo musical · T-pop',dates:'2023–2025',description:'Arquivo da trajetória musical de Atom como integrante do grupo VIIS. Músicas, apresentações, vídeos e participações serão reunidos aqui conforme os materiais forem catalogados.',gallery:[],links:[['Canal oficial do VIIS no YouTube','https://www.youtube.com/@gnest_official']] }
};
const careerPanel=document.querySelector('#work-detail-panel');
const careerContent=document.querySelector('#work-detail-content');
const careerTimeline=document.querySelector('#timeline .timeline-list');
function openCareerRecord(key){const item=careerRecords[key];if(!item||!careerPanel||!careerContent)return;const safe=s=>String(s).replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));careerContent.innerHTML='<div class="work-detail-content"><p class="work-detail-meta">'+safe(item.kind)+'</p><h2>'+safe(item.title)+'</h2><p class="catalogue-date">'+safe(item.dates)+'</p><p>'+safe(item.description)+'</p>'+(item.gallery.length?'<div class="work-detail-gallery">'+item.gallery.map((src,i)=>'<img src="'+safe(src)+'" alt="'+safe(item.title)+' — imagem '+(i+1)+'" loading="lazy">').join('')+'</div>':'')+'<div class="work-detail-links">'+item.links.map(([label,url])=>'<a href="'+safe(url)+'" target="_blank" rel="noopener noreferrer">'+safe(label)+' ↗</a>').join('')+'</div></div>';careerPanel.hidden=false;careerTimeline.hidden=true;careerPanel.scrollIntoView({behavior:'smooth',block:'start'});}
document.querySelectorAll('[data-work-detail]').forEach(button=>button.addEventListener('click',()=>openCareerRecord(button.dataset.workDetail)));
document.querySelector('[data-work-back]')?.addEventListener('click',()=>{careerPanel.hidden=true;careerTimeline.hidden=false;careerTimeline.scrollIntoView({behavior:'smooth',block:'start'});});


// Individual musical releases belong directly in the main career timeline.
const timelineMusicalEntries=document.querySelector('#timeline-musical-entries');
if(timelineMusicalEntries){
  fetch('data/works.json').then(r=>{if(!r.ok)throw new Error('Works data unavailable');return r.json();}).then(items=>{
    const records=items.filter(item=>Number.isInteger(item.sourceOrder)).sort((a,b)=>(a.date||'9999-99-99').localeCompare(b.date||'9999-99-99') || a.sourceOrder-b.sourceOrder);
    const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    timelineMusicalEntries.innerHTML=records.map(item=>{
      const detail='work.html?id='+encodeURIComponent(item.id);
      const link=item.links?.[0]?.url||'#';
      return '<article class="timeline-entry timeline-musical-entry" data-source-order="'+item.sourceOrder+'"><div class="timeline-entry-content"><h3><a href="'+detail+'" target="_blank" rel="noopener noreferrer" data-musical-title="'+escapeHTML(item.id)+'">'+escapeHTML(item.title)+'</a></h3><a class="timeline-musical-image" href="'+detail+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir detalhes de '+escapeHTML(item.title)+'"><img src="'+escapeHTML(item.image)+'" alt="Imagem de '+escapeHTML(item.title)+'" loading="lazy"></a><p class="work-catalogue-date">Data de lançamento: '+escapeHTML(item.dateLabel||'Data a confirmar')+'</p><p class="work-catalogue-kind">'+escapeHTML(item.kind)+' · '+escapeHTML(item.genre)+'</p><p class="work-catalogue-description">'+escapeHTML(item.description)+'</p><a class="timeline-watch-link" href="'+escapeHTML(link)+'" target="_blank" rel="noopener noreferrer">Assistir ao vídeo no YouTube ↗</a></div></article>';
    }).join('');
  }).catch(()=>{timelineMusicalEntries.innerHTML='<p class="muted">Não foi possível carregar os registros musicais agora.</p>';});
}
