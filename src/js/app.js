import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
    initMenu: function () {
        const thisApp = this;

        for (let product in thisApp.data.products) {
            new Product(thisApp.data.products[product].id, thisApp.data.products[product]);
        }
    },

    initData: function () {
        const thisApp = this;

        const url = `${settings.db.url}/${settings.db.product}`;
        thisApp.data = {};

        fetch(url)
            .then(function (rawResponse) {
                return rawResponse.json();
            })
            .then(function (parsedResponse) {
                thisApp.data.products = parsedResponse;
                thisApp.initMenu();
            });
    },

    initCart: function () {
        const thisApp = this;

        const cartElement = document.querySelector(select.containerOf.cart);
        thisApp.cart = new Cart(cartElement);

        thisApp.productList = document.querySelector(select.containerOf.menu);
        thisApp.productList.addEventListener('add-to-cart', function(event){
            app.cart.add(event.detail.product);
        });
    },

    init: function () {
        const thisApp = this;
        console.log('*** App starting ***');
        console.log('thisApp:', thisApp);
        console.log('classNames:', classNames);
        console.log('settings:', settings);
        console.log('templates:', templates);

        thisApp.initData();
        thisApp.initCart();
    },
};

app.init();
