import { Component, OnInit } from "@angular/core";
import { GoogleAuthService } from "src/app/services/googleauth.service";
import { FirebaseService } from "src/app/services/firebase.service";
import { FromFirebaseDataSource } from "src/app/data-sources/fromFireBase-data-source";
import { ActivatedRoute, Router } from "@angular/router";
import calendarProperties from "./calendarProperties";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit {
  dataSource = new FromFirebaseDataSource(this.firebaseService, "calendar");
  constructor(
    private firebaseService: FirebaseService,
    private googleAuthService: GoogleAuthService,
    private route: ActivatedRoute,
    private routerNavigate: Router
  ) {}
  sliderValue;
  actualMode;
  paramsDate;
  days;
  convertedDays;
  daysOfWeek = calendarProperties.daysOfWeek;
  convertedDaysOfWeek;
  week = [];
  startDate: Date;
  endDate: Date;
  monthName;
  currentYear = new Date().getFullYear();
  ngOnInit() {
    this.route.params.subscribe(
      params => {
        if (
          params.mode === "month" ||
          params.mode === "week" ||
          params.mode === "day"
        ) {
          this.paramsDate =
            params.d && params.m && params.d
              ? new Date(params.y, params.m - 1, params.d)
              : undefined;
          this.actualMode = params.mode;
          // Reset view
          this.convertedDaysOfWeek = this.daysOfWeek;
          this.week = [];
          this.convertedDays = [];
          this.days = [];
          this.loadViewOlddated();
        } else if (Object.keys(params).length === 0) {
          this.routerNavigate.navigate(["/calendar/week"]);
        } else {
          this.routerNavigate.navigate(["/not-found"]);
        }
      },
      () => {
        this.routerNavigate.navigate(["/not-found"]);
      }
    );

    // This will load all events to view in future
    this.loadView().then(events => console.log(events));
  }

  loadViewOlddated() {
    // Load view at present
    this.dataSource.connect().subscribe(
      data => {
        this.days = data;
        switch (this.actualMode) {
          case "day":
            this.sliderValue = 0;
            this.handleDayMode();
            break;
          case "week":
            this.sliderValue = 1;
            this.handleWeekMode();
            break;
          case "month":
            this.sliderValue = 2;
            this.handleMonthMode();
            break;
          default:
            this.routerNavigate.navigate(["/not-found"]);
            break;
        }
      },
      () => this.routerNavigate.navigate(["/not-found"])
    );
  }

  changeDate(month = 0, day = 0) {
    this.startDate = new Date(
      this.startDate.getFullYear(),
      this.startDate.getMonth() + month,
      this.startDate.getDate() + day
    );
    this.endDate = new Date(
      this.endDate.getFullYear(),
      this.endDate.getMonth() + month,
      this.endDate.getDate() + day
    );
  }

  changeMonthName() {
    this.monthName = this.startDate.toLocaleString("en-us", {
      month: "short"
    });
  }

  pastDays() {
    this.week = [];
    switch (this.actualMode) {
      case "month":
        this.startDate = new Date(
          this.startDate.getFullYear(),
          this.startDate.getMonth() - 1,
          1
        );
        this.endDate = new Date(
          this.endDate.getFullYear(),
          this.endDate.getMonth(),
          0
        );
        this.setMonthDays();
        break;
      case "week":
        this.changeDate(0, -7);
        this.setWeekDays();
        break;
      case "day":
        this.changeDate(0, -1);
        this.setDayDays();
        break;
    }
    this.changeMonthName();
  }

  futureDays() {
    this.week = [];
    switch (this.actualMode) {
      case "month":
        this.startDate = new Date(
          this.startDate.getFullYear(),
          this.startDate.getMonth() + 1,
          1
        );

        this.endDate = new Date(
          this.endDate.getFullYear(),
          this.endDate.getMonth() + 2,
          0
        );
        this.setMonthDays();
        break;
      case "week":
        this.changeDate(0, 7);
        this.setWeekDays();
        break;
      case "day":
        this.changeDate(0, 1);
        this.setDayDays();
        break;
    }
    this.changeMonthName();
  }

  changeStartDate(event) {
    this.startDate = event.value;

    this.setDayDays();
  }

  handleDayMode() {
    this.startDate = this.paramsDate ? this.paramsDate : new Date();
    this.endDate = this.paramsDate ? this.paramsDate : new Date();
    this.changeMonthName();
    this.setDayDays();
  }

  handleWeekMode() {
    const now = new Date();
    this.startDate = this.paramsDate
      ? new Date(
          this.paramsDate.getFullYear(),
          this.paramsDate.getMonth(),
          this.paramsDate.getDate() -
            this.paramsDate.getDay() +
            (this.paramsDate.getDay() === 0 ? -6 : 1)
        )
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        );
    this.endDate = new Date(
      this.startDate.getFullYear(),
      this.startDate.getMonth(),
      this.startDate.getDate() + 6
    );
    this.changeMonthName();
    this.setWeekDays();
  }

  handleMonthMode() {
    const now = new Date();
    this.startDate = this.paramsDate
      ? new Date(this.paramsDate.getFullYear(), this.paramsDate.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    this.endDate = new Date(
      this.startDate.getFullYear(),
      this.startDate.getMonth() + 1,
      0
    );
    this.changeMonthName();
    this.setMonthDays();
  }

  setDayDays() {
    this.actualMode = "day";
    this.convertedDays = this.days.slice(0, 1);
    this.convertedDaysOfWeek = [
      this.startDate.toLocaleDateString("en-us", {
        weekday: "short"
      })
    ];
    this.week = [this.startDate];
  }

  setWeekDays() {
    this.actualMode = "week";
    const tempDays = [];
    for (
      let i = this.startDate;
      this.endDate >= i;
      i = new Date(i.getTime() + 24 * 60 * 60 * 1000)
    ) {
      tempDays.push({});
      this.week.push(i);
    }
    tempDays.push(...this.days.slice(0, 8 - new Date().getDay()));
    this.convertedDays = tempDays;
  }

  setMonthDays() {
    this.actualMode = "month";
    const tempDays = [];

    if (this.startDate.getDay() !== 1) {
      for (
        let i = new Date(
          this.startDate.getFullYear(),
          this.startDate.getMonth(),
          -new Date(this.startDate.getTime() - 24 * 60 * 60 * 1000).getDay() + 1
        );
        this.startDate > i;
        i = new Date(i.getTime() + 24 * 60 * 60 * 1000)
      ) {
        tempDays.push({});
        this.week.push(i);
      }
    }
    for (let i = 1; i <= this.endDate.getDate(); i++) {
      tempDays.push({ events: [{ name: "Lorem ipsum" }] });
      this.week.push(
        new Date(this.endDate.getFullYear(), this.endDate.getMonth(), i)
      );
    }
    if (this.endDate.getDay() !== 0) {
      for (let i = 1; i <= 7 - this.endDate.getDay(); i++) {
        this.week.push(
          new Date(this.endDate.getFullYear(), this.endDate.getMonth() + 1, i)
        );
        tempDays.push({});
      }
    }
    this.convertedDays = tempDays;
  }

  handleChangeMode() {
    switch (this.actualMode) {
      case "day":
        this.routerNavigate.navigate(["/calendar/day"]);
        return "D";
      case "week":
        this.routerNavigate.navigate(["/calendar/week"]);
        return "W";
      case "month":
        this.routerNavigate.navigate(["/calendar/month"]);
        return "M";
      default:
        this.routerNavigate.navigate(["/calendar/week"]);
        return "W";
    }
  }

  formatLabel(value) {
    switch (value) {
      case 0:
        return "D";
      case 1:
        return "W";
      case 2:
        return "M";
      default:
        return "W";
    }
  }

  loadView() {
    return new Promise(async (resolve, reject) => {
      await this.googleAuthService.initClient();
      const events = await this.googleAuthService.modifyEvents();
      events.subscribe(event => {
        resolve(event);
      });
    });
  }
}
