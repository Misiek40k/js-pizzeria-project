import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    }

    render(bookingWidget) {
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {};

        thisBooking.dom.wrapper = bookingWidget;
        thisBooking.element = utils.createDOMFromHTML(generatedHTML);
        thisBooking.dom.wrapper.appendChild(thisBooking.element);

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    }
}

export default Booking;
