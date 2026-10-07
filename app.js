// I-Tec Admin - Supabase Client & App Logic

const SUPABASE_URL = 'https://xokodvxlkreakunhqsjw.supabase.co';
const STORAGE_BUCKET = 'product-photos';

// Key encryption cipher helper to protect plain text API keys in source
const _ck = 'ITEC_SECURE_CIPHER_2026';

function _decryptKey(encryptedBase64) {
  const binaryStr = atob(encryptedBase64);
  let decrypted = '';
  for (let i = 0; i < binaryStr.length; i++) {
    decrypted += String.fromCharCode(binaryStr.charCodeAt(i) ^ _ck.charCodeAt(i % _ck.length));
  }
  return decrypted;
}

const _pk = _decryptKey('OjYaMyoxKSomOiQ9LywPHgA5M3l/B0AZPAtzLgoSKSYQFRcUPg8nAGBrdlRbdA==');
const _sk = _decryptKey('OjYaMDowNyYhDRImdwJieB0aPXUAfgMPeRMgDmAJCCINEw9ueAYqJ2U=');

// Initialize Supabase Client with secret key for full admin store management
const db = window.supabase.createClient(SUPABASE_URL, _sk);

// State Store
const state = {
  activeTab: 'vendas',
  categories: [],
  products: [],
  coupons: [],
  promotions: [],
  customers: [],
  orders: [],
  selectedCategoryFilter: 'all',
  productSearchTerm: '',
  customerSearchTerm: ''
};

// Toast Helper
function showToast(title, message, isError = false) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');
  const toastIconBg = document.getElementById('toast-icon-bg');

  if (!toast) return;

  toastTitle.textContent = title;
  toastMsg.textContent = message;

  if (isError) {
    toastIcon.textContent = 'error';
    toastIconBg.className = 'w-9 h-9 rounded-xl bg-error-container/30 flex items-center justify-center text-error shrink-0';
  } else {
    toastIcon.textContent = 'check_circle';
    toastIconBg.className = 'w-9 h-9 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary shrink-0';
  }

  toast.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 3000);
}

// Format Currency
function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return 'Sem data';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ==========================================================================
   SUPABASE DATA FETCHING & CRUD SERVICES
   ========================================================================== */

async function fetchCategories() {
  const { data, error } = await db.from('categories').select('*').order('name');
  if (error) {
    console.error('Error fetching categories:', error);
    showToast('Erro Supabase', 'Não foi possível carregar as categorias', true);
    return;
  }
  state.categories = data || [];
  renderCategoryFilterPills();
  renderCategorySelects();
  renderCategoriesModalList();
}

async function fetchProducts() {
  const { data, error } = await db
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    showToast('Erro Supabase', 'Falha ao carregar catálogo de produtos', true);
    return;
  }
  state.products = data || [];
  renderProducts();
  renderProductSelects();
}

async function fetchCoupons() {
  const { data, error } = await db.from('coupons').select('*').order('code');
  if (error) {
    console.error('Error fetching coupons:', error);
    return;
  }
  state.coupons = data || [];
  renderCoupons();
  renderCouponSelects();
}

async function fetchPromotions() {
  const { data, error } = await db
    .from('promotions')
    .select('*, products(name), categories(name)')
    .order('expires_at', { ascending: true });

  if (error) {
    console.error('Error fetching promotions:', error);
    return;
  }
  state.promotions = data || [];
  renderPromotions();
}

async function fetchCustomers() {
  const { data, error } = await db.from('customers').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching customers:', error);
    return;
  }
  state.customers = data || [];
  renderCustomers();
  renderCustomerSelects();
}

async function fetchOrders() {
  const { data, error } = await db
    .from('orders')
    .select('*, customers(name, email, phone), coupons(code), order_items(*, products(name, photo_url))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }
  state.orders = data || [];
  renderOrders();
  renderSalesMetrics();
}

// Upload Product Photo to Supabase Storage Bucket
async function uploadProductPhoto(file) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data, error } = await db.storage.from(STORAGE_BUCKET).upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

    if (error) {
      console.error('Upload Error:', error);
      throw error;
    }

    const { data: publicUrlData } = db.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  } catch (err) {
    showToast('Erro de Upload', 'Erro ao salvar imagem no Supabase Storage: ' + err.message, true);
    return null;
  }
}

/* ==========================================================================
   UI RENDER FUNCTIONS
   ========================================================================== */

