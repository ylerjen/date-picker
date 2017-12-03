(function () {
    let DaysNameEnum;
    (function (DaysNameEnum) {
        DaysNameEnum[DaysNameEnum["Monday"] = 1] = "Monday";
        DaysNameEnum[DaysNameEnum["Thuesday"] = 2] = "Thuesday";
        DaysNameEnum[DaysNameEnum["Wednesday"] = 3] = "Wednesday";
        DaysNameEnum[DaysNameEnum["Thursday"] = 4] = "Thursday";
        DaysNameEnum[DaysNameEnum["Friday"] = 5] = "Friday";
        DaysNameEnum[DaysNameEnum["Saturday"] = 6] = "Saturday";
        DaysNameEnum[DaysNameEnum["Sunday"] = 0] = "Sunday";
    })(DaysNameEnum || (DaysNameEnum = {}));
    let MonthEnum;
    (function (MonthEnum) {
        MonthEnum[MonthEnum["January"] = 1] = "January";
        MonthEnum[MonthEnum["February"] = 2] = "February";
        MonthEnum[MonthEnum["March"] = 3] = "March";
        MonthEnum[MonthEnum["April"] = 4] = "April";
        MonthEnum[MonthEnum["May"] = 5] = "May";
        MonthEnum[MonthEnum["June"] = 6] = "June";
        MonthEnum[MonthEnum["July"] = 7] = "July";
        MonthEnum[MonthEnum["August"] = 8] = "August";
        MonthEnum[MonthEnum["September"] = 9] = "September";
        MonthEnum[MonthEnum["October"] = 10] = "October";
        MonthEnum[MonthEnum["November"] = 11] = "November";
        MonthEnum[MonthEnum["December"] = 12] = "December";
    })(MonthEnum || (MonthEnum = {}));
    const elementName = "date-picker";
    const classNS = "dp";
    const calendarTpl = document.getElementById('tpl-date-picker');
    const yearDisplaySelector = `.${classNS}-days__nav-month-display`;
    class DatePicker extends HTMLElement {
        constructor() {
            super();
            this._refDate = new Date(`2016-02-01`);
            const shadowRoot = this.attachShadow({ mode: 'open' });
            shadowRoot.appendChild(calendarTpl.content.cloneNode(true));
            this.weekList = shadowRoot.querySelector(`.${classNS}-days__list`);
            this.calendarEl = shadowRoot.querySelector(`.${classNS}`);
            this.monthNameDisplay = shadowRoot.querySelector(yearDisplaySelector);
        }
        set refDate(val) {
            this._refDate = new Date(val);
            this._refDateString = val;
            this.renderFullCalendar();
        }
        get refDate() {
            return this._refDateString;
        }
        connectedCallback() {
            console.log('connectedCallback');
            addListeners(this);
            this.refDate = this.getAttribute('ref-date') ? this.getAttribute('ref-date') : (new Date()).toString();
            console.log(this.refDate, this._refDate);
            this.renderFullCalendar();
        }
        disconnectedCallback() {
            console.log('disconnectedCallback');
            removeListeners(this);
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            console.log('attributeChangedCallback');
        }
        generateDayList() {
            const m = this._refDate.getMonth() + 1;
            const y = this._refDate.getFullYear();
            const firstMonthDay = new Date(`${y}-${m}-01`);
            const firstDayNb = firstMonthDay.getDay();
            const monthDetail = [];
            const daysInCurMonth = DatePicker.daysInMonth(m, y);
            console.log(daysInCurMonth);
            let curDay = 1;
            let weekNb = 1;
            while (curDay <= daysInCurMonth) {
                let curWeek = [];
                for (let i = 1; i <= 7; i++) {
                    if (weekNb === 1 && firstDayNb > i) {
                        curWeek.push(0);
                    }
                    else if (curDay > daysInCurMonth) {
                        curWeek.push(0);
                        curDay++;
                    }
                    else {
                        curWeek.push(curDay++);
                    }
                }
                weekNb++;
                monthDetail.push(curWeek);
            }
            ;
            return monthDetail;
        }
        renderDays(daysArray) {
            this.weekList.innerHTML = "";
            for (let rowIdx = 0, rowIdxMax = daysArray.length; rowIdx < rowIdxMax; rowIdx++) {
                const weekEl = document.createElement('tr');
                for (let cellIdx = 0, cellIdxMax = daysArray[rowIdx].length; cellIdx < cellIdxMax; cellIdx++) {
                    const dayEl = document.createElement('td');
                    dayEl.innerText = daysArray[rowIdx][cellIdx].toString();
                    weekEl.appendChild(dayEl);
                }
                this.weekList.appendChild(weekEl);
            }
        }
        renderYears() {
            console.log('renderYears');
            const yearListWrapper = this.shadowRoot.querySelector(`.${classNS}-years__year-list`);
            yearListWrapper.innerHTML = "";
            const y = this._refDate.getFullYear();
            let firstYear = y - 6;
            let curPos = 1;
            const yearsArray = [];
            let rowArray = [];
            while (curPos <= 12) {
                if (firstYear < 0) {
                    firstYear++;
                    continue;
                }
                rowArray.push(firstYear + curPos);
                if (curPos % 4 === 0) {
                    yearsArray.push(rowArray);
                    rowArray = [];
                }
                curPos++;
            }
            for (let rowIdx = 0, rowIdxMax = yearsArray.length; rowIdx < rowIdxMax; rowIdx++) {
                const weekEl = document.createElement('tr');
                for (let cellIdx = 0, cellIdxMax = yearsArray[rowIdx].length; cellIdx < cellIdxMax; cellIdx++) {
                    const yearCell = document.createElement('td');
                    const yearButton = document.createElement('a');
                    yearCell.appendChild(yearButton);
                    yearButton.innerText = yearsArray[rowIdx][cellIdx].toString();
                    weekEl.appendChild(yearCell);
                }
                yearListWrapper.appendChild(weekEl);
            }
        }
        renderCurrentMonthTitle() {
            let m = this._refDate.getMonth() + 1;
            let monthName = MonthEnum[m];
            this.monthNameDisplay.innerHTML = monthName;
        }
        renderCurrentYearTitle() {
            this.shadowRoot.querySelector(`.${classNS}-days__nav-year-display`).innerHTML = this._refDate.getFullYear().toString();
        }
        renderFullCalendar() {
            const monthDetail = this.generateDayList();
            this.renderDays(monthDetail);
            this.renderYears();
            this.renderCurrentMonthTitle();
            this.renderCurrentYearTitle();
        }
        onCalendarClick(evt) {
            const el = evt.srcElement;
            if (el.className.indexOf(`${classNS}__day`) >= 0) {
                console.log('its a day');
            }
            else {
                console.log("it's NOT a day");
            }
        }
        setTodayValue() {
            this.refDate = DatePicker.dateToSimpleString(new Date());
        }
        static dateToSimpleString(src) {
            if (!src) {
                return "";
            }
            if (typeof src !== 'object' || !src.getMonth) {
                throw "Param has to be null or a Date object";
            }
            return `${src.getFullYear()}-${src.getMonth() + 1}-${src.getDate()}`;
        }
        static daysInMonth(idxMonth, idxYear) {
            return new Date(idxYear, idxMonth, 0).getDate();
        }
    }
    function addListeners(instance) {
        instance.calendarEl.addEventListener('click', instance.onCalendarClick.bind(instance), false);
    }
    function removeListeners(instance) {
        instance.calendarEl.removeEventListener('click', instance.onCalendarClick);
    }
    customElements.define(elementName, DatePicker);
})();
//# sourceMappingURL=date-picker.js.map