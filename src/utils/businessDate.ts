import e from "express";

export class BusinessDate {
  private previousDay: Date;

  private startHour: Date;

  private endHour: Date;

  constructor() {
    this.calculatePreviousBusinessDayStartAndEndHour();
  }

  calculatePreviousBusinessDayStartAndEndHour() {
    const now = new Date();
    const nowString = now.toDateString();
    let [dayOfWeek, month, day, year] = nowString.split(" ") as [string, string, number, number]; 

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let dayIndex = daysOfWeek.indexOf(dayOfWeek);
    
    if (dayOfWeek === "Mon") {
      day = day - 3;
    } else if (dayOfWeek === "Sun") {
      day = day - 2;
    } else if (dayOfWeek === "Sat") {
      day = day - 1;
    }

    const startHour = `${daysOfWeek[dayIndex]} ${month} ${day} ${year} 08:00:00`;
    const endHour = `${daysOfWeek[dayIndex]} ${month} ${day} ${year} 18:00:00`;

    this.previousDay = new Date(`${daysOfWeek[dayIndex]} ${month} ${day} ${year}`);
    this.startHour = new Date(startHour);
    this.endHour = new Date(endHour);

    return { startHour, endHour };
}

  getPreviousDay() {
    return this.previousDay;
  }

  getStartHour() {
    return this.startHour;
  }

  getEndHour() {
    return this.endHour;
  }
}
