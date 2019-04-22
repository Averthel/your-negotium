import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-new-event",
  templateUrl: "./new-event.component.html",
  styleUrls: ["./new-event.component.scss"]
})
export class NewEventComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
  createEvent(event) {
    window.alert(JSON.stringify(event.value));
  }
}
