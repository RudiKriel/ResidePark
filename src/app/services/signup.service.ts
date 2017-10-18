import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';

import { config } from '../../assets/scripts/config.js';
import { User } from '../models/user';
import { ListingHelper } from '../helpers/listing-helper';

@Injectable()
export class SignupService {
    private _url: string;

    constructor(private _http: Http, private _listingHelper: ListingHelper) {
        this._url = config.api;
    }

    signup(user: User): Promise<void> {
        let data = this._listingHelper.getParams(user);

        return this._http.post(this._url, data, this.jwt())
            .toPromise()
            .then(res => {
                let user = res.json();

                localStorage.setItem('msg', user.msg);
                localStorage.setItem('success', JSON.stringify(user.success));
            });
    }

    private jwt() {
        // create authorization header with jwt token
        let user = JSON.parse(localStorage.getItem('user'));

        if (user && user.token) {
            let headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'q=0.8;application/json;q=0.9',
                'Authorization': 'Bearer ' + user.token
            });

            return new RequestOptions({headers: headers});
        }
    }
}