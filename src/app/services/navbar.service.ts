import { Component, Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { config } from '../../assets/scripts/config.js';
import { ListingHelper } from '../helpers/listing-helper';

@Injectable()
export class NavbarService {
    private _url: string;
    private _apiUrl: string;
    private _headers: Headers;
    private _options: RequestOptions;

    constructor(private _http: Http, private _listingHelper: ListingHelper) {
        this._url = 'https://secure.realcove.com/api.php?';
        this._apiUrl = config.api;

        this._headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'q=0.8;application/json;q=0.9'
        });

        this._options = new RequestOptions({headers: this._headers});
    }

    getCities(data: any): Observable<any> {
        var cities = this._http.post(this._url, data, this._options)
            .map(this._listingHelper.extractData)
            .catch(this._listingHelper.handleError);

        return cities;
    }

    saveCriteria(data: any): Observable<any> {
        return this._http.post(this._apiUrl, data, this._options);
    }
}