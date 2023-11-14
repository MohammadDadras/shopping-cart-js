const productsDom = document.querySelector('.products-center')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const cartDom = document.querySelector('.cart')
const cartOverLay = document.querySelector('.cart-overlay')
const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
let cart = []

class Product {
    async getProduct() {
        try {
            const res = await fetch("https://fakestoreapi.com/products")
            const data = await res.json()
            let products = data
            products = products.map((item) => {
                const { title, price, id, image } = item
                return { title, price, id, image }
            })
            return products

        } catch (error) {
            console.log(error)
        }
    }
}

class View {

    displayeProduct(products) {
        let result = ``
        products.forEach(item => {
            result += ` <article class="product">
            <div class="img-container">
              <img
                src=${item.image}
                alt=${item.title}
                class="product-img"
              />
              <button class="bag-btn" data-id=${item.id}>افزودن به سبد خرید</button>
            </div>
            <h3 class="min-h-80">${item.title}</h3>
            <h4>${item.price}</h4>
          </article>`

        });

        productsDom.innerHTML = result

    }

    getcartButton() {

        const buttons = [...document.querySelectorAll(".bag-btn")]

        buttons.forEach((item) => {
            let id = item.dataset.id
            item.addEventListener('click', (event) => {
                let cartItem = { ...Storage.getProduct(id), amount: 1 }
                cart = [...cart, cartItem]
                Storage.saveCart(cart)
                this.saveCartValue()
                this.addCartItem(cartItem)
                this.showCart()
            })
        })
    }

    saveCartValue() {
        let totlalItems = 0
        let totalPrice = 0

        cart.map((item) => {
            totalPrice = totalPrice + item.price * item.amount
            totlalItems = totlalItems + item.amount
        })

        cartItems.innerText = totlalItems
        cartTotal.innerText = totalPrice
    }

    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item')

        div.innerHTML = `<img width="100px" height="100px" src=${item.image} alt=${item.title} />
        <div>
          <h4>${item.title}</h4>
          <h5>${item.price}</h5>
          <span class="remove-item" data-id=${item.id}>حذف</span>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`
        cartContent.appendChild(div)
    }

    showCart() {
        cartOverLay.classList.add('transparentBcg')
        cartDom.classList.add('showCart')
    }

    initApp() {
        cart = Storage.getCart()
        this.saveCartValue(cart)
        this.populate(cart)

        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
    }

    populate(cart) {
        cart.forEach((item) => {
            return this.addCartItem(item)
        })
    }

    hideCart() {
        cartOverLay.classList.remove('transparentBcg')
        cartDom.classList.remove('showCart')
    }

    cartProcess() {

        clearCartBtn.addEventListener('click', () => {this.clearCart()})

        cartContent.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target
                let id = removeItem.dataset.id

                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeProduct(id)
            }


            if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target
                let id = addAmount.dataset.id

                let product = cart.find((item)=>item.id.toString()===id)
                product.amount = product.amount + 1
                Storage.saveCart(cart)
                this.saveCartValue(cart)
                addAmount.nextElementSibling.innerText = product.amount
            }

            if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target
                let id = lowerAmount.dataset.id

                let product = cart.find((item) => {
                    return item.id.toString() === id
                })

                product.amount = product.amount - 1
                if (product.amount > 0) {
                    Storage.saveCart(cart)
                    this.saveCartValue(cart)
                    lowerAmount.previousElementSibling.innerText = product.amount
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeProduct(id)
                }
            }
        })
    }

    clearCart() {
        let cartItem = cart.map((item) => {
            return item.id
        })

        cartItem.forEach((item) => {
            return this.removeProduct(item)
        })

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
    }

    removeProduct(id) {
        cart = cart.filter((item) => {
            return item.id !== id
        })

        this.saveCartValue(cart)
        Storage.saveCart(cart)
    }
}

class Storage {
    static saveProduct(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find((item) => item.id.toString() === id)
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))

    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const product = new Product()
    const view = new View()
    view.initApp()
    product.getProduct().then((data) => {
        view.displayeProduct(data)
        Storage.saveProduct(data)
    }).then(() => {
        view.getcartButton()
        view.cartProcess()
    })

})