/* script.js */

var theme = "light";

function onload_func()
{
    if(localStorage.getItem('theme') === "dark")
    {
        theme = "dark";
        document.body.classList.toggle('night-mode');
    }

    var date = new Date();
    document.getElementById('current-date').valueAsDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)); // https://stackoverflow.com/questions/13646446/javascript-date-tojson-produces-a-date-which-has-wrong-hours-and-minutes

    if(localStorage.getItem('start-date') !== null)
        document.getElementById('start-date').valueAsDate = new Date(localStorage.getItem('start-date'));
    else
        document.getElementById('start-date').valueAsDate = new Date("2022-07-01");

    if(localStorage.getItem('end-date') !== null)
        document.getElementById('end-date').valueAsDate = new Date(localStorage.getItem('end-date'));
    else
        document.getElementById('end-date').valueAsDate = new Date("2030-01-01");

    if(localStorage.getItem('holiday-per-year') !== null)
        document.getElementById('holiday-per-year').value = localStorage.getItem('holiday-per-year');
    else
        document.getElementById('holiday-per-year').value = 9;

    if(localStorage.getItem('pto-per-year') !== null)
        document.getElementById('pto-per-year').value = localStorage.getItem('pto-per-year');
    else
        document.getElementById('pto-per-year').value = 22;

    if(localStorage.getItem('sick-per-year') !== null)
        document.getElementById('sick-per-year').value = localStorage.getItem('sick-per-year');
    else
        document.getElementById('sick-per-year').value = 18;

    if(localStorage.getItem('wfh-per-week') !== null)
            document.getElementById('wfh-per-week').value = localStorage.getItem('wfh-per-week');
    else
        document.getElementById('wfh-per-week').value = 1;

    calc();
}

function days_delta(d1, d2)
{
    return Math.round(Math.max(0, (d2 - d1) / (1000 * 60 * 60 * 24)));
}

function total_days()
{
    var d1 = new Date(document.getElementById("start-date").value);
    var d2 = new Date(document.getElementById("end-date").value);
    return days_delta(d1, d2);
}

function days_passed()
{
    var d1 = new Date(document.getElementById("start-date").value);
    var d2 = new Date(document.getElementById("current-date").value);
    return days_delta(d1, d2);
}

function days_remaining()
{
    var d1 = new Date(document.getElementById("current-date").value);
    var d2 = new Date(document.getElementById("end-date").value);
    return days_delta(d1, d2);
}

function weekend_days()
{
    var d1 = new Date(document.getElementById("current-date").value);
    var d2 = new Date(document.getElementById("end-date").value);
    if(d1 >= d2)
        return 0;
    var result = 0;
    while((d1 < d2) && (d1.getDay() != d2.getDay()))
    {
        if(d1.getDay() === 5 || d1.getDay() === 6) // Hebrew version
            result = result + 1;
        d1.setDate(d1.getDate() + 1);
    }
    return Math.round(result + 2 * (days_delta(d1, d2) / 7));
}

// returns estimated holidays that aren't weekends
function get_holiday()
{
    var per_day = parseInt(document.getElementById("holiday-per-year").value) / 365.25;
    return Math.floor(((days_remaining() - weekend_days()) * per_day));
}

function get_non_weekend_or_holiday_per_year()
{
    return (365.25 - parseInt(document.getElementById("holiday-per-year").value)) * 5.0 / 7.0;
}

function get_pto()
{
    var per_day = parseInt(document.getElementById("pto-per-year").value) / get_non_weekend_or_holiday_per_year();
    return Math.floor(((days_remaining() - weekend_days() - get_holiday()) * per_day));
}

function get_sick()
{
    var per_day = parseInt(document.getElementById("sick-per-year").value) / get_non_weekend_or_holiday_per_year();
    return Math.floor(((days_remaining() - weekend_days() - get_holiday()) * per_day));
}

function get_wfh_fraction()
{
    var per_week = parseInt(document.getElementById("wfh-per-week").value);
    per_week = Math.max(per_week, 0);
    per_week = Math.min(per_week, 5);
    return per_week / 5;
}

