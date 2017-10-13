import { Component, Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/Rx';

import { config } from '../../assets/scripts/config.js';
import { ListingHelper } from '../helpers/index';

@Injectable()
export class HomeService {
    private _url: string;
    private _headers: Headers;
    private _options: RequestOptions;

    constructor(private _http: Http, private _listingHelper: ListingHelper) {
        this._url = config + 'favouritesEmail.php';
        this._headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'q=0.8;application/json;q=0.9'
        });

        this._options = new RequestOptions({headers: this._headers});
    }

    getFavouriteEvents() {
        let data = {
            action: 'getEvents'
        };

        let eventData = this._listingHelper.getParams(data);

        return this._http.post(this._url, eventData, this._options);
    }

    getSearchListings() {
        let url = config + 'searchCriteriaEmail.php';
        let data = {
            action: 'getEvents'
        };

        let listingData = this._listingHelper.getParams(data);

        return this._http.post(url, listingData, this._options);
    }
}