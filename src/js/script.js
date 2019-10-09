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
        },
        cart: {
            defaultDeliveryFee: 20,
        },
        db: {
            url: '//localhost:3131',
            product: 'product',
            order: 'order',
        },
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
        cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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
                thisProduct.addToCart();
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
            thisProduct.params = {};
            let price = thisProduct.data.price;

            if (thisProduct.data.params) {
                Object.entries(thisProduct.data.params).forEach(function ([paramId, param]) {


                    for (let optionId in param.options) {
                        const option = param.options[optionId];
                        const optionSelected = formData[paramId] && formData[paramId].indexOf(optionId) > -1;
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

                        if (!thisProduct.params[paramId]) {
                            thisProduct.params[paramId] = {
                                label: param.label,
                                options: {},
                            };
                        }

                        thisProduct.params[paramId].options[optionId] = option.label;

                        optionSelected ?
                            (images.forEach((image) => {
                                image.classList.add(classNames.menuProduct.imageVisible);
                            }))
                            :
                            (images.forEach((image) => {
                                image.classList.remove(classNames.menuProduct.imageVisible);
                            }));
                    }
                });
            }


            // for (let paramId in thisProduct.data.params) {
            //     const param = thisProduct.data.params[paramId];

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

            thisProduct.priceSingle = price;
            thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
            thisProduct.priceElem.innerHTML = thisProduct.price;
        }

        addToCart() {
            const thisProduct = this;

            thisProduct.name = thisProduct.data.name;
            thisProduct.amount = thisProduct.amountWidget.value;
            app.cart.add(thisProduct);
        }
    }

    class AmountWidget {
        constructor(element) {
            const thisWidget = this;

            thisWidget.getElements(element);
            thisWidget.value = settings.amountWidget.defaultValue;
            thisWidget.setValue(thisWidget.input.value);
            thisWidget.initActions();
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

            const event = new Event('updated', {
                bubbles: true
            });
            thisWidget.element.dispatchEvent(event);
        }
    }

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

            const url = `${settings.db.url}/${settings.db.order}`;

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
                console.log('product: ', product);

                const data = product.getData();
                console.log('data:', data);

                payload.products.push(data);
                console.log('data pushed');
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

    class CartProduct {
        constructor(menuProduct, element) {
            const thisCartProduct = this;

            thisCartProduct.id = menuProduct.id;
            thisCartProduct.name = menuProduct.name;
            thisCartProduct.price = menuProduct.price;
            thisCartProduct.priceSingle = menuProduct.priceSingle;
            thisCartProduct.amount = menuProduct.amount;
            thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
            thisCartProduct.getElements(element);
            thisCartProduct.initAmountWidget();
            thisCartProduct.initActions();
        }

        getElements(element) {
            const thisCartProduct = this;

            thisCartProduct.dom = {};
            thisCartProduct.dom.wrapper = element;
            thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
            thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
            thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
            thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
        }

        initAmountWidget() {
            const thisCartProduct = this;

            thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

            thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
                thisCartProduct.amount = thisCartProduct.amountWidget.value;
                thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
                thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
            });
        }

        remove() {
            const thisCartProduct = this;

            const event = new CustomEvent('remove', {
                bubbles: true,
                detail: {
                    cartProduct: thisCartProduct,
                },
            });

            thisCartProduct.dom.wrapper.dispatchEvent(event);
        }

        initActions() {
            const thisCartProduct = this;

            thisCartProduct.dom.edit.addEventListener('click', function () {
                event.preventDefault();
            });

            thisCartProduct.dom.remove.addEventListener('click', function () {
                event.preventDefault();
                thisCartProduct.remove();
            });
        }

        getData() {
            const thisCartProduct = this;

            const productData = {
                id: thisCartProduct.id,
                price: thisCartProduct.price,
                priceSingle: thisCartProduct.priceSingle,
                amount: thisCartProduct.amount,
                params: thisCartProduct.params,
            };

            return productData;
        }
    }

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

            console.log('thisApp.data', JSON.stringify(thisApp.data));
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
            thisApp.initCart();
        },
    };

    app.init();
}
