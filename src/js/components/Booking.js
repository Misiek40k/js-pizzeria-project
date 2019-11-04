import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.initActions();
    }

    getData() {
        const thisBooking = this;

        const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(thisBooking.datePicker.minDate)}`;
        const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(thisBooking.datePicker.maxDate)}`;

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };


        const urls = {
            booking: new URL(
                `${settings.db.booking}?${params.booking.join('&')}`,
                settings.db.url
            ),
            eventsCurrent: new URL(
                `${settings.db.event}?${params.eventsCurrent.join('&')}`,
                settings.db.url
            ),
            eventsRepeat: new URL(
                `${settings.db.event}?${params.eventsRepeat.join('&')}`,
                settings.db.url
            ),
        };

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function (allResponses) {
                return Promise.all(allResponses.map(function (response) {
                    return response.json();
                }));
            })
            .then(function ([bookings, eventsCurrent, eventsRepeat]) {
                // console.log(bookings);
                // console.log(eventsCurrent);
                // console.log(eventsRepeat);
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            });

    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this;

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        thisBooking.booked = {};

        for (let item of bookings) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of eventsCurrent) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of eventsRepeat) {
            if (item.repeat === 'daily') {
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        thisBooking.updateDOM();
    }

    updateDOM() {
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if (
            typeof thisBooking.booked[thisBooking.date] === 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined'
        ) {
            allAvailable = true;
        }

        for (let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);

            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

            if (
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ) {
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    makeBooked(date, hour, duration, table) {
        const thisBooking = this;


        if (typeof thisBooking.booked[date] === 'undefined') {
            thisBooking.booked[date] = {};
        }
        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
            if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    }

    initActions() {
        const thisBooking = this;

        thisBooking.dom.wrapper.addEventListener('updated', function () {
            delete thisBooking.tableId;
            thisBooking.updateDOM();
        });

        thisBooking.dom.datePicker.addEventListener('updated', function () {
            thisBooking.updateDOM();
        });

        thisBooking.dom.tables.forEach(function (table) {
            table.addEventListener('click', function () {
                event.preventDefault();
                thisBooking.getTableId(table);
            });
        });

        thisBooking.dom.form.addEventListener('click', function () {
            event.preventDefault();
            thisBooking.makeReservation(thisBooking.reservation);
        });

        window.onload = function(){
            thisBooking.openReservation();
        };

        window.addEventListener('hashchange', function () {
            event.preventDefault();
            thisBooking.reservation = undefined;
            thisBooking.tableId = undefined;
            thisBooking.getData();
            thisBooking.openReservation();
        });
    }

    getTableId(table) {
        const thisBooking = this;

        thisBooking.tableId = table.getAttribute(settings.booking.tableIdAttribute);

        (thisBooking.booked[thisBooking.date][thisBooking.hour]
            &&
            !thisBooking.booked[thisBooking.date][thisBooking.hour].includes(parseInt(thisBooking.tableId))
            ||
            !thisBooking.booked[thisBooking.date][thisBooking.hour])

            ? table.classList.toggle(classNames.booking.tableBooked)
            : alert('Table already reserved :(');

        if (!table.classList.contains(classNames.booking.tableBooked))
            delete thisBooking.tableId;
    }

    makeReservation(reservation) {
        const thisBooking = this;

        if (!reservation) {
            const url = new URL(settings.db.booking, settings.db.url);

            reservation = {
                uuid: thisBooking.createUuid(),
                date: thisBooking.datePicker.value,
                hour: thisBooking.hourPicker.value,
                table: parseInt(thisBooking.tableId),
                phone: parseInt(thisBooking.dom.phone.value),
                address: thisBooking.dom.address.value,
                duration: parseInt(thisBooking.dom.duration.value),
                ppl: parseInt(thisBooking.dom.people.value),
                starters: [],
            };

            for (let starter of thisBooking.dom.starters) {
                if (starter.checked)
                    reservation.starters.push(starter.value);
            }

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservation),
            };

            reservation.table !== undefined && !isNaN(reservation.table) ?
                (fetch(url, options)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (parsedResponse) {
                        console.log('parsedResponse reservation', parsedResponse);
                        thisBooking.getData();
                        thisBooking.dom.address.value = '';
                        thisBooking.dom.phone.value = '';
                        delete thisBooking.tableId;

                        alert(`/${parsedResponse.uuid}`);
                    }))
                : alert('No table choosed :(');
        } else {

            const url = new URL(`${settings.db.booking}/${thisBooking.reservation.id}`, settings.db.url);

            const editReservation = {
                uuid: reservation.uuid,
                date: thisBooking.datePicker.value,
                hour: thisBooking.hourPicker.value,
                table: parseInt(thisBooking.tableId),
                phone: parseInt(thisBooking.dom.phone.value),
                address: thisBooking.dom.address.value,
                duration: parseInt(thisBooking.dom.duration.value),
                ppl: parseInt(thisBooking.dom.people.value),
                starters: [],
            };

            for (let starter of thisBooking.dom.starters) {
                if (starter.checked)
                    editReservation.starters.push(starter.value);
            }

            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editReservation),
            };

            fetch(url, options)
                .then(function (response) {
                    return response.json();
                })
                .then(function (parsedResponse) {
                    console.log('parsedResponse editedReservation', parsedResponse);
                    thisBooking.getData();

                    // alert(`/${parsedResponse.uuid}`);
                });
        }
    }

    createUuid() {
        let uuid = '';
        for (let i = 0; i < 32; i++) {
            const random = Math.random() * 16 | 0;

            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }

    viewReservation(uuid) {
        const thisBooking = this;

        const url = new URL(`${settings.db.booking}?uuid=${uuid}`, settings.db.url);

        fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (parsedResponse) {
                if (parsedResponse[0]) {
                    thisBooking.reservation = parsedResponse[0];

                    thisBooking.dom.address.value = thisBooking.reservation.address;
                    thisBooking.dom.phone.value = thisBooking.reservation.phone;
                    thisBooking.dom.duration.value = parseInt(thisBooking.reservation.duration);
                    thisBooking.dom.people.value = parseInt(thisBooking.reservation.ppl);
                    thisBooking.hourPicker.value = parseInt(thisBooking.reservation.hour);
                    thisBooking.hourPicker.updateSlider(thisBooking.reservation.hour);
                    thisBooking.datePicker.value = thisBooking.reservation.date;
                    thisBooking.datePicker.updateCalendar(thisBooking.reservation.date);
                    thisBooking.tableId = parseInt(thisBooking.reservation.table);

                    thisBooking.deleteReservation(
                        thisBooking.reservation.date,
                        thisBooking.reservation.hour,
                        thisBooking.reservation.duration,
                        thisBooking.reservation.table
                    );

                } else {
                    thisBooking.reservation = undefined;

                    thisBooking.dom.address.value = '';
                    thisBooking.dom.phone.value = '';
                    delete thisBooking.tableId;
                }
            });
    }

    openReservation(){
        const thisBooking = this;

        const regexp = new RegExp('\\/[a-zA-Z\\-0-9]+', ['g']);

        if (window.location.hash && window.location.hash.match(regexp)[1]) {
            const uuid = window.location.hash.match(regexp)[1].replace('/', '');
            thisBooking.viewReservation(uuid);
        }
    }

    deleteReservation(date, hour, duration, table) {
        const thisBooking = this;

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
            thisBooking.booked[date][hourBlock] = thisBooking.booked[date][hourBlock].filter(function (item) {
                return item !== table;
            });
            thisBooking.updateDOM();
        }
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
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
        thisBooking.dom.people = thisBooking.dom.wrapper.querySelector('[name="people"]');
        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll('[name="starter"]');
        thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector('[name="hours"]');
    }
}

export default Booking;
