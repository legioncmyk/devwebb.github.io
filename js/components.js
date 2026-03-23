(function () {
  const phone = '085169307731';
  const danaPhone = '08516930771';

  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value || 0));
  }

  function buildNavbar() {
    const navItems = [
      { href: 'index.html', label: 'Home', key: 'home' },
      { href: 'premium.html', label: 'Premium', key: 'premium' },
      { href: 'jasa.html', label: 'Jasa', key: 'jasa' },
      { href: 'dashboard.html', label: 'Dashboard', key: 'dashboard' },
      { href: 'admin.html', label: 'Admin', key: 'admin' }
    ];

    const currentPage = document.body.dataset.page;
    return `
      <nav class="bottom-nav fade-in">
        <ul>
          ${navItems
            .map(
              (item) => `
                <li>
                  <a href="${item.href}" class="${currentPage === item.key ? 'active' : ''}">
                    <span>${item.label}</span>
                  </a>
                </li>`
            )
            .join('')}
        </ul>
      </nav>
    `;
  }

  function buildProductCard(product) {
    return `
      <article class="product-card slide-up">
        <span class="tag">${product.category || 'Produk Digital'}</span>
        <div>
          <h3>${product.name}</h3>
          <p class="muted">${product.description || 'Produk digital berkualitas dari ZALLSTORE.'}</p>
        </div>
        <div class="price">Rp ${formatRupiah(product.price)}</div>
        <div class="meta-row">
          <span>Stok: ${product.stock}</span>
          <span class="status-chip">${product.status}</span>
        </div>
        <button class="primary-btn" data-order-product="${product.id}">ORDER SEKARANG</button>
      </article>
    `;
  }

  function buildTableRow(product) {
    return `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>Rp ${formatRupiah(product.price)}</td>
        <td>${product.stock}</td>
        <td>${product.status}</td>
        <td>${product.category}</td>
        <td>
          <div class="table-actions">
            <button class="secondary-btn" data-edit-id="${product.id}">Edit</button>
            <button class="danger-btn" data-delete-id="${product.id}">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }

  function whatsappLink(product) {
    const message = `Halo admin, saya ingin memesan:\n\nProduk: ${product.name}\nHarga: Rp ${formatRupiah(product.price)}\nStatus: ${product.status}\n\nSaya akan melakukan pembayaran terlebih dahulu melalui DANA ke nomor: ${danaPhone}\n\nSetelah transfer, saya akan mengirim bukti pembayaran ke nomor ini.`;
    return `https://wa.me/62${phone.slice(1)}?text=${encodeURIComponent(message)}`;
  }

  window.ZallComponents = {
    phone,
    danaPhone,
    formatRupiah,
    buildNavbar,
    buildProductCard,
    buildTableRow,
    whatsappLink
  };
})();
