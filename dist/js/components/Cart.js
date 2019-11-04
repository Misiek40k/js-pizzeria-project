import { select, classNames, templates, settings } from '../settings.js';
import CartProduct from '../components/CartProduct.js';
import utils from '../utils.js';

class Cart {
    constructor(element) {
        const thisCart = this;

        thisCart.products = [];
        thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.getElements(element);
        thisCart.initActions();
    }

    getElements(element) {
        const thisCart = this;

        thisCart.dom = {};
        thisCart.dom.wrapper = element;
        thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
        thisCart.dom.productList = document.querySelector(select.cart.productList);
        thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
        thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
        thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
        thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

        for (let key of thisCart.renderTotalsKeys) {
            thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
        }
    }

    initActions() {
        const thisCart = this;

        thisCart.dom.toggleTrigger.addEventListener('click', function () {
            thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });

        thisCart.dom.productList.addEventListener('updated', function () {
            thisCart.update();
        });

        thisCart.dom.productList.addEventListener('remove', function () {
            thisCart.remove(event.detail.cartProduct);
        });

        thisCart.dom.form.addEventListener('submit', function () {
            event.preventDefault();
            thisCart.sendOrder();
        });
    }

    sendOrder() {
        const thisCart = this;

        const url = new URL(settings.db.order,`http:${settings.db.url}`);

        const payload = {
            address: thisCart.dom.address.value,
            phone: thisCart.dom.phone.value,
            totalNumber: thisCart.totalNumber,
            subtotalPrice: thisCart.subtotalPrice,
            deliveryFee: thisCart.deliveryFee,
            totalPrice: thisCart.totalPrice,
            products: [],
        };

        for (let product of thisCart.products) {
            payload.products.push(product.getData());
        }


        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(function (rawResponse) {
                return rawResponse.json();
            })
            .then(function (parsedResponse) {
                console.log('parsedResponse', parsedResponse);
            });
    }

    add(menuProduct) {
        const thisCart = this;

        const generatedHtml = templates.cartProduct(menuProduct);
        const generatedDom = utils.createDOMFromHTML(generatedHtml);
        thisCart.dom.productList.appendChild(generatedDom);
        thisCart.products.push(new CartProduct(menuProduct, generatedDom));
        thisCart.update();
    }

    update() {
        const thisCart = this;

        thisCart.totalNumber = 0;
        thisCart.subtotalPrice = 0;

        // for (let product of thisCart.products) {
        //     thisCart.subtotalPrice += product.price;
        //     thisCart.totalNumber += product.amount;
        // }

        thisCart.products.forEach(function (product) {
            thisCart.subtotalPrice += product.price;
            thisCart.totalNumber += product.amount;
        });

        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

        thisCart.renderTotalsKeys.forEach(function (key) {
            thisCart.dom[key].forEach(function (elem) {
                elem.innerHTML = thisCart[key];
            });
        });
    }

    remove(cartProduct) {
        const thisCart = this;

        const index = thisCart.products.indexOf(cartProduct);
        thisCart.products.splice(index, 1);
        cartProduct.dom.wrapper.remove();
        thisCart.update();
    }
}

export default Cart;
