// data.js

// Database game dan harga (GLOBAL SCOPE)
const gameData = {
    'mobile-legends': { name: 'Mobile Legends', currency: 'Diamond', nominals: { '86': { price: 20000, label: '86 Diamond' }, '172': { price: 39000, label: '172 Diamond' }, '257': { price: 59000, label: '257 Diamond' }, '344': { price: 79000, label: '344 Diamond' }, '429': { price: 99000, label: '429 Diamond' }, '514': { price: 119000, label: '514 Diamond' }, '706': { price: 159000, label: '706 Diamond' }, '878': { price: 199000, label: '878 Diamond' }, '1412': { price: 319000, label: '1412 Diamond' }, '2195': { price: 479000, label: '2195 Diamond' }, '3688': { price: 799000, label: '3688 Diamond' }, '5532': { price: 1199000, label: '5532 Diamond' }}},
    'wuthering-waves': { name: 'Wuthering Waves', currency: 'Astrid', nominals: { '60': { price: 15000, label: '60 Astrid' }, '300': { price: 75000, label: '300 Astrid' }, '980': { price: 235000, label: '980 Astrid' }, '1980': { price: 475000, label: '1980 Astrid' }, '3280': { price: 785000, label: '3280 Astrid' }, '6480': { price: 1500000, label: '6480 Astrid' }}},
    'magic-chest': { name: 'Magic Chest Go Go', currency: 'Diamond', nominals: { '60': { price: 12000, label: '60 Diamond' }, '125': { price: 25000, label: '125 Diamond' }, '250': { price: 49000, label: '250 Diamond' }, '500': { price: 95000, label: '500 Diamond' }, '1000': { price: 189000, label: '1000 Diamond' }, '2500': { price: 469000, label: '2500 Diamond' }}},
    'summoners-war': { name: 'Summoners War', currency: 'Crystal', nominals: { '100': { price: 15000, label: '100 Crystal' }, '250': { price: 35000, label: '250 Crystal' }, '500': { price: 70000, label: '500 Crystal' }, '1000': { price: 140000, label: '1000 Crystal' }, '2500': { price: 350000, label: '2500 Crystal' }, '5000': { price: 700000, label: '5000 Crystal' }}}
};

