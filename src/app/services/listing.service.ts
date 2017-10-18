import { Component, Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { config } from '../../assets/scripts/config.js';
import { Listing } from "../models/listing";
import { FavouriteHelper, ListingHelper } from '../helpers/index';

import 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ListingService {
    private _url: string;
    private _apiUrl: string;
    private _headers: Headers;
    private _options: RequestOptions;
    private _listings = new BehaviorSubject<any>([]);
    private _listingCount = new BehaviorSubject<number>(0);
    public listings$ = this._listings.asObservable();
    public listingCount$ = this._listingCount.asObservable();
    public listings: any[];

    constructor(private _http: Http, private _listingHelper: ListingHelper, private _favouriteHelper: FavouriteHelper) {
        this._url = 'https://secure.realcove.com/api.php?';
        this._apiUrl = config.api;

        this._headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'q=0.8;application/json;q=0.9'
        });

        this._options = new RequestOptions({headers: this._headers});
    }

    getListings(data: any, user: any): void {
        this._http.post(this._url, data, this._options)
            .map(this._listingHelper.extractData)
            .catch(this._listingHelper.handleError).subscribe(listings => {
                listings = this.getListingsFavourites(listings, user);

                this._listingCount.next(listings.total_count);

                if (data.loadMore) {
                    this.listings = this.listings.concat(listings.data);
                    this._listings.next(this.listings);
                }
                else {
                    this.listings = listings.data;
                    this._listings.next(listings.data);
                }
        });
    }

    getListing(mls: string): Observable<any> {
        let mlsNumbers = [mls];
        let data = this._listingHelper.getData([''], 'propertySearch', '0', '12', mlsNumbers, '', '', '', '', '');

        var listing = this._http.post(this._url, data, this._options)
            .map(this._listingHelper.extractData)
            .catch(this._listingHelper.handleError);

        return listing;
    }

    private getListingsFavourites(listings: any, user: any): any {
        for (let i = 1; i < listings.data.length; i++) {
            listings.data[i]['isFavourite'] = false;
            listings.data[i]['isOptEmail'] = false;
            listings.data[i]['hasChanges'] = false;
        }

        if (user !== null) {
            let favouriteData = this._favouriteHelper.getData('favourites', 'getFavourites', user.id);
            this._http.post(this._apiUrl, favouriteData, this._options).map(res => res.json()).subscribe(res => {
                for (var i = 0; i < listings.data.length; i++) {
                    for (var j = 0; j < res.favourites.length; j++) {
                        if (listings.data[i].mls_num === res.favourites[j].mls) {
                            listings.data[i].isFavourite = true;

                            if (res.favourites[j].optEmail == 1) {
                                listings.data[i].isOptEmail = true;
                            }

                            if(res.favourites[j].price !== listings.data[i].price || res.favourites[j].status !== listings.data[i].status) {
                                listings.data[i].hasChanges = true;
                            }
                        }
                    }
                }
            });
        }

        return listings;
    }
}