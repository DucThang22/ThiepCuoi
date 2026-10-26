/* ==========================================================================
   ONLINE WEDDING INVITATION - JAVASCRIPT
   Features: Envelope opening, Music play/pause, Dynamic Countdown,
             RSVP to localStorage, Guestbook wishes, Image Lightbox, Scroll Animation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 0. AUTO GOOGLE DRIVE IMAGE CONVERTER
  // Tự động nhận diện và chuyển đổi link Google Drive thành ảnh hiển thị trực tiếp
  // ==========================================
  function convertDriveLink(url) {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return url;
    
    // Tìm ID của file trên Google Drive
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      // Direct stream link từ Google CDN
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
  }

  function autoConvertDriveImages() {
    // 1. Chuyển đổi tất cả thẻ <img> có link Drive
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && (src.includes('drive.google.com') || src.includes('docs.google.com'))) {
        const directSrc = convertDriveLink(src);
        img.setAttribute('src', directSrc);
        
        // Tự động fallback sang thumbnail chất lượng cao nếu cần
        img.addEventListener('error', function fallback() {
          const fileMatch = src.match(/\/d\/([a-zA-Z0-9_-]+)/) || src.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (fileMatch && fileMatch[1]) {
            this.src = `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1600`;
          }
        }, { once: true });
      }
    });

    // 2. Chuyển đổi các thẻ dùng style background-image có link Drive
    document.querySelectorAll('[style*="drive.google.com"]').forEach(el => {
      const bg = el.style.backgroundImage;
      if (bg && bg.includes('drive.google.com')) {
        const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
        if (match && match[1]) {
          const directUrl = convertDriveLink(match[1]);
          el.style.backgroundImage = `url('${directUrl}')`;
        }
      }
    });
  }

  // Chạy chuyển đổi link Drive ngay khi tải trang
  autoConvertDriveImages();

  // ==========================================
  // 1. DYNAMIC WEDDING DATE & COUNTDOWN
  // ==========================================
  // Ngày cưới cố định: 20/12/2026 lúc 08:30 sáng
  const COUNTDOWN_TARGET = new Date("2026-12-20T08:30:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = COUNTDOWN_TARGET - now;

    if (distance < 0) {
      document.querySelector('.countdown-container').innerHTML = "<h3 style='font-family: var(--font-title); color: var(--primary-color);'>Đã đến ngày hạnh phúc!</h3>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown(); // Chạy ngay lập tức lần đầu
  const envelopeCover = document.getElementById('envelope-cover');
  const envelopeInteractive = document.getElementById('envelope-interactive');
  const musicBtn = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  let isPlaying = false;
  let isOpened = false;
  let autoEnterTimer = null;

  // Cấu hình âm lượng nhỏ vừa phải
  bgMusic.volume = 0.5;

  function playAudio() {
    bgMusic.play().then(() => {
      isPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.querySelector('i').className = 'fa-solid fa-compact-disc';
    }).catch(err => {
      console.log("Browser blocked autoplay. Waiting for user interaction.", err);
    });
  }

  function toggleAudio() {
    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      musicBtn.classList.remove('playing');
      musicBtn.querySelector('i').className = 'fa-solid fa-play';
    } else {
      playAudio();
    }
  }

  // Hiệu ứng 3 trái tim đỏ lớn bay lên từ bên trong phong bì sau khi mở xong
  function spawnThreeBigRedHearts() {
    const container = document.getElementById('envelope-hearts-container');
    if (!container || !envelopeCover || envelopeCover.classList.contains('opened')) return;

    // Xác định toạ độ xuất phát (từ bên trong miệng phong bì, nơi ảnh cưới vừa trồi lên)
    const envelopeRect = envelopeInteractive ? envelopeInteractive.getBoundingClientRect() : null;
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight * 0.55;

    if (envelopeRect) {
      startX = envelopeRect.left + envelopeRect.width / 2;
      startY = envelopeRect.top + envelopeRect.height * 0.46;
    }

    // 3 trái tim đỏ lớn, kích thước to rõ và quỹ đạo bay uốn lượn liên tục lên đỉnh màn hình
    const threeHearts = [
      {
        size: 54, // 54px (lệch trái)
        offsetX: -68,
        sway: 'bigHeartSwayLeft',
        duration: 3.4,
        delay: 0
      },
      {
        size: 72, // 72px (trái tim chủ đạo lớn nhất bay ở giữa)
        offsetX: 0,
        sway: 'bigHeartSwayCenter',
        duration: 3.6,
        delay: 220
      },
      {
        size: 60, // 60px (lệch phải)
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

        // Trái tim màu đỏ thắm (#e60026) với viền trắng bạc sắc nét và vệt sáng 3D nổi bật
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

  // Bước 1: Mở phong bì thư và trồi ảnh cưới lên
  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    if (envelopeCover) {
      envelopeCover.classList.add('envelope-opened');
    }
    if (envelopeInteractive) {
      envelopeInteractive.classList.add('opening');
    }

    // Sau khi phong thư mở xong (~1000ms), 3 trái tim đỏ lớn bắt đầu bay lên từ bên trong
    setTimeout(() => {
      spawnThreeBigRedHearts();
    }, 1000);

    // Phát nhạc nhẹ nhàng
    setTimeout(playAudio, 500);

    // Kích hoạt hiệu ứng chuyển động lên xuống nhẹ nhàng sau khi ảnh trượt lên xong
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
    }
    document.body.style.overflowY = 'auto';
    setTimeout(playAudio, 300);
  }

  // Logic click theo yêu cầu:
  // - CHỈ gắn sự kiện click vào thiệp (envelopeInteractive)
  // - KHÔNG gắn sự kiện click vào text "thiệp mời cưới", icon "song_hy", chữ "Đức Thắng Kiều Trang"
  // - Click lần 1: Mở thiệp và sau 5s tự động chuyển vào trang sau
  // - Click lần 2: Mở trang tiếp theo luôn lập tức
  let lastOpenTime = 0;
  function handleEnvelopeClick(e) {
    if (e) e.stopPropagation();
    const now = Date.now();

    if (!isOpened) {
      // Click lần 1: Mở thiệp
      lastOpenTime = now;
      openEnvelope();

      // Sau 6s tự động chuyển vào trang sau (đủ thời gian ngắm trọn vẹn 3 trái tim bay vút lên đỉnh)
      autoEnterTimer = setTimeout(() => {
        enterWeddingSite();
      }, 6000);
    } else {
      // Chỉ cho phép click lần 2 sau ít nhất 600ms để tránh tình cờ double-click làm mất hiệu ứng mở thiệp
      if (now - lastOpenTime > 600) {
        enterWeddingSite();
      }
    }
  }

  if (envelopeInteractive) {
    envelopeInteractive.addEventListener('click', handleEnvelopeClick);
  }

  // Mặc định khóa cuộn trang khi chưa mở thiệp
  document.body.style.overflowY = 'hidden';

  // Sự kiện bấm nút bật/tắt nhạc nổi
  if (musicBtn) {
    musicBtn.addEventListener('click', toggleAudio);
  }


  // ==========================================
  // 3. SCROLL REVEAL (INTERSECTION OBSERVER)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Chỉ chạy hiệu ứng 1 lần
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));


  // ==========================================
  // 4. PHOTO GALLERY LIGHTBOX WITH NAVIGATION
  // ==========================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentImgIndex = 0;
  const imageSources = [];

  // Thu thập các link ảnh trong gallery
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    imageSources.push(img.getAttribute('src'));
    
    item.addEventListener('click', () => {
      currentImgIndex = index;
      openLightbox(img.getAttribute('src'));
    });
  });

  function openLightbox(src) {
    lightboxImg.setAttribute('src', src);
    lightbox.style.display = 'flex';
    setTimeout(() => lightbox.classList.add('active'), 10);
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(() => lightbox.style.display = 'none', 400);
  }

  function showNextImage() {
    currentImgIndex = (currentImgIndex + 1) % imageSources.length;
    lightboxImg.setAttribute('src', imageSources[currentImgIndex]);
  }

  function showPrevImage() {
    currentImgIndex = (currentImgIndex - 1 + imageSources.length) % imageSources.length;
    lightboxImg.setAttribute('src', imageSources[currentImgIndex]);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

  // Click ra ngoài ảnh để đóng lightbox
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Hỗ trợ phím mũi tên và ESC
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });


  // ==========================================
  // 5. TOAST NOTIFICATION UTILITY
  // ==========================================
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }


  // ==========================================
  // 6. RSVP FORM SUBMISSION (localStorage)
  // ==========================================
  const rsvpForm = document.getElementById('wedding-rsvp-form');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const guestName = document.getElementById('rsvp-name').value.trim();
      const guestPhone = document.getElementById('rsvp-phone').value.trim();
      const attendance = document.querySelector('input[name="attendance"]:checked').value;
      const guestsCount = document.getElementById('rsvp-guests').value;
      const guestNote = document.getElementById('rsvp-note').value.trim();

      if (!guestName || !guestPhone) {
        showToast("Vui lòng điền Họ tên và Số điện thoại!");
        return;
      }

      // Tạo đối tượng RSVP
      const rsvpData = {
        id: Date.now(),
        name: guestName,
        phone: guestPhone,
        attendance: attendance === 'yes' ? 'Tham gia' : 'Không tham gia',
        guests: attendance === 'yes' ? guestsCount : 0,
        note: guestNote || 'Không có',
        time: new Date().toLocaleString('vi-VN')
      };

      // Lưu trữ vào localStorage
      const existingRsvpList = JSON.parse(localStorage.getItem('wedding_rsvp_list')) || [];
      existingRsvpList.push(rsvpData);
      localStorage.setItem('wedding_rsvp_list', JSON.stringify(existingRsvpList));

      // Hiển thị thông báo thành công ngọt ngào
      if (attendance === 'yes') {
        showToast(`Cảm ơn ${guestName}! Cô dâu & Chú rể rất vui được đón tiếp bạn.`);
      } else {
        showToast(`Cảm ơn ${guestName} đã phản hồi cho Cô dâu & Chú rể!`);
      }

      // Reset form
      rsvpForm.reset();

      // Nếu khách chúc luôn ở form RSVP, tự động đồng bộ vào Guestbook
      if (guestNote) {
        addGuestbookEntry(guestName, guestNote);
      }
    });

    // Ẩn/Hiện số người đi cùng tùy vào chọn Có tham dự hay không
    const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    const guestsGroup = document.getElementById('rsvp-guests').closest('.rsvp-form-group');
    
    attendanceRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'no') {
          guestsGroup.style.opacity = '0.5';
          document.getElementById('rsvp-guests').setAttribute('disabled', 'true');
          document.getElementById('rsvp-guests').value = '0';
        } else {
          guestsGroup.style.opacity = '1';
          document.getElementById('rsvp-guests').removeAttribute('disabled');
          document.getElementById('rsvp-guests').value = '1';
        }
      });
    });
  }


  // ==========================================
  // 7. GUESTBOOK (localStorage)
  // ==========================================
  const guestbookForm = document.getElementById('guestbook-form');
  const guestbookMessages = document.getElementById('guestbook-messages');

  // Lấy chữ cái đầu làm avatar
  function getInitials(name) {
    if (!name) return '❤';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  // Load lời chúc từ localStorage
  function loadWishes() {
    if (!guestbookMessages) return;
    
    const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [
      // Dữ liệu mẫu ban đầu để sổ lưu bút nhìn đẹp mắt
      { name: 'Anh Nguyễn Hoàng Lâm', text: 'Chúc mừng hai em trăm năm hạnh phúc! Chúc gia đình nhỏ luôn tràn ngập tiếng cười và niềm vui.', time: '18/07/2026 09:12' },
      { name: 'Chị Mai Lan', text: 'Chúc cô dâu chú rể mãi ngọt ngào như ngày đầu mới yêu nhé! Thật tiếc hôm đó mình đi công tác, gửi lời chúc phúc sâu sắc nhất.', time: '18/07/2026 08:30' }
    ];

    guestbookMessages.innerHTML = '';
    
    // Đảo ngược để lời chúc mới nhất lên đầu
    [...wishes].reverse().forEach(wish => {
      const card = document.createElement('div');
      card.className = 'message-card';
      
      const initials = getInitials(wish.name);
      
      card.innerHTML = `
        <div class="message-avatar">${initials}</div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-name">${wish.name}</span>
            <span class="message-time">${wish.time}</span>
          </div>
          <p class="message-text">${wish.text}</p>
        </div>
      `;
      guestbookMessages.appendChild(card);
    });
  }

  // Thêm một lời chúc mới vào dữ liệu
  function addGuestbookEntry(name, text) {
    const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [
      { name: 'Anh Nguyễn Hoàng Lâm', text: 'Chúc mừng hai em trăm năm hạnh phúc! Chúc gia đình nhỏ luôn tràn ngập tiếng cười và niềm vui.', time: '18/07/2026 09:12' },
      { name: 'Chị Mai Lan', text: 'Chúc cô dâu chú rể mãi ngọt ngào như ngày đầu mới yêu nhé! Thật tiếc hôm đó mình đi công tác, gửi lời chúc phúc sâu sắc nhất.', time: '18/07/2026 08:30' }
    ];

    const newWish = {
      name: name,
      text: text,
      time: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    wishes.push(newWish);
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
    loadWishes();
  }

  // Gửi form lưu bút
  if (guestbookForm) {
    guestbookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('wish-name');
      const textInput = document.getElementById('wish-text');
      
      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) {
        showToast("Vui lòng điền tên và viết lời chúc!");
        return;
      }

      addGuestbookEntry(name, text);
      
      nameInput.value = '';
      textInput.value = '';
      
      showToast("Lời chúc của bạn đã gửi đến Cô dâu & Chú rể!");
    });
  }

  // Load lời chúc ban đầu
  loadWishes();


  // ==========================================
  // 8. WISHING WELL QR MODAL / EXPAND EFFECT
  // ==========================================
  const qrWrappers = document.querySelectorAll('.wishing-qr-wrapper');
  
  qrWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const qrImgSrc = wrapper.querySelector('img').getAttribute('src');
      openLightbox(qrImgSrc);
    });
  });

});
