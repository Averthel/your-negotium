import { Component, OnInit, AfterViewInit } from "@angular/core";
import { GoogleAuthService } from "src/app/services/googleauth.service";
import { FirebaseService } from "src/app/services/firebase.service";
import { FromFirebaseDataSource } from "src/app/data-sources/fromFireBase-data-source";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit {
  dataSource = new FromFirebaseDataSource(this.firebaseService, "calendar");
  constructor(
    private firebaseService: FirebaseService,
    private GoogleAuthService: GoogleAuthService
  ) {}
  days;
  daysArr;
  ngOnInit() {
    this.dataSource.connect().subscribe(data => {
      this.days = data;
    });
    this.loadView().then(events => console.log(events));
    // this.daysArr = Object.values(this.days).map(day => {
    //   return day;
    // });
  }
  loadView() {
    return new Promise(async (resolve, reject) => {
      await this.GoogleAuthService.initClient();
      const events = await this.GoogleAuthService.getCalendar();

      // events.result.items.forEach(event => {
      //   let day = new Date(event.start.DateTime).getDate();
      //   this.days = { ...this.days, [day]: { ...this.days.day, event } };
      // });
      resolve(events);
    });
  }
}
