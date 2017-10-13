import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';
import 'rxjs/add/operator/takeUntil';

import { User } from "../../models/user";
import { Listing } from "../../models/listing";
import { HomeService } from '../../services/index';

import * as cron from 'node-cron';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    private _ngUnsubscribe: Subject<void> = new Subject<void>();
    public user: User;

    constructor(private _homeService: HomeService, private _router: Router) {}

    ngDoCheck(): void {
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    ngOnInit(): void {
        //if (this._router.url === '/searches' || this._router.url === '/recentSearches') {
        //    this.isFavouriteSearch = true;
        //}

        //var task = cron.schedule('* * * * *', this._loginService.isLoggedIn().takeUntil(this._ngUnsubscribe).subscribe(loggedIn => {
        //    if(loggedIn) {
        //        this._homeService.getFavouriteEvents().subscribe();
        //        this._homeService.getSearchListings().subscribe();
        //    }
        //}), true).start();
        //
        //task.stop();
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
        this._ngUnsubscribe.complete();
    }
}
