const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const CartDOM = document.querySelector('.cart')
const CartOverlay = document.querySelector('.cart-overlay')
const CartItems = document.querySelector('.cart-items')
const CartTotal = document.querySelector('.cart-total')
const CartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')

// CART
let cart = []

let buttonsDOM = []

// GETTING PRODUCTS
class Products {
  async getProducts() {
    try {
      const result = await fetch('products.json')
      let data = await result.json()
      let products = data.items

      products = products.map((item) => {
        const { title, price } = item.fields
        const { id } = item.sys
        const image = item.fields.image.fields.file.url

        return { title, price, id, image }
      })
      return products
    } catch (error) {
      console.log(error)
    }
  }
}

// DISPLAY PRODUCTS
class UI {
  displayProducts(products) {
    let result = ''

    products.forEach((product) => {
      result += `<article class="product">
          <div class="img-container">
            <img src=${product.image} alt="" class="product-img" />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fashopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>`
    })
    productsDOM.innerHTML = result
  }

  getBagButton() {
    const buttons = [...document.querySelectorAll('.bag-btn')]
    buttonsDOM = buttons
    buttons.forEach((button) => {
      let id = button.dataset.id
      let inCart = cart.find((item) => item.id === id)
      if (inCart) {
        button.innerText = 'In Cart'
        button.disabled = true
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart'
        event.target.disabled = true
        // GET PRODUCT FROM PRODUCTS
        let cartItem = { ...Storage.getProduct(id), amount: 1 }

        // ADD PRODUCT TO CART
        cart = [...cart, cartItem]

        // SAVE CART TO LOCAL STORAGE
        Storage.saveCart(cart)

        // SET CART VALUES
        this.setCartValues(cart)

        // DISPLAY CART ITEM
        this.addCartItem(cartItem)

        // SHOW THE CART
        this.showCart()
      })
    })
  }

  setCartValues(cart) {
    let tempTotal = 0
    let itemsTotal = 0
    cart.map((item) => {
      tempTotal += item.price * item.amount
      itemsTotal += item.amount
    })
    CartTotal.innerText = parseFloat(tempTotal.toFixed(2))
    CartItems.innerText = itemsTotal
  }

  addCartItem(item) {
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `<img src=${item.image} alt="" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`
    CartContent.appendChild(div)
  }

  showCart() {
    CartOverlay.classList.add('transparentBcg')
    CartDOM.classList.add('showCart')
  }

  setupApp() {
    cart = Storage.getCart()
    this.setCartValues(cart)
    this.populateCart(cart)
    cartBtn.addEventListener('click', this.showCart)
    closeCartBtn.addEventListener('click', this.hideCart)
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item))
  }

  hideCart() {
    CartOverlay.classList.remove('transparentBcg')
    CartDOM.classList.remove('showCart')
  }

  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    })

    // CART FUNCTIONALITY
    CartContent.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target
        let id = removeItem.dataset.id
        CartContent.removeChild(removeItem.parentElement.parentElement)
        this.removeItem(id)
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target
        let id = addAmount.dataset.id
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount + 1
        Storage.saveCart(cart)
        this.setCartValues(cart)
        addAmount.nextElementSibling.innerText = tempItem.amount
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target
        let id = lowerAmount.dataset.id
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount - 1
        if (tempItem.amount > 0) {
          Storage.saveCart(cart)
          this.setCartValues(cart)
          lowerAmount.previousElementSibling.innerText = tempItem.amount
        } else {
          CartContent.removeChild(lowerAmount.parentElement.parentElement)
          this.removeItem(id)
        }
      }
    })
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id)
    cartItems.forEach((id) => this.removeItem(id))
    while (CartContent.children.length > 0) {
      CartContent.removeChild(CartContent.children[0])
    }
    this.hideCart()
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id)
    this.setCartValues(cart)
    Storage.saveCart(cart)
    let button = this.getSingleButton(id)
    button.disabled = false
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id)
  }
}

// LOCAL STORAGE
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products))
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'))

    return products.find((product) => product.id === id)
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : []
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI()
  const products = new Products()

  // SETUP APPLICATION
  ui.setupApp()

  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products)
      Storage.saveProducts(products)
    })
    .then(() => {
      ui.getBagButton()
      ui.cartLogic()
    })
})

document.querySelector('.nav-icon').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.add('show')
})

document.querySelector('.banner-btn').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('show')
})

document.getElementById('close').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.remove('show')
})