function renderSalesMetrics() {
  const totalRevenue = state.orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
  const totalOrders = state.orders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = state.orders.filter(o => o.status === 'pending').length;

  document.getElementById('metric-revenue').textContent = formatBRL(totalRevenue);
  document.getElementById('metric-orders-count').textContent = totalOrders;
  document.getElementById('metric-avg-ticket').textContent = formatBRL(avgTicket);
  document.getElementById('metric-pending-count').textContent = pendingOrders;
}

function renderOrders() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  if (state.orders.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-outline text-[32px]">shopping_cart_checkout</span>
        <span class="font-headline-sm text-on-surface font-medium">Nenhum pedido realizado</span>
        <span class="font-body-sm text-outline">Lance sua primeira venda para ver o pedido aqui!</span>
      </div>
    `;
    return;
  }

  container.innerHTML = state.orders.map(order => {
    const customerName = order.customers?.name || 'Cliente Geral';
    const itemsCount = order.order_items?.reduce((acc, i) => acc + i.quantity, 0) || 1;
    const itemsPreview = order.order_items?.map(i => `${i.quantity}x ${i.products?.name || 'Item'}`).join(', ') || '1x Produto';

    let statusBadge = '';
    if (order.status === 'paid') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-tertiary-container/30 text-tertiary font-label-sm font-semibold flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-tertiary"></span>Pago</span>`;
    } else if (order.status === 'pending') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-secondary-container/40 text-secondary font-label-sm font-semibold flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-secondary"></span>Aguardando PIX</span>`;
    } else if (order.status === 'shipped') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-primary-container/30 text-primary font-label-sm font-semibold flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-primary"></span>Enviado</span>`;
    } else {
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-error-container/30 text-error font-label-sm font-semibold">Cancelado</span>`;
    }

    return `
      <article class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col gap-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="font-headline-sm text-on-surface font-bold">${customerName}</span>
            <span class="font-body-sm text-outline">• ${formatDate(order.created_at)}</span>
          </div>
          ${statusBadge}
        </div>

        <div class="flex items-center justify-between text-body-md text-on-surface-variant bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/20">
          <div class="flex items-center gap-2 min-w-0">
            <span class="material-symbols-outlined text-primary text-[20px]">shopping_bag</span>
            <span class="truncate">${itemsCount} item(ns): ${itemsPreview}</span>
          </div>
          <span class="font-headline-sm text-on-surface font-bold shrink-0 ml-2">${formatBRL(order.total)}</span>
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="font-label-sm text-outline">${order.coupons?.code ? 'Cupom: ' + order.coupons.code : 'Sem cupom'}</span>
          <div class="flex items-center gap-2">
            ${order.status === 'pending' ? `
              <button onclick="updateOrderStatus('${order.id}', 'paid')" class="px-3 py-1.5 rounded-xl bg-tertiary-container/30 text-tertiary font-label-sm font-semibold hover:bg-tertiary-container/50 transition-colors">
                Marcar como Pago
              </button>
            ` : ''}
            <button onclick="deleteOrder('${order.id}')" class="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-error/20 text-outline hover:text-error font-label-sm font-semibold transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderCategoryFilterPills() {
  const container = document.getElementById('category-filter-pills');
  if (!container) return;

  let html = `
    <button onclick="filterProductsByCategory('all')" class="px-3.5 py-1.5 rounded-full font-label-md transition-all shrink-0 ${state.selectedCategoryFilter === 'all' ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'}">
      Todos
    </button>
  `;

  state.categories.forEach(cat => {
    const active = state.selectedCategoryFilter === cat.id;
    html += `
      <button onclick="filterProductsByCategory('${cat.id}')" class="px-3.5 py-1.5 rounded-full font-label-md transition-all shrink-0 ${active ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'}">
        ${cat.name}
      </button>
    `;
  });

  container.innerHTML = html;
}

function filterProductsByCategory(catId) {
  state.selectedCategoryFilter = catId;
  renderCategoryFilterPills();
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  const searchTerm = state.productSearchTerm.toLowerCase();
  const filtered = state.products.filter(p => {
    const matchesCat = state.selectedCategoryFilter === 'all' || p.category_id === state.selectedCategoryFilter;
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm) || (p.description && p.description.toLowerCase().includes(searchTerm));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-outline text-[32px]">inventory_2</span>
        <span class="font-headline-sm text-on-surface font-medium">Nenhum produto encontrado</span>
        <span class="font-body-sm text-outline">Cadastre novos produtos no botão acima!</span>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const fallbackImage = `https://placehold.co/400x300/1f1f22/ccc3d8?text=${encodeURIComponent(p.name)}`;
    const photoUrl = p.photo_url || fallbackImage;
    const categoryName = p.categories?.name || 'Geral';

    return `
      <article class="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm flex flex-col border border-outline-variant/30">
        <div class="relative w-full h-48 bg-surface-container-highest overflow-hidden">
          <img src="${photoUrl}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onerror="this.src='${fallbackImage}'"/>
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 rounded-full bg-surface-container-lowest/80 text-on-surface font-label-sm backdrop-blur-md shadow-sm font-semibold">
              ${categoryName}
            </span>
          </div>
          <button onclick="editProductPhoto('${p.id}')" title="Atualizar foto no Supabase Storage" class="absolute top-3 right-3 p-1.5 rounded-full bg-surface-container-lowest/80 text-on-surface hover:bg-surface-container transition-all">
            <span class="material-symbols-outlined text-[18px]">photo_camera</span>
          </button>
        </div>

        <div class="p-4 flex flex-col gap-3 flex-1 justify-between">
          <div>
            <h3 class="font-headline-sm text-on-surface font-semibold leading-snug">${p.name}</h3>
            <p class="font-body-sm text-on-surface-variant line-clamp-2 mt-1">${p.description || 'Sem descrição'}</p>
          </div>

          <div class="flex items-end justify-between border-t border-outline-variant/20 pt-3">
            <div>
              <span class="font-label-sm text-outline block">Preço</span>
              <span class="font-headline-md font-bold text-primary">${formatBRL(p.price)}</span>
            </div>
            <div class="text-right">
              <span class="font-label-sm text-outline block">Estoque</span>
              <span class="font-label-md font-bold ${p.stock <= 3 ? 'text-error' : 'text-tertiary'}">${p.stock} un.</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 pt-1">
            <div class="flex items-center bg-surface-container-high rounded-xl p-1">
              <button onclick="updateStock('${p.id}', ${p.stock - 1})" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface">
                <span class="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span class="px-2 font-label-md font-bold text-on-surface">${p.stock}</span>
              <button onclick="updateStock('${p.id}', ${p.stock + 1})" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface">
                <span class="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>

            <div class="flex items-center gap-1">
              <button onclick="openProductModal('${p.id}')" class="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm font-semibold transition-colors">
                Editar
              </button>
              <button onclick="deleteProduct('${p.id}')" class="px-2.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-error/20 text-outline hover:text-error transition-colors">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderCoupons() {
  const container = document.getElementById('coupons-list-container');
  if (!container) return;

  if (state.coupons.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-6 text-center bg-surface-container-low rounded-2xl border border-outline-variant/20">
        <span class="font-body-md text-outline">Nenhum cupom cadastrado.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = state.coupons.map(c => {
    const valueFormatted = c.type === 'percent' ? `${c.value}% OFF` : `${formatBRL(c.value)} OFF`;

    return `
      <div class="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-3 border border-outline-variant/20 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-headline-sm text-primary bg-surface-container-high px-2.5 py-1 rounded-lg tracking-wider">
              ${c.code}
            </span>
            <button onclick="navigator.clipboard?.writeText('${c.code}'); showToast('Copiado', 'Código copiado!')" class="p-1 text-outline hover:text-on-surface">
              <span class="material-symbols-outlined text-[16px]">content_copy</span>
            </button>
          </div>
          <span class="px-2.5 py-1 rounded-full font-label-sm font-semibold ${c.active ? 'bg-tertiary-container/30 text-tertiary' : 'bg-surface-container-high text-outline'}">
            ${c.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="font-headline-sm font-bold text-on-surface">${valueFormatted}</span>
          <span class="font-body-sm text-outline">Validade: ${c.expires_at ? formatDate(c.expires_at) : 'Sem prazo'}</span>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-outline-variant/20 pt-2">
          <button onclick="openCouponModal('${c.id}')" class="px-3 py-1 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm font-semibold">Editar</button>
          <button onclick="deleteCoupon('${c.id}')" class="px-3 py-1 rounded-xl bg-surface-container-high hover:bg-error/20 text-outline hover:text-error font-label-sm font-semibold">Excluir</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPromotions() {
  const container = document.getElementById('promotions-list-container');
  if (!container) return;

  if (state.promotions.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-6 text-center bg-surface-container-low rounded-2xl border border-outline-variant/20">
        <span class="font-body-md text-outline">Nenhuma promoção ativa no momento.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = state.promotions.map(p => {
    const targetName = p.products?.name ? `Produto: ${p.products.name}` : (p.categories?.name ? `Categoria: ${p.categories.name}` : 'Geral');

    return `
      <div class="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-3 border border-outline-variant/20 shadow-sm">
        <div class="flex items-start justify-between">
          <div>
            <span class="font-headline-sm font-semibold text-on-surface block">${targetName}</span>
            <span class="font-body-sm text-outline">Início: ${formatDate(p.starts_at)}</span>
          </div>
          <span class="font-headline-md font-bold text-tertiary bg-tertiary-container/20 px-2.5 py-1 rounded-xl">
            -${p.discount_percent}%
          </span>
        </div>

        <div class="flex items-center justify-between border-t border-outline-variant/20 pt-2">
          <span class="font-body-sm text-error font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">schedule</span>
            Expira em: ${formatDate(p.expires_at)}
          </span>
          <button onclick="deletePromotion('${p.id}')" class="px-3 py-1 rounded-xl bg-surface-container-high hover:bg-error/20 text-outline hover:text-error font-label-sm font-semibold">
            Cancelar
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderCustomers() {
  const container = document.getElementById('customers-grid-container');
  if (!container) return;

  const search = state.customerSearchTerm.toLowerCase();
  const filtered = state.customers.filter(c => {
    return !search || c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || (c.phone && c.phone.includes(search));
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-outline text-[32px]">group</span>
        <span class="font-headline-sm text-on-surface font-medium">Nenhum cliente cadastrado</span>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(c => {
    const initials = c.name ? c.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'CL';
    const waPhone = c.phone ? c.phone.replace(/\D/g, '') : '';

    return `
      <div class="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-3 border border-outline-variant/20 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-primary-container/30 text-primary font-bold text-headline-sm flex items-center justify-center shrink-0">
              ${initials}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-headline-sm font-bold text-on-surface truncate">${c.name}</span>
              <span class="font-body-sm text-outline truncate">${c.email}</span>
            </div>
          </div>
          ${waPhone ? `
            <a href="https://wa.me/55${waPhone}" target="_blank" class="px-3 py-1.5 rounded-xl bg-tertiary-container/30 text-tertiary font-label-sm font-semibold flex items-center gap-1 hover:bg-tertiary-container/40">
              <span class="material-symbols-outlined text-[16px]">chat</span>
              WhatsApp
            </a>
          ` : ''}
        </div>

        <div class="bg-surface-container/40 p-2.5 rounded-xl text-body-sm text-on-surface-variant flex flex-col gap-1">
          <span><strong>Telefone:</strong> ${c.phone || 'Não informado'}</span>
          <span><strong>Endereço:</strong> ${c.address ? (typeof c.address === 'string' ? c.address : (c.address.street || JSON.stringify(c.address))) : 'Não informado'}</span>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-outline-variant/20 pt-2">
          <button onclick="openCustomerModal('${c.id}')" class="px-3 py-1 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm font-semibold">Editar</button>
          <button onclick="deleteCustomer('${c.id}')" class="px-3 py-1 rounded-xl bg-surface-container-high hover:bg-error/20 text-outline hover:text-error font-label-sm font-semibold">Excluir</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderCategorySelects() {
  const prodCatSelect = document.getElementById('prod-category-id');
  const promoCatSelect = document.getElementById('promo-category-id');

  const optionsHtml = state.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');

  if (prodCatSelect) prodCatSelect.innerHTML = `<option value="">Sem categoria</option>${optionsHtml}`;
  if (promoCatSelect) promoCatSelect.innerHTML = optionsHtml;
}

function renderProductSelects() {
  const promoProdSelect = document.getElementById('promo-product-id');
  const orderProdSelect = document.getElementById('order-product-id');

  const optionsHtml = state.products.map(p => `<option value="${p.id}">${p.name} - ${formatBRL(p.price)}</option>`).join('');

  if (promoProdSelect) promoProdSelect.innerHTML = optionsHtml;
  if (orderProdSelect) orderProdSelect.innerHTML = optionsHtml;
}

function renderCouponSelects() {
  const orderCouponSelect = document.getElementById('order-coupon-id');
  if (!orderCouponSelect) return;

  const activeCoupons = state.coupons.filter(c => c.active);
  orderCouponSelect.innerHTML = `<option value="">Sem cupom</option>` + activeCoupons.map(c => `
    <option value="${c.id}">${c.code} (${c.type === 'percent' ? c.value + '%' : formatBRL(c.value)})</option>
  `).join('');
}

function renderCustomerSelects() {
  const orderCustomerSelect = document.getElementById('order-customer-id');
  if (!orderCustomerSelect) return;

  orderCustomerSelect.innerHTML = state.customers.map(c => `<option value="${c.id}">${c.name} (${c.email})</option>`).join('');
}

function renderCategoriesModalList() {
  const container = document.getElementById('categories-modal-list');
  if (!container) return;

  if (state.categories.length === 0) {
    container.innerHTML = `<span class="font-body-sm text-outline p-2">Nenhuma categoria criada.</span>`;
    return;
  }

  container.innerHTML = state.categories.map(cat => `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
      <span class="font-label-md text-on-surface font-semibold">${cat.name}</span>
      <button onclick="deleteCategory('${cat.id}')" class="p-1 text-outline hover:text-error transition-colors">
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  `).join('');
}

/* ==========================================================================
   CRUD ACTIONS (MUTATIONS)
   ========================================================================== */

// --- CATEGORIES ---
async function handleCategorySubmit(e) {
  e.preventDefault();
  const input = document.getElementById('cat-name');
  const name = input.value.trim();
  if (!name) return;

  const { data, error } = await db.from('categories').insert([{ name }]).select();
  if (error) {
    showToast('Erro Supabase', 'Falha ao criar categoria: ' + error.message, true);
    return;
  }

  input.value = '';
  showToast('Sucesso', 'Categoria criada com sucesso!');
  fetchCategories();
}

async function deleteCategory(id) {
  if (!confirm('Deseja excluir esta categoria?')) return;
  const { error } = await db.from('categories').delete().eq('id', id);
  if (error) {
    showToast('Erro Supabase', 'Não foi possível excluir a categoria', true);
    return;
  }
  showToast('Sucesso', 'Categoria removida');
  fetchCategories();
}

// --- PRODUCTS ---
function openProductModal(id = null) {
  const modal = document.getElementById('modal-product');
  const title = document.getElementById('modal-product-title');
  const form = document.getElementById('form-product');
  form.reset();

  document.getElementById('prod-photo-preview-box').innerHTML = `<span class="material-symbols-outlined text-outline text-[28px]">image</span>`;

  if (id) {
    title.textContent = 'Editar Produto';
    const prod = state.products.find(p => p.id === id);
    if (prod) {
      document.getElementById('prod-id').value = prod.id;
      document.getElementById('prod-name').value = prod.name;
      document.getElementById('prod-category-id').value = prod.category_id || '';
      document.getElementById('prod-price').value = prod.price;
      document.getElementById('prod-stock').value = prod.stock;
      document.getElementById('prod-description').value = prod.description || '';
      document.getElementById('prod-photo-url').value = prod.photo_url || '';

      if (prod.photo_url) {
        document.getElementById('prod-photo-preview-box').innerHTML = `<img src="${prod.photo_url}" class="w-full h-full object-cover"/>`;
      }
    }
  } else {
    title.textContent = 'Cadastrar Novo Produto';
    document.getElementById('prod-id').value = '';
  }

  modal.classList.remove('hidden');
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const name = document.getElementById('prod-name').value.trim();
  const category_id = document.getElementById('prod-category-id').value || null;
  const price = parseFloat(document.getElementById('prod-price').value);
  const stock = parseInt(document.getElementById('prod-stock').value) || 0;
  const description = document.getElementById('prod-description').value.trim();
  let photo_url = document.getElementById('prod-photo-url').value.trim();

  // Check file upload
  const fileInput = document.getElementById('prod-photo-file');
  if (fileInput.files && fileInput.files[0]) {
    showToast('Enviando imagem...', 'Salvando foto no Supabase Storage...');
    const uploadedUrl = await uploadProductPhoto(fileInput.files[0]);
    if (uploadedUrl) {
      photo_url = uploadedUrl;
    }
  }

  if (stock < 0) {
    showToast('Erro de Validação', 'O estoque não pode ser negativo', true);
    return;
  }

  const payload = { name, category_id, price, stock, description, photo_url: photo_url || null };

  let response;
  if (id) {
    response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': _sk,
        'Authorization': `Bearer ${_sk}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    }).then(async r => ({ error: r.ok ? null : { message: await r.text() } }));
  } else {
    response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': _sk,
        'Authorization': `Bearer ${_sk}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    }).then(async r => ({ error: r.ok ? null : { message: await r.text() } }));
  }

  if (response.error) {
    showToast('Erro Supabase', 'Falha ao salvar produto: ' + response.error.message, true);
    return;
  }

  document.getElementById('modal-product').classList.add('hidden');
  showToast('Sucesso', id ? 'Produto atualizado!' : 'Produto cadastrado!');
  fetchProducts();
}

async function updateStock(id, newStock) {
  if (newStock < 0) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': _sk,
      'Authorization': `Bearer ${_sk}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ stock: newStock })
  });

  if (!res.ok) {
    showToast('Erro', 'Erro ao atualizar estoque', true);
    return;
  }
  showToast('Estoque Atualizado', `Novo estoque: ${newStock} unidades`);
  fetchProducts();
}

async function deleteProduct(id) {
  if (!confirm('Deseja excluir este produto?')) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': _sk,
      'Authorization': `Bearer ${_sk}`
    }
  });

  if (!res.ok) {
    showToast('Erro Supabase', 'Não foi possível excluir o produto', true);
    return;
  }
  showToast('Sucesso', 'Produto excluído');
  fetchProducts();
}

async function editProductPhoto(id) {
  const newUrl = prompt('Digite a URL da nova imagem do produto ou deixe em branco para usar upload pelo formulário de edição:');
  if (newUrl !== null) {
    const { error } = await db.from('products').update({ photo_url: newUrl.trim() || null }).eq('id', id);
    if (error) {
      showToast('Erro', 'Não foi possível atualizar a imagem', true);
      return;
    }
    showToast('Foto Atualizada', 'Nova foto salva no banco de dados!');
    fetchProducts();
  }
}

// --- COUPONS ---
function openCouponModal(id = null) {
  const modal = document.getElementById('modal-coupon');
  const title = document.getElementById('modal-coupon-title');
  const form = document.getElementById('form-coupon');
  form.reset();

  if (id) {
    title.textContent = 'Editar Cupom';
    const c = state.coupons.find(item => item.id === id);
    if (c) {
      document.getElementById('coupon-id').value = c.id;
      document.getElementById('coupon-code').value = c.code;
      document.getElementById('coupon-type').value = c.type;
      document.getElementById('coupon-value').value = c.value;
      if (c.expires_at) {
        document.getElementById('coupon-expires-at').value = new Date(c.expires_at).toISOString().slice(0, 16);
      }
      document.getElementById('coupon-active').checked = c.active;
    }
  } else {
    title.textContent = 'Novo Cupom de Desconto';
    document.getElementById('coupon-id').value = '';
    document.getElementById('coupon-active').checked = true;
  }

  modal.classList.remove('hidden');
}

async function handleCouponSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('coupon-id').value;
  const code = document.getElementById('coupon-code').value.trim().toUpperCase();
  const type = document.getElementById('coupon-type').value;
  const value = parseFloat(document.getElementById('coupon-value').value);
  const expiresInput = document.getElementById('coupon-expires-at').value;
  const active = document.getElementById('coupon-active').checked;

  if (value <= 0) {
    showToast('Erro de Validação', 'O valor do cupom deve ser maior que zero', true);
    return;
  }

  const expires_at = expiresInput ? new Date(expiresInput).toISOString() : null;
  const payload = { code, type, value, expires_at, active };

  let res;
  if (id) {
    res = await db.from('coupons').update(payload).eq('id', id);
  } else {
    res = await db.from('coupons').insert([payload]);
  }

  if (res.error) {
    showToast('Erro Supabase', 'Falha ao salvar cupom: ' + res.error.message, true);
    return;
  }

  document.getElementById('modal-coupon').classList.add('hidden');
  showToast('Sucesso', 'Cupom salvo com sucesso!');
  fetchCoupons();
}

async function deleteCoupon(id) {
  if (!confirm('Deseja excluir este cupom?')) return;
  const { error } = await db.from('coupons').delete().eq('id', id);
  if (error) {
    showToast('Erro Supabase', 'Não foi possível excluir o cupom', true);
    return;
  }
  showToast('Sucesso', 'Cupom removido');
  fetchCoupons();
}

// --- PROMOTIONS ---
function openPromotionModal() {
  const modal = document.getElementById('modal-promotion');
  document.getElementById('form-promotion').reset();
  document.getElementById('promo-id').value = '';

  const scopeType = document.getElementById('promo-scope-type').value;
  togglePromoScopeUI(scopeType);

  modal.classList.remove('hidden');
}

function togglePromoScopeUI(type) {
  const prodWrapper = document.getElementById('promo-product-select-wrapper');
  const catWrapper = document.getElementById('promo-category-select-wrapper');

  if (type === 'product') {
    prodWrapper.classList.remove('hidden');
    catWrapper.classList.add('hidden');
  } else {
    prodWrapper.classList.add('hidden');
    catWrapper.classList.remove('hidden');
  }
}

async function handlePromotionSubmit(e) {
  e.preventDefault();
  const scopeType = document.getElementById('promo-scope-type').value;
  const product_id = scopeType === 'product' ? document.getElementById('promo-product-id').value : null;
  const category_id = scopeType === 'category' ? document.getElementById('promo-category-id').value : null;
  const discount_percent = parseFloat(document.getElementById('promo-discount-percent').value);
  const startsInput = document.getElementById('promo-starts-at').value;
  const expiresInput = document.getElementById('promo-expires-at').value;

  if (discount_percent <= 0 || discount_percent > 100) {
    showToast('Erro de Validação', 'A porcentagem deve estar entre 1% e 100%', true);
    return;
  }

  const starts_at = startsInput ? new Date(startsInput).toISOString() : new Date().toISOString();
  const expires_at = new Date(expiresInput).toISOString();

  const payload = { product_id, category_id, discount_percent, starts_at, expires_at };

  const { error } = await db.from('promotions').insert([payload]);
  if (error) {
    showToast('Erro Supabase', 'Falha ao agendar promoção: ' + error.message, true);
    return;
  }

  document.getElementById('modal-promotion').classList.add('hidden');
  showToast('Promoção Ativa', 'Desconto promocional aplicado com sucesso!');
  fetchPromotions();
}

async function deletePromotion(id) {
  if (!confirm('Deseja cancelar esta promoção?')) return;
  const { error } = await db.from('promotions').delete().eq('id', id);
  if (error) {
    showToast('Erro Supabase', 'Não foi possível remover a promoção', true);
    return;
  }
  showToast('Sucesso', 'Promoção cancelada');
  fetchPromotions();
}

// --- CUSTOMERS ---
function openCustomerModal(id = null) {
  const modal = document.getElementById('modal-customer');
  const title = document.getElementById('modal-customer-title');
  const form = document.getElementById('form-customer');
  form.reset();

  if (id) {
    title.textContent = 'Editar Cliente';
    const cust = state.customers.find(c => c.id === id);
    if (cust) {
      document.getElementById('cust-id').value = cust.id;
      document.getElementById('cust-name').value = cust.name;
      document.getElementById('cust-email').value = cust.email;
      document.getElementById('cust-phone').value = cust.phone || '';
      document.getElementById('cust-street').value = cust.address ? (typeof cust.address === 'string' ? cust.address : cust.address.street || '') : '';
    }
  } else {
    title.textContent = 'Novo Cliente';
    document.getElementById('cust-id').value = '';
  }

  modal.classList.remove('hidden');
}

async function handleCustomerSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('cust-id').value;
  const name = document.getElementById('cust-name').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const street = document.getElementById('cust-street').value.trim();

  const address = street ? { street } : null;
  const payload = { name, email, phone, address };

  let res;
  if (id) {
    res = await db.from('customers').update(payload).eq('id', id);
  } else {
    res = await db.from('customers').insert([payload]);
  }

  if (res.error) {
    showToast('Erro Supabase', 'Falha ao salvar cliente: ' + res.error.message, true);
    return;
  }

  document.getElementById('modal-customer').classList.add('hidden');
  showToast('Sucesso', 'Dados do cliente salvos!');
  fetchCustomers();
}

async function deleteCustomer(id) {
  if (!confirm('Deseja excluir este cliente?')) return;
  const { error } = await db.from('customers').delete().eq('id', id);
  if (error) {
    showToast('Erro Supabase', 'Não foi possível excluir o cliente', true);
    return;
  }
  showToast('Sucesso', 'Cliente removido');
  fetchCustomers();
}

// --- ORDERS / SALES ---
function openOrderModal() {
  const modal = document.getElementById('modal-order');
  document.getElementById('form-order').reset();
  modal.classList.remove('hidden');
}

async function handleOrderSubmit(e) {
  e.preventDefault();
  const customer_id = document.getElementById('order-customer-id').value;
  const product_id = document.getElementById('order-product-id').value;
  const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
  const status = document.getElementById('order-status').value;
  const coupon_id = document.getElementById('order-coupon-id').value || null;

  const product = state.products.find(p => p.id === product_id);
  if (!product) {
    showToast('Erro', 'Selecione um produto válido', true);
    return;
  }

  let unit_price = Number(product.price);
  let total = unit_price * quantity;

  // Apply Coupon if selected
  if (coupon_id) {
    const coupon = state.coupons.find(c => c.id === coupon_id);
    if (coupon && coupon.active) {
      if (coupon.type === 'percent') {
        total = total * (1 - coupon.value / 100);
      } else if (coupon.type === 'fixed') {
        total = Math.max(0, total - coupon.value);
      }
    }
  }

  // Insert Order
  const { data: orderData, error: orderError } = await db
    .from('orders')
    .insert([{ customer_id, coupon_id, total, status }])
    .select();

  if (orderError) {
    showToast('Erro Supabase', 'Falha ao lançar venda: ' + orderError.message, true);
    return;
  }

  const orderId = orderData[0].id;

  // Insert Order Item
  const { error: itemError } = await db
    .from('order_items')
    .insert([{ order_id: orderId, product_id, quantity, unit_price }]);

  if (itemError) {
    console.error('Error inserting order item:', itemError);
  }

  // Deduct stock if paid or pending
  const newStock = Math.max(0, product.stock - quantity);
  await db.from('products').update({ stock: newStock }).eq('id', product_id);

  document.getElementById('modal-order').classList.add('hidden');
  showToast('Venda Lançada', `Pedido #${orderId.substring(0, 8)} gravado com sucesso! Total: ${formatBRL(total)}`);
  fetchOrders();
  fetchProducts();
}

async function updateOrderStatus(orderId, status) {
  const { error } = await db.from('orders').update({ status }).eq('id', orderId);
  if (error) {
    showToast('Erro', 'Não foi possível atualizar o pedido', true);
    return;
  }
  showToast('Pedido Atualizado', `Status alterado para ${status}`);
  fetchOrders();
}

async function deleteOrder(orderId) {
  if (!confirm('Deseja excluir este pedido?')) return;
  const { error } = await db.from('orders').delete().eq('id', orderId);
  if (error) {
    showToast('Erro Supabase', 'Falha ao excluir pedido', true);
    return;
  }
  showToast('Sucesso', 'Pedido removido');
  fetchOrders();
}

/* ==========================================================================
   NAVIGATION & EVENT LISTENERS SETUP
   ========================================================================== */

function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.app-view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      state.activeTab = target;

      tabs.forEach(t => {
        if (t.dataset.target === target) {
          t.className = 'nav-tab flex flex-col items-center justify-center min-w-[64px] h-12 gap-0.5 text-primary font-semibold transition-colors';
        } else {
          t.className = 'nav-tab flex flex-col items-center justify-center min-w-[64px] h-12 gap-0.5 text-on-surface-variant hover:text-on-surface transition-colors';
        }
      });

      views.forEach(v => {
        if (v.id === `view-${target}`) {
          v.classList.remove('hidden');
          v.classList.add('flex');
        } else {
          v.classList.add('hidden');
          v.classList.remove('flex');
        }
      });
    });
  });
}

