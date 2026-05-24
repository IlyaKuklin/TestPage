window.dataLayer = window.dataLayer || [];

const CART_STORAGE_KEY = 'digitDemoEcommerceCart';
const detailNode = document.querySelector('.product-detail');
const addToCartButton = document.querySelector('.js-add-to-cart');
const cartMessage = document.querySelector('.js-cart-message');
const debugNode = document.querySelector('.js-debug');

function parsePrice(text) {
  return Number(String(text).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
}

function parseQuantity(value) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity < 1) return 1;
  return Math.floor(quantity);
}

function getProductFromDetail() {
  return {
    id: detailNode.dataset.productId,
    name: detailNode.querySelector('.product-title').textContent.trim(),
    brand: detailNode.dataset.productBrand,
    category: detailNode.querySelector('.product-category').textContent.trim(),
    variant: detailNode.dataset.productVariant,
    price: parsePrice(detailNode.querySelector('.product-price').textContent),
    quantity: parseQuantity(detailNode.querySelector('.product-quantity').value),
    list: detailNode.dataset.productList,
    position: Number(detailNode.dataset.productPosition)
  };
}

function buildProductForEcommerce(product, includeQuantity) {
  const ecommerceProduct = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    variant: product.variant,
    price: product.price,
    list: product.list,
    position: product.position
  };

  if (includeQuantity) {
    ecommerceProduct.quantity = product.quantity;
  }

  return ecommerceProduct;
}

function loadCart() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.warn('Не удалось прочитать корзину из localStorage:', error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('Не удалось сохранить корзину в localStorage:', error);
  }
}

function addToStoredCart(product) {
  const cart = loadCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push({ ...product });
  }

  saveCart(cart);
}

function pushEcommerceDetail(product) {
  window.dataLayer.push({
    ecommerce: {
      currencyCode: 'RUB',
      detail: {
        products: [buildProductForEcommerce(product, false)]
      }
    }
  });
}

function pushEcommerceAdd(product) {
  window.dataLayer.push({
    ecommerce: {
      currencyCode: 'RUB',
      add: {
        products: [buildProductForEcommerce(product, true)]
      }
    }
  });
}

function renderDebug() {
  const ecommerceItems = window.dataLayer.filter(item => item && item.ecommerce);
  debugNode.textContent = JSON.stringify(ecommerceItems, null, 2);
}

function showCartMessage(product) {
  if (!cartMessage) return;

  cartMessage.innerHTML = product.name + ' добавлен в корзину. <a href="catalog.html">Открыть каталог</a>';
  cartMessage.classList.add('is-visible');
}

addToCartButton.addEventListener('click', () => {
  const product = getProductFromDetail();

  addToStoredCart(product);
  pushEcommerceAdd(product);
  showCartMessage(product);
  renderDebug();
});

pushEcommerceDetail(getProductFromDetail());
renderDebug();
