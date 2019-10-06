/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
            cartProduct: '#template-cart-product', // CODE ADDED
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
                input: 'input.amount', // CODE CHANGED
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
        // CODE ADDED START
        cart: {
            productList: '.cart__order-summary',
            toggleTrigger: '.cart__summary',
            totalNumber: `.cart__total-number`,
            totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
            subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
            deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
            form: '.cart__order',
            formSubmit: '.cart__order [type="submit"]',
            phone: '[name="phone"]',
            address: '[name="address"]',
        },
        cartProduct: {
            amountWidget: '.widget-amount',
            price: '.cart__product-price',
            edit: '[href="#edit"]',
            remove: '[href="#remove"]',
        },
        // CODE ADDED END
    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
        // CODE ADDED START
        cart: {
            wrapperActive: 'active',
        },
        // CODE ADDED END
    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        }, // CODE CHANGED
        // CODE ADDED START
        cart: {
            defaultDeliveryFee: 20,
        },
        // CODE ADDED END
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
        // CODE ADDED START
        cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
        // CODE ADDED END
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
            thisProduct.initAmountWidget();
            thisProduct.processOrder();

            //console.log('new product:', thisProduct);
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
            thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
            thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
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

        initAmountWidget() {
            const thisProduct = this;

            thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

            thisProduct.amountWidgetElem.addEventListener('updated', function () {
                thisProduct.processOrder();
            });
        }

        processOrder() {
            const thisProduct = this;


            const formData = utils.serializeFormToObject(thisProduct.form);
            let price = thisProduct.data.price;

            if (thisProduct.data.params) {
                Object.entries(thisProduct.data.params).forEach(function ([paramId, param]) {


                    for (let optionId in param.options) {
                        const option = param.options[optionId];
                        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
                        const images = thisProduct.imageWrapper.querySelectorAll(`.${paramId}-${optionId}`);

                        if (optionSelected && !option.default) {
                            price += option.price;
                        } else if (!optionSelected && option.default) {
                            price -= option.price;
                        }

                        // if (optionSelected) {
                        //     for (let image of images) {
                        //         image.classList.add('active');
                        //     }
                        // } else {
                        //     for (let image of images) {
                        //         image.classList.remove('active');
                        //     }
                        // }

                        optionSelected ?
                            (images.forEach((image) => {
                                image.classList.add('active');
                            }))
                            :
                            (images.forEach((image) => {
                                image.classList.remove('active');
                            }));
                    }
                });
            }


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
            price *= thisProduct.amountWidget.value;
            thisProduct.priceElem.innerHTML = price;
        }
    }

    class AmountWidget {
        constructor(element) {
            const thisWidget = this;

            thisWidget.getElements(element);
            thisWidget.value = settings.amountWidget.defaultValue;
            thisWidget.setValue(thisWidget.input.value);
            thisWidget.initActions();

            //console.log('AmountWidget: ', thisWidget);
            //console.log('constructor arguments: ', element);
        }

        getElements(element) {
            const thisWidget = this;

            thisWidget.element = element;
            thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
            thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
            thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
        }

        setValue(value) {
            const thisWidget = this;

            const newValue = parseInt(value);

            if (newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
                thisWidget.value = newValue;
                thisWidget.announce();
            }

            thisWidget.input.value = thisWidget.value;
        }

        initActions() {
            const thisWidget = this;

            thisWidget.input.addEventListener('change', function () {
                thisWidget.setValue(parseInt(thisWidget.input.value));
            });

            thisWidget.linkDecrease.addEventListener('click', function () {
                event.preventDefault();
                thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
            });

            thisWidget.linkIncrease.addEventListener('click', function () {
                event.preventDefault();
                thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
            });
        }

        announce() {
            const thisWidget = this;

            const event = new Event('updated');
            thisWidget.element.dispatchEvent(event);
        }
    }

    class Cart {
        constructor(element) {
            const thisCart = this;

            thisCart.products = [];
            thisCart.getElements(element);

            console.log('new Cart: ', thisCart);
        }

        getElements(element) {
            const thisCart = this;

            thisCart.dom = {};
            thisCart.dom.wrapper = element;
        }
    }

    const app = {
        initMenu: function () {
            const thisApp = this;

            //console.log('thisApp.data:', thisApp.data);

            for (let product in thisApp.data.products) {
                new Product(product, thisApp.data.products[product]);
            }
        },

        initData: function () {
            const thisApp = this;

            thisApp.data = dataSource;
        },

        initCart: function () {
            const thisApp = this;

            const cartElement = document.querySelector(select.containerOf.cart);
            thisApp.cart = new Cart(cartElement);
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
            thisApp.initCart();
        },
    };

    app.init();
}
