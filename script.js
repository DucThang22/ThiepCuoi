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
  // Mặc định: ngày cưới tự động tính là 60 ngày sau ngày hiện tại để người dùng test
  // Khi chỉnh sửa thật, bạn hãy đổi dòng này thành ngày cố định, ví dụ:
  // const COUNTDOWN_TARGET = new Date("2026-10-25T09:00:00").getTime();
  
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 60); // 60 ngày từ hôm nay
  targetDate.setHours(9, 0, 0, 0);
  const COUNTDOWN_TARGET = targetDate.getTime();

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


  // ==========================================
  // 2. ENVELOPE OPENING & PHOTO FLOATING ANIMATION
  // ==========================================
  const envelopeCover = document.getElementById('envelope-cover');
  const envelopeInteractive = document.getElementById('envelope-interactive');
  const envelopeWaxSeal = document.getElementById('envelope-wax-seal');
  const envelopeTopTitle = document.getElementById('envelope-top-title');
  const envelopeBottomInfo = document.getElementById('envelope-bottom-info');
  const musicBtn = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  let isPlaying = false;
  let isOpened = false;

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

  // Bước 1: Mở phong bì thư và trồi ảnh cưới TTT09222 lên
  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    if (envelopeCover) {
      envelopeCover.classList.add('envelope-opened');
    }
    if (envelopeInteractive) {
      envelopeInteractive.classList.add('opening');
    }
    if (envelopeTopTitle) {
      envelopeTopTitle.classList.add('opening');
    }

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
    if (envelopeCover) {
      envelopeCover.classList.add('opened');
    }
    document.body.style.overflowY = 'auto';
    setTimeout(playAudio, 300);
  }

  if (envelopeCover) {
    // Click vào phong bì / con dấu / tiêu đề lần đầu sẽ mở phong bì
    if (envelopeInteractive) {
      envelopeInteractive.addEventListener('click', () => {
        if (!isOpened) {
          openEnvelope();
        } else {
          enterWeddingSite();
        }
      });
    }

    if (envelopeWaxSeal) {
      envelopeWaxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isOpened) {
          openEnvelope();
        } else {
          enterWeddingSite();
        }
      });
    }

    if (envelopeTopTitle) {
      envelopeTopTitle.addEventListener('click', () => {
        if (!isOpened) openEnvelope();
        else enterWeddingSite();
      });
    }

    if (envelopeBottomInfo) {
      envelopeBottomInfo.addEventListener('click', () => {
        if (!isOpened) openEnvelope();
        else enterWeddingSite();
      });
    }

    // Khi đã mở phong bì, nhấp vào bất kỳ đâu trên màn hình cũng vào xem thiệp cưới
    envelopeCover.addEventListener('click', (e) => {
      if (isOpened && !e.target.closest('#music-toggle')) {
        enterWeddingSite();
      }
    });

    // Mặc định khóa cuộn trang khi chưa mở thiệp
    document.body.style.overflowY = 'hidden';
  }

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
