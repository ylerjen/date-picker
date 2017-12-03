(function() {
    
    enum DaysNameEnum {
        Monday = 1,
        Thuesday = 2,
        Wednesday = 3,
        Thursday = 4,
        Friday = 5,
        Saturday = 6,
        Sunday = 0,
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

    const elementName = "date-picker";
    const classNS = "dp";
    const calendarTpl = document.getElementById('tpl-date-picker') as HTMLTemplateElement;
    const yearDisplaySelector = `.${classNS}-days__nav-month-display`;

    class DatePicker extends HTMLElement {
        
        private _refDate: Date = new Date(`2016-02-01`); //new Date();
        private _refDateString: string;
        public weekList: HTMLElement;
        public monthNameDisplay: HTMLElement;
        public calendarEl: HTMLElement;

        constructor() {
            super();

            // create datepicker from template
            const shadowRoot = this.attachShadow({mode: 'open'});
            shadowRoot.appendChild(calendarTpl.content.cloneNode(true));
            this.weekList = shadowRoot.querySelector(`.${classNS}-days__list`);
            this.calendarEl = shadowRoot.querySelector(`.${classNS}`);
            this.monthNameDisplay = shadowRoot.querySelector(yearDisplaySelector);
        }

        set refDate(val: string) {
            this._refDate = new Date(val);
            this._refDateString = val;
            this.renderFullCalendar();
        }
        get refDate(): string {
            return this._refDateString;
        }

        connectedCallback() {
            console.log('connectedCallback');
            // get attributes value
            addListeners(this);
            this.refDate = this.getAttribute('ref-date') ? this.getAttribute('ref-date') : (new Date()).toString();
            console.log(this.refDate, this._refDate);
            this.renderFullCalendar();
        }

        disconnectedCallback() {
            console.log('disconnectedCallback');
            removeListeners(this);
        }
        
        attributeChangedCallback(attrName: string, oldVal: string, newVal: string) {
            console.log('attributeChangedCallback');
        }

        generateDayList() {
            const m = this._refDate.getMonth() + 1;
            const y = this._refDate.getFullYear();    
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
            // empty container
            const yearListWrapper = this.shadowRoot.querySelector(`.${classNS}-years__year-list`);
            yearListWrapper.innerHTML = "";

            // create years table
            const y = this._refDate.getFullYear();
            let firstYear = y-6;
            let curPos = 1;
            const yearsArray: Array<Array<number>> = [];
            let rowArray: Array<number> = [];
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

            // render table
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
            let m = this._refDate.getMonth()+1;
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
        
        onCalendarClick(evt: Event) {
            const el = evt.srcElement;
            if (el.className.indexOf(`${classNS}__day`) >= 0) {
                console.log('its a day');
            } else {
                console.log("it's NOT a day");
            }
        }

        setTodayValue() {
            this.refDate = DatePicker.dateToSimpleString(new Date());
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
        
        static daysInMonth(idxMonth: number, idxYear: number)
        {
            return new Date(idxYear, idxMonth, 0).getDate();
        }
    }

    function addListeners(instance: DatePicker) {
        instance.calendarEl.addEventListener('click', instance.onCalendarClick.bind(instance), false);
    }
    function removeListeners(instance: DatePicker) {
        instance.calendarEl.removeEventListener('click', instance.onCalendarClick);
    }
    
    customElements.define(elementName, DatePicker);
})();