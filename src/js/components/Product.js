import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

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

        // app.cart.add(thisProduct);

        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct,
            },
        });

        thisProduct.element.dispatchEvent(event);
    }
}

export default Product;
