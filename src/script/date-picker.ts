enum DaysNameEnum {
    Monday = 1,
    Thuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sunday = 0
}

enum MonthEnum {
    January = 1,
    February = 2,
    March = 3,
    April = 4,
    May = 5,
    June = 6,
    July = 7,
    August = 8,
    September = 9,
    October = 10,
    November = 11,
    December = 12
}

(function() {

    const elementName = "date-picker";
    const classNS = "dp";
    const calendarTpl = document.getElementById('tpl-date-picker') as HTMLTemplateElement;
    const yearDisplaySelector = `.${classNS}-days__nav-month-display`;
    const initDateAttrName = 'init-date';

    class DatePicker extends HTMLElement {
        
        private _refDate: Date = new Date();
        public weekList: HTMLTableSectionElement;
        public monthNameDisplay: HTMLElement;
        public calendarEl: HTMLElement;
        daysView: any;
        monthsView: HTMLElement;
        yearsView: any;

        constructor() {
            super();
            console.log('ctor called');
            // create datepicker from template
            const shadowRoot = this.attachShadow({mode: 'open'});
            shadowRoot.appendChild(calendarTpl.content.cloneNode(true));
            this.weekList = shadowRoot.querySelector(`.${classNS}-days__list`);
            this.calendarEl = shadowRoot.querySelector(`.${classNS}`);
            this.monthNameDisplay = shadowRoot.querySelector(yearDisplaySelector);
            this.daysView = shadowRoot.querySelector(`.${classNS}__days-view`);
            this.monthsView = shadowRoot.querySelector(`.${classNS}__months-view`);
            this.yearsView = shadowRoot.querySelector(`.${classNS}__years-view`);
        }

        set refDate(val: Date) {
            this._refDate = val;
            this.renderFullCalendar();
            console.log(`refDate has changed to ${this._refDate}`)
        }
        get refDate(): Date {
            return this._refDate;
        }

        get refDateString(): string {
            return this.refDate.toLocaleDateString();
        }
        set refDateString(val: string) {
            let d = new Date(val);
            if (isNaN(d.getTime())) {
                d = new Date();
            }
            this.refDate = d;
        }

        setChoosenDate(choosenDate: Date) {
            this.refDate = choosenDate;
            console.log(`choose date : ${this.refDateString}`);
            this.setAttribute('data-value', this.refDateString);
        }

        connectedCallback() {
            console.info('connectedCallback');
            // get attributes value
            this.refDateString = this.getAttribute(initDateAttrName) ? this.getAttribute(initDateAttrName) : (new Date()).toString();
            console.log(this.refDate);
            this.addListeners();
        }

        disconnectedCallback() {
            console.info('disconnectedCallback');
            this.removeListeners();
        }
        
        attributeChangedCallback(attrName: string, oldVal: string, newVal: string) {
            console.info('attributeChangedCallback',attrName, oldVal, newVal);
        }

        generateDayList() {
            const m = this.refDate.getMonth() + 1;
            const y = this.refDate.getFullYear();
            const firstMonthDay = new Date(`${y}-${m}-01`);
            const firstDayNb = firstMonthDay.getDay();
            const monthDetail: Array<Array<Number>> = [];
            const daysInCurMonth = DatePicker.daysInMonth(m, y);
            let curDay = 1;
            let weekNb = 1;
            while (curDay <= daysInCurMonth) {
                let curWeek: Array<Number> = [];
                for (let i = 1; i <= 7; i++) {
                    if (weekNb === 1 && firstDayNb > i) {
                        curWeek.push(0);
                    } else if (curDay > daysInCurMonth) {
                        curWeek.push(0);
                        curDay++
                    } else {
                        curWeek.push(curDay++);
                    }
                }
                weekNb++;
                monthDetail.push(curWeek);
            };
            return monthDetail;
        }
        
        renderDays(daysArray: Array<Array<Number>>) {
            // empty existing children
            this.weekList.innerHTML = "";
            // create calendar
            for (let rowIdx = 0, rowIdxMax = daysArray.length; rowIdx < rowIdxMax; rowIdx++) {
                const weekEl = this.weekList.insertRow();
                for (let cellIdx = 0, cellIdxMax = daysArray[rowIdx].length; cellIdx < cellIdxMax; cellIdx++) {
                    const dayEl = weekEl.insertCell();
                    const dayBtn = document.createElement('button');
                    const curDay = daysArray[rowIdx][cellIdx].toString();
                    dayBtn.innerText = curDay;
                    dayBtn.className = 'btn-selector';
                    dayBtn.setAttribute('data-date', curDay);
                    dayEl.appendChild(dayBtn);
                }
            }
        }

        renderYears() {
            // empty container
            const yearListWrapper: HTMLTableElement = this.shadowRoot.querySelector(`.${classNS}-years__list`);
            yearListWrapper.innerHTML = "";

            // create years table
            const y = this.refDate.getFullYear();
            let firstYear = y-6;
            let curPos = 1;
            const yearsArray: Array<Array<number>> = [];
            let rowArray: Array<number> = [];
            while (curPos <= 18) {
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

            // render table
            for (let rowIdx = 0, rowIdxMax = yearsArray.length; rowIdx < rowIdxMax; rowIdx++) {
                const weekEl = yearListWrapper.insertRow();
                for (let cellIdx = 0, cellIdxMax = yearsArray[rowIdx].length; cellIdx < cellIdxMax; cellIdx++) {
                    const yearCell = weekEl.insertCell();
                    const yearBtn = document.createElement('button');
                    const curYear = yearsArray[rowIdx][cellIdx].toString();
                    yearBtn.className = 'btn-selector';
                    yearBtn.setAttribute('data-date', curYear)
                    yearCell.appendChild(yearBtn); 
                    yearBtn.innerText = curYear;
                }
            }
        }

        renderCurrentMonthTitle() {
            let m = this.refDate.getMonth()+1;
            let monthName = MonthEnum[m];
            this.monthNameDisplay.innerHTML = monthName;
        }

        renderCurrentYearTitle() {
            this.shadowRoot.querySelector(`.${classNS}-months__nav-year-display`).innerHTML = this.refDate.getFullYear().toString();
        }

        renderFullCalendar() {
            const monthDetail = this.generateDayList();
            this.renderDays(monthDetail);
            this.renderYears();
            this.renderCurrentMonthTitle();
            this.renderCurrentYearTitle();
        }
        
        onCalendarClick(evt: Event) {
            const el = evt.srcElement;
            if (el.className.indexOf(`${classNS}__day`) >= 0) {
                console.log('its a day');
            }
        }

        gotoYears(year: number) {
            const d = this.refDate;
            d.setFullYear(year);
            this.refDate = d;
            console.log(`goto year ${year}`);
        }

        gotoNextMonth() {
            const d = this.refDate;
            d.setMonth(d.getMonth()+1);
            this.refDate = d;
        }
        gotoPreviousMonth() {
            const d = this.refDate;
            d.setMonth(d.getMonth()-1);
            this.refDate = d;
        }

        setTodayValue() {
            this.setChoosenDate(new Date());
        }

        onClickADay(evt: Event) {
            evt.preventDefault();

            const btn = evt.srcElement;
            if (!btn.classList.contains('btn-selector'))
            {
                return;
            }
            const day = btn.getAttribute('data-date');
            console.log(day);
            const d = this.refDate;
            d.setDate(+day);
            this.refDate = d;
        }

        onClickAMonth(evt: Event) {
            evt.preventDefault();

            const btn = evt.srcElement;
            if (!btn.classList.contains('btn-selector'))
            {
                return;
            }
            const m = btn.getAttribute('data-date');
            console.log(m);
            const d = this.refDate;
            d.setMonth(+m-1);
            this.refDate = d;
            this.gotoDayView();
        }

        onClickAYear(evt: Event) {
            evt.preventDefault();

            const btn = evt.srcElement;
            if (!btn.classList.contains('btn-selector'))
            {
                return;
            }
            const year = btn.getAttribute('data-date');
            console.log(year);
            const d = this.refDate;
            d.setFullYear(+year);
            this.refDate = d;
            this.gotoMonthView();
        }

        private gotoDayView() {
            this.monthsView.classList.add('hide-me');
            this.yearsView.classList.add('hide-me');
        }
        onClickGotoMonthView() {
            console.log('Goto month view');
            this.gotoMonthView();
        }
        private gotoMonthView() {
            this.monthsView.classList.remove('hide-me');
            this.yearsView.classList.add('hide-me');
        }
        onClickGotoYearView() {
            console.log('Goto year view');
            this.monthsView.classList.add('hide-me');
            this.yearsView.classList.remove('hide-me');
        }

        static dateToSimpleString(src: Date): string {
            if (!src) {
                return "";
            }
            if (typeof src !== 'object' || !src.getMonth) {
                throw "Param has to be null or a Date object";
            }
            return `${src.getFullYear()}-${src.getMonth()+1}-${src.getDate()}`;
        }

        /**
         * Transform a date string to a Date object
         * @param dateStr - should be a date string with the format dd/mm/yyyy
         */
        static stringToDate(dateStr: string): Date {
            return new Date(dateStr);
        }
        
        static daysInMonth(idxMonth: number, idxYear: number)
        {
            return new Date(idxYear, idxMonth, 0).getDate();
        }

        private addListeners() {
            this.calendarEl.querySelector(`.${classNS}__today-selector`).addEventListener('click', this.setTodayValue.bind(this), false);
            this.calendarEl.querySelector(`.${classNS}-days__nav-next`).addEventListener('click', this.gotoNextMonth.bind(this), false);
            this.calendarEl.querySelector(`.${classNS}-days__nav-prev`).addEventListener('click', this.gotoPreviousMonth.bind(this), false);
            this.calendarEl.querySelector(`.${classNS}-days__list`).addEventListener('click', this.onClickADay.bind(this), false);
            this.calendarEl.querySelector(`.${classNS}-month__list`).addEventListener('click', this.onClickAMonth.bind(this), false);
            this.calendarEl.querySelector(`.${classNS}-years__list`).addEventListener('click', this.onClickAYear.bind(this), false);
            this.calendarEl.querySelector(`.${classNS}-days__nav-month-display`).addEventListener('click', this.onClickGotoMonthView.bind(this), false);
            this.calendarEl.querySelector(`.${classNS}-months__nav-year-display`).addEventListener('click', this.onClickGotoYearView.bind(this), false);
        }

        private removeListeners() {
            this.calendarEl.removeEventListener('click', this.onCalendarClick);
        }
    }
    
    customElements.define(elementName, DatePicker);
})();