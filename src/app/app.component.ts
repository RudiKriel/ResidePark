import { Component, OnInit, ElementRef, Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { User } from "./models/user";

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ["./app.component.css"]
})
export class AppComponent {
    public user: User;

    constructor(@Inject(DOCUMENT) private _document: any, private _elRef: ElementRef) {}

    ngDoCheck(): void {
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    ngAfterViewInit(): void {
        var listingSript = this._document.createElement("script");
        listingSript.type = "text/javascript";
        listingSript.src = "assets/scripts/listing.js";
        this._elRef.nativeElement.appendChild(listingSript);
    }
}
