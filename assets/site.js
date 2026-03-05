function splitConferenceCards() {
  var papersPane = document.getElementById('papers');
  var conferencesList = document.getElementById('conferences-list');

  if (!papersPane || !conferencesList) {
    return;
  }

  var cards = Array.from(papersPane.querySelectorAll(':scope > .col'));
  var conferenceCards = [];

  cards.forEach(function (cardCol) {
    var subtitle = cardCol.querySelector('.card-subtitle');
    var kind = subtitle ? subtitle.textContent.trim().toLowerCase() : '';

    if (kind === 'conference') {
      conferenceCards.push(cardCol);
    }
  });

  function extractYear(cardCol) {
    var title = ((cardCol.querySelector('.card-title') || {}).textContent || '');
    var date = ((cardCol.querySelector('.row.mt-2 .text-secondary') || {}).textContent || '');
    var content = title + ' ' + date;
    var yearMatches = content.match(/\b(19|20)\d{2}\b/g);
    if (!yearMatches || !yearMatches.length) {
      return 0;
    }
    return Number(yearMatches[yearMatches.length - 1]);
  }

  conferenceCards
    .sort(function (a, b) {
      return extractYear(b) - extractYear(a);
    })
    .forEach(function (cardCol) {
      conferencesList.appendChild(cardCol);
    });
}

function curateHighlights() {
  var highlightsRow = document.querySelector('#highlights > .row.mt-2');
  var projectsRow = document.querySelector('#projects > .row.mt-2');
  if (!highlightsRow) {
    return;
  }

  var titleOf = function (col) {
    var node = col.querySelector('.card-title');
    return node ? node.textContent.trim() : '';
  };

  var hasTitle = function (list, title) {
    return list.some(function (col) {
      return titleOf(col) === title;
    });
  };

  var highlights = Array.from(highlightsRow.querySelectorAll(':scope > .col'));
  var speechTitle = 'Speech to Text';
  var octTitle = 'A Transformer-Based Anomaly Detection System for OCT Image Embeddings';
  var vaeTitle = 'Variational Autoencoder as a Data Augmentation tool for Confocal Microscopy Images';

  if (!hasTitle(highlights, speechTitle) && projectsRow) {
    var speechFromProjects = Array.from(projectsRow.querySelectorAll(':scope > .col')).find(function (col) {
      return titleOf(col) === speechTitle;
    });
    if (speechFromProjects) {
      highlights.push(speechFromProjects.cloneNode(true));
    }
  }

  var findByTitle = function (title) {
    return highlights.find(function (col) { return titleOf(col) === title; }) || null;
  };

  var oct = findByTitle(octTitle);
  var vae = findByTitle(vaeTitle);
  var speech = findByTitle(speechTitle);

  var remaining = highlights.filter(function (col) {
    var t = titleOf(col);
    return t !== octTitle && t !== vaeTitle && t !== speechTitle;
  });

  var ordered = [];
  if (oct) {
    ordered.push(oct);
  }
  if (vae) {
    ordered.push(vae);
  }
  if (remaining.length) {
    ordered.push(remaining.shift());
  }
  if (speech) {
    ordered.push(speech);
  }
  ordered = ordered.concat(remaining);

  highlightsRow.innerHTML = '';
  ordered.forEach(function (col) {
    highlightsRow.appendChild(col);
  });

  var speechCard = Array.from(highlightsRow.querySelectorAll(':scope > .col')).find(function (col) {
    var titleNode = col.querySelector('.card-title');
    return titleNode && titleNode.textContent.trim() === speechTitle;
  });
  if (speechCard) {
    ensureHighlightStar(speechCard);
  }
}

function ensureHighlightStar(cardCol) {
  var firstRow = cardCol.querySelector('.card .card-body > .row');
  if (!firstRow) {
    return;
  }

  if (firstRow.querySelector('.bi-star-fill')) {
    return;
  }

  var starCol = document.createElement('div');
  starCol.className = 'col d-flex flex-row-reverse';
  starCol.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#FFCE33" class="bi bi-star-fill" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>';
  firstRow.appendChild(starCol);
}

function parseColorToRgb(color) {
  var sample = document.createElement('span');
  sample.style.color = color;
  sample.style.display = 'none';
  document.body.appendChild(sample);
  var computed = window.getComputedStyle(sample).color;
  document.body.removeChild(sample);

  var match = computed.match(/\d+/g);
  if (!match || match.length < 3) {
    return null;
  }

  return {
    r: Number(match[0]),
    g: Number(match[1]),
    b: Number(match[2])
  };
}

function getContrastTextColor(color) {
  var rgb = parseColorToRgb(color);
  if (!rgb) {
    return '#111111';
  }

  var luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.62 ? '#111111' : '#ffffff';
}

