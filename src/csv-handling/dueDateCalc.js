/* Calculate due date by start date and duration according to the following rules:

    - Due date can only be during business hours: 08:30 to 16:00
    - Monday to Friday
*/
import moment from "moment";

/*
Function: calcDueDate
Parameters: startDate (string), duration (number)
    @startDate: The start date and tim of the activity (YYYYMMDDTHHmm)
    @duration: The duration of the activity in whole hours
Returns: A string representing the due date and time of the activity (YYYYMMDDTHHmm)

Notes: This calculation assumes that duration is a whole number representing billable hours
        for the activity, it will not accurately calculate fractions of hours.
*/
export const calcDueDate = (startDate, duration) => {
    const busEnd = moment().set({ hour: 16, minute: 0 });
    let dueDate = moment(startDate, "YYYYMMDDTHHmm");

    console.log("Calculating due date...");

    // const durationCopy = duration;

    while (duration > 0) {
        const hourDue = dueDate.hour();
        const minuteDue = dueDate.minute();
        const busEndHour = busEnd.hour();
        // console.log(`Hour due: ${hourDue} | Bus end hour: ${busEndHour}`);

        // console.log(`Duration: ${duration}`)

        if (hourDue >= busEndHour && minuteDue > 0) {
            dueDate.add(1, "day").set({ hour: 8, minute: (30 + minuteDue) });
        // if (hourDue === (busEndHour - 1)
        //     && minuteDue > 0
        //     && duration > 1
        //     && !(busEndHour < hourDue)) {
        //     console.log("Case: is within an hour of busEnd");
        //     const minute = dueDate.minute();
        //     if (minute >= 30) {
        //         dueDate.add(1, "day").set({ hour: 9, minute: (minute - 30)});
        //         duration--;
        //     } else {
        //         dueDate.add(1, "day").set({ hour: 8, minute: (30 + minute) });
        //         duration--;
        //     }
            // console.log(`New due date: ${dueDate.format("LLLL")}`);
        } else if (busEndHour === hourDue && minuteDue === 0) {
            // console.log("Case: is at busEnd");
            dueDate.add(1, "day").set({ hour: 8, minute: 30 })
            // console.log(`New due date: ${dueDate.format("LLLL")}`);
        } else if (busEndHour < hourDue) {
            // console.log("Case: is after busEnd");
            while (dueDate.isoWeekday() >= 6) {
                dueDate.add(1, "day").set({ hour: 8, minute:30 });

            }
            duration--;
            // console.log(`New due date: ${dueDate.format("LLLL")}`);
        } else if (dueDate.isoWeekday() >= 6) {
            // console.log("Case: is weekend");
            dueDate.add(1, "day")
            // console.log(`New due date: ${dueDate.format("LLLL")}`);
        } else {
            // console.log("default case");
            dueDate.add(1, "hour");
            duration--;
            // console.log(`New due date: ${dueDate.format("LLLL")}`);
        };
    };

    // For testing and debugging purposes only
    // console.log("____________________________________________________________")
    // console.log(`Start date: ${moment(startDate).format("LLLL")} | Duration: ${durationCopy} hours | Due Date: ${dueDate.format("LLLL")}`);
    // console.log("____________________________________________________________")


    // console.log(`Due date: ${dueDate.format("LLLL")}`);
    return dueDate.format("YYYYMMDDTHHmm");
};