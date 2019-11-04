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
            ...document.querySelectorAll('.logo .link'),
            ...document.querySelectorAll(select.nav.links),
            ...document.querySelectorAll(select.mainPage.itemLinks)
        ];

        const substring = new RegExp('^#\\/[a-zA-Z]+');

        let idFromHash = '';

        if (window.location.hash) {
            idFromHash = window.location.hash.match(substring)[0].replace('#/', '');
        }

        let pageMatchingHash = thisApp.pages[0].id;

        for (let page of thisApp.pages) {
            if (page.id === idFromHash) {
                console.log(page.id);
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
                window.location.hash = `#/${id}`;
            });
        });

        window.onhashchange = function () {
            const substring = new RegExp('^#\\/[a-zA-Z]+');

            if (window.location.hash) {
                const id = window.location.hash.match(substring)[0].replace('#/', '');
                thisApp.activatePage(id);
            } else {
                thisApp.activatePage('mainPage');
            }
        };
    },

    activatePage: function (pageId) {
        const thisApp = this;

        const cartElement = document.querySelector(select.containerOf.cart);

        pageId === select.mainPage.main ?
            cartElement.style.display = classNames.cart.none
            :
            cartElement.style.display = classNames.cart.visible;

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

            pageId === select.mainPage.main && !link.classList.contains('link') ?
                link.style.display = classNames.nav.none
                :
                link.style.display = classNames.nav.visible;
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