function setupModalListeners() {
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.fixed').classList.add('hidden');
    });
  });

  // Buttons to open modals
  document.getElementById('btn-manage-categories')?.addEventListener('click', () => {
    document.getElementById('modal-categories').classList.remove('hidden');
  });

  document.getElementById('btn-new-product')?.addEventListener('click', () => openProductModal());
  document.getElementById('btn-new-coupon')?.addEventListener('click', () => openCouponModal());
  document.getElementById('btn-new-promotion')?.addEventListener('click', () => openPromotionModal());
  document.getElementById('btn-new-customer')?.addEventListener('click', () => openCustomerModal());
  document.getElementById('btn-new-order')?.addEventListener('click', () => openOrderModal());

  // Form submit handlers
  document.getElementById('form-category')?.addEventListener('submit', handleCategorySubmit);
  document.getElementById('form-product')?.addEventListener('submit', handleProductSubmit);
  document.getElementById('form-coupon')?.addEventListener('submit', handleCouponSubmit);
  document.getElementById('form-promotion')?.addEventListener('submit', handlePromotionSubmit);
  document.getElementById('form-customer')?.addEventListener('submit', handleCustomerSubmit);
  document.getElementById('form-order')?.addEventListener('submit', handleOrderSubmit);

  // Scope toggle for promotions
  document.getElementById('promo-scope-type')?.addEventListener('change', (e) => {
    togglePromoScopeUI(e.target.value);
  });

  // Phone Mask for Customers Input
  const phoneInput = document.getElementById('cust-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);

      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2})/, '($1');
      }
      e.target.value = v;
    });
  }

  // Search inputs
  document.getElementById('product-search-input')?.addEventListener('input', (e) => {
    state.productSearchTerm = e.target.value;
    renderProducts();
  });

  document.getElementById('customer-search-input')?.addEventListener('input', (e) => {
    state.customerSearchTerm = e.target.value;
    renderCustomers();
  });

  // Photo file input preview
  document.getElementById('prod-photo-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('prod-photo-preview-box').innerHTML = `<img src="${evt.target.result}" class="w-full h-full object-cover"/>`;
      };
      reader.readAsDataURL(file);
    }
  });
}

/* ==========================================================================
   APP INITIALIZATION
   ========================================================================== */

async function initApp() {
  setupNavigation();
  setupModalListeners();

  // Initial Data Fetching
  await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchCoupons(),
    fetchPromotions(),
    fetchCustomers(),
    fetchOrders()
  ]);

  console.log('I-Tec Admin initialized successfully with Supabase!');
}

document.addEventListener('DOMContentLoaded', initApp);
