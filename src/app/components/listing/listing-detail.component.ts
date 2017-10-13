import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from "rxjs/Observable";

import { User } from '../../models/user';
import { Listing } from '../../models/listing';
import { ListingService } from '../../services/index';
import { ListingHelper } from '../../helpers/index';

import * as jQuery from 'jquery';

declare var google: any;

@Component({
    selector: 'listing-detail',
    templateUrl: './listing-detail.component.html',
    styleUrls: ['./listing-detail.component.css']
})
export class ListingDetailComponent implements OnInit {
    public listing: Listing;
    public index: number;
    public isDetail: boolean;
    public imgSrc: string;
    public areaListings: Listing[];
    public user: User;

    constructor(private _listingService: ListingService, private _listingHelper: ListingHelper, private _route: ActivatedRoute,
                private _router: Router, private _changeDetector: ChangeDetectorRef) {
        this.isDetail = false;
        this.imgSrc = 'https://source.unsplash.com/wtrAchtpc-w';
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    ngDoCheck(): void {
        if (this.user === null) {
            this.user = JSON.parse(localStorage.getItem('user'));
        }
    }

    ngOnInit(): void {
        if (this._router.url.includes('detail')) {
            this.isDetail = true;
            this.getListing();
        }
        if (this._router.url === '/area') {
            this._listingService.listings$.subscribe(listings => {
                let that = this;
                that.listing = listings[0];
                that.areaListings = listings;

                google.charts.load('current', { 'packages': ['map'] });

                google.charts.setOnLoadCallback(function() {
                    if (!that._router.url.includes('detail')) {
                        that.drawMap(listings);
                    }
                });

                if (that.listing) {
                    that.index = that.getIndex(listings, listings[0].mls_num);
                    that.setImgSrc(that.listing.photos);
                }
            });
        }
    }

    ngAfterViewInit(): void {
        this._changeDetector.detectChanges();
    }

    getListing(): void {
        this._route.paramMap.switchMap((params: ParamMap) => this._listingService.getListing(params.get('mls'))).subscribe(listings => {
            let that = this;
            that.listing = listings.data[0];
            that.setImgSrc(that.listing.photos);

            google.charts.load('current', { 'packages': ['map'] });

            google.charts.setOnLoadCallback(function() {
                that.drawMap(listings.data);
            });
        });
    }

    imageScroll(image: any, dir: string): void {
        var photos = jQuery(image).attr('photos').split(',');
        var src = image.src.replace('http://www.realcove.net/', '');
        var index = jQuery.inArray(src, photos);

        if(dir == 'prev') {
            //Move to prev photo in array
            var new_index = index <= 0 ? photos.length - 1 : index - 1;
        }
        else {
            //Move to next photo in array
            var new_index = index == photos.length - 1 ? 0 : index + 1;
        }

        this.imgSrc = this._listingHelper.removeHttpFromPhotos(photos)[new_index];
    }

    listingScroll(mls: string, dir: string): void {
        var index = this.getIndex(this.areaListings, mls);

        if (dir == 'prev') {
            this.index = index - 1;
            this.listing = this.areaListings[index - 1];
        }
        else {
            this.index = index + 1;
            this.listing = this.areaListings[index + 1];
        }

        this.setImgSrc(this.listing.photos);
    }

    imageSelect(image: any): void {
        this.imgSrc = image.src;
    }

    getAreaAndMlsDetails(area: string, mls: string): void {
        this._router.navigateByUrl('/detail/' + mls);

        let data = this._listingHelper.getData([''], 'propertySearch', '0', '12', [''], area, '', '', '', '');

        this._listingService.getListings(data, this.user);
    }

    getImages(): string[] {
        return this._listingHelper.getImages(this.listing);
    }

    private setImgSrc(photos: string[]): void {
        if (photos) {
            this.imgSrc = this._listingHelper.removeHttpFromPhotos((photos + "").split(','))[0];
        }
    }

    private drawMap(listings: Listing[]): void {
        let data = new google.visualization.DataTable();

        data.addColumn('number', 'Lat');
        data.addColumn('number', 'Long');
        data.addColumn('string', 'Price');

        for (let i = 0; i < listings.length; i++) {
            let listing = listings[i],
                latitude = parseFloat(listing.latitude),
                longitude = parseFloat(listing.longitude),
                listingPrice = parseFloat(listing.price.replace(/\D/g, '')),
                price = this.convertPrice(listingPrice);

            data.addRow([latitude, longitude, price]);
        }

        let options = {
            showTooltip: true,
            showInfoWindow: true
        };

        if (document.body.contains(document.getElementById('google-map'))) {
            let map = new google.visualization.Map(document.getElementById('google-map'));
            map.draw(data, options);
        }
    }

    private getIndex(listings: Listing[], mls: string): number {
        return listings.map(function (listing) {
            return listing.mls_num;
        }).indexOf(mls);
    }

    private convertPrice(listingPrice: number): string {
        let price = "";

        if (listingPrice >= 1000 || (listingPrice * 1000) < 1000000)
        {
            price = "$" + (Math.round(listingPrice / 1000)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "K";
        }

        if (listingPrice >= 1000000 || (listingPrice * 1000000) < 1000000000)
        {
            price = "$" + (Math.round(listingPrice / 1000000)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "M";
        }

        if (listingPrice >= 1000000000 || (listingPrice * 1000000000) < 1000000000000)
        {
            price = "$" + (Math.round(listingPrice / 1000000000)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "B";
        }

        return price;
    }
}