
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const settingsBtn = document.getElementById('settings-btn');
  const backBtn = document.getElementById('back-btn');
  const homeView = document.getElementById('home-view');
  const settingsView = document.getElementById('settings-view');

  const iconHome = document.getElementById('icon-home');
  const iconSettings = document.getElementById('icon-settings');
  const iconSearch = document.getElementById('icon-search');
  const iconArrow = document.getElementById('icon-arrow');
  const favicon = document.getElementById('favicon');

  const clockDisplay = document.getElementById('clock-display');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchEngineSelect = document.getElementById('search-engine-select');
  const clockFormatToggle = document.getElementById('clock-format-toggle');
  const showClockToggle = document.getElementById('show-clock-toggle');
  const showLogoToggle = document.getElementById('show-logo-toggle');
  const elevationToggle = document.getElementById('elevation-toggle');
  const shortcutsToggle = document.getElementById('shortcuts-toggle');
  const animationsToggle = document.getElementById('animations-toggle');
  const resetBtn = document.getElementById('reset-btn');
  const shortcutsContainer = document.getElementById('shortcuts-container');
  const logoContainer = document.querySelector('.logo-container');

  let searchBaseUrl = 'https://www.google.com/search?q=';

  function updateIcons(isDark) {
    const suffix = isDark ? '_light.svg' : '_dark.svg';
    if(iconHome) { iconHome.src = 'assets/home' + suffix; favicon.href = 'assets/home' + suffix; }
    if(iconSettings) iconSettings.src = 'assets/settings' + suffix;
    if(iconSearch) iconSearch.src = 'assets/search' + suffix;
    if(iconArrow) iconArrow.src = 'assets/arrow' + suffix;
  }

  function applyPrimaryColor(color) {
    document.documentElement.style.setProperty('--md-sys-color-primary', color);
    document.documentElement.style.setProperty('--md-sys-color-primary-container', color + '33');
    document.documentElement.style.setProperty('--md-sys-color-ripple', color + '26');
  }

  // Load saved preferences
  chrome.storage.local.get([
    'darkMode', 'primaryColor', 'searchEngine', 'is24Hour', 
    'showClock', 'showLogo', 'elevationBlur', 'showShortcuts', 'smoothAnimations'
  ], (res) => {
    if (res.darkMode) {
      body.classList.add('dark-theme');
      updateIcons(true);
    } else {
      updateIcons(false);
    }

    if (res.primaryColor) {
      applyPrimaryColor(res.primaryColor);
    }

    if (res.searchEngine) {
      searchBaseUrl = res.searchEngine;
      searchEngineSelect.value = res.searchEngine;
    }

    if (res.is24Hour !== undefined) {
      clockFormatToggle.checked = res.is24Hour;
    }

    if (res.showClock !== undefined) {
      showClockToggle.checked = res.showClock;
      clockDisplay.style.display = res.showClock ? 'block' : 'none';
    }

    if (res.showLogo !== undefined) {
      showLogoToggle.checked = res.showLogo;
      logoContainer.style.display = res.showLogo ? 'block' : 'none';
    }

    if (res.elevationBlur !== undefined) {
      elevationToggle.checked = res.elevationBlur;
      if(res.elevationBlur) document.querySelectorAll('.m3-card').forEach(c => c.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)');
    }

    if (res.showShortcuts !== undefined) {
      shortcutsToggle.checked = res.showShortcuts;
      shortcutsContainer.style.display = res.showShortcuts ? 'flex' : 'none';
    }

    if (res.smoothAnimations !== undefined) {
      animationsToggle.checked = res.smoothAnimations;
    }
  });

  // Live Clock Update
  function updateClock() {
    const now = new Date();
    const is24 = clockFormatToggle.checked;
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    if (!is24) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      clockDisplay.textContent = `${hours}:${minutes} ${ampm}`;
    } else {
      hours = String(hours).padStart(2, '0');
      clockDisplay.textContent = `${hours}:${minutes}`;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Event Listeners for Settings
  if(themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-theme');
      const isDark = body.classList.contains('dark-theme');
      updateIcons(isDark);
      chrome.storage.local.set({ darkMode: isDark });
    });
  }

  // Color Dots
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      applyPrimaryColor(color);
      chrome.storage.local.set({ primaryColor: color });
    });
  });

  searchEngineSelect.addEventListener('change', (e) => {
    searchBaseUrl = e.target.value;
    chrome.storage.local.set({ searchEngine: searchBaseUrl });
  });

  clockFormatToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ is24Hour: e.target.checked });
    updateClock();
  });

  showClockToggle.addEventListener('change', (e) => {
    const val = e.target.checked;
    clockDisplay.style.display = val ? 'block' : 'none';
    chrome.storage.local.set({ showClock: val });
  });

  showLogoToggle.addEventListener('change', (e) => {
    const val = e.target.checked;
    logoContainer.style.display = val ? 'block' : 'none';
    chrome.storage.local.set({ showLogo: val });
  });

  elevationToggle.addEventListener('change', (e) => {
    const val = e.target.checked;
    document.querySelectorAll('.m3-card').forEach(c => {
      c.style.boxShadow = val ? '0 8px 24px rgba(0,0,0,0.12)' : 'none';
    });
    chrome.storage.local.set({ elevationBlur: val });
  });

  shortcutsToggle.addEventListener('change', (e) => {
    const val = e.target.checked;
    shortcutsContainer.style.display = val ? 'flex' : 'none';
    chrome.storage.local.set({ showShortcuts: val });
  });

  animationsToggle.addEventListener('change', (e) => {
    const val = e.target.checked;
    document.documentElement.style.setProperty('--m3-transition-duration', val ? '350ms' : '0ms');
    chrome.storage.local.set({ smoothAnimations: val });
  });

  resetBtn.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      window.location.reload();
    });
  });

  // View Switching
  if(settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      homeView.classList.remove('active');
      settingsView.classList.add('active');
    });
  }

  if(backBtn) {
    backBtn.addEventListener('click', () => {
      settingsView.classList.remove('active');
      homeView.classList.add('active');
    });
  }

  // Search Submit
  if(searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        if (query.startsWith('http://') || query.startsWith('https://')) {
          window.location.href = query;
        } else {
          window.location.href = searchBaseUrl + encodeURIComponent(query);
        }
      }
    });
  }

  // Google Ripple Effect
  document.querySelectorAll('.ripple').forEach(element => {
    element.addEventListener('click', function(e) {
      if (!animationsToggle.checked) return;
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 550);
    });
  });
});