// Format Rupiah (GLOBAL SCOPE)
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// Menjalankan kode setelah semua elemen halaman dimuat
document.addEventListener('DOMContentLoaded', function() {

    // LOGIKA KHUSUS UNTUK HALAMAN TOPUP.HTML
    const topupForm = document.getElementById('topupForm');
    if (topupForm) {
        let selectedGame = null;
        const gameSelect = document.getElementById('game-select');
        const nominalContainer = document.getElementById('nominal-container');
        const priceDisplay = document.getElementById('price-display');
        const totalPrice = document.getElementById('total-price');
        const currencyType = document.getElementById('currency-type');
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));

        // Fungsi untuk render nominal berdasarkan game
        function renderNominals(gameKey) {
            const game = gameData[gameKey];
            if (!game) return;

            nominalContainer.innerHTML = '';
            Object.keys(game.nominals).forEach((nominalValue, index) => {
                const data = game.nominals[nominalValue];
                const nominalElement = document.createElement('div');
                nominalElement.innerHTML = `
                    <input type="radio" class="btn-check" name="nominal" id="nominal${index}" value="${nominalValue}" autocomplete="off">
                    <label class="btn btn-outline-light w-100" for="nominal${index}">
                        ${data.label}<br>
                        <small class="fw-normal">${formatRupiah(data.price)}</small>
                    </label>
                `;
                nominalContainer.appendChild(nominalElement);
            });

            // Tambahkan event listener ke radio button yang baru dibuat
            document.querySelectorAll('input[name="nominal"]').forEach(radio => {
                radio.addEventListener('change', updatePrice);
            });
        }

        // Fungsi untuk update tampilan harga
        function updatePrice() {
            const selectedNominalRadio = document.querySelector('input[name="nominal"]:checked');
            if (selectedNominalRadio && selectedGame) {
                const nominalValue = selectedNominalRadio.value;
                const game = gameData[selectedGame];
                const nominalData = game.nominals[nominalValue];

                totalPrice.textContent = formatRupiah(nominalData.price);
                currencyType.textContent = nominalData.label;
                priceDisplay.style.display = 'block';
                priceDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                priceDisplay.style.display = 'none';
            }
        }

        // Event listener untuk dropdown game
        gameSelect.addEventListener('change', function() {
            selectedGame = this.value;
            priceDisplay.style.display = 'none'; // Sembunyikan harga
            document.querySelectorAll('input[name="nominal"]').forEach(r => r.checked = false); // Hapus pilihan nominal
            
            if (selectedGame) {
                renderNominals(selectedGame);
            } else {
                nominalContainer.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="bi bi-controller fs-1 mb-2"></i>
                        <p>Pilih game terlebih dahulu</p>
                    </div>`;
            }
        });
        
        // Cek parameter URL saat halaman dimuat
        const urlParams = new URLSearchParams(window.location.search);
        const gameFromUrl = urlParams.get('game');
        if (gameFromUrl && gameData[gameFromUrl]) {
            gameSelect.value = gameFromUrl;
            // Picu event change secara manual untuk memuat nominal
            gameSelect.dispatchEvent(new Event('change'));
        }

        // Event listener untuk submit form
        topupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(topupForm);
            const nominal = formData.get('nominal');

            // Validasi manual sederhana
            if (!formData.get('game') || !formData.get('user_id') || !formData.get('server') || !nominal || !formData.get('payment_method')) {
                alert('Harap lengkapi semua data sebelum melanjutkan!');
                return;
            }

            // Ambil data untuk modal
            const gameKey = formData.get('game');
            const game = gameData[gameKey];
            const item = game.nominals[nominal];

            // Masukkan detail pesanan ke dalam modal
            document.getElementById('modal-order-details').innerHTML = `
                <ul class="list-unstyled">
                    <li><strong>Game:</strong> ${game.name}</li>
                    <li><strong>User ID:</strong> ${formData.get('user_id')}</li>
                    <li><strong>Server:</strong> ${formData.get('server').toUpperCase()}</li>
                    <li><strong>Item:</strong> ${item.label}</li>
                    <li><strong>Pembayaran:</strong> ${formData.get('payment_method').toUpperCase()}</li>
                    <li class="mt-3 fs-5 fw-bold text-white">
                        Total: <span class="text-warning">${formatRupiah(item.price)}</span>
                    </li>
                </ul>`;

            // Tampilkan modal
            confirmationModal.show();
        });

        // Event listener untuk tombol "Lanjutkan Pembayaran" di dalam modal
        document.getElementById('confirm-purchase-btn').addEventListener('click', function() {
            confirmationModal.hide();
            
            const submitButton = topupForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';
            submitButton.disabled = true;

            // Simulasi proses pembayaran
            setTimeout(() => {
                alert('Terima kasih! Pesanan Anda telah diterima dan akan segera diproses.');
                topupForm.reset();
                gameSelect.dispatchEvent(new Event('change')); // Reset tampilan nominal
                submitButton.innerHTML = '<i class="bi bi-cart-check-fill me-2"></i> Beli Sekarang';
                submitButton.disabled = false;
            }, 2000);
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
      const promoGamesContainer = document.getElementById('promoGames');
      const noPromo = document.getElementById('noPromo');
      const regionSelect = document.getElementById('regionSelect');

      function loadGames(region) {
        promoGamesContainer.innerHTML = '';
        noPromo.style.display = 'none';

        if (region !== 'jawa') {
          noPromo.style.display = 'block';
          return;
        }

        fetch('games.html')
          .then(res => res.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const allGameItems = doc.querySelectorAll('.game-item');

            if (allGameItems.length === 0) {
              noPromo.style.display = 'block';
            } else {
              allGameItems.forEach(item => {
                const col = document.createElement('div');
                col.className = 'col-lg-3 col-md-4 col-sm-6';
                const card = item.querySelector('.game-card-custom');
                const priceElement = card.querySelector('.price-range');

                const priceText = priceElement.textContent;
                const match = priceText.match(/Rp\s?(\d+[.,]?\d*)/);
                if (match) {
                  let originalPrice = parseFloat(match[1].replace('.', '').replace(',', '.'));
                  let discountedPrice = originalPrice * 0.9;
                  priceElement.textContent = `Diskon Jawa: Rp ${discountedPrice.toLocaleString('id-ID')}`;
                }

                card.classList.add('border', 'border-warning');
                col.innerHTML = card.outerHTML;
                promoGamesContainer.appendChild(col);
              });
            }
          })
          .catch(error => {
            console.error('Gagal memuat data:', error);
            noPromo.style.display = 'block';
          });
      }

      regionSelect.addEventListener('change', () => {
        loadGames(regionSelect.value);
      });

      loadGames(regionSelect.value);
    });

    

    