import { Component, OnInit, Input, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/Rx';
import * as jQuery from 'jquery';

import { User } from '../../models/user';
import { Listing } from '../../models/listing';
import { FavouritesService, ListingService, LoginService } from '../../services/index';
import { ListingHelper } from '../../helpers/index';

@Component({
    selector: 'listing',
    templateUrl: './listing.component.html',
    styleUrls: ['./listing.component.css']
})
export class ListingComponent implements OnInit {
    @Input() listing: Listing;
    @Input() user: User;
    public isFavourite: boolean;
    public isLoggedIn$: Observable<boolean>;

    constructor(private _router: Router, private _listingHelper: ListingHelper, private _listingService: ListingService,
                private _favouritesService: FavouritesService, private _loginService: LoginService) {
        this.isLoggedIn$ = _loginService.isLoggedIn();
    }

    ngOnInit(): void {
        if(this._router.url === '/favourites') {
            this.isFavourite = true;
        }
    }

    toggleFavourite(): void {
        let data = {
            action: 'favourites',
            subAction: 'saveFavourite',
            userId: this.user.id,
            mls: this.listing.mls_num,
            price: this.listing.price,
            status: this.listing.status
        };

        let favouriteData = this._listingHelper.getParams(data);
        this._favouritesService.saveFavourite(favouriteData).subscribe(res => {
            if (this._router.url === '/favourites') {
                if (confirm('Are you sure you want to delete this listing from your favourites?')) {
                    let mls: string[] = [];

                    for (let i = 0; i < res.favourites.length; i++) {
                        mls.push(res.favourites[i].mls);
                    }

                    localStorage.setItem('favouriteData', mls.toString());

                    let listingData = this._listingHelper.getData([''], 'propertySearch', '0', '12', mls, '', '', '', '', '');
                    this._listingService.getListings(listingData, this.user);
                }
            }
        });
    }

    toggleEmailOptOut(): void {
        let data = {
            action: 'favourites',
            subAction: 'emailOpt',
            userId: this.user.id,
            mls: this.listing.mls_num
        };

        let favouriteData = this._listingHelper.getParams(data);
        this._favouritesService.optFavouriteEmail(favouriteData);
    }

    getAreaAndMlsDetails(area: string, mls: string): void {
        this._router.navigateByUrl('/detail/' + mls);

        let data = this._listingHelper.getData([''], 'propertySearch', '0', '12', [''], area, '', '', '', '');
        this._listingService.getListings(data, this.user);
    }

    getImages(): string[] {
        return this._listingHelper.getImages(this.listing);
    }
}
