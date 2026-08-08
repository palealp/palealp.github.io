(() => {
  const encoded = window.__PROFILE_DATA__;
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const profiles = JSON.parse(new TextDecoder().decode(bytes));
  const root = document.documentElement;
  const languageButtons = [...document.querySelectorAll('[data-set-language]')];

  const ui = {
    en: {
      profile: 'Profile',
      experience: 'Experience',
      education: 'Education',
      message: 'Message',
      contact: 'Contact',
      verified: 'Verified profile',
      privacyTitle: 'Shared privately',
      privacyText: 'This profile is intended for direct, individual sharing.',
      metrics: [
        ['18', 'years of experience in cybersecurity'],
        ['9', 'years in leadership positions'],
        ['35+', 'team members'],
        ['1500+', 'b2b clients'],
      ],
    },
    ru: {
      profile: 'Профиль',
      experience: 'Опыт',
      education: 'Образование',
      message: 'Написать',
      contact: 'Контакты',
      verified: 'Подтверждённый профиль',
      privacyTitle: 'Личная ссылка',
      privacyText: 'Профиль предназначен для индивидуальной рассылки по прямой ссылке.',
      metrics: [
        ['18', 'лет опыта в кибербезопасности'],
        ['9', 'лет опыта на руководящих позициях'],
        ['35+', 'человек в команде'],
        ['1500+', 'b2b клиентов'],
      ],
    },
  };

  const organizations = {
    hackski: {
      href: 'https://hackski.com/',
      src: 'assets/logo-hackski.svg',
      alt: 'Hackski',
      fallback: 'HC',
      className: 'company-mark--hackski',
    },
    bank: {
      href: 'https://dolinskbank.ru/',
      src: 'assets/logo-dolinsk.svg',
      alt: 'Dolinsk Bank',
      fallback: 'BD',
      className: 'company-mark--bank',
    },
    kdv: {
      href: 'https://kdv-group.com/ru',
      src: 'assets/logo-kdv.svg',
      alt: 'KDV Group',
      fallback: 'K',
      className: 'company-mark--kdv',
    },
    gpb: {
      href: 'https://www.gazprombank.ru/',
      src: 'assets/logo-gpb.svg',
      alt: 'Gazprombank',
      fallback: 'G',
      className: 'company-mark--gpb',
    },
    nstu: {
      href: 'https://www.nstu.ru/',
      src: 'assets/logo-nstu.svg',
      alt: 'NSTU',
      fallback: 'NSTU',
      className: 'company-mark--edu',
    },
    tsu: {
      href: 'https://www.tsu.ru/',
      src: 'assets/logo-tsu.svg',
      alt: 'TSU',
      fallback: 'TSU',
      className: 'company-mark--law',
    },
    rbc: {
      href: 'https://rbc.ru/',
      src: 'assets/logo-rbc.svg',
      alt: 'RBC',
      fallback: 'RBC',
      className: 'company-mark--course',
    },
  };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function safePreference() {
    try { return localStorage.getItem('profile-language'); } catch (_) { return null; }
  }

  function chooseInitialLanguage() {
    const saved = safePreference();
    if (saved === 'en' || saved === 'ru') return saved;
    return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
  }

  function organizationMark(config) {
    const mark = element(config.href ? 'a' : 'div', `company-mark ${config.className || ''}${config.src ? '' : ' is-fallback'}`);
    if (config.href) {
      mark.href = config.href;
      mark.target = '_blank';
      mark.rel = 'noreferrer';
      mark.setAttribute('aria-label', config.alt);
    }
    if (config.src) {
      const image = element('img');
      image.src = config.src;
      image.alt = config.alt;
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', () => {
        image.hidden = true;
        mark.classList.add('is-fallback');
      }, { once: true });
      mark.append(image);
    }
    mark.append(element('span', 'company-mark__fallback', config.fallback));
    return mark;
  }

  function renderMetrics(language) {
    const host = document.getElementById('metrics');
    host.replaceChildren(...ui[language].metrics.map(([value, label]) => {
      const item = element('div');
      item.append(element('strong', '', value), element('span', '', label));
      return item;
    }));
  }

  function splitOrganization(text) {
    const separator = text.lastIndexOf(', ');
    if (separator === -1) return [text, ''];
    return [text.slice(0, separator), text.slice(separator + 2)];
  }

  function renderExperience(data) {
    const host = document.getElementById('experience-list');
    host.replaceChildren();
    const marks = [organizations.hackski, organizations.bank, organizations.kdv, organizations.gpb];
    data.jobs.forEach((job, index) => {
      const article = element('article', `timeline-item${index === data.jobs.length - 1 ? ' timeline-item--last' : ''}`);
      const copy = element('div', 'timeline-copy');
      const [position, organization] = splitOrganization(job.title);
      copy.append(element('h3', '', position), element('p', 'company', organization));
      const meta = element('div', 'meta-pair');
      meta.append(element('span', '', job.date), element('span', '', job.location));
      copy.append(meta);
      const details = element('div', 'details');
      if (job.intro !== null) details.append(element('p', '', job.intro));
      const list = element('ul');
      job.bullets.forEach((item) => list.append(element('li', '', item)));
      details.append(list);
      copy.append(details);
      article.append(organizationMark(marks[index]), copy);
      host.append(article);
    });
  }

  function renderEducation(data) {
    const host = document.getElementById('education-list');
    host.replaceChildren();
    const marks = [organizations.nstu, organizations.tsu];
    data.items.forEach((item, index) => {
      const article = element('article', `timeline-item compact-item${index === data.items.length - 1 ? ' timeline-item--last' : ''}`);
      const copy = element('div', 'timeline-copy');
      const [degree, institution] = splitOrganization(item.title);
      copy.append(element('h3', '', degree), element('p', 'company', institution));
      const meta = element('div', 'meta-pair');
      meta.append(element('span', '', item.date), element('span', '', item.location));
      copy.append(meta);
      article.append(organizationMark(marks[index]), copy);
      host.append(article);
    });
  }

  function renderTraining(data) {
    const host = document.getElementById('training-content');
    host.replaceChildren();
    const article = element('article', 'timeline-item compact-item timeline-item--last');
    const copy = element('div', 'timeline-copy');
    const [course, provider] = splitOrganization(data.text);
    copy.append(element('h3', '', course), element('p', 'company', provider), element('p', 'meta', data.date));
    article.append(organizationMark(organizations.rbc), copy);
    host.append(article);
  }

  function renderSkills(data) {
    const host = document.getElementById('skills-text');
    const skills = data.text.split(',').map((item) => item.trim()).filter(Boolean);
    host.replaceChildren(...skills.map((skill) => element('span', '', skill)));
  }

  function profileParagraphs(language, data) {
    if (language !== 'ru') return data.profile.paragraphs;
    const paragraphs = data.profile.paragraphs;
    return [
      paragraphs[0],
      [paragraphs[1], paragraphs[2], paragraphs[3]].map((paragraph) => paragraph.trim()).join(' '),
      paragraphs[4],
      [paragraphs[5], paragraphs[6], paragraphs[7]].map((paragraph) => paragraph.trim()).join(' '),
      paragraphs[8],
    ];
  }

  function render(language) {
    const data = profiles[language];
    root.lang = language;
    root.dataset.language = language;
    document.title = data.name;
    document.querySelectorAll('[data-ui]').forEach((node) => { node.textContent = ui[language][node.dataset.ui]; });
    languageButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.setLanguage === language)));

    document.getElementById('profile-name').textContent = data.name;
    document.getElementById('profile-headline').textContent = data.headline;
    const badge = document.getElementById('verified-badge');
    badge.setAttribute('aria-label', ui[language].verified);
    badge.title = ui[language].verified;

    const identity = document.getElementById('identity-lines');
    if (language === 'ru') {
      identity.replaceChildren(element('p', '', 'Гражданство РФ · Дата рождения: 9 июня 1988 (38 лет) · Удаленный/гибридный формат · Готов к переезду и командировкам'));
    } else {
      identity.replaceChildren(element('p', '', 'Russian citizenship · Date of birth: 9 June 1988 (38 years old) · Remote/hybrid format · Open to relocation and business travel'));
    }
    document.getElementById('message-link').href = `mailto:${data.contact.email}`;
    document.getElementById('email-link').href = `mailto:${data.contact.email}`;
    document.getElementById('email-text').textContent = data.contact.email;
    document.getElementById('phone-link').href = `tel:${data.contact.phone.replace(/[^+\d]/g, '')}`;
    document.getElementById('phone-text').textContent = data.contact.phone;
    document.getElementById('personal-text').textContent = data.contact.details[0];
    document.getElementById('contact-details').replaceChildren();

    document.getElementById('profile-title').textContent = data.profile.title;
    document.getElementById('profile-paragraphs').replaceChildren(...profileParagraphs(language, data).map((paragraph) => element('p', '', paragraph)));
    renderMetrics(language);
    document.getElementById('experience-title').textContent = data.experience.title;
    renderExperience(data.experience);
    document.getElementById('education-title').textContent = data.education.title;
    renderEducation(data.education);
    document.getElementById('training-title').textContent = data.training.title;
    renderTraining(data.training);
    document.getElementById('skills-title').textContent = data.skills.title;
    renderSkills(data.skills);
    document.getElementById('languages-title').textContent = data.languages.title;
    document.getElementById('languages-text').textContent = data.languages.text;
    document.getElementById('hobbies-title').textContent = data.hobbies.title;
    document.getElementById('hobbies-text').textContent = data.hobbies.text;

    document.getElementById('privacy-title').textContent = ui[language].privacyTitle;
    document.getElementById('privacy-text').textContent = ui[language].privacyText;

    try { localStorage.setItem('profile-language', language); } catch (_) { /* Preference storage may be disabled. */ }
  }

  languageButtons.forEach((button) => button.addEventListener('click', () => render(button.dataset.setLanguage)));
  document.getElementById('year').textContent = new Date().getFullYear();
  render(chooseInitialLanguage());
})();
