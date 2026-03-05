function splitConferenceCards() {
  var papersPane = document.getElementById('papers');
  var conferencesList = document.getElementById('conferences-list');

  if (!papersPane || !conferencesList) {
    return;
  }

  var cards = Array.from(papersPane.querySelectorAll(':scope > .col'));
  cards.forEach(function (cardCol) {
    var subtitle = cardCol.querySelector('.card-subtitle');
    var kind = subtitle ? subtitle.textContent.trim().toLowerCase() : '';

    if (kind === 'conference') {
      conferencesList.appendChild(cardCol);
    }
  });
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
  var containers = Array.from(document.querySelectorAll('.card .card-body > div'));

  containers.forEach(function (container) {
    if (container.classList.contains('row')) {
      return;
    }

    var dots = Array.from(container.querySelectorAll('svg.bi-circle-fill'));
    var labels = Array.from(container.querySelectorAll('.text-secondary'));

    if (!dots.length || !labels.length || dots.length !== labels.length) {
      return;
    }

    var tags = [];
    for (var i = 0; i < labels.length; i += 1) {
      var name = labels[i].textContent.trim();
      if (!name) {
        continue;
      }

      var color = dots[i].getAttribute('fill') || '#666666';
      tags.push({ name: name, color: color });
    }

    if (!tags.length) {
      return;
    }

    container.classList.add('lang-tags');
    container.innerHTML = '';

    tags.forEach(function (tagData) {
      var tag = document.createElement('span');
      tag.className = 'lang-tag';
      tag.textContent = tagData.name;
      tag.style.backgroundColor = tagData.color;
      tag.style.color = getContrastTextColor(tagData.color);
      container.appendChild(tag);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  splitConferenceCards();
  transformLanguageTags();
});