function transformLanguageTags() {
  var cards = Array.from(document.querySelectorAll('.card'));

  cards.forEach(function (card) {
    var cardBody = card.querySelector('.card-body');
    if (!cardBody) {
      return;
    }

    var languageContainer = null;
    var directDivs = Array.from(cardBody.querySelectorAll(':scope > div'));
    directDivs.forEach(function (div) {
      if (div.classList.contains('row')) {
        return;
      }
      if (div.querySelector('svg.bi-circle-fill') && div.querySelector('.text-secondary')) {
        languageContainer = div;
      }
    });

    if (languageContainer) {
      var dots = Array.from(languageContainer.querySelectorAll('svg.bi-circle-fill'));
      var labels = Array.from(languageContainer.querySelectorAll('.text-secondary'));
      var tags = [];

      for (var i = 0; i < labels.length; i += 1) {
        if (!dots[i]) {
          continue;
        }
        var name = labels[i].textContent.trim();
        if (!name) {
          continue;
        }
        tags.push({ name: name, color: dots[i].getAttribute('fill') || '#666666' });
      }

      if (tags.length) {
        languageContainer.classList.add('lang-tags');
        languageContainer.innerHTML = '';

        tags.forEach(function (tagData) {
          var tag = document.createElement('span');
          tag.className = 'lang-tag';
          tag.textContent = tagData.name;
          tag.style.backgroundColor = tagData.color;
          tag.style.color = getContrastTextColor(tagData.color);
          languageContainer.appendChild(tag);
        });
      }
    }

    var sharedContainer = addKeywordTags(card, languageContainer);
    addTopicTags(card, sharedContainer || languageContainer);
  });
}

function addKeywordTags(card, container) {
  var cardBody = card.querySelector('.card-body');
  if (!cardBody) {
    return container;
  }
  var isConferenceCard = Boolean(card.closest('#conferences')) || /conference/i.test(((card.querySelector('.card-subtitle') || {}).textContent || ''));
  var isHighlightCard = Boolean(card.closest('#highlights'));

  var keywordParagraph = Array.from(cardBody.querySelectorAll(':scope > p:not(.card-text)')).find(function (node) {
    return /^\s*keywords\s*:/i.test(node.textContent || '');
  });

  if (!keywordParagraph) {
    return container;
  }

  if (isConferenceCard || isHighlightCard) {
    keywordParagraph.remove();
    return container;
  }

  var raw = keywordParagraph.textContent || '';
  var match = raw.match(/\{([^}]*)\}/);
  var keywordText = match ? match[1] : raw.replace(/^\s*keywords\s*:/i, '');
  var keywords = keywordText
    .split(/[;,]/)
    .map(function (term) { return term.trim(); })
    .filter(Boolean);

  keywordParagraph.remove();

  if (!keywords.length) {
    return container;
  }

  var tagContainer = container;
  if (!tagContainer) {
    tagContainer = document.createElement('div');
    tagContainer.className = 'lang-tags';
    var footerRow = cardBody.querySelector(':scope > .row.mt-2');
    if (footerRow) {
      cardBody.insertBefore(tagContainer, footerRow);
    } else {
      cardBody.appendChild(tagContainer);
    }
  } else if (!tagContainer.classList.contains('lang-tags')) {
    tagContainer.classList.add('lang-tags');
  }

  keywords.forEach(function (keyword) {
    var tag = document.createElement('span');
    tag.className = 'lang-tag keyword-tag';
    tag.textContent = keyword;
    tagContainer.appendChild(tag);
  });

  return tagContainer;
}

function addTopicTags(card, container) {
  var cardBody = card.querySelector('.card-body');
  if (!cardBody) {
    return;
  }

  var title = (card.querySelector('.card-title') || {}).textContent || '';
  var subtitle = (card.querySelector('.card-subtitle') || {}).textContent || '';
  var description = (card.querySelector('.card-text') || {}).textContent || '';
  var summary = (title + ' ' + subtitle + ' ' + description).toLowerCase();
  var tags = [];
  var isPaperOrConference = Boolean(card.closest('#papers')) || Boolean(card.closest('#conferences'));
  var isPublicationIeee = subtitle.trim().toLowerCase() === 'publication ieee';

  if (isPaperOrConference || /\bartificial intelligence\b|\bai\b|\bdeep learning\b/.test(summary)) {
    tags.push({ label: 'Artficial Intelligence', className: 'topic-ai' });
  }

  if (isPublicationIeee) {
    tags.push({ label: 'Paper', className: 'topic-paper' });
  }

  if (/\bimage\b|\bimages\b|\bimaging\b|\bmicroscopy\b|\bretina\b|\bsegmentation\b|\bsift\b|\bcanny\b|\bharris\b|\bconfocal\b|\bcomputer vision\b|\bvisualization\b/.test(summary)) {
    tags.push({ label: 'Computer Vision', className: 'topic-cv' });
  }

  if (!tags.length) {
    return;
  }

  var tagContainer = container;
  if (!tagContainer) {
    tagContainer = document.createElement('div');
    tagContainer.className = 'lang-tags';
    var footerRow = cardBody.querySelector(':scope > .row.mt-2');
    if (footerRow) {
      cardBody.insertBefore(tagContainer, footerRow);
    } else {
      cardBody.appendChild(tagContainer);
    }
  }

  tags.forEach(function (topic) {
    var exists = Array.from(tagContainer.querySelectorAll('.topic-tag')).some(function (node) {
      return node.textContent.trim() === topic.label;
    });
    if (exists) {
      return;
    }

    var tag = document.createElement('span');
    tag.className = 'lang-tag topic-tag ' + topic.className;
    tag.textContent = topic.label;
    tagContainer.appendChild(tag);
  });
}

