import { settings, select, classNames, templates } from './settings.js';
import MainPage from './components/MainPage.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
    initPages: function () {
        const thisApp = this;

        thisApp.initMainPage();
        thisApp.pages = document.querySelector(select.containerOf.pages).children;
        thisApp.navLinks = [
            ...document.querySelectorAll(select.nav.links),
            ...document.querySelectorAll(select.mainPage.itemLinks)
        ];

        const idFromHash = window.location.hash.replace('#/', '');

        let pageMatchingHash = thisApp.pages[0].id;

        for (let page of thisApp.pages) {
            if (page.id === idFromHash) {
                pageMatchingHash = page.id;
                break;
            }
        }

        thisApp.activatePage(pageMatchingHash);

        thisApp.navLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                const clickedElement = this;
                event.preventDefault();


                const id = clickedElement.getAttribute('href').replace('#', '');

                thisApp.activatePage(id);

                window.location.hash = `#/${id}`;

            });
        });
    },

    activatePage: function (pageId) {
        const thisApp = this;

        const cartElement = document.querySelector(select.containerOf.cart);


        if (pageId === select.mainPage.main) {
            cartElement.style.display = classNames.cart.none;
        } else {
            cartElement.style.display = classNames.cart.visible;
        }

        Object.values(thisApp.pages).forEach(function (page) {
            page.classList.toggle(
                classNames.pages.active,
                page.id === pageId,
            );
        });

        thisApp.navLinks.forEach(function (link) {

            link.classList.toggle(
                classNames.nav.active,
                link.getAttribute('href') === `#${pageId}`
            );

            if (pageId === select.mainPage.main && !link.classList.contains('link')) {
                link.style.display = classNames.nav.none;
            } else {
                link.style.display = classNames.nav.visible;
            }
        });
    },

    initMainPage: function () {
        const thisApp = this;

        const mainPage = document.querySelector(select.containerOf.mainPage);

        thisApp.mainPage = new MainPage(mainPage);
    },

    initBooking: function () {
        const thisApp = this;

        const bookingWidget = document.querySelector(select.containerOf.booking);

        thisApp.booking = new Booking(bookingWidget);
    },

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
        thisApp.productList.addEventListener('add-to-cart', function (event) {
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

        thisApp.initPages();
        thisApp.initData();
        thisApp.initCart();
        thisApp.initBooking();
    },
};

app.init();
