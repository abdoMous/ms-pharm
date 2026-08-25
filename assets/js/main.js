/**
 * MS-PHARM Portal - Interactive JavaScript
 * Moussaoui Services Informatique
 */

document.addEventListener('DOMContentLoaded', () => {
  checkDecodeShortcut();
  initThemeToggle();
  initMobileMenu();
  initBackToTop();
  initSearchAndFilters();
  initVideoFilters();
  initAutoFileDates();
  initDownloadToasts();
  initSmoothScroll();
  initFooterYear();
});

function checkDecodeShortcut() {
  if (window.location.hash.toLowerCase() === '#decode' || window.location.search.includes('decode')) {
    window.location.href = 'decode.html';
  }
}

/**
 * Automatically fetch real file timestamps from Firebase Storage metadata
 */
async function initAutoFileDates() {
  const metaElements = document.querySelectorAll('[data-file-key]');
  if (!metaElements.length) return;

  const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/mspharm-28a52.appspot.com/o/';

  metaElements.forEach(async (el) => {
    const fileKey = el.getAttribute('data-file-key');
    if (!fileKey) return;

    try {
      const response = await fetch(`${baseUrl}${encodeURIComponent(fileKey)}`);
      if (response.ok) {
        const data = await response.json();
        const updatedIso = data.updated || data.timeCreated;
        if (updatedIso) {
          const dateObj = new Date(updatedIso);
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = dateObj.getFullYear();
          const formattedDate = `${day}/${month}/${year}`;

          // Preserve any internal icon
          const icon = el.querySelector('i');
          if (icon) {
            el.innerHTML = '';
            el.appendChild(icon);
            el.appendChild(document.createTextNode(` ${formattedDate}`));
          } else {
            el.textContent = formattedDate;
          }
        }
      }
    } catch (e) {
      console.warn(`Auto date read skipped for ${fileKey}:`, e);
    }
  });
}

function initVideoFilters() {
  const videoTabs = document.querySelectorAll('.video-filter-pill');
  const videoCards = document.querySelectorAll('.video-card');

  videoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      videoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetCategory = tab.getAttribute('data-video-filter') || 'all';

      videoCards.forEach(card => {
        const cardCat = card.getAttribute('data-software') || 'all';
        if (targetCategory === 'all' || cardCat === targetCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function initFooterYear() {
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
   Theme Toggle (Dark / Light Mode)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
  
  // Check localStorage or system preference
  const savedTheme = localStorage.getItem('mspharm_theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('mspharm_theme', newTheme);
      updateThemeIcon(newTheme);
      
      showToast('Thème mis à jour', `Mode ${newTheme === 'dark' ? 'Sombre' : 'Clair'} activé.`, 'info');
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
    }
  }
}

/* ==========================================================================
   Mobile Navigation Drawer
   ========================================================================== */
function initMobileMenu() {
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileNavToggle.innerHTML = isOpen 
        ? '<i class="fa-solid fa-xmark"></i>' 
        : '<i class="fa-solid fa-bars"></i>';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileNavToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }
}

/* ==========================================================================
   Back to Top & Scroll Progress
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   Smooth Scrolling with Active Navigation Indicator
   ========================================================================== */
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   Search and Category Filter for Utilities
   ========================================================================== */
function initSearchAndFilters() {
  const searchInput = document.getElementById('utilitySearch');
  const filterPills = document.querySelectorAll('.filter-pill');
  const utilityCards = document.querySelectorAll('.utility-card');
  const countBadge = document.getElementById('utilityCount');

  let currentCategory = 'all';
  let currentSearch = '';

  function applyFilters() {
    let visibleCount = 0;

    utilityCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || 'all';
      const cardTitle = (card.querySelector('h4')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('p')?.textContent || '').toLowerCase();
      const cardTags = (card.getAttribute('data-tags') || '').toLowerCase();

      const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
      const matchesSearch = currentSearch === '' || 
        cardTitle.includes(currentSearch) || 
        cardDesc.includes(currentSearch) || 
        cardTags.includes(currentSearch);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countBadge) {
      countBadge.textContent = `${visibleCount} module${visibleCount > 1 ? 's' : ''}`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });
}

/* ==========================================================================
   Download Toast Notifications
   ========================================================================== */
function initDownloadToasts() {
  const downloadLinks = document.querySelectorAll('a[download], a[href$=".exe"], a[href$=".EXE"], a[href$=".rar"], a[href$=".zip"], a[href$=".msi"]');

  downloadLinks.forEach(link => {
    link.addEventListener('click', () => {
      const cardTitle = link.closest('.software-card, .remote-card, .utility-card')?.querySelector('h3, h4, .remote-title')?.textContent.trim() || 'Fichier';
      const isMaj = link.textContent.includes('Mise à Jour') || link.textContent.includes('MAJ');
      
      showToast(
        'Téléchargement initié', 
        `Le téléchargement de ${cardTitle} ${isMaj ? '(Mise à jour)' : ''} démarre...`, 
        'success'
      );
    });
  });
}

/* ==========================================================================
   Global Toast Notification System
   ========================================================================== */
function showToast(title, message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  
  const iconClass = type === 'success' 
    ? 'fa-solid fa-circle-check' 
    : 'fa-solid fa-circle-info';

  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <div class="toast-content">
      <h6>${title}</h6>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}
