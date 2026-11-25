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

// Peachy artwork interaction and rotation. Preload the artwork for reliable mobile display.
const peachyImages = [
  ...[6,7,8,26,27,28,29,30,31,32,37,39,41].map(n => `1.%20assets/Peachy/Padrao/${n}.png`),
  ...[1,2,3,4,12,13,14,15].map(n => `1.%20assets/Peachy/Brasil/${n}.png`)
];
const peachyImage = document.querySelector('#peachy-rotator');
if (peachyImage && peachyImages.length > 1) {
  let peachyIndex = 0;
  let holdTimer = null;
  let longPress = false;
  let rotationTimer = null;
  peachyImages.forEach(src => { const preload = new Image(); preload.src = src; });

  function showNextPeachy() {
    peachyIndex = (peachyIndex + 1) % peachyImages.length;
    const nextSrc = peachyImages[peachyIndex];
    peachyImage.classList.add('changing');
    const reveal = () => {
      peachyImage.src = nextSrc;
      peachyImage.classList.remove('changing');
    };
    const probe = new Image();
    probe.onload = reveal;
    probe.onerror = () => {
      peachyImage.classList.remove('changing');
      console.warn('Não foi possível carregar a arte Peachy:', nextSrc);
    };
    probe.src = nextSrc;
  }

  function startRotation() {
    if (rotationTimer) window.clearInterval(rotationTimer);
    rotationTimer = window.setInterval(showNextPeachy, 3500);
  }
  function startHold() {
    longPress = false;
    holdTimer = window.setTimeout(() => {
      longPress = true;
      peachyImage.classList.add('expanded');
      if (navigator.vibrate) navigator.vibrate(45);
    }, 500);
  }
  function endHold() {
    if (holdTimer) window.clearTimeout(holdTimer);
    holdTimer = null;
    peachyImage.classList.remove('expanded');
  }
  peachyImage.addEventListener('pointerdown', startHold);
  ['pointerup','pointercancel','pointerleave'].forEach(type => peachyImage.addEventListener(type, endHold));
  peachyImage.addEventListener('contextmenu', event => event.preventDefault());
  peachyImage.addEventListener('click', () => {
    if (longPress) { longPress = false; return; }
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
  en: {\n    "ATOM PARIYA ARCHIVE":"ATOM PARIYA ARCHIVE",\n    "Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.":"Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.",\n    "Aestiny":"Aestiny",
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
  pt: {\n    "ATOM PARIYA ARCHIVE":"ARQUIVO ATOM PARIYA",\n    "Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.":"Criado com carinho por Atom Pariya Brasil. Projeto feito por fãs, sem afiliação ou endosso de Atom ou de seus representantes.",\n    "Aestiny":"Aestiny",
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
  es: {\n    "ATOM PARIYA ARCHIVE":"ARCHIVO ATOM PARIYA",\n    "Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.":"Creado con cariño por Atom Pariya Brasil. Proyecto hecho por fans, sin afiliación ni respaldo de Atom o sus representantes.",\n    "Aestiny":"Aestiny",
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
    "Explore fanbase archive ↗":"Explora el archivo de la fanbase ↗","FASHION ARCHIVE":"ARCHIVO DE MODA",
    "Looks, brands, outfits, accessories and fashion appearances.":"Looks, marcas, conjuntos, accesorios y apariciones relacionadas con la moda.","Explore the closet ↗":"Explora el guardarropa ↗",
    "LIVE & VIDEO ARCHIVE":"ARCHIVO DE DIRECTOS Y VIDEOS","Lives, translations, subtitles and moments worth replaying.":"Directos, traducciones, subtítulos y momentos que merecen volver a verse.",
    "Enter Repeach ↗":"Entra en Repeach ↗","THE JOURNEY":"LA TRAYECTORIA","Atom's first acting work. She played Best in the Channel 3 series.":"Primer trabajo de actuación de Atom. Interpretó a Best en la serie de Channel 3.",
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
    "Every live deserves another peach.":"Cada directo merece revivirse.","Full lives · Translations · Subtitles · Memorable moments":"Directos completos · Traducciones · Subtítulos · Momentos memorables",
    "THE LIVE COLLECTION":"LA COLECCIÓN DE DIRECTOS","Atom Live Archive":"Archivo de directos de Atom",
    "A collection of lives featuring Atom — whether she is on camera or heard in the background.":"Una colección de directos con la participación de Atom, ya sea en pantalla o escuchándose de fondo.",
    "Resumo da live":"Resumen del directo","Espaço reservado para registrar os assuntos, momentos e interações desta transmissão.":"Espacio reservado para registrar los temas, momentos e interacciones de esta transmisión.",
    "Assistir no YouTube ↗":"Ver en YouTube ↗","COMPLETE PLAYLIST":"LISTA COMPLETA","All Lives Featuring Atom":"Todos los directos con Atom",
    "Playlist with lives in which Atom participates, appears on screen or can be heard speaking in the background.":"Lista de directos en los que Atom participa, aparece en pantalla o se la escucha hablar de fondo.",
    "Open the complete YouTube playlist ↗":"Abrir la lista completa en YouTube ↗"
  },
  th: {\n    "ATOM PARIYA ARCHIVE":"ATOM PARIYA ARCHIVE",\n    "Created with love by Atom Pariya Brasil. Fan-made project; not affiliated with or endorsed by Atom or her representatives.":"จัดทำด้วยความรักโดย Atom Pariya Brasil เป็นโปรเจกต์แฟนคลับ ไม่ได้มีส่วนเกี่ยวข้องหรือได้รับการรับรองจาก Atom หรือผู้แทนของเธอ",\n    "Aestiny":"Aestiny",
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
const originalTextNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  const value = node.nodeValue;
  const key = value.trim();
  if (key) originalTextNodes.push({node, value, key});
}
function setLanguage(lang) {
  const dictionary = translations[lang] || translations.pt;
  originalTextNodes.forEach(({node,value,key}) => {
    const leading = value.match(/^\s*/)?.[0] || '';
    const trailing = value.match(/\s*$/)?.[0] || '';
    let translated = dictionary[key] || key;
    const liveLabel = key.match(/^LIVE ARCHIVE · (\d{2})( · PART 2| · VIIS)?$/);
    if (liveLabel) {
      const suffix = liveLabel[2] === ' · PART 2' ? (lang==='pt'?' · PARTE 2':lang==='es'?' · PARTE 2':lang==='th'?' · PART 2':' · PART 2') : liveLabel[2] || '';
      const prefix = lang==='pt'?'ARQUIVO DE LIVES · ':lang==='es'?'ARCHIVO DE DIRECTOS · ':lang==='th'?'อาร์ไคฟ์ไลฟ์ · ':'LIVE ARCHIVE · ';
      translated = prefix + liveLabel[1] + suffix;
    }
    node.nodeValue = leading + translated + trailing;
  });
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang === 'th' ? 'th' : lang;
  document.title = lang === 'pt' ? 'Atom Pariya Archive | Brasil' : lang === 'es' ? 'Atom Pariya Archive | Brasil' : lang === 'th' ? 'Atom Pariya Archive | Brasil' : 'Atom Pariya Archive | Brazil';
  const description = {
    pt:'Arquivo de fãs dedicado a Atom Pariya, criado por Atom Pariya Brasil.',
    en:'A fan-made archive dedicated to Atom Pariya, created by Atom Pariya Brasil.',
    es:'Archivo de fans dedicado a Atom Pariya, creado por Atom Pariya Brasil.',
    th:'แฟนอาร์ไคฟ์ที่จัดทำขึ้นเพื่อ Atom Pariya โดย Atom Pariya Brasil'
  };
  document.querySelector('meta[name="description"]')?.setAttribute('content', description[lang] || description.pt);
  if (languageSelect && languageSelect.value !== lang) languageSelect.value = lang;
  try { localStorage.setItem('atomArchiveLanguage', lang); } catch(e) {}
}
let initialLanguage = 'pt';
try { initialLanguage = localStorage.getItem('atomArchiveLanguage') || 'pt'; } catch(e) {}
if (!translations[initialLanguage]) initialLanguage = 'pt';
if (languageSelect) {
  languageSelect.value = initialLanguage;
  languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
}
setLanguage(initialLanguage);
