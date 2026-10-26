/* ==========================================================================
   ONLINE WEDDING INVITATION - JAVASCRIPT
   Duc Thang & Kieu Trang | 20.12.2026
   Features:
   - Realistic Red Envelope Opening & 3 Big Floating Hearts
   - Background Music Toggle
   - Real-time Countdown to 20/12/2026 09:30
   - Ultra-smooth Scroll Entrance Animations (slide in from margins)
   - Photo Gallery Lightbox with Keyboard & Touch Navigation
   - RSVP Management with LocalStorage
   - Quick One-touch Copy Bank Account Number
   - Elegant Guestbook Wishes (No floating stream comments)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. DYNAMIC WEDDING COUNTDOWN (20/12/2026 lúc 09:30)
  // ==========================================
  const COUNTDOWN_TARGET = new Date("2026-12-20T09:30:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = COUNTDOWN_TARGET - now;

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl) return;

    if (distance < 0) {
      daysEl.innerText = "00";
      hoursEl.innerText = "00";
      minutesEl.innerText = "00";
      secondsEl.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minutesEl.innerText = String(minutes).padStart(2, '0');
    secondsEl.innerText = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();


  // ==========================================
  // 2. BACKGROUND MUSIC SYSTEM
  // ==========================================
  const musicBtn = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  let isMusicPlaying = false;

  if (bgMusic) {
    bgMusic.volume = 0.5;
  }

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      if (musicBtn) {
        musicBtn.classList.add('playing');
        musicBtn.querySelector('i').className = 'fa-solid fa-pause';
      }
    }).catch(err => {
      console.log("Autoplay waiting for user gesture:", err);
    });
  }

  function toggleMusic() {
    if (!bgMusic) return;
    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
      if (musicBtn) {
        musicBtn.classList.remove('playing');
        musicBtn.querySelector('i').className = 'fa-solid fa-play';
      }
    } else {
      playMusic();
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
  }


  // ==========================================
  // 3. ENVELOPE OPENING & 3 FLOATING HEARTS
  // ==========================================
  const envelopeCover = document.getElementById('envelope-cover');
  const envelopeInteractive = document.getElementById('envelope-interactive');
  let isEnvelopeOpened = false;
  let autoTransitionTimer = null;
  let lastOpenClickTime = 0;

  function spawnThreeBigRedHearts() {
    const container = document.getElementById('envelope-hearts-container');
    if (!container || !envelopeCover || envelopeCover.classList.contains('opened')) return;

    const envelopeRect = envelopeInteractive ? envelopeInteractive.getBoundingClientRect() : null;
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight * 0.55;

    if (envelopeRect) {
      startX = envelopeRect.left + envelopeRect.width / 2;
      startY = envelopeRect.top + envelopeRect.height * 0.46;
    }

    const heartsConfig = [
      { size: 54, offsetX: -68, sway: 'bigHeartSwayLeft', duration: 3.4, delay: 0 },
      { size: 74, offsetX: 0,   sway: 'bigHeartSwayCenter', duration: 3.6, delay: 220 },
      { size: 60, offsetX: 68,  sway: 'bigHeartSwayRight', duration: 3.2, delay: 450 }
    ];

    heartsConfig.forEach((cfg) => {
      setTimeout(() => {
        if (!container || !envelopeCover || envelopeCover.classList.contains('opened')) return;

        const heartEl = document.createElement('div');
        heartEl.className = 'floating-big-heart';
        heartEl.style.left = `${startX + cfg.offsetX - cfg.size / 2}px`;
        heartEl.style.top = `${startY - cfg.size / 2}px`;
        heartEl.style.width = `${cfg.size}px`;
        heartEl.style.height = `${cfg.size}px`;
        heartEl.style.setProperty('--duration', `${cfg.duration}s`);

        heartEl.innerHTML = `
          <div class="heart-inner" style="animation: ${cfg.sway} 2.2s ease-in-out infinite;">
            <svg viewBox="0 0 32 32" width="100%" height="100%">
              <path d="M16 28.5L14.1 26.8C7.3 20.6 2.8 16.5 2.8 11.4C2.8 7.3 6 4.1 10.1 4.1C12.4 4.1 14.6 5.2 16 6.8C17.4 5.2 19.6 4.1 21.9 4.1C26 4.1 29.2 7.3 29.2 11.4C29.2 16.5 24.7 20.6 17.9 26.8L16 28.5Z"
                    fill="#e60026"
                    stroke="#ffffff"
                    stroke-width="1.2"
                    stroke-linejoin="round"/>
              <path d="M10 6C7.5 6 5.5 8 5.5 10.8C5.5 12.8 7 15.2 10.5 18.5C10.8 16.8 11.5 13.5 13.2 11.2C14.2 9.8 15.2 9.2 15.8 8.8C14.5 7.2 12.5 6 10 6Z"
                    fill="rgba(255, 255, 255, 0.45)"/>
            </svg>
          </div>
        `;

        container.appendChild(heartEl);

        setTimeout(() => {
          heartEl.remove();
        }, cfg.duration * 1000 + 400);
      }, cfg.delay);
    });
  }

  function openEnvelopeStep() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    if (envelopeCover) envelopeCover.classList.add('envelope-opened');
    if (envelopeInteractive) envelopeInteractive.classList.add('opening');

    setTimeout(spawnThreeBigRedHearts, 950);
    setTimeout(playMusic, 500);

    setTimeout(() => {
      if (envelopeInteractive) envelopeInteractive.classList.add('opened-float');
    }, 1200);
  }

  function enterMainSite() {
    if (autoTransitionTimer) {
      clearTimeout(autoTransitionTimer);
      autoTransitionTimer = null;
    }
    if (envelopeCover) {
      envelopeCover.classList.add('opened');
    }
    document.body.style.overflowY = 'auto';
    setTimeout(playMusic, 300);

    // Kích hoạt ngay các animation ở hero screen
    triggerInViewAnimations();
  }

  function handleEnvelopeInteraction(e) {
    if (e) e.stopPropagation();
    const now = Date.now();

    if (!isEnvelopeOpened) {
      lastOpenClickTime = now;
      openEnvelopeStep();
      autoTransitionTimer = setTimeout(enterMainSite, 5800);
    } else {
      if (now - lastOpenClickTime > 600) {
        enterMainSite();
      }
    }
  }

  if (envelopeInteractive) {
    envelopeInteractive.addEventListener('click', handleEnvelopeInteraction);
  }

  // Khóa cuộn trang khi chưa mở phong bì
  document.body.style.overflowY = 'hidden';

  // Nút cuộn xuống ở Hero Banner
  const scrollHintBtn = document.getElementById('scroll-hint-btn');
  if (scrollHintBtn) {
    scrollHintBtn.addEventListener('click', () => {
      const invSec = document.getElementById('invitation-section');
      if (invSec) {
        invSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }


  // ==========================================
  // 4. ULTRA-SMOOTH SCROLL ENTRANCE ANIMATIONS (TỪ LỀ VÀO MƯỢT MÀ)
  // ==========================================
  const animatedElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  animatedElements.forEach(el => scrollObserver.observe(el));

  function triggerInViewAnimations() {
    animatedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('active');
      }
    });
  }


  // ==========================================
  // 5. TOAST NOTIFICATION UTILITY
  // ==========================================
  window.showToast = function(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  };


  // ==========================================
  // 6. QUICK COPY BANK ACCOUNT NUMBER
  // ==========================================
  window.copyAccount = function(accountNumber, ownerLabel) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(accountNumber).then(() => {
        window.showToast(`Đã sao chép STK ${ownerLabel} (${accountNumber}) thành công!`);
      }).catch(() => {
        fallbackCopy(accountNumber, ownerLabel);
      });
    } else {
      fallbackCopy(accountNumber, ownerLabel);
    }
  };

  function fallbackCopy(text, ownerLabel) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    window.showToast(`Đã sao chép STK ${ownerLabel} (${text})!`);
  }


  // ==========================================
  // 7. PHOTO GALLERY LIGHTBOX WITH FULL NAVIGATION
  // ==========================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentLightboxIndex = 0;

  // Danh sách các ảnh kỷ niệm
  const galleryPhotosList = [
    'assets/images/TTT08789_web.jpg',
    'assets/images/TTT08816_web.jpg',
    'assets/images/TTT08627_web.jpg',
    'assets/images/TTT08982_web.jpg',
    'assets/images/TTT09584_web.jpg',
    'assets/images/TTT09222_web.jpg'
  ];

  document.querySelectorAll('.gallery-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const explicitSrc = trigger.getAttribute('data-img-src');
      if (explicitSrc) {
        openSingleLightbox(explicitSrc);
        return;
      }
      const idx = trigger.getAttribute('data-img-index');
      if (idx !== null && idx !== undefined) {
        currentLightboxIndex = parseInt(idx, 10);
        openGalleryLightbox(currentLightboxIndex);
      } else {
        openSingleLightbox(trigger.getAttribute('src'));
      }
    });
  });

  function openGalleryLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    currentLightboxIndex = index;
    lightboxImg.src = galleryPhotosList[currentLightboxIndex];
    if (lightboxPrev) lightboxPrev.style.display = 'block';
    if (lightboxNext) lightboxNext.style.display = 'block';
    lightbox.style.display = 'flex';
    setTimeout(() => lightbox.classList.add('active'), 10);
  }

  function openSingleLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxPrev) lightboxPrev.style.display = 'none';
    if (lightboxNext) lightboxNext.style.display = 'none';
    lightbox.style.display = 'flex';
    setTimeout(() => lightbox.classList.add('active'), 10);
  }

  function closeLightboxModal() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    setTimeout(() => { lightbox.style.display = 'none'; }, 350);
  }

  function nextGalleryPhoto() {
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryPhotosList.length;
    lightboxImg.src = galleryPhotosList[currentLightboxIndex];
  }

  function prevGalleryPhoto() {
    currentLightboxIndex = (currentLightboxIndex - 1 + galleryPhotosList.length) % galleryPhotosList.length;
    lightboxImg.src = galleryPhotosList[currentLightboxIndex];
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightboxModal);
  if (lightboxNext) lightboxNext.addEventListener('click', nextGalleryPhoto);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevGalleryPhoto);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightboxModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightboxModal();
    if (e.key === 'ArrowRight') nextGalleryPhoto();
    if (e.key === 'ArrowLeft') prevGalleryPhoto();
  });


  // ==========================================
  // 8. RSVP SUBMISSION (LOCALSTORAGE)
  // ==========================================
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  const rsvpGuestsContainer = document.getElementById('rsvp-guests-container');
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

  if (attendanceRadios.length && rsvpGuestsContainer) {
    attendanceRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'no') {
          rsvpGuestsContainer.style.opacity = '0.4';
          document.getElementById('rsvp-guests').disabled = true;
        } else {
          rsvpGuestsContainer.style.opacity = '1';
          document.getElementById('rsvp-guests').disabled = false;
        }
      });
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('rsvp-name').value.trim();
      const phone = document.getElementById('rsvp-phone').value.trim();
      const attendance = document.querySelector('input[name="attendance"]:checked').value;
      const guests = attendance === 'yes' ? document.getElementById('rsvp-guests').value : 0;
      const note = document.getElementById('rsvp-note').value.trim();

      if (!name || !phone) {
        window.showToast("Vui lòng điền Họ tên và Số điện thoại!");
        return;
      }

      const rsvpEntry = {
        id: Date.now(),
        name: name,
        phone: phone,
        attendance: attendance === 'yes' ? 'Tham dự' : 'Không tham dự',
        guests: guests,
        note: note || 'Không có',
        time: new Date().toLocaleString('vi-VN')
      };

      const existingRsvp = JSON.parse(localStorage.getItem('wedding_rsvp_list')) || [];
      existingRsvp.push(rsvpEntry);
      localStorage.setItem('wedding_rsvp_list', JSON.stringify(existingRsvp));

      if (attendance === 'yes') {
        window.showToast(`Cảm ơn ${name}! Chúng mình rất vui được đón tiếp bạn vào ngày 20/12/2026.`);
      } else {
        window.showToast(`Cảm ơn ${name} đã gửi phản hồi cho Cô dâu & Chú rể!`);
      }

      if (note) {
        addGuestbookEntry(name, note);
      }

      rsvpForm.reset();
    });
  }


  // ==========================================
  // 9. GUESTBOOK WISHES (SỔ LƯU BÚT TRANG NHÃ)
  // ==========================================
  const guestbookForm = document.getElementById('guestbook-form');
  const guestbookMessages = document.getElementById('guestbook-messages');

  const defaultWishes = [
    {
      name: 'Anh Nguyễn Hoàng Lâm',
      text: 'Chúc mừng hai em trăm năm hạnh phúc! Chúc gia đình nhỏ luôn tràn ngập tiếng cười và yêu thương.',
      time: '26/10/2026 10:15'
    },
    {
      name: 'Chị Mai Lan',
      text: 'Chúc cô dâu chú rể mãi ngọt ngào và gắn kết bền chặt như ngày đầu mới yêu nhé! Hẹn gặp hai bạn ngày 20/12.',
      time: '26/10/2026 09:40'
    },
    {
      name: 'Bạn Thảo Linh',
      text: 'Chúc Kiều Trang và Đức Thắng luôn là hậu phương vững chắc và đồng hành cùng nhau trên mọi nẻo đường hạnh phúc!',
      time: '26/10/2026 08:30'
    }
  ];

  function loadWishes() {
    if (!guestbookMessages) return;
    const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || defaultWishes;
    guestbookMessages.innerHTML = '';

    [...wishes].reverse().forEach(wish => {
      const item = document.createElement('div');
      item.className = 'wish-item-bubble';
      item.innerHTML = `
        <div class="wish-author-row">
          <span class="wish-author-name">${escapeHtml(wish.name)}</span>
          <span class="wish-date-time">${escapeHtml(wish.time)}</span>
        </div>
        <p class="wish-content-text">${escapeHtml(wish.text)}</p>
      `;
      guestbookMessages.appendChild(item);
    });
  }

  function addGuestbookEntry(name, text) {
    const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || defaultWishes;
    const newEntry = {
      name: name,
      text: text,
      time: new Date().toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    };
    wishes.push(newEntry);
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
    loadWishes();
  }

  if (guestbookForm) {
    guestbookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wish-name');
      const textInput = document.getElementById('wish-text');

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) {
        window.showToast("Vui lòng điền tên và lời chúc!");
        return;
      }

      addGuestbookEntry(name, text);
      nameInput.value = '';
      textInput.value = '';
      window.showToast("Lời chúc của bạn đã gửi đến Đức Thắng & Kiều Trang!");
    });
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }

  loadWishes();

});