function calc() {
    const tot = total_days();
    const daysPassed = days_passed()
    const weekenddays = weekend_days();
    const ptoDays = get_pto();
    const holidaysDays = get_holiday();
    const weekendsPlusHolidays = weekenddays + holidaysDays;
    const sickDays = get_sick();
    const ptoPlusSick = ptoDays + sickDays;
    const workDays = Math.max(0, tot - (daysPassed + weekenddays + ptoDays + holidaysDays + sickDays));
    const wfhFraction = get_wfh_fraction();
    const workDaysAtHome = Math.floor(workDays * wfhFraction);
    const workDaysAtOffice = workDays - workDaysAtHome;
    const daysPassedPercentage = (daysPassed / tot) * 100;
    const weekendsPercentage = (weekenddays / tot) * 100;
    const ptoPercentage = (ptoDays / tot) * 100;
    const holidaysPercentage = (holidaysDays / tot) * 100;
    const sickPercentage = (sickDays / tot) * 100;
    const workDaysPercentage = (workDays / tot) * 100;
    const wfhPercentage = (workDaysAtHome / tot) * 100;
    const officePercentage = (workDaysAtOffice / tot) * 100;


    document.getElementById('days-passed-segment').style.width = `${daysPassedPercentage}%`;
    document.getElementById('weekends-and-holidays-segment').style.width = `${weekendsPercentage + holidaysPercentage}%`;
    document.getElementById('pto-and-sick-segment').style.width = `${ptoPercentage + sickPercentage}%`;
    document.getElementById('wfh-segment').style.width = `${wfhPercentage}%`;
    document.getElementById('office-segment').style.width = `${officePercentage}%`;
    
    document.getElementById('percentage-days-passed').textContent = `${Math.round(daysPassedPercentage)}%`;
    document.getElementById('percentage-weekends-and-holidays').textContent = `${Math.round(weekendsPercentage + holidaysPercentage)}%`;
    document.getElementById('percentage-pto-and-sick').textContent = `${Math.round(ptoPercentage + sickPercentage)}%`;
    document.getElementById('percentage-wfh').textContent = `${Math.round(wfhPercentage)}%`;
    document.getElementById('percentage-office').textContent = `${Math.round(officePercentage)}%`;

    document.getElementById('days-passed').textContent = daysPassed + " passed";
    document.getElementById('weekends-and-holidays').textContent = weekendsPlusHolidays + " weekends and holidays";
    document.getElementById('pto-and-sick').textContent = ptoPlusSick + " pto and sick";
    document.getElementById('wfh').textContent = workDaysAtHome + " wfh";
    document.getElementById('office').textContent = workDaysAtOffice + " office";
    // document.getElementById('work').setAttribute('style', 'white-space: pre;');
    //document.getElementById('work').textContent = workDays + " work \r\n(" + workDaysAtOffice + " office, " + workDaysAtHome + " home)";

    document.getElementById('ttt').innerHTML = "Time till target: " + days_remaining() + " days";
}

document.getElementById('night-mode-toggle').addEventListener('click', function() {
    if(theme === "light")
        theme = "dark";
    else if(theme === "dark")
        theme = "light";
    else
        console.log("theme wtf: " + theme);
    document.body.classList.toggle('night-mode');
});

document.getElementById('save-parameters').addEventListener('click', function() {
    localStorage.setItem('start-date', document.getElementById('start-date').valueAsDate.toISOString());
    localStorage.setItem('end-date', document.getElementById('end-date').valueAsDate.toISOString());
    localStorage.setItem('holiday-per-year', document.getElementById('holiday-per-year').value);
    localStorage.setItem('pto-per-year', document.getElementById('pto-per-year').value);
    localStorage.setItem('sick-per-year', document.getElementById('sick-per-year').value);
    localStorage.setItem('wfh-per-week', document.getElementById('wfh-per-week').value);
    localStorage.setItem('theme', theme);
});