function normalizePublicationAuthors() {
  var publicationCards = Array.from(document.querySelectorAll('.card')).filter(function (card) {
    var subtitle = (card.querySelector('.card-subtitle') || {}).textContent || '';
    return subtitle.trim() === 'Publication IEEE';
  });

  publicationCards.forEach(function (card) {
    var desc = card.querySelector('.card-text');
    if (!desc) {
      return;
    }

    var text = desc.textContent || '';
    if (/^E\.\s*S\.\s*Piñeiro et al\./.test(text)) {
      return;
    }

    desc.textContent = text.replace(/^E\.\s*S\.\s*Piñeiro[\s\S]*?,\s*"/, 'E. S. Piñeiro et al., "');
  });
}

function buildTagFilter() {
  var nav = document.querySelector('.nav');
  if (!nav) {
    return null;
  }

  var wrapper = document.createElement('div');
  wrapper.className = 'tag-filter-bar';
  wrapper.innerHTML = [
    '<p class="tag-filter-label">Filter by tag</p>',
    '<select id="tag-filter" class="tag-filter-select" aria-label="Filter cards by tag">',
    '  <option value="">All tags</option>',
    '</select>'
  ].join('');

  nav.parentNode.insertBefore(wrapper, nav.nextSibling);
  return wrapper.querySelector('#tag-filter');
}

function getActivePane() {
  var active = document.querySelector('.tab-content .tab-pane.active');
  if (active) {
    return active;
  }
  return document.querySelector('.tab-content .tab-pane');
}

function getPaneTags(pane) {
  if (!pane) {
    return [];
  }

  var tags = Array.from(pane.querySelectorAll('.card .lang-tag'))
    .map(function (node) { return node.textContent.trim(); })
    .filter(Boolean);

  return Array.from(new Set(tags)).sort(function (a, b) {
    return a.localeCompare(b);
  });
}

function populateTagFilter(select, pane, selectedTag) {
  if (!select || !pane) {
    return;
  }

  var tags = getPaneTags(pane);
  select.innerHTML = '<option value="">All tags</option>';

  tags.forEach(function (tag) {
    var option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    select.appendChild(option);
  });

  if (selectedTag && tags.indexOf(selectedTag) !== -1) {
    select.value = selectedTag;
  } else {
    select.value = '';
  }
}

function applyTagFilter(pane, selectedTag) {
  if (!pane) {
    return;
  }

  var normalized = (selectedTag || '').trim().toLowerCase();
  var cards = Array.from(pane.querySelectorAll('.card'));

  cards.forEach(function (card) {
    var col = card.closest('.col');
    if (!col) {
      return;
    }

    if (!normalized) {
      col.style.display = '';
      return;
    }

    var hasTag = Array.from(card.querySelectorAll('.lang-tag')).some(function (tagNode) {
      return tagNode.textContent.trim().toLowerCase() === normalized;
    });

    col.style.display = hasTag ? '' : 'none';
  });
}

function setupTagFiltering() {
  var select = buildTagFilter();
  if (!select) {
    return;
  }

  var filterByPane = {};

  function syncActivePane() {
    var pane = getActivePane();
    if (!pane || !pane.id) {
      return;
    }

    var selected = filterByPane[pane.id] || '';
    populateTagFilter(select, pane, selected);
    applyTagFilter(pane, select.value);
  }

  syncActivePane();

  select.addEventListener('change', function () {
    var pane = getActivePane();
    if (!pane || !pane.id) {
      return;
    }

    filterByPane[pane.id] = select.value;
    applyTagFilter(pane, select.value);
  });

  var tabButtons = Array.from(document.querySelectorAll('#nav-tab [data-bs-toggle="tab"]'));
  tabButtons.forEach(function (button) {
    button.addEventListener('shown.bs.tab', function () {
      syncActivePane();
    });
  });
}

function makeProjectCardsClickable() {
  var cards = Array.from(document.querySelectorAll('.card'));

  cards.forEach(function (card) {
    var link = card.querySelector('a.card-link');
    if (!link) {
      return;
    }

    var linkText = (link.textContent || '').trim().toLowerCase();
    var isProject = /see project/.test(linkText);
    var isPaper = Boolean(card.closest('#papers')) && /see publication/.test(linkText);

    if (!isProject && !isPaper) {
      return;
    }

    var href = link.getAttribute('href');
    if (!href) {
      return;
    }

    card.classList.add('card-clickable');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');

    card.addEventListener('click', function (event) {
      if (event.target.closest('a, button')) {
        return;
      }
      window.open(href, '_self');
    });

    card.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      window.open(href, '_self');
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  splitConferenceCards();
  curateHighlights();
  normalizePublicationAuthors();
  transformLanguageTags();
  makeProjectCardsClickable();
  setupTagFiltering();
});
