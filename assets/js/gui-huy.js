/**
 * GUI-HUY.JS - SCRIPT TRÊU ĐÙA & TƯƠNG TÁC DÀNH RIÊNG CHO BẠN THÂN HOÀNG HUY
 * Chạy độc lập, không làm ảnh hưởng đến thiệp cưới chính thức
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. WEB AUDIO API SYNTHESIZER (ÂM THANH VUI NHỘN KHÔNG CẦN TẢI FILE NGOÀI)
  // -------------------------------------------------------------------------
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Âm thanh lò xo / né tránh khi nút Mơ Đi chạy (Boing sound)
  function playBoingSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.28);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      // Ignored
    }
  }

  // Âm thanh chiến thắng / chuông vàng khi ấn Đồng Ý (Fanfare Chime)
  function playChimeSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
      });
    } catch (e) {
      // Ignored
    }
  }

  // Âm thanh gạch xoá bút đỏ khi trêu Huy mới chia tay
  function playScribbleSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.12);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      // Ignored
    }
  }

  // -------------------------------------------------------------------------
  // 2. HIỆU ỨNG TYPEWRITER LỜI NHẮN CỦA TRANG
  // -------------------------------------------------------------------------
  const fullText = "Gửi Huy, trong ngày trọng đại của cuộc đời mình Trang rất buồn khi Huy không thể về được nhưng không sao cả Trang sẽ cố gắng để vượt qua, nếu Huy thực sự muốn chúc phúc cho Trang thì hãy mừng Trang 1 chỉ vàng nhé :D";
  const typewriterEl = document.getElementById('prank-typewriter-text');
  const subnoteEl = document.getElementById('prank-subnote');
  let charIdx = 0;

  function typeNextChar() {
    if (!typewriterEl) return;
    if (charIdx < fullText.length) {
      typewriterEl.textContent += fullText.charAt(charIdx);
      charIdx++;
      const delay = Math.floor(Math.random() * 20) + 25; // 25-45ms
      setTimeout(typeNextChar, delay);
    } else {
      // Kết thúc đánh máy -> hiện subnote tỷ giá và gợi ý
      if (subnoteEl) {
        subnoteEl.classList.add('show');
      }
    }
  }

  // Khởi động typewriter sau 600ms
  setTimeout(typeNextChar, 600);

  // -------------------------------------------------------------------------
  // 3. NÚT "MƠ ĐI" CHẠY QUANH MÀN HÌNH (RUNAWAY BUTTON MEME)
  // -------------------------------------------------------------------------
  const runawayBtn = document.getElementById('btn-prank-runaway');
  const agreeBtn = document.getElementById('btn-prank-agree');
  let escapeCount = 0;

  const escapeJokes = [
    "Né nè! Bắt được hông? 😜",
    "Gần trúng rồi, cố lên bro! 😂",
    "Mùa đông Hàn Quốc lạnh, tay chậm thế! ❄️",
    "Vàng đang hạ giá kìa, bấm Đồng Ý đi! 📈",
    "Ủa tưởng bấm được hả? Mơ đi! 🏃‍♂️💨",
    "Chạy đâu cho thoát khỏi lòng bàn tay Trang! 😈",
    "Nút này tạo ra chỉ để ngắm thôi nha! 🤣",
    "Thôi chấp nhận số phận đi Huy: 1 CHỈ VÀNG! 💍"
  ];

  function showToastNearButton(x, y, text) {
    const oldToast = document.querySelector('.runaway-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'runaway-toast';
    toast.textContent = text;
    toast.style.left = Math.min(Math.max(16, x - 50), window.innerWidth - 180) + 'px';
    toast.style.top = Math.max(16, y - 45) + 'px';

    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }
    }, 1400);
  }

  function dodgeRunawayButton(e) {
    if (!runawayBtn) return;
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }

    playBoingSound();
    escapeCount++;

    // Thay đổi vị trí nút
    const btnRect = runawayBtn.getBoundingClientRect();
    const btnWidth = btnRect.width || 120;
    const btnHeight = btnRect.height || 42;

    const padding = 20;
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;

    let randomX = Math.floor(Math.random() * (maxX - padding)) + padding;
    let randomY = Math.floor(Math.random() * (maxY - padding)) + padding;

    // Tránh vị trí đè lên nút Đồng Ý
    if (agreeBtn) {
      const agreeRect = agreeBtn.getBoundingClientRect();
      if (
        randomX + btnWidth > agreeRect.left - 20 &&
        randomX < agreeRect.right + 20 &&
        randomY + btnHeight > agreeRect.top - 20 &&
        randomY < agreeRect.bottom + 20
      ) {
        randomY = (randomY > window.innerHeight / 2) ? 40 : window.innerHeight - 80;
      }
    }

    // Biến nút thành fixed để chạy tự do toàn màn hình
    runawayBtn.style.position = 'fixed';
    runawayBtn.style.left = randomX + 'px';
    runawayBtn.style.top = randomY + 'px';
    runawayBtn.style.bottom = 'auto';
    runawayBtn.style.transform = 'none';

    // Đổi chữ nút vui nhộn sau vài lần né
    if (escapeCount >= 3) {
      runawayBtn.innerHTML = '<i class="fa-solid fa-person-running"></i> Đố bắt được đó =))';
    }
    if (escapeCount >= 6) {
      runawayBtn.innerHTML = '<i class="fa-solid fa-ghost"></i> Chịu thua đi bro!';
    }

    const jokeText = escapeJokes[(escapeCount - 1) % escapeJokes.length];
    showToastNearButton(randomX, randomY, jokeText);
  }

  if (runawayBtn) {
    // Sự kiện chuột máy tính
    runawayBtn.addEventListener('mouseenter', dodgeRunawayButton);
    runawayBtn.addEventListener('mouseover', dodgeRunawayButton);
    runawayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dodgeRunawayButton(e);
    });

    // Sự kiện cảm ứng điện thoại
    runawayBtn.addEventListener('touchstart', (e) => {
      dodgeRunawayButton(e);
    }, { passive: false });
    runawayBtn.addEventListener('pointerdown', (e) => {
      dodgeRunawayButton(e);
    });

    // Chuột đến gần trong phạm vi 85px cũng tự động né (desktop)
    document.addEventListener('mousemove', (e) => {
      if (!runawayBtn || runawayBtn.style.display === 'none') return;
      const rect = runawayBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (distance < 85) {
        dodgeRunawayButton(e);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 4. NÚT "ĐỒNG Ý" & POPUP BIÊN BẢN CAM KẾT 1 CHỈ VÀNG
  // -------------------------------------------------------------------------
  const prankOverlay = document.getElementById('prank-gate');
  const pledgeModal = document.getElementById('pledge-modal');
  const pledgeConfirmBtn = document.getElementById('btn-pledge-confirm');
  const floatingGoldBadge = document.getElementById('floating-gold-badge');

  function triggerConfettiBurst() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    }
  }

  if (agreeBtn) {
    agreeBtn.addEventListener('click', () => {
      playChimeSound();
      triggerConfettiBurst();
      if (pledgeModal) {
        pledgeModal.classList.add('active');
      }
    });
  }

  if (pledgeConfirmBtn) {
    pledgeConfirmBtn.addEventListener('click', () => {
      playChimeSound();
      triggerConfettiBurst();

      // Đóng modal cam kết & ẩn màn prank gate
      if (pledgeModal) pledgeModal.classList.remove('active');
      if (prankOverlay) {
        prankOverlay.classList.add('hidden');
        setTimeout(() => {
          prankOverlay.style.display = 'none';
        }, 600);
      }

      // Kích hoạt teaser animation "người thương"
      triggerTeaseAnimation();

      // Hiện floating badge 1 chỉ vàng
      if (floatingGoldBadge) {
        floatingGoldBadge.style.display = 'flex';
      }
    });
  }

  if (floatingGoldBadge) {
    floatingGoldBadge.addEventListener('click', () => {
      if (pledgeModal) {
        pledgeModal.classList.add('active');
      }
    });
  }

  // Đóng modal cam kết khi click ra ngoài nền đen
  if (pledgeModal) {
    pledgeModal.addEventListener('click', (e) => {
      if (e.target === pledgeModal) {
        pledgeModal.classList.remove('active');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. HIỆU ỨNG TRÊU ĐÙA "NGƯỜI THƯƠNG" (VÌ HUY MỚI CHIA TAY)
  // -------------------------------------------------------------------------
  function triggerTeaseAnimation() {
    setTimeout(() => {
      const crossLines = document.querySelectorAll('.tease-cross-line');
      const stamps = document.querySelectorAll('.tease-stamp');
      const jokeNotes = document.querySelectorAll('.tease-joke-note');

      playScribbleSound();

      crossLines.forEach(el => el.classList.add('active'));
      stamps.forEach(el => el.classList.add('active'));
      jokeNotes.forEach(el => el.classList.add('active'));
    }, 1200);
  }

  // Nếu người dùng cuộn đến phần thư mời thì kích hoạt hiệu ứng nếu chưa chạy
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerTeaseAnimation();
      }
    });
  }, { threshold: 0.3 });

  const inviteSection = document.getElementById('invitation-section');
  if (inviteSection) {
    observer.observe(inviteSection);
  }
});
