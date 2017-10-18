import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { config } from '../../assets/scripts/config.js';
import { ListingHelper } from '../helpers/listing-helper';

@Injectable()
export class LoginService {
    private _url: string;
    private _headers: Headers;
    private _options: RequestOptions;
    private _isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());

    constructor(private _http: Http, private _listingHelper: ListingHelper) {
        this._url = config.api;
        this._headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'q=0.8;application/json;q=0.9'
        });

        this._options = new RequestOptions({headers: this._headers});
    }

    login(user: any): Promise<void> {
        let data = this._listingHelper.getParams(user);

        return this._http.post(this._url, data, this._options)
            .toPromise()
            .then(res => {
                let user = this.extractData(res);

                if(user.success) {
                    localStorage.removeItem('msg');

                    this._isLoggedIn.next(true);
                }
                else {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.setItem('msg', user.msg);

                    this._isLoggedIn.next(false);
                }
            });
    }

    logout(): void {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('success');
        localStorage.removeItem('msg');
        localStorage.removeItem('favouriteData');

        this._isLoggedIn.next(false);
    }

    isLoggedIn(): Observable<boolean> {
        return this._isLoggedIn.asObservable();
    }

    private extractData(res: Response) {
        let body = res.json();

        if(body && body.token) {
            localStorage.setItem('user', JSON.stringify(body.data));
            localStorage.setItem('token', JSON.stringify(body.token));
            localStorage.setItem('success', JSON.stringify(body.success));
        }

        return body || [];
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('token');
    }
}