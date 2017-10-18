import { Component, OnInit, ElementRef } from '@angular/core';

import { User } from "../../models/user";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
    public user: User;

    constructor() {}

    ngDoCheck(): void {
        this.user = JSON.parse(localStorage.getItem('user'));
    }
}
