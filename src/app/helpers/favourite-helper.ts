import { Injectable } from '@angular/core';

import { ListingHelper } from './listing-helper';

@Injectable()
export class FavouriteHelper {
    constructor(private _listingHelper: ListingHelper) {}

    getData(action: string, userId: number) {
        let data = {
            action: action,
            userId: userId
        };

        return this._listingHelper.getParams(data);
    }
}