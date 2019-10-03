/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
        },
        containerOf: {
            menu: '#product-list',
            cart: '#cart',
        },
        all: {
            menuProducts: '#product-list > .product',
            menuProductsActive: '#product-list > .product.active',
            formInputs: 'input, select',
        },
        menuProduct: {
            clickable: '.product__header',
            form: '.product__order',
            priceElem: '.product__total-price .price',
            imageWrapper: '.product__images',
            amountWidget: '.widget-amount',
            cartButton: '[href="#add-to-cart"]',
        },
        widgets: {
            amount: {
                input: 'input[name="amount"]',
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        }
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    };

    class Product {
        constructor(id, data) {
            const thisProduct = this;
            thisProduct.id = id;
            thisProduct.data = data;
            thisProduct.renderInMenu();
            thisProduct.getElements();
            thisProduct.initAccordion();
            thisProduct.initOrderForm();
            thisProduct.processOrder();

            console.log('new product:', thisProduct);
        }

        renderInMenu() {
            const thisProduct = this;

            const generatedHtml = templates.menuProduct(thisProduct.data);
            const menuContainer = document.querySelector(select.containerOf.menu);
            thisProduct.element = utils.createDOMFromHTML(generatedHtml);
            menuContainer.appendChild(thisProduct.element);
        }

        getElements() {
            const thisProduct = this;

            thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
            thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
            thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
            thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
            thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        }

        initAccordion() {
            const thisProduct = this;

            const element = thisProduct.element;
            const clickable = thisProduct.accordionTrigger;

            clickable.addEventListener('click', function () {
                event.preventDefault();
                element.classList.toggle('active');
                const activeElements = document.querySelectorAll(select.all.menuProductsActive);

                for (let item of activeElements) {
                    if (item !== element) {
                        item.classList.remove('active');
                    }
                }
            });
        }

        initOrderForm() {
            const thisProduct = this;

            thisProduct.form.addEventListener('submit', function (event) {
                event.preventDefault();
                thisProduct.processOrder();
            });

            for (let input of thisProduct.formInputs) {
                input.addEventListener('change', function () {
                    thisProduct.processOrder();
                });
            }

            thisProduct.cartButton.addEventListener('click', function (event) {
                event.preventDefault();
                thisProduct.processOrder();
            });
        }

        processOrder() {
            const thisProduct = this;

            const formData = utils.serializeFormToObject(thisProduct.form);
            let price = thisProduct.data.price;

            Object.entries(thisProduct.data).forEach(function (entries) {
                if (entries[0] === 'params') {
                    Object.entries(entries[1]).forEach(function (entries) {
                        const paramId = entries[0];
                        const param = entries[1];

                        for (let optionId in param.options) {
                            const option = param.options[optionId];
                            const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

                            if (optionSelected && !option.default) {
                                price += option.price;
                            } else if (!optionSelected && option.default) {
                                price -= option.price;
                            }
                        }
                    });
                }
            });

            // for (let paramId in thisProduct.data.params) {
            //     const param = thisProduct.data.params[paramId];
            //     console.log(param);

            //     for (let optionId in param.options) {
            //         const option = param.options[optionId];
            //         const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

            //         if (optionSelected && !option.default) {
            //             price += option.price;
            //         } else if (!optionSelected && option.default) {
            //             price -= option.price;
            //         }
            //     }
            // }
            thisProduct.priceElem.innerHTML = price;
        }
    }

    const app = {
        initMenu: function () {
            const thisApp = this;

            console.log('thisApp.data:', thisApp.data);

            for (let product in thisApp.data.products) {
                new Product(product, thisApp.data.products[product]);
            }
        },

        initData: function () {
            const thisApp = this;

            thisApp.data = dataSource;
        },

        init: function () {
            const thisApp = this;
            console.log('*** App starting ***');
            console.log('thisApp:', thisApp);
            console.log('classNames:', classNames);
            console.log('settings:', settings);
            console.log('templates:', templates);

            thisApp.initData();
            thisApp.initMenu();
        },
    };

    app.init();
}
