(function () {
  const state = {
    products: [],
    filteredProducts: []
  };

  function showNotice(targetId, message, type) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.innerHTML = `<div class="notice ${type}">${message}</div>`;
    setTimeout(() => {
      target.innerHTML = '';
    }, 3000);
  }

  async function loadProducts() {
    const products = await window.ZallAPI.getProducts();
    state.products = products;
    state.filteredProducts = products;
    return products;
  }

  function attachOrderHandlers(products) {
    document.querySelectorAll('[data-order-product]').forEach((button) => {
      button.addEventListener('click', () => {
        const productId = Number(button.dataset.orderProduct);
        const product = products.find((item) => item.id === productId);
        if (!product) return;
        window.location.href = window.ZallComponents.whatsappLink(product);
      });
    });
  }

  async function renderProductsPage(category) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="empty-state">Memuat produk dari backend...</div>';

    try {
      const products = await loadProducts();
      const filtered = products.filter((product) => product.category === category);

      if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state">Belum ada produk tersedia.</div>';
        return;
      }

      grid.innerHTML = filtered.map(window.ZallComponents.buildProductCard).join('');
      attachOrderHandlers(filtered);
    } catch (error) {
      grid.innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
  }

  async function renderDashboard() {
    const statsMount = document.getElementById('dashboardStats');
    const latestMount = document.getElementById('latestProducts');
    if (!statsMount || !latestMount) return;

    try {
      const products = await loadProducts();
      const premiumCount = products.filter((item) => item.category === 'premium').length;
      const jasaCount = products.filter((item) => item.category === 'jasa').length;
      const availableCount = products.filter((item) => item.status.toLowerCase() !== 'habis').length;
      const totalStock = products.reduce((sum, item) => sum + Number(item.stock || 0), 0);

      statsMount.innerHTML = `
        <div class="stat-card glow-pulse"><div class="kpi">${products.length}</div><p class="muted">Total Produk</p></div>
        <div class="stat-card"><div class="kpi">${premiumCount}</div><p class="muted">Produk Premium</p></div>
        <div class="stat-card"><div class="kpi">${jasaCount}</div><p class="muted">Layanan Jasa</p></div>
        <div class="stat-card"><div class="kpi">${totalStock}</div><p class="muted">Total Stok</p></div>
        <div class="stat-card"><div class="kpi">${availableCount}</div><p class="muted">Status Aktif</p></div>
      `;

      latestMount.innerHTML = products.slice(0, 3).map(window.ZallComponents.buildProductCard).join('');
      attachOrderHandlers(products.slice(0, 3));
    } catch (error) {
      statsMount.innerHTML = `<div class="empty-state">${error.message}</div>`;
      latestMount.innerHTML = '';
    }
  }

  function populateForm(product) {
    const form = document.getElementById('productForm');
    if (!form || !product) return;
    form.productId.value = product.id;
    form.name.value = product.name;
    form.price.value = product.price;
    form.stock.value = product.stock;
    form.status.value = product.status;
    form.category.value = product.category;
    form.description.value = product.description || '';
    const title = document.getElementById('formTitle');
    if (title) title.textContent = `Edit Produk #${product.id}`;
  }

  function resetForm() {
    const form = document.getElementById('productForm');
    if (!form) return;
    form.reset();
    form.productId.value = '';
    const title = document.getElementById('formTitle');
    if (title) title.textContent = 'Tambah Produk Baru';
  }

  async function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    try {
      const products = await loadProducts();
      tbody.innerHTML = products.map(window.ZallComponents.buildTableRow).join('');

      tbody.querySelectorAll('[data-edit-id]').forEach((button) => {
        button.addEventListener('click', () => {
          const product = state.products.find((item) => item.id === Number(button.dataset.editId));
          populateForm(product);
        });
      });

      tbody.querySelectorAll('[data-delete-id]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await window.ZallAPI.deleteProduct(Number(button.dataset.deleteId));
            showNotice('adminNotice', 'Produk berhasil dihapus.', 'success');
            await renderAdminTable();
          } catch (error) {
            showNotice('adminNotice', error.message, 'error');
          }
        });
      });
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7">${error.message}</td></tr>`;
    }
  }

  function setupAdminPage() {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const productForm = document.getElementById('productForm');
    const cancelEdit = document.getElementById('cancelEdit');

    if (!loginForm || !loginSection || !adminSection || !productForm) return;

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await window.ZallAPI.loginAdmin(payload);
        sessionStorage.setItem('zallAdmin', JSON.stringify(response.user));
        loginSection.style.display = 'none';
        adminSection.style.display = 'grid';
        showNotice('adminNotice', `Selamat datang, ${response.user.name}.`, 'success');
        await renderAdminTable();
      } catch (error) {
        showNotice('loginNotice', error.message, 'error');
      }
    });

    productForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(productForm);
      const payload = Object.fromEntries(formData.entries());
      const productId = payload.productId;
      delete payload.productId;

      try {
        if (productId) {
          await window.ZallAPI.updateProduct(productId, payload);
          showNotice('adminNotice', 'Produk berhasil diperbarui.', 'success');
        } else {
          await window.ZallAPI.createProduct(payload);
          showNotice('adminNotice', 'Produk baru berhasil ditambahkan.', 'success');
        }
        resetForm();
        await renderAdminTable();
      } catch (error) {
        showNotice('adminNotice', error.message, 'error');
      }
    });

    if (cancelEdit) {
      cancelEdit.addEventListener('click', resetForm);
    }

    const savedUser = sessionStorage.getItem('zallAdmin');
    if (savedUser) {
      loginSection.style.display = 'none';
      adminSection.style.display = 'grid';
      renderAdminTable();
    }
  }

  function initHomePage() {
    const featuredMount = document.getElementById('featuredProducts');
    if (!featuredMount) return;

    window.ZallAPI
      .getProducts()
      .then((products) => {
        featuredMount.innerHTML = products.slice(0, 4).map(window.ZallComponents.buildProductCard).join('');
        attachOrderHandlers(products.slice(0, 4));
      })
      .catch((error) => {
        featuredMount.innerHTML = `<div class="empty-state">${error.message}</div>`;
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;

    if (page === 'home') initHomePage();
    if (page === 'premium') renderProductsPage('premium');
    if (page === 'jasa') renderProductsPage('jasa');
    if (page === 'dashboard') renderDashboard();
    if (page === 'admin') setupAdminPage();
  });
})();
