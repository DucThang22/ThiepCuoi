/* ==========================================================================
   ONLINE WEDDING INVITATION - JAVASCRIPT
   Duc Thang & Kieu Trang | 20.12.2026
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 0. TIỆN ÍCH CHUNG
  // ==========================================

  // localStorage có thể bị chặn (chế độ ẩn danh, trình duyệt trong Zalo/Messenger) hoặc chứa dữ liệu hỏng
  // => luôn bọc try/catch để không làm sập toàn bộ script
  const safeStorage = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) { /* bỏ qua */ }
    }
  };

  // Phát hiện trình duyệt hỗ trợ WebP (dùng cho ảnh phóng to trong lightbox)
  let supportsWebP = false;
  (function detectWebP() {
    const probe = new Image();
    probe.onload = () => { supportsWebP = probe.width === 1; };
    probe.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
  })();

  function optimizedSrc(src) {
    if (!src || !supportsWebP || src.indexOf('assets/opt/') === -1) return src;
    return src.replace(/\.(jpe?g|png)$/i, '.webp');
  }

  // ==========================================
  // 0.1. HIỆN PHONG BÌ TRỌN VẸN KHI ẢNH & FONT ĐÃ SẴN SÀNG
  // (tối đa chờ 3s, mạng chậm vẫn hiện; ảnh đã cache thì hiện ngay lập tức)
  // ==========================================
  const envelopeCoverEl = document.getElementById('envelope-cover');

  function waitForImage(img) {
    const decode = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve());
    if (img.complete) return img.naturalWidth ? decode() : Promise.resolve();
    return new Promise(resolve => {
      img.addEventListener('load', () => decode().then(resolve), { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }

  function revealEnvelope() {
    if (envelopeCoverEl) envelopeCoverEl.classList.remove('is-preparing');
  }

  if (envelopeCoverEl && envelopeCoverEl.classList.contains('is-preparing')) {
    const criticalImgs = Array.from(envelopeCoverEl.querySelectorAll('img[data-critical]'));
    const fontReady = (document.fonts && document.fonts.load)
      ? document.fonts.load('1em "Pinyon Script"').catch(() => {})
      : Promise.resolve();
    const timeout = new Promise(resolve => setTimeout(resolve, 3000));

    Promise.race([
      Promise.all(criticalImgs.map(waitForImage).concat(fontReady)),
      timeout
    ]).then(() => requestAnimationFrame(revealEnvelope));
  }

  // ==========================================
  // 1. DYNAMIC WEDDING COUNTDOWN (Đọc theo data-countdown-target hoặc mặc định 09:30)
  // ==========================================
  const targetAttr = document.body ? document.body.getAttribute('data-countdown-target') : null;
  const COUNTDOWN_TARGET = targetAttr 
    ? new Date(targetAttr).getTime() 
    : new Date("2026-12-20T09:30:00").getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  let countdownTimer = null;

  // Chỉ ghi DOM khi giá trị thay đổi (textContent không gây tính lại layout như innerText)
  function setNum(el, value) {
    const text = String(value).padStart(2, '0');
    if (el.textContent !== text) el.textContent = text;
  }

  function updateCountdown() {
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const distance = COUNTDOWN_TARGET - Date.now();

    if (!(distance > 0)) {
      setNum(daysEl, 0);
      setNum(hoursEl, 0);
      setNum(minutesEl, 0);
      setNum(secondsEl, 0);
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      return;
    }

    setNum(daysEl, Math.floor(distance / (1000 * 60 * 60 * 24)));
    setNum(hoursEl, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    setNum(minutesEl, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
    setNum(secondsEl, Math.floor((distance % (1000 * 60)) / 1000));
  }

  countdownTimer = setInterval(updateCountdown, 1000);
  updateCountdown();


  // ==========================================
  // 2. BACKGROUND MUSIC & ENVELOPE LOGIC (BACK LẠI CHUẨN XÁC)
  // ==========================================
  const envelopeCover = document.getElementById('envelope-cover');
  const envelopeInteractive = document.getElementById('envelope-interactive');
  const musicBtn = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  let isPlaying = false;
  let isOpened = false;
  let autoEnterTimer = null;
  let userManuallyPaused = false;

  if (bgMusic) {
    bgMusic.volume = 0.6;
  }

  function playAudio() {
    if (!bgMusic) return;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        userManuallyPaused = false;
        if (musicBtn) {
          musicBtn.classList.add('playing');
          const icon = musicBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-compact-disc';
        }
      }).catch(err => {
        console.log("Browser waiting for user interaction or blocked autoplay:", err);
      });
    }
  }

  function pauseAudio() {
    if (!bgMusic) return;
    bgMusic.pause();
    isPlaying = false;
    if (musicBtn) {
      musicBtn.classList.remove('playing');
      const icon = musicBtn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-play';
    }
  }

  function toggleAudio() {
    if (!bgMusic) return;
    if (isPlaying) {
      userManuallyPaused = true;
      pauseAudio();
    } else {
      userManuallyPaused = false;
      playAudio();
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', toggleAudio);
  }

  // Nhạc nền 3.6MB không tải ngay khi vào trang (tránh tranh băng thông với ảnh phong bì).
  // Bắt đầu tải ngầm sau khi trang đã tải xong ảnh => lúc khách chạm mở thiệp nhạc phát gần như tức thì.
  function warmUpMusic() {
    if (!bgMusic || bgMusic.preload === 'auto') return;
    // Chỉ đổi thuộc tính preload (không gọi load() để không huỷ lệnh play() đang chờ)
    bgMusic.preload = 'auto';
  }

  const scheduleWarmUp = () => {
    setTimeout(() => {
      if (isPlaying || (bgMusic && !bgMusic.paused)) return; // đã phát rồi thì không cần
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(warmUpMusic, { timeout: 2000 });
      } else {
        warmUpMusic();
      }
    }, 800);
  };

  if (document.readyState === 'complete') {
    scheduleWarmUp();
  } else {
    window.addEventListener('load', scheduleWarmUp, { once: true });
  }

  // Khách chuyển sang Zalo/Messenger hoặc tắt màn hình => tạm dừng nhạc, quay lại thì phát tiếp
  let pausedByVisibility = false;
  document.addEventListener('visibilitychange', () => {
    if (!bgMusic) return;
    if (document.hidden) {
      if (isPlaying) {
        pausedByVisibility = true;
        pauseAudio();
      }
    } else if (pausedByVisibility) {
      pausedByVisibility = false;
      if (!userManuallyPaused) playAudio();
    }
  });

  // Hiệu ứng 3 trái tim đỏ lớn bay lên từ bên trong phong bì sau khi mở
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

    const threeHearts = [
      {
        size: 54,
        offsetX: -68,
        sway: 'bigHeartSwayLeft',
        duration: 3.4,
        delay: 0
      },
      {
        size: 72,
        offsetX: 0,
        sway: 'bigHeartSwayCenter',
        duration: 3.6,
        delay: 220
      },
      {
        size: 60,
        offsetX: 68,
        sway: 'bigHeartSwayRight',
        duration: 3.2,
        delay: 450
      }
    ];

    threeHearts.forEach((cfg) => {
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

  window.spawnThreeBigRedHearts = spawnThreeBigRedHearts;

  // Bước 1: Mở phong bì thư và trồi ảnh cưới lên (đồng thời phát nhạc ngay lập tức)
  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    // Phát bài hát "Beautiful in White" ngay khi mở thiệp
    playAudio();

    if (envelopeCover) {
      envelopeCover.classList.add('envelope-opened');
    }
    if (envelopeInteractive) {
      envelopeInteractive.classList.add('opening');
    }

    setTimeout(() => {
      spawnThreeBigRedHearts();
    }, 1000);

    setTimeout(() => {
      if (envelopeInteractive) {
        envelopeInteractive.classList.add('opened-float');
      }
    }, 1200);
  }

  // Bước 2: Vào xem toàn bộ website thiệp cưới
  function enterWeddingSite() {
    if (autoEnterTimer) {
      clearTimeout(autoEnterTimer);
      autoEnterTimer = null;
    }
    if (envelopeCover) {
      envelopeCover.classList.add('opened');
      setTimeout(() => {
        envelopeCover.style.display = 'none';
      }, 1250);
    }
    document.body.classList.remove('envelope-locked');
    document.body.style.overflowY = '';

    // Mặc định cuộn lên trang đầu tiên (Hero Screen / Trang đầu tiên)
    // (dùng scrollTo(0, 0): giá trị behavior 'instant' gây lỗi TypeError trên một số trình duyệt cũ)
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (!isPlaying && !userManuallyPaused) {
      playAudio();
    }

    setTimeout(adjustTimelineTrack, 300);
  }

  // Logic click theo yêu cầu:
  // - CHỈ gắn sự kiện click vào thiệp (envelopeInteractive)
  // - KHÔNG gắn sự kiện click vào text "thiệp mời cưới", icon "song_hy", chữ "Đức Thắng Kiều Trang"
  // - Click lần 1: Mở thiệp, phát nhạc "Beautiful in White" và sau 6s tự động chuyển vào trang sau
  // - Click lần 2: Mở trang tiếp theo luôn lập tức
  let lastOpenTime = 0;
  function handleEnvelopeClick(e) {
    if (e) e.stopPropagation();
    const now = Date.now();

    // Kích hoạt phát nhạc "Beautiful in White" ngay trong sự kiện click trực tiếp của người dùng
    playAudio();

    if (!isOpened) {
      lastOpenTime = now;
      openEnvelope();
      autoEnterTimer = setTimeout(() => {
        enterWeddingSite();
      }, 6000);
    } else {
      if (now - lastOpenTime > 600) {
        enterWeddingSite();
      }
    }
  }

  if (envelopeInteractive) {
    envelopeInteractive.addEventListener('click', handleEnvelopeClick);
  }

  // Đảm bảo phát nhạc mượt mà trên mọi thiết bị và trình duyệt khi người dùng chạm/tương tác
  const triggerAudioOnFirstTouch = () => {
    if (!isPlaying && !userManuallyPaused) {
      playAudio();
    }
  };
  document.addEventListener('pointerdown', triggerAudioOnFirstTouch, { passive: true });

  // Mặc định khóa cuộn trang khi chưa mở thiệp & luôn reset scroll về đầu trang
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.body.classList.add('envelope-locked');

  // Nút Cuộn xuống ở Hero Screen
  const scrollDownHint = document.getElementById('scroll-down-hint');
  if (scrollDownHint) {
    scrollDownHint.addEventListener('click', () => {
      const invSec = document.getElementById('invitation-section');
      if (invSec) {
        invSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }


  // ==========================================
  // 3. SMOOTH SCROLL REVEAL (TỪ LỀ VÀO MƯỢT MÀ, CHẬM VÀ ĐẸP TRÊN MỌI VIEW)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
  const observerOptions = {
    root: null,
    threshold: 0.05,
    rootMargin: "0px 0px -20px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // CĂN CHỈNH ĐƯỜNG KẺ TIMELINE TỪ TÂM TIM ĐẦU ĐẾN TÂM TIM CUỐI (LOẠI BỎ NÉT THỪA)
  // ==========================================
  function adjustTimelineTrack() {
    const track = document.querySelector('.cl-timeline-track');
    if (!track) return;
    const firstNode = track.querySelector('.cl-timeline-row:first-child .cl-timeline-node');
    const lastNode = track.querySelector('.cl-timeline-row:last-child .cl-timeline-node');
    if (firstNode && lastNode) {
      const trackRect = track.getBoundingClientRect();
      const firstRect = firstNode.getBoundingClientRect();
      const lastRect = lastNode.getBoundingClientRect();
      const topOffset = (firstRect.top + firstRect.height / 2) - trackRect.top;
      const bottomOffset = trackRect.bottom - (lastRect.top + lastRect.height / 2);
      if (topOffset > 0 && bottomOffset > 0) {
        track.style.setProperty('--line-top', `${Math.round(topOffset)}px`);
        track.style.setProperty('--line-bottom', `${Math.round(bottomOffset)}px`);
      }
    }
  }

  adjustTimelineTrack();

  // Trên điện thoại, sự kiện resize bắn liên tục khi thanh địa chỉ ẩn/hiện lúc cuộn.
  // Gom lại (debounce) để không đo layout (getBoundingClientRect) giữa lúc cuộn => hết giật.
  let timelineResizeTimer = null;
  let lastViewportWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastViewportWidth) return; // chỉ đổi chiều cao (thanh địa chỉ) => bỏ qua
    lastViewportWidth = window.innerWidth;
    clearTimeout(timelineResizeTimer);
    timelineResizeTimer = setTimeout(adjustTimelineTrack, 150);
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(adjustTimelineTrack, 250);
  });
  // Font chữ tải xong có thể làm thay đổi chiều cao các dòng timeline
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(adjustTimelineTrack).catch(() => {});
  }


  // ==========================================
  // 4. PHOTO GALLERY LIGHTBOX & 3D COVERFLOW SWIPE SLIDER
  // ==========================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentImgIndex = 0;

  // Tự động đồng bộ danh sách ảnh từ coverflow slider
  const coverflowImgEls = document.querySelectorAll('#album-coverflow .gallery-trigger');
  // Album hiển thị ảnh thumbnail nhỏ (data-full là ảnh đầy đủ để phóng to trong lightbox)
  const gallerySources = coverflowImgEls.length
    ? Array.from(coverflowImgEls).map(img => img.getAttribute('data-full') || img.getAttribute('src')).filter(Boolean)
    : [
        'assets/images/TTT08627_web.jpg',
        'assets/images/TTT08982_web.jpg',
        'assets/images/TTT09584_web.jpg',
        'assets/images/TTT09222_web.jpg',
        'assets/images/TTT09824_web.jpg',
        'assets/images/TTT09053_web.jpg',
        'assets/images/TTT09839_web.jpg',
        'assets/images/TTT08816_web.jpg',
        'assets/images/TTT09334_web.jpg',
        'assets/images/TTT09654_web.jpg'
      ];

  // 4.1. 3D COVERFLOW SWIPE SLIDER LOGIC (CHUẨN ẢNH THỨ 2)
  const coverflowContainer = document.getElementById('album-coverflow');
  const coverflowSlides = document.querySelectorAll('.cl-coverflow-slide');
  const coverflowPrevBtn = document.getElementById('coverflow-prev');
  const coverflowNextBtn = document.getElementById('coverflow-next');
  const coverflowDotsWrap = document.getElementById('coverflow-dots');
  let coverflowIndex = 0;
  const totalSlides = coverflowSlides.length;
  let isLightboxOpen = false;

  if (coverflowSlides.length && coverflowDotsWrap) {
    // ==========================================
    // HIỆU ỨNG TỰ ĐỘNG CHUYỂN ẢNH ALBUM (AUTO-PLAY)
    // ==========================================
    const AUTO_PLAY_INTERVAL = 3000; // Tự động chuyển sau mỗi 3 giây
    let autoPlayTimer = null;
    let isUserInteracting = false;
    // Chỉ tự chuyển ảnh khi album đang nằm trong màn hình (đỡ tốn CPU/GPU khi khách xem phần khác)
    let isAlbumInView = !('IntersectionObserver' in window);

    function startAutoPlay() {
      stopAutoPlay();
      if (isLightboxOpen || !isAlbumInView || document.hidden) return;
      autoPlayTimer = setInterval(() => {
        if (!isUserInteracting && !isLightboxOpen) {
          nextCoverflowSlide(false);
        }
      }, AUTO_PLAY_INTERVAL);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function restartAutoPlayWithDelay(delay = AUTO_PLAY_INTERVAL) {
      stopAutoPlay();
      if (isLightboxOpen || !isAlbumInView || document.hidden) return;
      autoPlayTimer = setTimeout(() => {
        if (!isUserInteracting && !isLightboxOpen) {
          nextCoverflowSlide(false);
        }
        startAutoPlay();
      }, delay);
    }

    // Kết nối để Lightbox có thể tạm dừng/tiếp tục chuyển ảnh
    window.pauseAlbumAutoPlay = stopAutoPlay;
    window.resumeAlbumAutoPlay = startAutoPlay;

    // Tạo các chấm phân trang
    coverflowDotsWrap.innerHTML = '';
    coverflowSlides.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = `cl-coverflow-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToCoverflowSlide(idx);
        restartAutoPlayWithDelay();
      });
      coverflowDotsWrap.appendChild(dot);
    });

    function updateCoverflow(activeIdx) {
      coverflowIndex = (activeIdx + totalSlides) % totalSlides;

      coverflowSlides.forEach((slide, i) => {
        let offset = i - coverflowIndex;
        if (offset > totalSlides / 2) offset -= totalSlides;
        if (offset < -totalSlides / 2) offset += totalSlides;

        slide.classList.remove('active');

        if (offset === 0) {
          slide.classList.add('active');
          slide.style.transform = 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1)';
          slide.style.opacity = '1';
          slide.style.zIndex = '15';
          slide.style.pointerEvents = 'auto';
        } else if (offset === 1) {
          slide.style.transform = 'translateX(100px) translateZ(-80px) rotateY(-36deg) scale(0.85)';
          slide.style.opacity = '0.72';
          slide.style.zIndex = '10';
          slide.style.pointerEvents = 'auto';
        } else if (offset === -1) {
          slide.style.transform = 'translateX(-100px) translateZ(-80px) rotateY(36deg) scale(0.85)';
          slide.style.opacity = '0.72';
          slide.style.zIndex = '10';
          slide.style.pointerEvents = 'auto';
        } else if (offset === 2) {
          slide.style.transform = 'translateX(175px) translateZ(-160px) rotateY(-48deg) scale(0.7)';
          slide.style.opacity = '0.4';
          slide.style.zIndex = '5';
          slide.style.pointerEvents = 'auto';
        } else if (offset === -2) {
          slide.style.transform = 'translateX(-175px) translateZ(-160px) rotateY(48deg) scale(0.7)';
          slide.style.opacity = '0.4';
          slide.style.zIndex = '5';
          slide.style.pointerEvents = 'auto';
        } else {
          const side = offset > 0 ? 220 : -220;
          slide.style.transform = `translateX(${side}px) translateZ(-240px) scale(0.5)`;
          slide.style.opacity = '0';
          slide.style.zIndex = '1';
          slide.style.pointerEvents = 'none';
        }
      });

      // Cập nhật dots
      const dots = coverflowDotsWrap.querySelectorAll('.cl-coverflow-dot');
      dots.forEach((dot, dIdx) => {
        dot.classList.toggle('active', dIdx === coverflowIndex);
      });
    }

    function goToCoverflowSlide(idx) {
      updateCoverflow(idx);
    }

    function nextCoverflowSlide(resetTimer = true) {
      updateCoverflow(coverflowIndex + 1);
      if (resetTimer) restartAutoPlayWithDelay();
    }

    function prevCoverflowSlide(resetTimer = true) {
      updateCoverflow(coverflowIndex - 1);
      if (resetTimer) restartAutoPlayWithDelay();
    }

    if (coverflowPrevBtn) {
      coverflowPrevBtn.addEventListener('click', () => prevCoverflowSlide(true));
    }
    if (coverflowNextBtn) {
      coverflowNextBtn.addEventListener('click', () => nextCoverflowSlide(true));
    }

    // Click vào slide: active thì mở Lightbox, không active thì chuyển tới slide đó
    coverflowSlides.forEach((slide, sIdx) => {
      slide.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sIdx === coverflowIndex) {
          openGalleryLightbox(sIdx);
        } else {
          goToCoverflowSlide(sIdx);
          restartAutoPlayWithDelay();
        }
      });
    });

    // HỖ TRỢ VUỐT CẢM ỨNG (TOUCH SWIPE) VÀ KÉO CHUỘT (MOUSE DRAG)
    let startX = 0;
    let isDragging = false;
    let diffX = 0;

    if (coverflowContainer) {
      // Hover trên máy tính: tạm dừng, rời chuột: tiếp tục
      coverflowContainer.addEventListener('mouseenter', () => {
        isUserInteracting = true;
        stopAutoPlay();
      });
      coverflowContainer.addEventListener('mouseleave', () => {
        isUserInteracting = false;
        startAutoPlay();
      });

      // Chạm vuốt trên điện thoại: tạm dừng khi vuốt, tự động chuyển tiếp mượt mà sau khi thả tay
      coverflowContainer.addEventListener('touchstart', (e) => {
        isUserInteracting = true;
        stopAutoPlay();
        startX = e.touches[0].clientX;
        diffX = 0;
      }, { passive: true });

      coverflowContainer.addEventListener('touchmove', (e) => {
        diffX = e.touches[0].clientX - startX;
      }, { passive: true });

      coverflowContainer.addEventListener('touchend', () => {
        isUserInteracting = false;
        if (Math.abs(diffX) > 35) {
          if (diffX < 0) {
            nextCoverflowSlide(false);
          } else {
            prevCoverflowSlide(false);
          }
        }
        diffX = 0;
        restartAutoPlayWithDelay(2500);
      });

      coverflowContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        isUserInteracting = true;
        stopAutoPlay();
        startX = e.clientX;
        diffX = 0;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        diffX = e.clientX - startX;
      });

      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        isUserInteracting = false;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) {
            nextCoverflowSlide(false);
          } else {
            prevCoverflowSlide(false);
          }
        }
        diffX = 0;
        restartAutoPlayWithDelay(2500);
      });
    }

    // Tạm dừng khi chuyển tab trình duyệt, chạy tiếp khi quay lại
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });

    // Kích hoạt slider và tự động chuyển ảnh ban đầu
    updateCoverflow(0);

    if ('IntersectionObserver' in window && coverflowContainer) {
      const albumObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isAlbumInView = entry.isIntersecting;
          if (isAlbumInView) {
            if (!isUserInteracting) startAutoPlay();
          } else {
            stopAutoPlay();
          }
        });
      }, { threshold: 0.2 });
      albumObserver.observe(coverflowContainer);
    } else {
      startAutoPlay();
    }
  }

  // 4.2. LIGHTBOX FUNCTIONS
  // Lưu ý: không dùng selector ':not(.a .b)' (CSS Selectors 4) vì trình duyệt Android/iOS cũ báo lỗi
  // SyntaxError => toàn bộ phần script phía sau (QR, RSVP, lời chúc...) ngừng chạy.
  Array.from(document.querySelectorAll('.gallery-trigger'))
    .filter(el => !el.closest('.cl-coverflow-slide'))
    .forEach(trigger => {
    trigger.addEventListener('click', () => {
      const explicitSrc = trigger.getAttribute('data-img-src');
      if (explicitSrc) {
        openSingleLightbox(explicitSrc);
        return;
      }
      const idx = trigger.getAttribute('data-img-index');
      if (idx !== null && idx !== undefined) {
        currentImgIndex = parseInt(idx, 10);
        openGalleryLightbox(currentImgIndex);
      } else {
        openSingleLightbox(trigger.getAttribute('src'));
      }
    });
  });

  let lightboxHideTimer = null;
  let isGalleryMode = false;

  function setLightboxImage(src) {
    if (!lightboxImg) return;
    lightboxImg.src = optimizedSrc(src);
  }

  // Tải trước ảnh kế bên để vuốt/bấm chuyển ảnh trong lightbox không phải chờ
  function preloadNeighbors(index) {
    if (!gallerySources.length) return;
    [index + 1, index - 1].forEach(i => {
      const src = gallerySources[(i + gallerySources.length) % gallerySources.length];
      const img = new Image();
      img.decoding = 'async';
      img.src = optimizedSrc(src);
    });
  }

  function showLightbox() {
    if (lightboxHideTimer) {
      clearTimeout(lightboxHideTimer);
      lightboxHideTimer = null;
    }
    lightbox.style.display = 'flex';
    setTimeout(() => lightbox.classList.add('active'), 10);
  }

  function openGalleryLightbox(index) {
    if (!lightbox || !lightboxImg || !gallerySources.length) return;
    isLightboxOpen = true;
    isGalleryMode = true;
    if (window.pauseAlbumAutoPlay) window.pauseAlbumAutoPlay();
    currentImgIndex = index;
    setLightboxImage(gallerySources[currentImgIndex]);
    preloadNeighbors(currentImgIndex);
    if (lightboxPrev) lightboxPrev.style.display = 'block';
    if (lightboxNext) lightboxNext.style.display = 'block';
    showLightbox();
  }

  function openSingleLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    isLightboxOpen = true;
    isGalleryMode = false;
    if (window.pauseAlbumAutoPlay) window.pauseAlbumAutoPlay();
    setLightboxImage(src);
    if (lightboxPrev) lightboxPrev.style.display = 'none';
    if (lightboxNext) lightboxNext.style.display = 'none';
    showLightbox();
  }

  function closeLightbox() {
    if (!lightbox) return;
    isLightboxOpen = false;
    if (window.resumeAlbumAutoPlay) window.resumeAlbumAutoPlay();
    lightbox.classList.remove('active');
    // Lưu timer để nếu mở lại ngay trong 350ms thì lightbox không bị ẩn mất
    lightboxHideTimer = setTimeout(() => {
      lightbox.style.display = 'none';
      lightboxHideTimer = null;
    }, 350);
  }

  function showNextImage() {
    if (!isGalleryMode || !gallerySources.length) return;
    currentImgIndex = (currentImgIndex + 1) % gallerySources.length;
    setLightboxImage(gallerySources[currentImgIndex]);
    preloadNeighbors(currentImgIndex);
  }

  function showPrevImage() {
    if (!isGalleryMode || !gallerySources.length) return;
    currentImgIndex = (currentImgIndex - 1 + gallerySources.length) % gallerySources.length;
    setLightboxImage(gallerySources[currentImgIndex]);
    preloadNeighbors(currentImgIndex);
  }

  // Vuốt trái/phải để chuyển ảnh trong lightbox trên điện thoại
  if (lightbox) {
    let lbStartX = 0;
    let lbStartY = 0;
    lightbox.addEventListener('touchstart', (e) => {
      lbStartX = e.touches[0].clientX;
      lbStartY = e.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (!isGalleryMode || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - lbStartX;
      const dy = e.changedTouches[0].clientY - lbStartY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx < 0) showNextImage();
        else showPrevImage();
      }
    }, { passive: true });
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });


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
    }, 4000);
  };


  // ==========================================
  // 6. QUICK COPY BANK ACCOUNT NUMBER & 3D GIFT BOX INTERACTION
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

  // Tương tác thả tim hồ sơ cô dâu & chú rể
  window.reactProfileHeart = function(btn) {
    if (!btn) return;
    const numEl = btn.querySelector('.cl-heart-num');
    if (!numEl) return;
    let count = parseInt(numEl.innerText, 10) || 0;

    if (btn.classList.contains('is-loved')) {
      btn.classList.remove('is-loved');
      count = Math.max(0, count - 1);
    } else {
      btn.classList.add('is-loved');
      count += 1;
      if (navigator.vibrate) {
        try { navigator.vibrate(25); } catch (e) {}
      }
      if (window.showToast) {
        window.showToast("Cảm ơn bạn đã thả tim chúc phúc! ❤️");
      }
    }
    numEl.innerText = count;
  };

  // --- LOGIC HỘP QUÀ TƯƠNG TÁC TỰ NHIÊN MỞ RA VIEW QR NGÂN HÀNG (ZERO-JUMP LAYOUT) ---
  const giftViewport = document.getElementById('gift-viewport');
  const giftBoxStage = document.getElementById('gift-box-stage');
  const giftCardsStage = document.getElementById('gift-cards-stage');
  const giftRecloseBtn = document.getElementById('gift-reclose-btn');
  let isGiftBoxOpening = false;

  function openGiftBox(shouldScroll = false) {
    if (!giftViewport || isGiftBoxOpening) return;
    if (giftViewport.classList.contains('is-opened')) return;

    isGiftBoxOpening = true;

    // Haptic feedback nhẹ trên thiết bị di động
    if (navigator.vibrate) {
      try { navigator.vibrate(35); } catch (err) {}
    }

    // 1. Bật hoạt cảnh nảy nhẹ & bung toả hạt bụi phép thuật
    giftViewport.classList.add('is-opening');

    // 2. Sau 420ms (khi hạt bung toả rực rỡ), chuyển tiếp mượt sang danh sách thẻ QR ngay tại chỗ
    setTimeout(() => {
      giftViewport.classList.remove('is-opening');
      giftViewport.classList.add('is-opened');
      isGiftBoxOpening = false;
    }, 420);
  }

  function closeGiftBox() {
    if (!giftViewport || isGiftBoxOpening) return;

    // Đóng mượt mà tại chỗ, chuyển lại về hộp quà (zero jump layout)
    giftViewport.classList.remove('is-opened');
    giftViewport.classList.remove('is-opening');
  }

  if (giftBoxStage) {
    giftBoxStage.addEventListener('click', () => {
      openGiftBox(false);
    });

    giftBoxStage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGiftBox(false);
      }
    });
  }

  if (giftRecloseBtn) {
    giftRecloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeGiftBox();
    });
  }


  // ==========================================
  // 7. RSVP FORM SUBMISSION (localStorage)
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

      const rsvpData = {
        id: Date.now(),
        name: name,
        phone: phone,
        attendance: attendance === 'yes' ? 'Tham gia' : 'Không tham gia',
        guests: guests,
        note: note || 'Không có',
        time: new Date().toLocaleString('vi-VN')
      };

      const storedRsvp = safeStorage.get('wedding_rsvp_list', []);
      const existingRsvpList = Array.isArray(storedRsvp) ? storedRsvp : [];
      existingRsvpList.push(rsvpData);
      safeStorage.set('wedding_rsvp_list', existingRsvpList);

      if (attendance === 'yes') {
        window.showToast(`Cảm ơn ${name}! Cô dâu & Chú rể rất vui được đón tiếp bạn.`);
      } else {
        window.showToast(`Cảm ơn ${name} đã phản hồi cho Cô dâu & Chú rể!`);
      }

      if (note) {
        addGuestbookEntry(name, note);
      }

      rsvpForm.reset();
    });
  }


  // ==========================================
  // 8. GUESTBOOK (SỔ LƯU BÚT)
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

  function getWishes() {
    const stored = safeStorage.get('wedding_wishes', null);
    return Array.isArray(stored) ? stored : defaultWishes.slice();
  }

  function loadWishes() {
    if (!guestbookMessages) return;
    const wishes = getWishes();
    // Dựng toàn bộ danh sách trong bộ nhớ rồi chèn 1 lần (tránh reflow nhiều lần)
    const fragment = document.createDocumentFragment();

    wishes.slice().reverse().forEach(wish => {
      if (!wish) return;
      const item = document.createElement('div');
      item.className = 'wish-item-bubble';
      item.innerHTML = `
        <div class="wish-author-row">
          <span class="wish-author-name">${escapeHtml(wish.name)}</span>
          <span class="wish-date-time">${escapeHtml(wish.time)}</span>
        </div>
        <p class="wish-content-text">${escapeHtml(wish.text)}</p>
      `;
      fragment.appendChild(item);
    });

    guestbookMessages.innerHTML = '';
    guestbookMessages.appendChild(fragment);
  }

  function addGuestbookEntry(name, text) {
    const wishes = getWishes();
    const newEntry = {
      name: name,
      text: text,
      time: new Date().toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    };
    wishes.push(newEntry);
    safeStorage.set('wedding_wishes', wishes);
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

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  // ==========================================
  // 9. CINELOVE 42 FLOATING ACTION BAR LOGIC
  // ==========================================
  const floatOpenWishes = document.getElementById('float-open-wishes');
  const floatOpenGift = document.getElementById('float-open-gift');
  const floatBurstHearts = document.getElementById('float-burst-hearts');
  const floatLikeBtn = document.getElementById('float-like-btn');
  const likeCounter = document.getElementById('like-counter');
  const heartsBurstContainer = document.getElementById('hearts-burst-container');

  // Shortcut đến form lời chúc
  if (floatOpenWishes) {
    floatOpenWishes.addEventListener('click', () => {
      const gbSec = document.getElementById('guestbook-section');
      if (gbSec) {
        gbSec.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const wishInput = document.getElementById('wish-name');
          if (wishInput) wishInput.focus();
        }, 600);
      }
    });
  }

  // Shortcut đến quà mừng / QR
  if (floatOpenGift) {
    floatOpenGift.addEventListener('click', () => {
      const giftSec = document.getElementById('wishing-section');
      if (giftSec) {
        giftSec.scrollIntoView({ behavior: 'smooth' });
        // Tự động kích hoạt mở hộp quà nếu chưa mở để khách chiêm ngưỡng
        if (giftViewport && !giftViewport.classList.contains('is-opened')) {
          setTimeout(() => {
            openGiftBox(false);
          }, 500);
        }
      }
    });
  }

  // Bắn tim rực rỡ khi nhấn nút "Bắn tim"
  function triggerHeartsBurst(count = 14) {
    if (!heartsBurstContainer) return;

    const colors = ['#e63946', '#ff4d6d', '#ff758f', '#c9184a', '#ff8fa3', '#d90429'];
    const emojis = ['💖', '💕', '❤️', '🌸', '✨', '🫶', '🥰'];

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const heartEl = document.createElement('div');
        heartEl.className = 'burst-heart';

        const size = Math.floor(Math.random() * 24) + 20; // 20px - 44px
        const leftPercent = Math.random() * 80 + 10; // 10% - 90%
        const duration = (Math.random() * 1.5 + 2.0).toFixed(2); // 2.0s - 3.5s
        const rotation = (Math.random() * 60 - 30).toFixed(0); // -30deg to 30deg
        const useEmoji = Math.random() > 0.4;

        heartEl.style.left = `${leftPercent}%`;
        heartEl.style.bottom = '70px';
        heartEl.style.fontSize = `${size}px`;
        heartEl.style.setProperty('--duration', `${duration}s`);
        heartEl.style.setProperty('--rot', `${rotation}deg`);

        if (useEmoji) {
          heartEl.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        } else {
          const color = colors[Math.floor(Math.random() * colors.length)];
          heartEl.innerHTML = `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          `;
        }

        heartsBurstContainer.appendChild(heartEl);

        setTimeout(() => {
          heartEl.remove();
        }, duration * 1000 + 200);
      }, i * 65);
    }
  }

  if (floatBurstHearts) {
    floatBurstHearts.addEventListener('click', () => {
      triggerHeartsBurst(16);
      window.showToast("Cảm ơn tình cảm yêu thương của bạn! 💖");
    });
  }

  // Nút like tăng dần
  let currentLikes = parseInt(safeStorage.get('wedding_likes_count', 222), 10);
  if (!Number.isFinite(currentLikes)) currentLikes = 222;
  if (likeCounter) {
    likeCounter.innerText = currentLikes;
  }

  if (floatLikeBtn) {
    floatLikeBtn.addEventListener('click', () => {
      currentLikes += 1;
      safeStorage.set('wedding_likes_count', String(currentLikes));
      if (likeCounter) likeCounter.innerText = currentLikes;
      floatLikeBtn.classList.add('liked');
      triggerHeartsBurst(6);
    });
  }

  loadWishes();

});
