export class BusinessDate {
  private previousDay: Date;

  private startHour: Date;

  private endHour: Date;

  constructor() {
    this.calculatePreviousBusinessDayStartAndEndHour();
  }

  calculatePreviousBusinessDayStartAndEndHour() {
    const now = new Date();
    let day = now.getDay();
    let date = now.getDate();
    const hours = now.getHours();

    function isBusinessDay(day) {
      return day >= 1 && day <= 5;
    }

    if (day === 0) {
      date -= 2;
    } else if (day === 6) {
      date -= 1;
    } else if (hours < 8) {
      date -= 1;
    } else if (hours >= 18) {
      date -= 1;
    }

    const previousDate = new Date(now.setDate(date));
    day = previousDate.getDay();
    while (!isBusinessDay(day)) {
      previousDate.setDate(previousDate.getDate() - 1);
      day = previousDate.getDay();
    }

    this.previousDay = previousDate;

    this.startHour = new Date(previousDate.setHours(8, 0, 0, 0));
    this.endHour = new Date(previousDate.setHours(18, 0, 0, 0));

    return;
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
