import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Response, URLSearchParams } from '@angular/http';

import { Listing } from '../models/listing';

@Injectable()
export class ListingHelper {
    constructor(private _sanitizer: DomSanitizer) {}

    getData(propertyType: string[], action: string, searchOffset: string, searchLimit: string, mls: string[], area: string, minPrice: string, maxPrice: string, beds: string, qry: string): any {
        let minPriceValue = minPrice ? minPrice.replace(/,/g, "") : '',
            maxPriceValue = maxPrice ? maxPrice.replace(/,/g, "") : '';

        let data = this.getInitialData(propertyType, action, searchOffset, searchLimit, mls, area, minPriceValue, maxPriceValue, beds, qry);

        return this.getParams(data);
    }

    getInitialData(propertyType: string[], action: string, searchOffset: string, searchLimit: string, mls: string[], area: string, minPrice: string, maxPrice: string, beds: string, qry: string): any {
        let data = {
            partner_key          : '7e52cad4e91ee36e308d35f93a9db02b',    //International MLS
            action               : action,                                //agentSearch, officeSearch, propertySearch, pickListSearch
            return               : 'json', 							      //xml, json
            search_offset        : searchOffset,
            search_limit         : searchLimit,
            search_mls_id        : ['1'],                                 //Array of valid MLS id's, Park City MLS = 1 and WFRMLS = 2
            search_mls_num       : mls,
            search_price_min     : minPrice,
            search_price_max     : maxPrice,
            search_beds          : beds,
            search_property_type : propertyType,
            search_area_name     : area,
            qry                  : qry,
            debug                : '0'
        };

        return data;
    }

    extractData(res: Response): any {
        let body = res.json();
        return body || [];
    }

    handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);

        return Promise.reject(error.message || error);
    }

    getImages(listing: Listing): string[] {
        listing.photos = (listing.photos + "").split(',');

        let photos = this.removeHttpFromPhotos(listing.photos);
        return photos;
    }

    removeHttpFromPhotos(array: string[]): string[] {
        let photos = [];

        if (array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].indexOf('http') >= 0) {
                    let url = "http://www.realcove.net/" + array[i].replace('http://54.245.115.2/rets.realcove.com/', '/');
                    photos.push(this._sanitizer.bypassSecurityTrustResourceUrl(url));
                }
                else {
                    let url = "http://www.realcove.net/" + array[i];
                    photos.push(this._sanitizer.bypassSecurityTrustResourceUrl(url));
                }
            }
        }

        return photos;
    }

    getParams(data: any): any {
        let params: URLSearchParams = new URLSearchParams();

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                let val = data[key];
                params.set(key, val);
            }
        }

        return params;
    }
}