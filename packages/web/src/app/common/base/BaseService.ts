import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BaseService {
    private _apiUrl = '';

    get apiUrl() {
        return this._apiUrl;
    }

    set apiUrl(value: string) {
        this._apiUrl = `http://localhost:3000${value}`
    }
}
