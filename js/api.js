(function () {
  const BASE_URL = 'http://localhost:3000';

  async function request(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      ...options
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(payload.message || 'Terjadi kesalahan pada server.');
    }

    return payload;
  }

  window.ZallAPI = {
    getProducts: () => request('/products'),
    createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    loginAdmin: (data) => request('/users/login', { method: 'POST', body: JSON.stringify(data) }),
    getUsers: () => request('/users')
  };
})();
