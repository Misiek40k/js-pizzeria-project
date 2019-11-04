import { select, settings } from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget {
    constructor(wrapper) {
        super(wrapper, utils.dateToStr(new Date()));
        const thisWidget = this;

        thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
        thisWidget.initPlugin();
    }

    initPlugin() {
        const thisWidget = this;

        thisWidget.minDate = new Date(thisWidget.value);
        thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

        thisWidget.picr = flatpickr(thisWidget.dom.input, {
            defaultDate: thisWidget.minDate,
            minDate: thisWidget.minDate,
            maxDate: thisWidget.maxDate,
            'disable': [
                function (date) {
                    // return true to disable
                    return (date.getDay() === 1);
                }
            ],
            'locale': {
                'firstDayOfWeek': 1 // start week on Monday
            },
            dateFormat: 'Y-m-d', // Displays: 2017-01-22Z
            onChange: function (dateStr) {
                thisWidget.value = utils.dateToStr(dateStr[0]);
            },
        });
    }

    updateCalendar(date){
        const thisWidget = this;

        thisWidget.picr.setDate(date.replace('-', '/'));
    }

    parseValue(value) {
        return value;
    }

    isValid() {
        return true;
    }

    renderValue() {

    }
}

export default DatePicker;
