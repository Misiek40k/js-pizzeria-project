import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
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
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    }
}

export default Booking;
