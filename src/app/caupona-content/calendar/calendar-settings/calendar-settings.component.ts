import { Component, OnInit } from "@angular/core";
import { GoogleAuthService } from "src/app/services/googleauth.service";

@Component({
  selector: "app-calendar-settings",
  templateUrl: "./calendar-settings.component.html",
  styleUrls: ["./calendar-settings.component.scss"]
})
export class CalendarSettingsComponent implements OnInit {
  constructor(public auth: GoogleAuthService) {
    this.auth.initClient();
  }
  googleintegration: boolean;

  ngOnInit() {
    this.googleintegration = JSON.parse(
      sessionStorage.getItem("turnGoogleIntegration")
    );
  }
  activateApi(event) {
    console.log(event.value["api-key"]);
  }
  test() {
    if (this.googleintegration)
      sessionStorage.setItem("turnGoogleIntegration", "true");
    else sessionStorage.setItem("turnGoogleIntegration", "false");
  }
}
