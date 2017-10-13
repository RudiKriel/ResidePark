import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './pages/about/index';
import { ContactUsComponent } from './pages/contactUs/index';
import { HomeComponent } from './pages/home/index';
import { SearchCriteriaComponent } from './components/search/index';
import { AuthGuard } from './guards/index';

// Define which component should be loaded based on the current URL
const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contactUs', component: ContactUsComponent },
    { path: 'results', component: HomeComponent },
    { path: 'area', component: HomeComponent },
    { path: 'favourites', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'searches', component: SearchCriteriaComponent, canActivate: [AuthGuard] },
    { path: 'recentSearches', component: SearchCriteriaComponent, canActivate: [AuthGuard] },
    { path: 'detail/:mls', component: HomeComponent }
];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}