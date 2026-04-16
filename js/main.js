// MT21 Paslanmaz Civata — Ana JavaScript Dosyası

// ============================================================
// FOTOĞRAF YÜKLEME SİSTEMİ (global scope — onclick'ten çağrılır)
// ============================================================
var _fileInput = null;
var _activeProductId = null;

function _getOrCreateFileInput() {
  if (!_fileInput) {
    _fileInput = document.createElement('input');
    _fileInput.type = 'file';
    _fileInput.accept = 'image/*';
    _fileInput.style.display = 'none';
    document.body.appendChild(_fileInput);
    _fileInput.addEventListener('change', function () {
      var file = _fileInput.files[0];
      if (!file || !_activeProductId) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        var dataUrl = e.target.result;
        _applyPhoto(_activeProductId, dataUrl);
        try { localStorage.setItem('mt21_img_' + _activeProductId, dataUrl); } catch (err) {}
        _fileInput.value = '';
      };
      reader.readAsDataURL(file);
    });
  }
  return _fileInput;
}

function triggerUpload(productId) {
  _activeProductId = productId;
  _getOrCreateFileInput().click();
}

function _applyPhoto(productId, dataUrl) {
  var card = document.querySelector('[data-product-id="' + productId + '"]');
  if (!card) return;
  var imgArea = card.querySelector('.product-img');
  if (!card || !imgArea) return;

  // Mevcut uploaded img varsa güncelle, yoksa yenisini oluştur
  var existing = imgArea.querySelector('.uploaded-img');
  if (!existing) {
    var img = document.createElement('img');
    img.className = 'uploaded-img';
    imgArea.insertBefore(img, imgArea.firstChild);
    existing = img;
  }
  existing.src = dataUrl;
}

function removePhoto(productId, event) {
  event.stopPropagation();
  var card = document.querySelector('[data-product-id="' + productId + '"]');
  if (!card) return;
  var img = card.querySelector('.uploaded-img');
  if (img) img.remove();
  try { localStorage.removeItem('mt21_img_' + productId); } catch (err) {}
}

// Sayfa yüklenince kayıtlı fotoğrafları geri yükle
function _restorePhotos() {
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf('mt21_img_') === 0) {
        var pid = key.replace('mt21_img_', '');
        var dataUrl = localStorage.getItem(key);
        if (dataUrl) _applyPhoto(pid, dataUrl);
      }
    }
  } catch (err) {}
}
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  _restorePhotos();

  // ---- HAMBURGEr MENÜ ----
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      var spans = hamburger.querySelectorAll('span');
      if (mobileMenu.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
  }

  // ---- BACK TO TOP ----
  var backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backTop.classList.add('visible');
      } else {
        backTop.classList.remove('visible');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- TOAST BİLDİRİM ----
  var toast = document.getElementById('toast');
  var toastClose = document.getElementById('toastClose');
  if (toast) {
    // Sayfaya geldikten 3 saniye sonra göster
    setTimeout(function () {
      toast.classList.add('show');
    }, 3000);
    // 8 saniye sonra otomatik kapat
    setTimeout(function () {
      toast.classList.remove('show');
    }, 8000);
  }
  if (toastClose && toast) {
    toastClose.addEventListener('click', function () {
      toast.classList.remove('show');
    });
  }

  // ---- SAYAÇ ANİMASYONU ----
  var statNums = document.querySelectorAll('.stat-num[data-target]');
  if (statNums.length > 0) {
    var counted = false;
    function animateCounters() {
      if (counted) return;
      counted = true;
      statNums.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var suffix = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
        var start = 0;
        var duration = 1800;
        var step = Math.ceil(target / (duration / 16));
        var interval = setInterval(function () {
          start += step;
          if (start >= target) {
            start = target;
            clearInterval(interval);
          }
          el.innerHTML = start + suffix;
        }, 16);
      });
    }

    // IntersectionObserver ile görünür olduğunda çalıştır
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });
      observer.observe(statNums[0].closest('.stats-inner') || statNums[0]);
    } else {
      animateCounters();
    }
  }

  // ---- ÜRÜN FİLTRELEME (urunler.html) ----
  var filterBar = document.getElementById('filterBar');
  var productsGrid = document.getElementById('productsGrid');
  if (filterBar && productsGrid) {
    var filterBtns = filterBar.querySelectorAll('.filter-btn');
    var productCards = productsGrid.querySelectorAll('.product-card');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Aktif buton güncelle
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter');

        productCards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = '';
            // Hafif fade animasyonu
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(function () {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = '';
            }, 10);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // URL parametresine göre otomatik filtrele
    var urlParams = new URLSearchParams(window.location.search);
    var kategori = urlParams.get('kategori');
    if (kategori) {
      var matchBtn = filterBar.querySelector('[data-filter="' + kategori + '"]');
      if (matchBtn) matchBtn.click();
    }
  }

  // ---- İLETİŞİM FORMU (iletisim.html) ----
  var contactForm = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basit validasyon
      var required = contactForm.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#FC8181';
          setTimeout(function () { field.style.borderColor = ''; }, 2000);
        }
      });

      if (!valid) return;

      // Gönder butonu
      var submitBtn = contactForm.querySelector('.form-submit');
      submitBtn.textContent = 'Gönderiliyor...';
      submitBtn.disabled = true;

      // Simüle gönderim (backend yokken)
      setTimeout(function () {
        contactForm.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
      }, 1200);
    });

    // Input focus temizleme
    contactForm.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('focus', function () {
        el.style.borderColor = '';
      });
    });
  }

  // ---- HEADER SCROLL EFFEKTİ ----
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
      } else {
        header.style.boxShadow = '';
      }
    });
  }

  // ---- MOBİL MENÜ — SAYFA DIŞINA TIKLAYINCA KAPAT ----
  document.addEventListener('click', function (e) {
    if (hamburger && mobileMenu && mobileMenu.classList.contains('open')) {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        var spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    }
  });

});
