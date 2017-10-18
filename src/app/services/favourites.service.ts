import { Component, Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/Rx';

import { config } from '../../assets/scripts/config.js';
import { ListingHelper } from '../helpers/index';

@Injectable()
export class FavouritesService {
    private _url: string;
    private _headers: Headers;
    private _options: RequestOptions;
    private _searches = new BehaviorSubject<any>([]);
    public searches$ = this._searches.asObservable();

    constructor(private _http: Http, private _listingHelper: ListingHelper) {
        this._url = config.api;

        this._headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'q=0.8;application/json;q=0.9'
        });

        this._options = new RequestOptions({headers: this._headers});
    }

    saveFavourite(data: any): Observable<any> {
        return this._http.post(this._url, data, this._options).map(res => res.json())
            .catch(this._listingHelper.handleError);
    }

    saveSearch(data: any): Observable<any> {
        return this._http.post(this._url, data, this._options).map(res => res.json())
            .catch(this._listingHelper.handleError);
    }

    removeSearch(data: any): Observable<any> {
        return this._http.post(this._url, data, this._options).catch(this._listingHelper.handleError);
    }

    optFavouriteEmail(data: any): void {
        this._http.post(this._url, data, this._options).subscribe();
    }

    optSearchEmail(data: any): void {
        this._http.post(this._url, data, this._options).subscribe();
    }

    getSearches(data: any): void {
        this._http.post(this._url, data, this._options)
            .map(res => res.json().searches)
            .catch(this._listingHelper.handleError).subscribe(searches => this._searches.next(searches));
    }

    getFavourites(data: any): Observable<any> {
        return this._http.post(this._url, data, this._options)
            .map(res => res.json())
            .catch(this._listingHelper.handleError);
    }

    hasFavouritesChanged(data: any): Observable<any> {
        return this._http.post(this._url, data, this._options)
            .map(res => res.json())
            .catch(this._listingHelper.handleError);
    }
}